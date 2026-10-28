Reg.on('npc_hired', (npc) => {
  npc.relations = {}; // { npcId: score }
});

// ГЛОБАЛЬНАЯ ЗАЩИТА: Создаем relations для всех, у кого их нет
Reg.on('npc_tick', (npc, state) => {
    if (!npc.relations) npc.relations = {};
    return false;
});

Reg.on('npc_tick', (npc, state) => {
  if (!npc.relations) npc.relations = {};

  // Ищем рядом других дварфов (в радиусе 2 клеток)
  const others = state.npcs.filter(n => n.id !== npc.id && n.alive && Math.abs(n.x - npc.x) + Math.abs(n.y - npc.y) <= 2);
  
  if (others.length > 0 && Math.random() < 0.15) {
    const other = others[0];
    if (!npc.relations[other.id]) npc.relations[other.id] = 0;

    // Если оба работают (копают) или отдыхают рядом, отношения растут
    if (npc.task.type === other.task.type) {
      npc.relations[other.id] += 1;
    } else {
      // Если один работает, а другой бездельничает, отношения могут упасть
      npc.relations[other.id] -= 1;
    }

    // Ограничиваем от -100 до 100
    npc.relations[other.id] = Math.max(-100, Math.min(100, npc.relations[other.id]));

    // Генерируем мысль при сильных изменениях (и чтобы не спамило, проверяем только при переходе порога)
    if (npc.relations[other.id] === 10 || npc.relations[other.id] === 20 || npc.relations[other.id] === 50) {
      Reg.addMemory(npc, `Он чувствует, что сблизился с ${other.name}. Они хорошие друзья.`, { type: 'joy', power: 30, category: 'social' });
    } else if (npc.relations[other.id] === -10 || npc.relations[other.id] === -20 || npc.relations[other.id] === -50) {
      Reg.addMemory(npc, `Он ненавидит ${other.name}. Тот постоянно мешает ему работать.`, { type: 'anger', power: 30, category: 'social' });
    }
  }
});
