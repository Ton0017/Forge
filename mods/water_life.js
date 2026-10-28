(function(){
  // 1. ДВАРФЫ ПЬЮТ ИЗ ОЗЕР (Если есть жажда и рядом вода)
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || !npc.task) return false;
    if (npc.thirst < 60) return false;
    if (npc.task.type !== 'idle' && npc.task.type !== 'wander') return false;

    // Ищем воду в радиусе 5 клеток
    let waterPos = null;
    for (let dx = -5; dx <= 5; dx++) {
      for (let dy = -5; dy <= 5; dy++) {
        const c = getCell(npc.x + dx, npc.y + dy);
        if (c && c.type === 'water') { waterPos = { x: npc.x + dx, y: npc.y + dy }; break; }
      }
    }

    if (waterPos) {
      // Идем к воде
      const path = window.GameUtils.findPath(npc.x, npc.y, waterPos.x, waterPos.y, 'floor');
      if (path && path.length > 0) {
        npc.task = { type: 'go_to_water', path, target: waterPos };
        return true;
      } else if (path && path.length === 0) {
        // Уже стоит на воде (или не может найти путь)
        npc.task = { type: 'idle', path: [] };
        return true;
      } else if (Math.abs(npc.x - waterPos.x) + Math.abs(npc.y - waterPos.y) <= 1) {
        // Уже стоим рядом
        npc.thirst = 0;
        npc.emo.stress = Math.max(0, npc.emo.stress - 10); // Вода успокаивает
        Reg.log(`${npc.name} пьет из подземного озера.`, 'sys');
        
        // Эмерджентность: мысли о воде
        const thought = Reg.composer.generate(npc, 'water', 'drink');
        if (thought) Reg.addMemory(npc, thought.text, thought.emo);
        
        npc.task = { type: 'idle', path: [] };
        return true;
      }
    }
    return false;
  });

  // 2. ЗВЕРИ ПЬЮТ ИЗ ОЗЕР
  Reg.on('tick', (state) => {
    if (!state || state.tick % 20 !== 0) return;
    const cells = state.cells;
    
    for (const k in cells) {
      const c = cells[k];
      if (c.animal && c.animal.thirst > 60) {
         const [x, y] = k.split(',').map(Number);
         
         // Ищем воду или эль в радиусе 4 клеток
         let targetLiq = null;
         for (let dx = -4; dx <= 4; dx++) {
           for (let dy = -4; dy <= 4; dy++) {
             const nc = getCell(x + dx, y + dy);
             if (nc && (nc.type === 'water' || nc.type === 'beer_tap')) { targetLiq = { x: x + dx, y: y + dy, type: nc.type, cell: nc }; break; }
           }
           if (targetLiq) break;
         }
         
         if (targetLiq) {
             const dist = Math.abs(x - targetLiq.x) + Math.abs(y - targetLiq.y);
             if (dist <= 1) {
                 // Уже рядом — пьем
                 if (targetLiq.type === 'water') c.animal.thirst = 0;
                 else if (targetLiq.type === 'beer_tap') {
                     c.animal.thirst = 0;
                     c.animal.drunk = 100;
                     targetLiq.cell.type = 'floor';
                     if (window.recordMobAction) window.recordMobAction(c.animal, 'drank_booze');
                     const _drinkTxt = window.generateMobActionText ? window.generateMobActionText(c.animal) : 'выпил эль.';
                     Reg.log(`${c.animal.name}: ${_drinkTxt}`, 'sys');
                 }
             } else {
                 // Идем к жидкости
                 const stepX = Math.sign(targetLiq.x - x);
                 const stepY = Math.sign(targetLiq.y - y);
                 const nextCell = getCell(x + stepX, y + stepY);
                 if (nextCell && nextCell.type !== 'stone' && nextCell.type !== 'water' && !nextCell.animal && !nextCell.monster) {
                     nextCell.animal = c.animal;
                     c.animal = null;
                     nextCell.animal.x = x + stepX;
                     nextCell.animal.y = y + stepY;
                 }
             }
         }
      }
    }
  });

  // 3. УСПОКОЕНИЕ РЯДОМ С ВОДОЙ (Пассивный эффект)
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || state.tick % 50 !== 0) return false;
    const c = getCell(npc.x, npc.y);
    if (c && c.type === 'water') {
       // Если дварф случайно оказался на воде (например, спавн), он не тонет, а просто мокнет
       npc.emo.stress = Math.max(0, npc.emo.stress - 1);
    }
    return false;
  });

  // Регистрируем объект воды для композера
  if (Reg.composer && !Reg.composer.objects['water']) {
    Reg.composer.register('water', {
      name: 'вода',
      verbs: ['смотрит на', 'трогает', 'пьет из'],
      adjectives: ['холодную', 'чистую', 'темную'],
      traits: {
        curiosity: { emotion: 'интерес', text: 'Он размышляет о том, откуда здесь вода.', emoType: 'joy' },
        anxiety: { emotion: 'беспокойство', text: 'Он боится, что вода может подняться.', emoType: 'fear' }
      }
    });
  }

  console.log('[Water Life] Вода теперь безопасна, но полезна.');
})();
