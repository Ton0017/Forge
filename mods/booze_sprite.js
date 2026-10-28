(function(){
  setTimeout(() => {
    // Переопределяем отрисовку бочки (beer_tap) на красивую кружку
    Reg.tile('beer_tap', (ctx, sx, sy, seed) => {
      // 1. Рисуем пол под кружкой
      if (Reg.tiles['floor']) Reg.tiles['floor'](ctx, sx, sy, seed);
      
      // 2. Тень от кружки
      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(sx + 16, sy + 26, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3. Тело кружки (дерево)
      ctx.fillStyle = '#7a4a20'; // Темное дерево
      ctx.fillRect(sx + 8, sy + 10, 16, 16);
      ctx.fillStyle = '#8a5a30'; // Светлое дерево
      ctx.fillRect(sx + 9, sy + 11, 14, 14);
      
      // 4. Деревянные доски (вертикальные полоски)
      ctx.fillStyle = '#6a3a10';
      ctx.fillRect(sx + 12, sy + 11, 1, 14);
      ctx.fillRect(sx + 16, sy + 11, 1, 14);
      ctx.fillRect(sx + 20, sy + 11, 1, 14);

      // 5. Металлические обручи
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(sx + 7, sy + 14, 18, 2); // Верхний обруч
      ctx.fillRect(sx + 7, sy + 22, 18, 2); // Нижний обруч
      ctx.fillStyle = '#5a5a5a'; // Блик на металле
      ctx.fillRect(sx + 7, sy + 14, 18, 1);

      // 6. Ручка (сбоку)
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(sx + 24, sy + 13, 3, 8);
      ctx.fillStyle = '#8a5a30';
      ctx.fillRect(sx + 25, sy + 14, 1, 6);
      ctx.fillStyle = '#3a2a10';
      ctx.fillRect(sx + 27, sy + 13, 1, 8);

      // 7. Пена (сверху)
      ctx.fillStyle = '#e8e0d0';
      ctx.fillRect(sx + 8, sy + 8, 16, 4);
      ctx.fillStyle = '#ffffff'; // Белые пузырьки
      ctx.fillRect(sx + 9, sy + 7, 4, 2);
      ctx.fillRect(sx + 15, sy + 6, 5, 2);
      ctx.fillRect(sx + 21, sy + 7, 2, 2);
      
      // 8. Блик света (слева)
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.fillRect(sx + 9, sy + 12, 2, 10);

      // 9. Если кружка пустая (boozeCount === 0), делаем её темнее
      const cell = window.state && window.state.cells ? window.state.cells[(Math.floor(sx/32) + (window.camX||0)) + ',' + (Math.floor(sy/32) + (window.camY||0))] : null;
      // (Упрощенная проверка, если пустая - рисуем крестик)
      if (cell && cell.boozeCount <= 0) {
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(sx, sy, 32, 32);
          ctx.strokeStyle = '#a83838';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(sx + 10, sy + 10);
          ctx.lineTo(sx + 22, sy + 22);
          ctx.moveTo(sx + 22, sy + 10);
          ctx.lineTo(sx + 10, sy + 22);
          ctx.stroke();
      }
    });
    console.log('[Booze Sprite] Кружка эля нарисована кодом.');
  }, 1500);
})();
