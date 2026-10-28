// Инициализация эмоций при найме
Reg.on('npc_hired', (npc) => {
  npc.emo = { stress: 0, joy: 20, fear: 0, drunk: 0 };
  npc.longTerm = { alcoholism: 0 };
});

// Обновление эмоций каждый тик
Reg.on('npc_tick', (npc, state) => {
  if (!npc.emo) npc.emo = { stress: 0, joy: 20, fear: 0, drunk: 0 };

  // Стресс растет от работы
  if (npc.task.type === 'dig') npc.emo.stress = Math.min(100, npc.emo.stress + 0.5);
  
  // Стресс падает от отдыха/еды
  if (npc.task.type === 'rest') npc.emo.stress = Math.max(0, npc.emo.stress - 2);
  
  // Страх растет, если рядом монстр (даже если он не вступает в бой)
  const hasMonster = findAdjacentMonster(npc.x, npc.y);
  if (hasMonster) npc.emo.fear = Math.min(100, npc.emo.fear + 5);
  else npc.emo.fear = Math.max(0, npc.emo.fear - 1);

  // Страх падает, если он Трус и убежал (находится у кровати)
  if (npc.trait.id === 'coward' && npc.task.type === 'rest') npc.emo.fear = Math.max(0, npc.emo.fear - 5);
});
