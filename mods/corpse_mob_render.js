(function(){
  // Ждём, пока загрузятся базовые тайлы
  setTimeout(() => {
    const types = ['floor', 'grass', 'grass_berry', 'water', 'mushroom', 'ruins', 'ore', 'stone'];
    
    types.forEach(type => {
      if (!Reg.tiles[type]) return;
      const orig = Reg.tiles[type];
      
      Reg.tiles[type] = function(ctx, sx, sy, seed) {
        orig.call(this, ctx, sx, sy, seed);
        
        try {
          if (!window.state || !window.state.cells) return;
          
          // Получаем мировые координаты клетки
          const canvas = document.getElementById('gameCanvas');
          const COLS = Math.floor(canvas.width / 32);
          const ROWS = Math.floor(canvas.height / 32);
          
          let _selId = null;
          try { _selId = eval('selectedNpcId'); } catch(e) {}
          if (!_selId) _selId = window.selectedNpcId;
          
          let camX = window.state.forgePos.x - Math.floor(COLS/2);
          let camY = window.state.forgePos.y - Math.floor(ROWS/2);
          if (_selId) {
            const n = window.state.npcs.find(n => n.id === _selId && n.alive);
            if (n) { camX = n.x - Math.floor(COLS/2); camY = n.y - Math.floor(ROWS/2); }
          }
          
          const wx = Math.floor(sx / 32) + camX;
          const wy = Math.floor(sy / 32) + camY;
          const cell = window.state.cells[wx + ',' + wy];
          
          if (!cell || !cell.corpse) return;
          
          // 1. Рисуем лужу крови (размер зависит от массы, если есть)
          ctx.fillStyle = 'rgba(120, 0, 0, 0.4)';
          ctx.beginPath();
          ctx.arc(sx + 16, sy + 16, 13, 0, Math.PI * 2);
          ctx.fill();
          
          // 2. Рисуем труп (спрайт из assets/animals/)
          const spriteFile = cell.corpse.sprite || 'boar.png';
          let img = null;
          try {
            img = getImg('assets/animals/' + spriteFile);
          } catch(e) {}
          
          ctx.save();
          ctx.globalAlpha = 0.6;
          
          if (img && img.complete && img.naturalWidth > 0) {
            // Поворачиваем на 90 градусов (лежащий труп)
            ctx.translate(sx + 16, sy + 16);
            ctx.rotate(Math.PI / 2);
            ctx.drawImage(img, -16, -16, 32, 32);
          } else {
            // Fallback: серый крестик
            ctx.fillStyle = '#555';
            ctx.fillRect(sx + 8, sy + 8, 16, 16);
            ctx.fillStyle = '#333';
            ctx.fillRect(sx + 12, sy + 12, 8, 8);
          }
          
          ctx.restore();
        } catch(e) {
          console.error('[Corpse Mob Render] Ошибка:', e);
        }
      };
    });
    
    console.log('[Corpse Mob Render] Отрисовка трупов мобов подключена.');
  }, 1500);
})();
