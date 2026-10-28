// Жестко прописываем точные имена файлов из твоей папки
const sprites = {
  goblin: 'goblin shaman.png',
  skeleton: 'skeleton king.png',
  troll: 'boss troll.png',
  orc: 'Orc warrior 2.png'
};

function drawMonster(ctx, sx, sy, mId, fallbackColor) {
  const fileName = sprites[mId];
  if (fileName) {
    const img = getImg('assets/skins/' + fileName);
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, sx, sy, 32, 32);
      return;
    }
  }
  
  // Если картинка не загрузилась, рисуем заглушку
  ctx.fillStyle = fallbackColor; ctx.fillRect(sx+8, sy+8, 16, 16);
  ctx.fillStyle = '#000'; ctx.fillRect(sx+10, sy+10, 2, 2); ctx.fillRect(sx+18, sy+10, 2, 2);
}

Reg.monster({ id: 'goblin', name: 'Гоблин', hp: 12, atk: 2, drops: [{ item: 'gold', chance: 0.4 }], draw: (ctx, sx, sy) => drawMonster(ctx, sx, sy, 'goblin', '#3a5a2a') });
Reg.monster({ id: 'skeleton', name: 'Скелет', hp: 10, atk: 3, drops: [{ item: 'bone', chance: 0.8 }], draw: (ctx, sx, sy) => drawMonster(ctx, sx, sy, 'skeleton', '#dddddd') });
Reg.monster({ id: 'troll', name: 'Тролль', hp: 35, atk: 5, drops: [{ item: 'gold', chance: 0.9 }], draw: (ctx, sx, sy) => drawMonster(ctx, sx, sy, 'troll', '#4a6a3a') });
Reg.monster({ id: 'orc', name: 'Орк', hp: 20, atk: 3, drops: [{ item: 'ore', chance: 0.5 }], draw: (ctx, sx, sy) => drawMonster(ctx, sx, sy, 'orc', '#5a4a2a') });

const originalSpawn = window.spawnMonster;
window.spawnMonster = function() {
  if (!state || !state.cells) return;
  let count = 0;
  for (let k in state.cells) if (state.cells[k].monster) count++;
  if (count >= 3) return;

  if (Math.random() < 0.6) {
    const ids = ['goblin', 'skeleton', 'orc', 'troll'];
    const mId = ids[Math.floor(Math.random() * ids.length)];
    const def = Reg.monsters[mId];
    const floors = [];
    for (const k in state.cells) {
      const c = state.cells[k];
      if (c.type === 'floor' && !c.monster) {
        const [x, y] = k.split(',').map(Number);
        if (Math.abs(x) + Math.abs(y) > 8) floors.push({ x, y });
      }
    }
    if (floors.length > 0) {
      const p = floors[Math.floor(Math.random() * floors.length)];
      getCell(p.x, p.y).monster = { ...def, x: p.x, y: p.y, hp: def.hp };
    }
  } else {
    if (originalSpawn) originalSpawn();
  }
};
