(function(){
  setTimeout(() => {
    Reg.tile('beer_tap', (ctx, sx, sy, seed) => {
      // 1. Рисуем пол под кружкой
      if (Reg.tiles['floor']) Reg.tiles['floor'](ctx, sx, sy, seed);

      // 2. Рисуем картинку пива
      if (!window._beerImg) {
        window._beerImg = new Image();
        window._beerImg.src = 'assets/equipment/ale.png';
      }
      
      if (window._beerImg.complete) {
        ctx.drawImage(window._beerImg, sx, sy, 32, 32);
      } else {
        // Заглушка, пока картинка грузится
        ctx.fillStyle = '#7a4a20';
        ctx.fillRect(sx + 8, sy + 10, 16, 16);
      }

      // 3. Если бочка пустая, затемняем и рисуем крестик
      const cell = window.state && window.state.cells ? window.state.cells[(Math.floor(sx/32) + (window.camX||0)) + ',' + (Math.floor(sy/32) + (window.camY||0))] : null;
      
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
    console.log('[Booze Sprite] Загружена картинка ale.png для эля.');
  }, 1500);
})();
