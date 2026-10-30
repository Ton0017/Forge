// Отрисовка объектов
Reg.tile('beer_tap', (ctx,sx,sy,seed) => {
  Reg.tiles['floor'](ctx,sx,sy,seed);
  ctx.fillStyle='#4a2a10'; ctx.fillRect(sx+8, sy+12, 16, 18); // Бочка
  ctx.fillStyle='#2a1a10'; ctx.fillRect(sx+8, sy+12, 16, 2); ctx.fillRect(sx+8, sy+28, 16, 2);
  ctx.fillStyle='#e0c060'; ctx.fillRect(sx+14, sy+18, 4, 4); // Краник
  ctx.fillStyle='#a06030'; ctx.fillRect(sx+12, sy+24, 8, 4); // Лужа
});

Reg.tile('bar_snack', (ctx,sx,sy,seed) => {
  Reg.tiles['floor'](ctx,sx,sy,seed);
  ctx.fillStyle='#4a3a2a'; ctx.fillRect(sx+4, sy+14, 24, 8); // Стол
  ctx.fillStyle='#2a1a10'; ctx.fillRect(sx+6, sy+22, 4, 6); ctx.fillRect(sx+22, sy+22, 4, 6);
  ctx.fillStyle='#c08040'; ctx.fillRect(sx+8, sy+10, 6, 4); ctx.fillRect(sx+18, sy+10, 6, 4); // Закуски
});

// Инициализация потребности в вере
Reg.on('npc_hired', (npc) => {
  npc.faithNeed = 0;
});

// Добавляем объекты на карту (И РАСШИРЯЕМ КОМНАТУ)
Reg.on('world_init', (state) => {
  const put = (x, y, type) => {
    const k = x+','+y;
    if (!state.cells[k]) state.cells[k] = { seed: Math.floor(Math.random()*10000), monster: null, corpse: null };
    state.cells[k].type = type;
  };

  // Расширяем комнату, чтобы было где ходить (делаем пол вокруг)
  for (let x = -3; x <= 4; x++) {
    for (let y = -3; y <= 3; y++) {
      const k = x+','+y;
      if (state.cells[k] && state.cells[k].type === 'stone') {
        state.cells[k].type = 'floor';
      }
    }
  }

  // Теперь ставим объекты РАЗДЕЛЬНО, чтобы к каждому был доступ
  put(3, 0, 'beer_tap');     // Кран с элем (правый угол)
  put(3, -1, 'bar_snack');   // Закуски (чуть выше)
  // Алтарь у нас уже стоит на (1,1)
});

// Логика драк в таверне
Reg.on('npc_tick', (npc, state) => {
  if (npc.emo && npc.emo.drunk > 60 && npc.facets && npc.facets.aggression > 50) {
    if (Math.random() < 0.05) {
      const victim = state.npcs.find(n => n.id !== npc.id && n.alive && Math.abs(n.x - npc.x) + Math.abs(n.y - npc.y) <= 1);
      if (victim) {
        // Бьем в случайную часть тела (дробящий урон)
        const parts = ['head', 'torso', 'left_arm', 'right_arm'];
        const hitPart = parts[Math.floor(Math.random() * parts.length)];
        
        if (window.applyBodyDamage) {
            victim.lastAttackerId = npc.id; // Запоминаем пьяного убийцу
            window.applyBodyDamage(victim, 10, 'blunt', hitPart);
        } else {
            victim.hp -= 10;
        }
        
        Reg.log(`[ДРАКА] Пьяный ${npc.name} бьет ${victim.name}!`, 'combat');
        Reg.addMemory(victim, `Пьяный ${npc.name} ударил меня в таверне.`, { type: 'anger', power: 20, category: 'tavern' });
        npc.emo.stress = Math.max(0, npc.emo.stress - 20);
        victim.emo.stress = Math.min(100, victim.emo.stress + 30);
        Reg.log(`${npc.name} в пьяной ярости бьет ${victim.name} по лицу!`, 'combat');
        if (npc.relations && victim.relations) {
          npc.relations[victim.id] = (npc.relations[victim.id] || 0) - 20;
          victim.relations[npc.id] = (victim.relations[npc.id] || 0) - 20;
        }
      }
    }
  }
});
