(function(){
  Reg.on('npc_hired', (npc) => {
    if (npc.pain === undefined) npc.pain = 0;
    if (npc.nausea === undefined) npc.nausea = 0;
    if (npc.temp === undefined) npc.temp = 37;
    if (npc.unconscious === undefined) npc.unconscious = false;
  });

  // 1. РАСЧЕТ БОЛИ И ТЕМПЕРАТУРЫ
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || !npc.body) return false;

    // БОЛЬ
    let targetPain = 0;
    for (let part in npc.body) {
      const b = npc.body[part];
      if (b.status === 'fracture') targetPain += 20;
      if (b.status === 'cut') targetPain += 10;
      if (b.status === 'severed') targetPain += 40;
    }
    if (npc.infections) targetPain += npc.infections.length * 15;

    if (npc.pain < targetPain) npc.pain += 2;
    else if (npc.pain > targetPain) npc.pain -= 1;

    // Мысли о боли (через генератор)
    if (npc.pain > 50 && Math.random() < 0.1) {
       const thought = Reg.composer.generate(npc, 'physiology', 'state', { type: 'pain' });
       if (thought) Reg.addMemory(npc, thought.text, thought.emo);
    }
    
    // Болевой шок (обморок)
    if (npc.pain > 90 && Math.random() < 0.05 && !npc.unconscious) {
       npc.unconscious = true;
       npc.unconsciousTimer = 50 + Math.floor(Math.random() * 50);
       const thought = Reg.composer.generate(npc, 'physiology', 'state', { type: 'shock' });
       if (thought) {
          Reg.log(`[ШОК] ${npc.name} падает без сознания.`, 'death');
          Reg.addMemory(npc, thought.text, thought.emo);
       }
    }

    // ТЕМПЕРАТУРА
    let targetTemp = 37;
    const cell = getCell(npc.x, npc.y);
    
    if (cell) {
       if (cell.type === 'lava' || cell.type === 'fire' || cell.type === 'campfire') targetTemp = 80;
       else if (cell.type === 'water') targetTemp = 20;
       else if (cell.type === 'ice') targetTemp = 0;
    }
    
    if (npc.equipment && npc.equipment.armor) {
       if (npc.equipment.armor.tags.includes('fire')) targetTemp += 10;
       if (npc.equipment.armor.tags.includes('ice')) targetTemp -= 10;
    }

    if (npc.temp < targetTemp) npc.temp += 0.5;
    else if (npc.temp > targetTemp) npc.temp -= 0.5;

    // Ожоги и обморожения
    if (npc.temp > 45) {
       npc.hp -= 1;
       if (Math.random() < 0.05) {
          const t = Reg.composer.generate(npc, 'physiology', 'state', { type: 'heat' });
          if (t) Reg.addMemory(npc, t.text, t.emo);
       }
    } else if (npc.temp < 30) {
       npc.speed = 0.5;
       if (Math.random() < 0.05) {
          const t = Reg.composer.generate(npc, 'physiology', 'state', { type: 'cold' });
          if (t) Reg.addMemory(npc, t.text, t.emo);
       }
    } else {
       npc.speed = 1.0; 
    }

    return false;
  });

  // 2. ОБМОРОК
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive) return false;
    if (npc.unconscious) {
       npc.unconsciousTimer--;
       npc.task = { type: 'idle', path: [] };
       if (npc.unconsciousTimer <= 0) {
          npc.unconscious = false;
          Reg.log(`${npc.name} приходит в себя. Он стонет.`, 'sys');
          npc.pain = 50; 
       }
       return true; 
    }
    return false;
  });

  // 3. ТОШНОТА
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || state.tick % 50 !== 0) return false;

    let corpsesNearby = 0;
    for (let dx = -2; dx <= 2; dx++) {
       for (let dy = -2; dy <= 2; dy++) {
          const c = getCell(npc.x + dx, npc.y + dy);
          if (c && (c.corpse || c.type === 'corpse')) corpsesNearby++;
       }
    }

    if (corpsesNearby > 0) {
       let nauseaChance = 0.1;
       if (npc.facets && npc.facets.courage < 40) nauseaChance = 0.4;
       if (npc.facets && npc.facets.aesthetics > 60) nauseaChance = 0.6;

       if (Math.random() < nauseaChance) {
          npc.nausea += 20;
          const t = Reg.composer.generate(npc, 'physiology', 'state', { type: 'nausea' });
          if (t) Reg.addMemory(npc, t.text, t.emo);
       }
    }

    if (npc.nausea > 80 && !npc.vomiting) {
       npc.vomiting = true;
       npc.nausea = 0;
       npc.hunger = Math.max(0, npc.hunger - 30); 
       Reg.log(`${npc.name} падает на колени. Его рвет.`, 'sys');
       
       if (Math.random() < 0.3) {
          npc.unconscious = true;
          npc.unconsciousTimer = 30;
       }
       setTimeout(() => { npc.vomiting = false; }, 5000);
    }
    
    if (npc.nausea > 0) npc.nausea -= 1;
    return false;
  });

  // 4. ГАЛЛЮЦИНАЦИИ
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || !npc.holdingItem || state.tick % 100 !== 0) return false;
    
    if (npc.holdingItem.name && npc.holdingItem.name.includes('fly agaric')) {
       if (Math.random() < 0.2) {
          npc.hallucinating = true;
          const t = Reg.composer.generate(npc, 'physiology', 'state', { type: 'halluc' });
          if (t) {
             Reg.log(`[ГАЛЛЮЦИНАЦИИ] ${npc.name} смотрит в пустоту и улыбается.`, 'sys');
             Reg.addMemory(npc, t.text, t.emo);
          }
          
          const ally = state.npcs.find(n => n.alive && n.id !== npc.id && Math.abs(n.x - npc.x) + Math.abs(n.y - npc.y) <= 1);
          if (ally && Math.random() < 0.3) {
             Reg.log(`[БЕЗУМИЕ] ${npc.name} нападает на ${ally.name}, приняв его за монстра!`, 'death');
             ally.hp -= 15;
             Reg.addMemory(ally, "Он напал на меня. Он сошел с ума.", { type: 'anger', power: 25, category: 'betrayal' });
          }
       }
    }
    return false;
  });

  console.log('[Physiology System] Физиология активирована (генерация текстов).');
})();
