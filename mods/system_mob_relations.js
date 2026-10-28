(function(){
  // Инициализация отношений
  function initMobMind(mob) {
    if (!mob.relations) mob.relations = {};
    if (!mob.memory) mob.memory = [];
    if (!mob.bondedTo) mob.bondedTo = null;
  }

  Reg.on('tick', (state) => {
    if (state.tick % 20 !== 0) return; // Работаем раз в 20 тиков

    for (let k in state.cells) {
      const c = state.cells[k];
      if (!c.animal && !c.monster) continue;

      const mob = c.animal || c.monster;
      initMobMind(mob);

      // Защита: если у моба нет характера (старые сейвы), пропускаем
      if (!mob.facets) continue;

      const [x, y] = k.split(',').map(Number);

      // Ищем дварфов рядом
      for (let dx = -2; dx <= 2; dx++) {
        for (let dy = -2; dy <= 2; dy++) {
          const n = state.npcs.find(n => n.alive && n.x === x + dx && n.y === y + dy);
          if (!n) continue;

          const dist = Math.abs(dx) + Math.abs(dy);

          // === ШЕСТЕРЁНКА 1: АГРЕССИЯ ===
          // Если моб злой и дварф прямо перед ним — он может напасть
          if (mob.facets.aggression > 70 && dist === 1 && Math.random() < 0.3) {
            if (window.Reg && Reg.doCombat && !mob.task) {
                // Записываем, что моб зол
                if (window.recordMobAction) window.recordMobAction(mob, 'attacked', n.name);
                // Вступаем в бой (через систему боя)
                if (mob.isHostile !== true) mob.isHostile = true; // Временно агрим
                // Атакуем (бой сам сгенерирует описание)
                try { Reg.doCombat(mob, n, state); } catch(e) {}
                continue;
            }
          }

          // === ШЕСТЕРЁНКА 2: ТРУСОСТЬ ===
          // Если моб труслив — он убегает от дварфа
          if (mob.facets.bravery < 30 && dist <= 2 && Math.random() < 0.4) {
            const fleeX = x - Math.sign(dx);
            const fleeY = y - Math.sign(dy);
            const fleeCell = getCell(fleeX, fleeY);
            if (fleeCell && fleeCell.type === 'floor' && !fleeCell.animal && !fleeCell.monster) {
                fleeCell.animal = mob;
                c.animal = null;
                mob.x = fleeX; mob.y = fleeY;
                if (window.recordMobAction) window.recordMobAction(mob, 'fled', n.name);
                continue;
            }
          }

          // === ШЕСТЕРЁНКА 3: ОБЩИТЕЛЬНОСТЬ (и Альтруизм дварфа) ===
          // Привязанность растет только у общительных мобов
          if (mob.facets.sociality > 40) {
            // Множитель: общительность моба * альтруизм дварфа
            const dwarfAltruism = (n.facets && n.facets.altruism) ? n.facets.altruism : 50;
            const bondRate = (mob.facets.sociality / 100) * (dwarfAltruism / 100) * 2;
            
            const curVal = mob.relations[n.id] || 0;
            mob.relations[n.id] = curVal + bondRate;

            // Проверка на привязку (порог 50)
            if (mob.relations[n.id] >= 50 && !mob.bondedTo) {
              mob.bondedTo = n.id;
              if (window.recordMobAction) window.recordMobAction(mob, 'bonded', n.name);
              const bondText = window.generateMobActionText ? window.generateMobActionText(mob) : "Он привязался к дварфу.";
              Reg.log(`${mob.name}: ${bondText}`, 'sys');
            }
          }
        }
      }
    }
  });

  // === СЛЕДСТВИЕ: ДВИЖЕНИЕ К ХОЗЯИНУ ===
  Reg.on('tick', (state) => {
    if (state.tick % 10 !== 0) return;

    for (let k in state.cells) {
      const c = state.cells[k];
      if (!c.animal && !c.monster) continue;

      const mob = c.animal || c.monster;
      if (!mob.bondedTo) continue;

      const owner = state.npcs.find(n => n.id === mob.bondedTo && n.alive);
      
      // Если хозяин умер — моб в печали
      if (!owner) {
        mob.bondedTo = null;
        mob.memory.push({ type: 'sadness', text: 'Хозяин ушел навсегда.' });
        if (window.recordMobAction) window.recordMobAction(mob, 'mourning');
        const mournText = window.generateMobActionText ? window.generateMobActionText(mob) : "Он потерял хозяина.";
        Reg.log(`${mob.name}: ${mournText}`, 'sys');
        continue;
      }

      const [x, y] = k.split(',').map(Number);
      const dist = Math.abs(x - owner.x) + Math.abs(y - owner.y);

      // Если моб слишком далеко от хозяина — он идёт к нему
      if (dist > 3 && Math.random() < 0.5) {
        const stepX = Math.sign(owner.x - x);
        const stepY = Math.sign(owner.y - y);
        const nextCell = getCell(x + stepX, y + stepY);
        
        if (nextCell && nextCell.type === 'floor' && !nextCell.animal && !nextCell.monster && !state.npcs.some(n => n.x === x + stepX && n.y === y + stepY)) {
          nextCell.animal = mob;
          c.animal = null;
          mob.x = x + stepX;
          mob.y = y + stepY;
        }
      }
    }
  });
  
  console.log('[Mob Relations] Шестерёнки привязанности и агрессии запущены.');
})();
