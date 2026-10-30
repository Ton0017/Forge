(function(){
  function _gs() { return (typeof state !== 'undefined') ? state : window.state; }

  function drawItemsOverlay(ctx, sx, sy, wx, wy, cell) {
    if (!cell || !cell.items || cell.items.length === 0) return;
    const item = cell.items[cell.items.length - 1];
    if (!item || !item.name) return;

    if (!cell._rlog) { cell._rlog = true; if (window.Reg && Reg.log) Reg.log('[РЕНДЕР] ' + item.name + ' в клетке ' + wx + ',' + wy, 'sys'); }

    if (item.isEmoji) {
      ctx.save();
      // Тень убрана
      ctx.font = "20px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(item.file, sx + 16, sy + 16);
      ctx.restore();
      if (cell.items.length > 1) {
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('x' + cell.items.length, sx + 2, sy + 12);
        ctx.restore();
      }
      return;
    }

    if (item.tags && item.tags.includes('scrap')) {
      if (Reg.tiles && Reg.tiles['scrap']) {
        try { Reg.tiles['scrap'](ctx, sx, sy, 0); } catch(e) {}
      }
      return;
    }

    let imgPath = '';
    if (item.file) {
      if (item.file.includes('/')) imgPath = item.file;
      else imgPath = 'assets/equipment/' + item.file;
    }
    let img = null;
    try { img = getImg(imgPath); } catch(e) {}
    ctx.save();
    // Тень убрана
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, sx + 4, sy + 4, 24, 24);
    }
    if (cell.items.length > 1) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('x' + cell.items.length, sx + 2, sy + 12);
    }
    ctx.restore();
  }

  function _attach() {
    if (window._itemsWrapped) return;
    if (typeof window.renderMap !== 'function') return;
    window._itemsWrapped = true;
    const orig = window.renderMap;
    window.renderMap = function() {
      orig.apply(this, arguments);
      try {
        const _s = _gs();
        if (!_s || !_s.cells || !_s.forgePos) return;
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const CW = 32, CH = 32;
        const COLS = Math.floor(canvas.width / CW);
        const ROWS = Math.floor(canvas.height / CH);
        let camX = _s.forgePos.x - Math.floor(COLS/2);
        let camY = _s.forgePos.y - Math.floor(ROWS/2);
        let _selId = null; try { _selId = eval('selectedNpcId'); } catch(e) {} if (!_selId) _selId = window.selectedNpcId; if (_selId) {
          const n = _s.npcs.find(n => n.id === _selId && n.alive);
          if (n) { camX = n.x - Math.floor(COLS/2); camY = n.y - Math.floor(ROWS/2); }
        }
        for (let ry = 0; ry < ROWS; ry++) {
          for (let rx = 0; rx < COLS; rx++) {
            const wx = camX + rx, wy = camY + ry;
            const cell = _s.cells[wx + ',' + wy];
            if (!cell || !cell.items || cell.items.length === 0) continue;
            const _hasNpc = _s.npcs.some(n => n.alive && n.x === wx && n.y === wy);
            if (_hasNpc) continue;
            drawItemsOverlay(ctx, rx * CW, ry * CH, wx, wy, cell);
          }
        }
      } catch(e) { console.error('[ItemRender] wrap err', e); }
    };
    console.log('[Item Render] обёртка renderMap установлена');
  }
  _attach();
  setTimeout(_attach, 500);
  setTimeout(_attach, 1500);
})();
