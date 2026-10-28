(function(){
  // 1. СИСТЕМА СТАРЕНИЯ (Раз в игровой год)
  Reg.on('tick', (state) => {
    if (!state || state.tick % 2000 !== 0) return; // Раз в 100 дней (условный год)
    
    state.npcs.forEach(npc => {
      if (!npc.alive) return;
      if (!npc.age) npc.age = 20 + Math.floor(Math.random() * 30); // Стартовый возраст 20-50
      
      npc.age++;
      
      // В старости (после 70) начинают отказывать органы
      if (npc.age > 70) {
         if (Math.random() < 0.3) {
            npc.hp -= 10;
            Reg.log(`${npc.name} чувствует слабость. Старость берет свое.`, 'sys');
            const ageThought = Reg.composer.generate(npc, 'injury', 'old', { part: 'torso', type: 'old' });
            if (ageThought) Reg.addMemory(npc, ageThought.text, ageThought.emo);
         }
         if (npc.age > 85 && Math.random() < 0.2) {
            killNpc(npc, 'умер от старости');
            Reg.log(`${npc.name} тихо умирает во сне. Его время пришло.`, 'death');
         }
      }
    });
  });

  // 2. ИНФЕКЦИИ И ГНИЕНИЕ РАН
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || !npc.body || state.tick % 50 !== 0) return false;

    // ФИЗИКА ГРЯЗИ: Дварф пачкается, когда копает
    if (npc.task && npc.task.type === 'dig') {
        npc.dirt = Math.min(100, (npc.dirt || 0) + 5);
    }
    // Дварф отмывается, если стоит на воде
    const cell = getCell(npc.x, npc.y);
    if (cell && cell.type === 'water' && npc.dirt > 0) {
        npc.dirt = Math.max(0, npc.dirt - 10);
    }

    // Проверяем все части тела на наличие открытых ран
    for (let part in npc.body) {
      const b = npc.body[part];
      if (b.status === 'cut' || b.status === 'fracture') {
        // Инфекция уже назначена в body_system (физически)
        if (b.infection > 0) {
          if (!npc.infections) npc.infections = [];
          if (!npc.infections.includes(part)) {
            npc.infections.push(part);
            const infThought = Reg.composer.generate(npc, 'injury', 'infection', { part: part, type: 'infection' });
            if (infThought) Reg.addMemory(npc, infThought.text, infThought.emo);
          }
        }
      }
    }

    // Эффект инфекции
    if (npc.infections && npc.infections.length > 0) {
      npc.hp -= npc.infections.length * 2;
      npc.emo.stress = Math.min(100, npc.emo.stress + 2);
      
      // Жар и бред
      if (Math.random() < 0.1) {
         const feverThought = Reg.composer.generate(npc, 'injury', 'fever', { part: 'head', type: 'infection' });
         if (feverThought) Reg.addMemory(npc, feverThought.text, feverThought.emo);
      }

      if (npc.hp <= 0) {
         killNpc(npc, 'умер от заражения крови');
         Reg.log(`${npc.name} умирает от гангрены.`, 'death');
         return true;
      }
    }
    return false;
  });

  // 3. ЗАРАЖЕННАЯ ВОДА
  // Если кто-то умирает на клетке с водой, она становится "зараженной"
  const origKillNpc = window.killNpc;
  if (origKillNpc) {
    window.killNpc = function(npc, reason) {
      if (!npc.alive) return;
      
      const cell = getCell(npc.x, npc.y);
      if (cell && cell.type === 'water') {
         cell.infected_water = true;
         if (Reg.log) Reg.log(`[ОПАСНОСТЬ] Вода в этом месте заражена трупным ядом.`, 'death');
      }
      
      return origKillNpc(npc, reason);
    };
  }

  // Питье зараженной воды
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || state.tick % 20 !== 0) return false;
    
    const cell = getCell(npc.x, npc.y);
    // Если дварф пьет (или стоит) на зараженной воде
    const isWild = !npc.skinFile || npc.isAnimal || npc.isMonster;
    if (cell && cell.type === 'water' && cell.infected_water && (npc.task?.type === 'go_to_water' || (isWild && Math.random() < 0.05))) {
        if (Math.random() < 0.3) {
           npc.hp -= 5;
           npc.emo.stress = Math.min(100, npc.emo.stress + 10);
           Reg.log(`${npc.name} пьет из зараженного источника и корчится от боли.`, 'death');
           Reg.addMemory(npc, "Вода была отравлена. Внутри все горит.", { type: 'sadness', power: 25, category: 'disease' });
           npc.task = { type: 'idle', path: [] };
        }
    }
    return false;
  });

  console.log('[Disease System] Инфекции, старость и зараженная вода активированы.');
})();
