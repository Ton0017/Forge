(function(){
  setTimeout(() => {
    const drawFloor = (ctx, sx, sy, seed) => {
        if (Reg.tiles['floor']) Reg.tiles['floor'](ctx, sx, sy, seed);
    };

    // 1. КРОВАТЬ (Деревянная рама, солома, подушка)
    Reg.tile('bed', (ctx, sx, sy, seed) => {
      drawFloor(ctx, sx, sy, seed);
      // Тень
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(sx + 4, sy + 24, 24, 4);
      // Рама
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(sx + 4, sy + 8, 24, 16);
      ctx.fillStyle = '#7a5a3a';
      ctx.fillRect(sx + 5, sy + 9, 22, 14);
      // Солома
      ctx.fillStyle = '#c8a860';
      ctx.fillRect(sx + 6, sy + 10, 20, 12);
      // Подушка
      ctx.fillStyle = '#e8e0d0';
      ctx.fillRect(sx + 6, sy + 10, 6, 4);
      // Одеяло
      ctx.fillStyle = '#7a3a3a';
      ctx.fillRect(sx + 13, sy + 10, 13, 8);
      // Ножки
      ctx.fillStyle = '#3a1a08';
      ctx.fillRect(sx + 4, sy + 24, 2, 3);
      ctx.fillRect(sx + 26, sy + 24, 2, 3);
    });

    // 2. СТОЛ (Деревянный, с кружкой)
    Reg.tile('table', (ctx, sx, sy, seed) => {
      drawFloor(ctx, sx, sy, seed);
      const img = getImg('assets/objects/table.png');
      if (img && img.complete) ctx.drawImage(img, sx, sy, 32, 32);
    });

    // 3. АЛТАРЬ (Каменный, со свечами)
    Reg.tile('altar', (ctx, sx, sy, seed) => {
      drawFloor(ctx, sx, sy, seed);
      const img = getImg('assets/objects/altar.png');
      if (img && img.complete) ctx.drawImage(img, sx, sy, 32, 32);
    });

    // 4. СТОЛ ДЛЯ АЛХИМИИ (С колбами)
    Reg.tile('alchemy', (ctx, sx, sy, seed) => {
      drawFloor(ctx, sx, sy, seed);
      const img = getImg('assets/objects/magic table.png');
      if (img && img.complete) ctx.drawImage(img, sx, sy, 32, 32);
    });

    // 5. КОСТЕР (Бревна и огонь)
    Reg.tile('campfire', (ctx, sx, sy, seed) => {
      drawFloor(ctx, sx, sy, seed);
      // Бревна
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(sx + 6, sy + 20, 20, 4);
      ctx.fillRect(sx + 10, sy + 18, 4, 8);
      ctx.fillRect(sx + 18, sy + 18, 4, 8);
      // Огонь
      ctx.fillStyle = '#c87b32';
      ctx.fillRect(sx + 10, sy + 10, 12, 10);
      ctx.fillStyle = '#e0a040';
      ctx.fillRect(sx + 12, sy + 8, 8, 10);
      ctx.fillStyle = '#f0c860';
      ctx.fillRect(sx + 14, sy + 6, 4, 8);
      // Искры
      ctx.fillStyle = '#ffe080';
      ctx.fillRect(sx + 11, sy + 4, 2, 2);
      ctx.fillRect(sx + 19, sy + 5, 2, 2);
    });

    // 6. КОТЕЛ С ЕДОЙ (Магазин с едой)
    Reg.tile('pot', (ctx, sx, sy, seed) => {
      drawFloor(ctx, sx, sy, seed);
      // Огонь под котлом
      ctx.fillStyle = '#c87b32';
      ctx.fillRect(sx + 10, sy + 22, 12, 4);
      // Котел
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(sx + 6, sy + 12, 20, 10);
      ctx.fillStyle = '#2a2a2a';
      ctx.fillRect(sx + 7, sy + 13, 18, 8);
      // Ручки
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(sx + 4, sy + 14, 2, 4);
      ctx.fillRect(sx + 26, sy + 14, 2, 4);
      // Еда внутри (похлебка)
      ctx.fillStyle = '#a06030';
      ctx.fillRect(sx + 9, sy + 12, 14, 2);
      // Пар
      ctx.fillStyle = 'rgba(220,220,220,0.5)';
      ctx.fillRect(sx + 10, sy + 6, 2, 4);
      ctx.fillRect(sx + 16, sy + 4, 2, 4);
      ctx.fillRect(sx + 20, sy + 7, 2, 4);
    });

    console.log('[Hub Sprites] Все объекты перерисованы в едином стиле.');
  }, 1500);
})();
