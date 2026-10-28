// Отрисовка костра
Reg.tile('campfire', (ctx, sx, sy, seed) => {
  Reg.tiles['floor'](ctx, sx, sy, seed);
  // Камни вокруг
  ctx.fillStyle = '#555';
  ctx.fillRect(sx+6, sy+20, 4, 4); ctx.fillRect(sx+22, sy+20, 4, 4);
  ctx.fillRect(sx+14, sy+24, 4, 4); ctx.fillRect(sx+4, sy+12, 4, 4);
  // Дрова
  ctx.fillStyle = '#3a2010';
  ctx.fillRect(sx+8, sy+18, 16, 3); ctx.fillRect(sx+10, sy+22, 12, 3);
  // Огонь
  ctx.fillStyle = '#a03010'; ctx.fillRect(sx+10, sy+10, 12, 12);
  ctx.fillStyle = '#e06020'; ctx.fillRect(sx+12, sy+12, 8, 8);
  ctx.fillStyle = '#f0c040'; ctx.fillRect(sx+14, sy+14, 4, 4);
});

// Расстановка костра на карте
Reg.on('world_init', (state) => {
  const put = (x, y, type) => {
    if (!state.cells[x+','+y]) state.cells[x+','+y] = { seed: Math.floor(Math.random()*10000), monster: null, corpse: null };
    state.cells[x+','+y].type = type;
  };
  put(-3, 0, 'campfire'); // слева от кровати
});

// Монстры дропают сырое мясо при убийстве
Reg.on('monsterDeath', (monster, npc, state) => {
  if (!npc.inv) npc.inv = {};
  const dropChance = monster.id === 'troll' ? 1.0 : 0.4; // Тролль жирный
  if (Math.random() < dropChance) {
    const meatAmount = monster.id === 'troll' ? 3 : 1;
    npc.inv.raw_meat = (npc.inv.raw_meat || 0) + meatAmount;
    Reg.log(`${npc.name} срезает ${meatAmount} кусок(а) мяса с ${monster.name}.`, 'sys');
  }
});

// Помечаем трупы дварфов как isDwarf (чтобы отличать от монстров)
Reg.on('tick', (state) => {
  if (state.tick % 10 !== 0) return;
  for (let k in state.cells) {
    const c = state.cells[k];
    if (c.corpse && !c.corpse.isDwarf) {
      const deadNpc = state.npcs.find(n => !n.alive && n.name === c.corpse.name);
      if (deadNpc) c.corpse.isDwarf = true;
    }
  }
});

// Ужас каннибализма: если рядом с трупом дварфа, добавляем особое воспоминание
Reg.on('tick', (state) => {
  if (state.tick % 20 !== 0) return;
  state.npcs.forEach(npc => {
    if (!npc.alive) return;
    for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0],[0,0]]) {
      const c = getCell(npc.x + dx, npc.y + dy);
      if (c && c.corpse && c.corpse.isDwarf) {
        // Если дварф не сумасшедший, он получает стресс от созерцания трупа товарища
        if (!npc.memory) return;
        const hasSeen = npc.memory.shortTerm.some(m => m.text.includes(c.corpse.name));
        if (!hasSeen && Math.random() < 0.3) {
          Reg.addMemory(npc, `Он смотрит на тело ${c.corpse.name}. Того, кого он знал. Это невыносимо.`, { type: 'sadness', power: 50, category: 'dwarf_corpse' });
        }
      }
    }
  });
});
