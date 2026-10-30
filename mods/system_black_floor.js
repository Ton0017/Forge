(function(){
  setTimeout(() => {
    Reg.tile('floor', (ctx, sx, sy, seed) => {
      // Тёмно-серый, почти чёрный пол
      ctx.fillStyle = '#0f0f12';
      ctx.fillRect(sx, sy, 32, 32);
      
      // Крапинки для текстуры
      const r = (seed * 9301 + 49297) % 233280 / 233280;
      const rx = Math.floor(r * 13) * 2 + 2;
      const ry = Math.floor(r * 13) * 2 + 2;
      
      ctx.fillStyle = '#1a1a20';
      ctx.fillRect(sx + rx, sy + ry, 2, 2);
      
      const r2 = (seed * 12345 + 6789) % 1000 / 1000;
      ctx.fillRect(sx + Math.floor(r2 * 14) * 2, sy + Math.floor(r2 * 10) * 2, 2, 2);
    });
    console.log('[Black Floor] Пол перекрашен в чёрный.');
  }, 500);
})();
