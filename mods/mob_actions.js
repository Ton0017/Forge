(function(){
  // 1. ФУНКЦИЯ ЗАПИСИ ДЕЙСТВИЯ
  window.recordMobAction = function(mob, actionType, targetName) {
    if (!mob) return;
    if (!mob.recentActions) mob.recentActions = [];
    
    // Записываем последнее действие
    mob.recentActions.unshift({ type: actionType, target: targetName, time: Date.now() });
    
    // Держим только последние 3 действия, чтобы не засорять память
    if (mob.recentActions.length > 3) mob.recentActions.pop();
  };

  // 2. АТОМАРНЫЙ ГЕНЕРАТОР (Сборка из слоёв)
  window.generateMobActionText = function(mob) {
    const L = Reg.mobAct;
    if (!L) return "Он просто существует.";
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    // Если действий нет — возвращаем атмосферный дефолт
    if (!mob.recentActions || mob.recentActions.length === 0) {
       return "Он просто живет своей жизнью в темноте шахты.";
    }

    const lastAction = mob.recentActions[0];
    const type = lastAction.type;

    // Собираем части
    const verb = (L.verbs[type] && L.verbs[type].length) ? pick(L.verbs[type]) : "делает что-то с";
    const obj = lastAction.target || ((L.objects[type] && L.objects[type].length) ? pick(L.objects[type]) : "предметом");
    const ctx = pick(L.contexts);
    const fin = (L.finals[type] && L.finals[type].length) ? pick(L.finals[type]) : "Он выглядит напряженным.";

    // Выбираем наречие на основе граней характера и состояния
    let adv = "";
    const f = mob.facets || {};
    const hpPercent = (mob.hp / (mob.maxHp || 10));

    if (mob.hunger > 80 || hpPercent < 0.3) {
        adv = pick(L.adverbs.tired) + " ";
    } else if (f.aggression > 70) {
        adv = pick(L.adverbs.aggression_high) + " ";
    } else if (f.bravery < 30) {
        adv = pick(L.adverbs.bravery_low) + " ";
    } else if (Math.random() < 0.5) {
        adv = pick(L.adverbs.default) + " ";
    }

    // Склеиваем: [Имя] [наречие] [глагол] [объект]. [контекст] [финал]
    return `${mob.name} ${adv}${verb} ${obj}. ${ctx} ${fin}`;
  };

  // 3. ПЕРЕХВАТ ПИТЬЯ (Из drunk_wildlife.js)
  const origDrink = window.state ? window.state.npcs : null; // заглушка
  // Мы добавим вызов recordMobAction прямо в drunk_wildlife
  // А пока перехватим смерть дварфа от монстра
  const origKill = window.killNpc;
  if (origKill) {
    window.killNpc = function(npc, reason) {
       if (!npc.alive) return;
       
       // Если убил монстр (ищем монстра рядом)
       for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
             const c = getCell(npc.x + dx, npc.y + dy);
             if (c && c.monster) {
                window.recordMobAction(c.monster, 'killed_dwarf', npc.name);
             }
          }
       }
       return origKill(npc, reason);
    };
  }
  
  // 4. ПЕРЕХВАТ АТАКИ (Если дварф бьет монстра)
  Reg.on('npc_tick', (npc, state) => {
     if (!npc.alive || !npc.task || npc.task.type !== 'go_to_hunt') return false;
     const t = npc.task.target;
     if (!t) return false;
     const c = getCell(t.x, t.y);
     if (c && c.monster && Math.random() < 0.1) {
        window.recordMobAction(c.monster, 'hurt', npc.name);
     }
     return false;
  });

  console.log('[Mob Actions] Система записи действий мобов активна.');
})();
