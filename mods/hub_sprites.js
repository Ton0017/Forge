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
      // Тень
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.fillRect(sx + 6, sy + 26, 20, 3);
      // Ножки
      ctx.fillStyle = '#4a2a10';
      ctx.fillRect(sx + 8, sy + 18, 3, 10);
      ctx.fillRect(sx + 21, sy + 18, 3, 10);
      // Столешница
      ctx.fillStyle = '#6a4a2a';
      ctx.fillRect(sx + 4, sy + 12, 24, 6);
      ctx.fillStyle = '#8a6a4a';
      ctx.fillRect(sx + 4, sy + 12, 24, 2);
      // Кружка на столе
      ctx.fillStyle = '#e8d0a0';
      ctx.fillRect(sx + 14, sy + 7, 4, 5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx + 14, sy + 6, 4, 1);
    });

    // 3. АЛТАРЬ (Каменный, со свечами)
    Reg.tile('altar', (ctx, sx, sy, seed) => {
      drawFloor(ctx, sx, sy, seed);
      // Основание
      ctx.fillStyle = '#5a5a60';
      ctx.fillRect(sx + 6, sy + 16, 20, 12);
      ctx.fillStyle = '#7a7a80';
      ctx.fillRect(sx + 5, sy + 12, 22, 6);
      ctx.fillStyle = '#9a9aa0';
      ctx.fillRect(sx + 5, sy + 12, 22, 2);
      // Свечи
      ctx.fillStyle = '#e8d8b0';
      ctx.fillRect(sx + 8, sy + 6, 2, 6);
      ctx.fillRect(sx + 22, sy + 6, 2, 6);
      // Огонь свечей
      ctx.fillStyle = '#f0c860';
      ctx.fillRect(sx + 8, sy + 4, 2, 2);
      ctx.fillRect(sx + 22, sy + 4, 2, 2);
    });

    // 4. СТОЛ ДЛЯ АЛХИМИИ (С колбами)
    Reg.tile('alchemy', (ctx, sx, sy, seed) => {
      drawFloor(ctx, sx, sy, seed);
      // Стол
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(sx + 4, sy + 16, 24, 8);
      // Колбы
      ctx.fillStyle = '#3a7a3a'; // Зеленая жидкость
      ctx.fillRect(sx + 8, sy + 8, 4, 8);
      ctx.fillStyle = '#7a3a7a'; // Фиолетовая
      ctx.fillRect(sx + 14, sy + 6, 4, 10);
      ctx.fillStyle = '#3a3a7a'; // Синяя
      ctx.fillRect(sx + 20, sy + 10, 4, 6);
      // Горлышки
      ctx.fillStyle = '#a0a0a0';
      ctx.fillRect(sx + 9, sy + 6, 2, 2);
      ctx.fillRect(sx + 15, sy + 4, 2, 2);
      ctx.fillRect(sx + 21, sy + 8, 2, 2);
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
