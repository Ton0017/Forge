(function(){
  setTimeout(() => {
    if (!window.Reg || !Reg.tiles) return;

    const originalRenderMap = window.renderMap;
    if (!originalRenderMap) return;

    // Чтобы не спамить в лог, запоминаем, о каких тайлах уже сообщили
    if (!window._missingTiles) window._missingTiles = {};

    window.renderMap = function() {
        originalRenderMap();

        const canvas = document.getElementById('gameCanvas');
        const ctx = canvas.getContext('2d');
        const CW = 32, CH = 32;
        const COLS = Math.floor(canvas.width / CW);
        const ROWS = Math.floor(canvas.height / CH);
        
        const s = (typeof state !== 'undefined') ? state : window.state;
        if (!s || !s.cells) return;

        let camX = s.forgePos.x - Math.floor(COLS/2);
        let camY = s.forgePos.y - Math.floor(ROWS/2);
        if (window.selectedNpcId) {
            const n = s.npcs.find(n => n.id === window.selectedNpcId && n.alive);
            if (n) { camX = n.x - Math.floor(COLS/2); camY = n.y - Math.floor(ROWS/2); }
        }

        for (let ry = 0; ry < ROWS; ry++) {
            for (let rx = 0; rx < COLS; rx++) {
                const wx = camX + rx, wy = camY + ry;
                const cell = s.cells[wx + ',' + wy];
                if (!cell) continue;

                if (!Reg.tiles[cell.type]) {
                    const sx = rx * CW, sy = ry * CH;
                    
                    // Рисуем розовый фон
                    ctx.fillStyle = '#ff00ff';
                    ctx.fillRect(sx, sy, CW, CH);
                    
                    // Пишем название тайла (обрезаем до 4 символов, чтобы влезло)
                    ctx.fillStyle = '#000';
                    ctx.font = 'bold 10px monospace';
                    const label = cell.type.substring(0, 5);
                    ctx.fillText(label, sx + 2, sy + 18);

                    // Пишем в летопись ОДИН раз
                    if (!window._missingTiles[cell.type]) {
                        window._missingTiles[cell.type] = true;
                        if (window.Reg && Reg.log) {
                            Reg.log(`[ОШИБКА ГРАФИКИ] Нет спрайта для тайла: "${cell.type}"`, 'death');
                        }
                    }
                }
            }
        }
    };
  }, 500);
})();
