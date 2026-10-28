(function(){
  Reg.tile('scrap', (ctx, sx, sy, seed) => {
    if (Reg.tiles['floor']) Reg.tiles['floor'](ctx, sx, sy, seed);
    ctx.fillStyle = '#3a3e45';
    ctx.fillRect(sx + 6, sy + 18, 14, 4);
    ctx.fillRect(sx + 12, sy + 12, 6, 6);
    ctx.fillStyle = '#8a4a2a';
    ctx.fillRect(sx + 8, sy + 16, 4, 2);
    ctx.fillRect(sx + 14, sy + 14, 2, 2);
    ctx.fillStyle = '#5a3a20';
    ctx.fillRect(sx + 16, sy + 22, 8, 2);
    ctx.fillStyle = '#7a7e85';
    ctx.fillRect(sx + 12, sy + 12, 2, 2);
    ctx.fillRect(sx + 6, sy + 18, 2, 2);
  });
})();
