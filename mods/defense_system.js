(function(){
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || npc.hasGoneInsane) return false;

    // 1. Ищем агрессора рядом (Безумца ИЛИ пьяного агрессивного дварфа)
    let attacker = null;
    if (state.npcs) {
       attacker = state.npcs.find(n => {
           if (!n.alive || n.id === npc.id) return false;
           const dist = Math.abs(n.x - npc.x) + Math.abs(n.y - npc.y);
           if (dist > 1) return false;
           
           const isInsane = n.hasGoneInsane;
           const isDrunkAggressive = (n.emo && n.emo.drunk > 60 && n.facets && n.facets.aggression > 60);
           
           return isInsane || isDrunkAggressive;
       });
    }

    // 2. Если рядом агрессор
    if (attacker) {
       // Если дварф храбрый (или пьяный сам), он бьет в ответ
       if (!npc.facets || npc.facets.courage > 30) {
           if (window.applyBodyDamage) {
               // Бьем в ответ (дробящий урон)
               window.applyBodyDamage(attacker, 5, 'blunt', 'torso');
           } else {
               attacker.hp -= 5;
           }
           
           if (state.tick % 50 === 0) {
               Reg.log(`[ДРАКА] ${npc.name} защищается и бьет ${attacker.name}!`, 'combat');
           }
           npc.task = { type: 'fight' };
           return true;
       } else {
           // Если трус — он пытается убежать
           if (state.tick % 20 === 0) {
               Reg.log(`${npc.name} в панике убегает от ${attacker.name}!`, 'sys');
               // Принудительно сбрасываем задачу, чтобы он начал блуждать (убегать)
               npc.task = { type: 'wander', path: [] }; 
           }
           return true;
       }
    }
    return false;
  });
  console.log('[Defense System] Защита работает и против безумцев, и против пьяных агрессоров.');
})();
