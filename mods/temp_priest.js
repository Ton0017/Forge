(function(){
  window.hirePriest = function() {
    let s = null;
    try { s = state; } catch(e) {}
    if (!s && window.state) s = window.state;
    
    if (!s) { alert("Ошибка: Игра не загружена."); return; }
    if (s.gold < 100) { alert('Нужно 100 золота для найма! У вас: ' + Math.floor(s.gold)); return; }
    
    // Ищем свободное место рядом с кузней (радиус 3)
    let spawnX = s.forgePos.x;
    let spawnY = s.forgePos.y;
    let foundSpot = false;

    for (let dx = -3; dx <= 3; dx++) {
        for (let dy = -3; dy <= 3; dy++) {
            const c = getCell(spawnX + dx, spawnY + dy);
            // Ищем пол, где никого нет
            if (c && c.type === 'floor' && !s.npcs.find(n => n.x === spawnX+dx && n.y === spawnY+dy)) {
                spawnX += dx;
                spawnY += dy;
                foundSpot = true;
                break;
            }
        }
        if (foundSpot) break;
    }

    s.gold -= 100;
    
    const priest = {
      id: 'priest_' + Date.now(),
      name: 'Странствующий Жрец',
      skinFile: 'Hobbit.png',
      alive: true,
      x: spawnX, y: spawnY,
      hp: 100, maxHp: 100,
      blood: 100,
      isTempPriest: true,
      profession: { id: 'priest', name: 'Жрец' },
      trait: { id: 'pious', name: 'Набожный' },
      paidUntil: s.tick + 1000, 
      speed: 1.0,
      task: { type: 'idle', path: [] },
      emo: { stress: 0, joy: 20, fear: 0, drunk: 0 },
      facets: { courage: 90, altruism: 90, greed: 40 },
      skills: { combat: 5 },
      weapon: { id: 'staff', name: 'Посох', damage: 5 },
      equipment: { weapon: { name: 'Посох', dmgMod: 5, tags: ['weapon', 'light'] }, armor: null },
      fatigue: 0, hunger: 0, thirst: 0, healCooldown: 0,
      longTerm: { alcoholism: 0, cirrhosis: 0 },
      memory: { shortTerm: [], longTerm: [] }, // ПАМЯТЬ
      relations: {}, // ОТНОШЕНИЯ
      inventory: []
    };
    
    if (!s.npcs) s.npcs = [];
    priest.facets = { aggression: 20, bravery: 60, sociality: 50, curiosity: 50, altruism: 80, anxiety: 30, greed: 10 };
    priest.emo = { stress: 0, joy: 50, fear: 0, drunk: 0 };
    priest.inventory = [];
    priest.equipment = { weapon: null, armor: null, accessory: null };
    s.npcs.push(priest);
    
    Reg.log(`[Найм] Странствующий Жрец прибыл в шахту.`, 'good');
    alert(`Жрец нанят! Он появился рядом с кузней (X:${spawnX}, Y:${spawnY})`);
    
    // Принудительно обновляем UI, чтобы увидеть списание золота
    if (window.renderUI) window.renderUI();
    if (window.closePanels) window.closePanels(); // Закрываем меню, чтобы увидеть жреца
  };



  // Логика жреца (лечение, усталость и т.д.)
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.isTempPriest || !npc.alive) return false;

    npc.fatigue = Math.min(100, npc.fatigue + 0.5);
    npc.hunger = Math.min(100, npc.hunger + 0.2);
    npc.thirst = Math.min(100, npc.thirst + 0.3);
    if (npc.healCooldown > 0) npc.healCooldown--;

    if (npc.fatigue > 70) {
        npc.task = { type: 'idle', path: [] };
        npc.fatigue -= 1.5;
        return true; 
    }

    // (Копание заблокировано в utility_ai.js)

    if (state.tick > npc.paidUntil) {
       if (!npc.demandingMoney) {
          npc.demandingMoney = true;
          Reg.log(`[Жрец] Время оплаты вышло. Жрец требует золото!`, 'combat');
          Reg.addMemory(npc, "Мне не заплатили.", { type: 'anger', power: 20, category: 'trade' });
       }
       if (npc.task && npc.task.type === 'heal') npc.task = { type: 'idle', path: [] };
    } else {
        // Лечение
        if (npc.healCooldown === 0 && state.tick % 10 === 0) {
           const patients = state.npcs.filter(n => 
               n.id !== npc.id && n.alive && 
               Math.abs(n.x - npc.x) + Math.abs(n.y - npc.y) <= 8 && 
               ((n.hp < n.maxHp) || (n.blood && n.blood < 100) || (n.infections && n.infections.length > 0))
           );

           if (patients.length > 0) {
              const patient = patients[0];
              const dist = Math.abs(npc.x - patient.x) + Math.abs(npc.y - patient.y);

              if (dist <= 1) {
                 let successChance = 0.8;
                 if (patient.blood <= 10) successChance = 0.1;
                 else if (patient.blood < 30) successChance = 0.4;

                 if (Math.random() < successChance) {
                     if (patient.blood !== undefined) patient.blood = Math.min(100, patient.blood + 20);
                     if (patient.hp < patient.maxHp) patient.hp = Math.min(patient.maxHp, patient.hp + 10);
                     if (patient.infections && patient.infections.length > 0 && Math.random() < 0.5) patient.infections.pop();
                     
                     Reg.log(`[Жрец] Жрец перевязал раны ${patient.name}.`, 'good');
                     Reg.addMemory(patient, "Жрец промыл мои раны.", { type: 'joy', power: 15, category: 'heal' });
                 } else {
                     Reg.log(`[Жрец] Жрец не смог спасти ${patient.name}.`, 'death');
                     Reg.addMemory(patient, "Жрец пытался меня спасти, но не смог.", { type: 'fear', power: 25, category: 'heal' });
                 }
                 npc.healCooldown = 50; 
                 npc.fatigue += 5; 
                 npc.task = { type: 'idle', path: [] };
              } else {
                 if (!npc.task.path || npc.task.path.length === 0) {
                    const path = window.GameUtils.findPath(npc.x, npc.y, patient.x, patient.y, 'floor');
                    if (path && path.length > 0) npc.task = { type: 'go_to_patient', path: path };
                 }
              }
           }
        }

        if (npc.task && npc.task.type === 'go_to_patient' && npc.task.path && npc.task.path.length > 0) {
            const step = npc.task.path.shift();
            npc.x = step.x; npc.y = step.y;
            return true;
        }
    }
    return false;
  });

  // Кнопка найма теперь находится в mods/forge_ui.js

})();
