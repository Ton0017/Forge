(function(){
  Reg.tile('farm_plot', (ctx, sx, sy, seed) => {
    if (Reg.tiles['floor']) Reg.tiles['floor'](ctx, sx, sy, seed);
    ctx.fillStyle = '#3a2410'; ctx.fillRect(sx + 2, sy + 2, 28, 28);
    ctx.fillStyle = '#5a3a1a';
    for (let i = 0; i < 4; i++) ctx.fillRect(sx + 4 + i * 7, sy + 4, 3, 24);
    ctx.fillStyle = '#2a1808';
    for (let i = 0; i < 5; i++) { const r = (seed + i * 13) % 100; ctx.fillRect(sx + 4 + (r % 24), sy + 4 + ((r * 3) % 24), 2, 2); }
  });
  Reg.tile('farm_sprout', (ctx, sx, sy, seed) => {
    Reg.tiles['farm_plot'](ctx, sx, sy, seed);
    ctx.fillStyle = '#6a9a3a';
    for (let i = 0; i < 8; i++) { const r = (seed + i * 17) % 100; const px = 4 + (r % 24); const py = 6 + ((r * 2) % 20); ctx.fillRect(sx + px, sy + py, 2, 4); ctx.fillRect(sx + px - 1, sy + py, 4, 1); }
  });
  Reg.tile('farm_ready', (ctx, sx, sy, seed) => {
    Reg.tiles['farm_plot'](ctx, sx, sy, seed);
    for (let i = 0; i < 10; i++) {
      const r = (seed + i * 19) % 100; const px = 4 + (r % 24); const py = 4 + ((r * 3) % 20);
      ctx.fillStyle = '#a08030'; ctx.fillRect(sx + px, sy + py, 1, 6);
      ctx.fillStyle = '#e0c050'; ctx.fillRect(sx + px - 1, sy + py - 2, 3, 3);
      ctx.fillStyle = '#ffd860'; ctx.fillRect(sx + px, sy + py - 1, 1, 1);
    }
  });
})();
