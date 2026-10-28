Reg.on('world_init', (state) => {
  state.lastPayday = 0;
});

Reg.on('tick', (state) => {
  if (state.tick === 0) return;
  
  // ЗАЩИТА ДЛЯ СТАРЫХ СОХРАНЕНИЙ
  if (state.lastPayday === undefined) state.lastPayday = state.tick;

  // 1. ЕЖЕДНЕВНЫЙ НАЛОГ (Раз в день = 20 тиков)
  // Мы отключили его, чтобы ты мог накопить золото на зарплату.
  // Если захочешь вернуть, раскомментируй код ниже.
  /*
  if (state.tick % 20 === 0) {
    const aliveCount = state.npcs.filter(n => n.alive).length;
    const tax = aliveCount * 2;
    if (state.gold >= tax) {
      state.gold -= tax;
    } else {
      state.gold = 0;
      state.npcs.forEach(n => { if (n.alive) n.emo.stress = Math.min(100, n.emo.stress + 1); });
    }
  }
  */
});
