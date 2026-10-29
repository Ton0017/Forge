(function(){
  Reg.on('world_init', (state) => {
    if (!state.playerOrders) state.playerOrders = [];
  });

  setTimeout(() => {
    if (document.getElementById('btn-order-panel')) return;
    
    // === 1. КНОПКА И ПАНЕЛЬ ===
    const btn = document.createElement('div');
    btn.id = 'btn-order-panel';
    btn.innerText = 'Приказы';
    btn.style.cssText = 'position:fixed; bottom:70px; left:50%; transform:translateX(-50%); width:80px; height:36px; background:#1e1a16; border:2px solid #c87b32; color:#c87b32; display:flex; justify-content:center; align-items:center; font-size:12px; cursor:pointer; z-index:999999; user-select:none; box-shadow: inset -2px -2px 0 #000; font-family:Georgia;';
    document.body.appendChild(btn);

    const panel = document.createElement('div');
    panel.id = 'order-action-panel';
    panel.style.cssText = 'display:none; position:fixed; bottom:112px; left:50%; transform:translateX(-50%); background:#1a1008; border:2px solid #5a4a3a; padding:5px; z-index:999999; flex-direction:column; gap:5px; width:100px;';
    panel.innerHTML = `
      <button class="ord-select" data-type="dig" style="padding:5px; background:#2a1e14; border:1px solid #5a4a3a; color:#c9c4b4; cursor:pointer; font-family:Georgia;">Копать</button>
      <button class="ord-select" data-type="chop" style="padding:5px; background:#2a1e14; border:1px solid #5a4a3a; color:#c9c4b4; cursor:pointer; font-family:Georgia;">Рубить</button>
      <button class="ord-select" data-type="haul" style="padding:5px; background:#2a1e14; border:1px solid #5a4a3a; color:#c9c4b4; cursor:pointer; font-family:Georgia;">Подобрать</button>
      <button class="ord-select" data-type="attack" style="padding:5px; background:#2a1e14; border:1px solid #5a4a3a; color:#c9c4b4; cursor:pointer; font-family:Georgia;">Атаковать</button>
      <button id="ord-clear" style="padding:5px; background:#5a1a1a; border:1px solid #a83838; color:#ffaaaa; cursor:pointer; font-family:Georgia;">Очистить всё</button>
    `;
    document.body.appendChild(panel);

    let activeMode = null;

    btn.onclick = () => {
      panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    };

    panel.querySelectorAll('.ord-select').forEach(b => {
      b.onclick = () => {
        activeMode = b.getAttribute('data-type');
        panel.style.display = 'none';
        btn.innerText = 'Режим: ' + b.innerText;
        btn.style.borderColor = '#ffaa00';
      };
    });

    document.getElementById('ord-clear').onclick = () => {
      activeMode = null;
      panel.style.display = 'none';
      btn.innerText = 'Приказы';
      btn.style.borderColor = '#c87b32';
      if (state.playerOrders) {
          state.playerOrders = [];
          Reg.log('Все приказы отменены.', 'sys');
      }
    };

    // === 2. КЛИК ПО КАРТЕ ===
    const canvas = document.getElementById('gameCanvas');
    canvas.addEventListener('click', (e) => {
      if (!activeMode) return;

      const rect = canvas.getBoundingClientRect();
      // Важно: учитываем масштабирование экрана!
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      const CW = 32, CH = 32;
      const COLS = Math.floor(canvas.width / CW);
      const ROWS = Math.floor(canvas.height / CH);

      // Берем камеру, учитывая выбранного дварфа
      let _selId = null; 
      try { _selId = eval('selectedNpcId'); } catch(e) {} 
      if (!_selId) _selId = window.selectedNpcId;

      let camX = state.forgePos.x - Math.floor(COLS/2);
      let camY = state.forgePos.y - Math.floor(ROWS/2);
      if (_selId) {
          const n = state.npcs.find(n => n.id === _selId && n.alive);
          if (n) { camX = n.x - Math.floor(COLS/2); camY = n.y - Math.floor(ROWS/2); }
      }

      const wx = Math.floor(clickX / CW) + camX;
      const wy = Math.floor(clickY / CH) + camY;

      const existingIdx = state.playerOrders.findIndex(o => o.x === wx && o.y === wy);

      if (existingIdx !== -1) {
          // Если тут уже есть приказ — удаляем его (любым кликом)
          state.playerOrders.splice(existingIdx, 1);
          Reg.log(`Приказ в (${wx}, ${wy}) отменен.`, 'sys');
      } else {
          // Если пусто — ставим новый
          state.playerOrders.push({ x: wx, y: wy, type: activeMode });
          Reg.log(`Поставлен приказ ${activeMode} в (${wx}, ${wy}).`, 'sys');
      }
    });

    // === 3. ОТРИСОВКА РАМОК ===
    function tryWrapRenderMap() {
        if (!window.renderMap || window._playerOrdersWrapped) return;
        window._playerOrdersWrapped = true;
        
        const origRenderMap = window.renderMap;
        window.renderMap = function() {
            origRenderMap.apply(this, arguments);
            try {
                if (!state || !state.playerOrders || state.playerOrders.length === 0) return;
                const canvas = document.getElementById('gameCanvas');
                if (!canvas) return;
                const ctx = canvas.getContext('2d');
                const CW = 32, CH = 32;
                const COLS = Math.floor(canvas.width / CW);
                const ROWS = Math.floor(canvas.height / CH);
                
                // Берем камеру, учитывая выбранного дварфа (точно так же, как в core.js)
                let _selId = null; 
                try { _selId = eval('selectedNpcId'); } catch(e) {} 
                if (!_selId) _selId = window.selectedNpcId;

                let camX = state.forgePos.x - Math.floor(COLS/2);
                let camY = state.forgePos.y - Math.floor(ROWS/2);
                if (_selId) {
                    const n = state.npcs.find(n => n.id === _selId && n.alive);
                    if (n) { camX = n.x - Math.floor(COLS/2); camY = n.y - Math.floor(ROWS/2); }
                }

                state.playerOrders.forEach(o => {
                    const sx = (o.x - camX) * CW;
                    const sy = (o.y - camY) * CH;
                    if (sx < -32 || sy < -32 || sx > canvas.width || sy > canvas.height) return;
                    
                    ctx.strokeStyle = '#ff3333';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(sx + 1, sy + 1, CW - 2, CH - 2);
                    
                    ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
                    ctx.fillRect(sx, sy, CW, CH);
                });
            } catch(e) { console.error('Ошибка отрисовки приказов:', e); }
        };
        console.log('[Orders] Отрисовка приказов подключена к renderMap.');
    }

    tryWrapRenderMap();
    let attempts = 0;
    const wrapInterval = setInterval(() => {
        tryWrapRenderMap();
        attempts++;
        if (attempts > 50) clearInterval(wrapInterval);
    }, 100);

  }, 1500);
})();
