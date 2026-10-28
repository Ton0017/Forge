Reg.on('npc_hired', (npc) => {
  npc.wallet = 20; // СТАРТОВЫЕ ДЕНЬГИ (на эль и закуски)
});

Reg.on('tick', (state) => {
  if (state.tick === 0) return;
  
  // ЗАЩИТА ДЛЯ СТАРЫХ СОХРАНЕНИЙ
  if (state.lastPayday === undefined) state.lastPayday = state.tick;
  
  // Раз в 300 тиков (15 дней)
  if (state.tick - state.lastPayday >= 160) {
    state.lastPayday = state.tick;
    const alive = state.npcs.filter(n => n.alive);
    
    alive.forEach(npc => {
      const wage = 10;
      if (state.gold >= wage) {
        state.gold -= wage;
        npc.wallet = (npc.wallet || 0) + wage; // Защита от NaN
        npc.emo.stress = Math.max(0, npc.emo.stress - 10);
        Reg.log(`[Зарплата] ${npc.name} получает ${wage} золота в свой кошелек.`, 'good');
      } else {
        npc.emo.stress = Math.min(100, npc.emo.stress + 30);
        Reg.log(`[Зарплата] ${npc.name} не получил зарплату! Он в ярости.`, 'death');
      }
    });
  }
});
