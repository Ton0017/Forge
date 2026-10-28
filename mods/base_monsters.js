Reg.monster({
  id: 'rat', name: 'Крыса', hp: 10, atk: 2, speed: 1,
  drops: [{ item: 'food', chance: 0.2 }],
  draw: (ctx, sx, sy) => {
    ctx.fillStyle = '#4a4a4a'; ctx.fillRect(sx + 8, sy + 14, 14, 8);
    ctx.fillStyle = '#6a6a6a'; ctx.fillRect(sx + 10, sy + 13, 10, 2);
    ctx.fillStyle = '#000'; ctx.fillRect(sx + 12, sy + 16, 2, 2);
    ctx.fillStyle = '#a04040'; ctx.fillRect(sx + 24, sy + 20, 4, 1);
  }
});

Reg.monster({
  id: 'zombie', name: 'Зомби', hp: 30, atk: 5, speed: 1,
  drops: [{ item: 'ore', chance: 0.3 }],
  draw: (ctx, sx, sy) => {
    ctx.fillStyle = '#4a5a4a'; ctx.fillRect(sx + 8, sy + 8, 16, 20);
    ctx.fillStyle = '#2a3a2a'; ctx.fillRect(sx + 8, sy + 22, 16, 6);
    ctx.fillStyle = '#000'; ctx.fillRect(sx + 11, sy + 12, 2, 2); ctx.fillRect(sx + 19, sy + 12, 2, 2);
    ctx.fillStyle = '#a04040'; ctx.fillRect(sx + 13, sy + 18, 6, 2);
  }
});
