(function(){
  // Инициализация при найме (для старых сейвов и для детей)
  Reg.on('npc_hired', (npc) => {
    if (npc.gender === undefined) npc.gender = Math.random() < 0.5 ? 'male' : 'female';
    if (npc.age === undefined) npc.age = 20 + Math.floor(Math.random() * 20);
    if (npc.familyNeed === undefined) npc.familyNeed = 0;
    if (npc.pregnancy === undefined) npc.pregnancy = 0;
    if (npc.children === undefined) npc.children = [];
    if (npc.isChild === undefined) npc.isChild = npc.age < 14;
  });

  // Раз в 100 тиков: рост потребности + зачатие
  Reg.on('tick', (state) => {
    if (state.tick % 100 !== 0) return;
    if (!state.npcs) return;

    // 1. Семейная потребность растёт у взрослых
    state.npcs.forEach(npc => {
      if (!npc.alive || npc.isChild) return;
      if (npc.gender === 'female' && npc.pregnancy > 0) return;
      if (npc.gender === 'female' && npc.age > 45) return;
      if (npc.gender === 'male' && npc.age > 65) return;
      npc.familyNeed = Math.min(100, (npc.familyNeed || 0) + 0.5);
    });

    // 2. Ищем пары для зачатия
    const males = state.npcs.filter(n => n.alive && !n.isChild && n.gender === 'male' && n.age >= 14 && n.age <= 65);
    const females = state.npcs.filter(n => n.alive && !n.isChild && n.gender === 'female' && n.age >= 14 && n.age <= 45 && npc_pregnancyFree(n));

    females.forEach(f => {
      if ((f.familyNeed || 0) < 40) return;
      const partner = males.find(m =>
        (m.familyNeed || 0) >= 40 &&
        Math.abs(m.x - f.x) + Math.abs(m.y - f.y) <= 3 &&
        f.relations && f.relations[m.id] > 30
      );
      if (partner && Math.random() < 0.1) {
        f.pregnancy = 300 + Math.floor(Math.random() * 300);
        f.familyNeed = Math.max(0, (f.familyNeed || 0) - 30);
        partner.familyNeed = Math.max(0, (partner.familyNeed || 0) - 30);
        Reg.log(`${f.name} и ${partner.name} ожидают ребёнка.`, 'good');
        Reg.addMemory(f, `Я беременна от ${partner.name}.`, { type: 'joy', power: 30, category: 'family' });
        Reg.addMemory(partner, `${f.name} ожидает от меня ребёнка.`, { type: 'joy', power: 30, category: 'family' });
      }
    });
  });

  function npc_pregnancyFree(n) {
    return (n.pregnancy || 0) === 0;
  }

  // Каждый tick дварфа: беременность и роды
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive) return false;
    if (npc.pregnancy && npc.pregnancy > 0) {
      npc.pregnancy--;
      if (npc.pregnancy <= 0) {
        npc.pregnancy = 0;
        spawnChild(npc, state);
      }
    }
    return false;
  });

  // Взросление — раз в 100 тиков
  Reg.on('tick', (state) => {
    if (state.tick % 100 !== 0) return;
    if (!state.npcs) return;
    state.npcs.forEach(npc => {
      if (!npc.alive || !npc.isChild) return;
      npc.age = (npc.age || 0) + 0.5;
      if (npc.age >= 15) {
        npc.isChild = false;
        npc.profession = { id: 'miner', name: 'Шахтер', color: '#8a6a4a' };
        if (npc.gender === 'female') {
          npc.skinFile = 'commoner man woman.png';
        } else {
          const pick = arr => arr[Math.floor(Math.random() * arr.length)];
          npc.skinFile = pick(['dwarf1.png', 'dwarf2.png', 'dwarf3.png', 'dwarf4.png']);
        }
        Reg.log(`[Семья] ${npc.name} вырос(ла) и теперь может работать.`, 'good');
        Reg.addMemory(npc, `Я вырос(ла). Теперь я взрослый дварф.`, { type: 'joy', power: 20, category: 'family' });
      }
    });
  });

  // ФУНКЦИЯ РОЖДЕНИЯ РЕБЁНКА
  function spawnChild(mother, state) {
    if (!state || !state.npcs) return;

    let spawnPos = null;
    for (let dx = -2; dx <= 2 && !spawnPos; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const c = getCell(mother.x + dx, mother.y + dy);
        if (c && c.type === 'floor' && !state.npcs.find(n => n.x === mother.x + dx && n.y === mother.y + dy)) {
          spawnPos = { x: mother.x + dx, y: mother.y + dy };
          break;
        }
      }
    }
    if (!spawnPos) spawnPos = { x: mother.x, y: mother.y };

    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    const childGender = Math.random() < 0.5 ? 'male' : 'female';
    const _childSkins = ['skeleton_0.png', 'goblin_0.png'];
    const childSkin = _childSkins[Math.floor(Math.random() * _childSkins.length)];
    const names = (Reg.df && Reg.df.names) ? Reg.df.names : ['Малыш'];
    const surnames = (Reg.df && Reg.df.surnames) ? Reg.df.surnames : ['Юный'];

    const child = {
      id: 'npc_' + Date.now() + Math.random(),
      name: pick(names) + ' ' + pick(surnames),
      profession: { id: 'child', name: 'Ребёнок', color: '#888' },
      trait: (Reg.df && Reg.df.traits) ? pick(Reg.df.traits) : { id: 'curious', name: 'Любопытный' },
      habit: (Reg.df && Reg.df.habits) ? pick(Reg.df.habits) : 'Играет',
      skinFile: childSkin,
      gender: childGender,
      age: 0,
      isChild: true,
      familyNeed: 0,
      pregnancy: 0,
      children: [],
      x: spawnPos.x, y: spawnPos.y,
      task: { type: 'idle', path: [] },
      alive: true,
      inv: { ore: 0 },
      hp: 50, maxHp: 50,
      hunger: 20, maxHunger: 100
    };

    state.npcs.push(child);
    mother.children.push(child.id);

    Reg.log(`[Семья] ${mother.name} родила ребёнка: ${child.name}.`, 'good');
    Reg.addMemory(mother, `Я родила ${child.name}.`, { type: 'joy', power: 40, category: 'family' });

    // Запускаем хуки найма (характер, тело, отношения)
    Reg.fire('npc_hired', child);

    return child;
  }

  console.log('[Dwarf Family] Семья и размножение дварфов активны.');
})();
