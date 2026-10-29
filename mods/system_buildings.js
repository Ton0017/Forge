(function(){
  window.BUILDINGS = { 
    farm: { 
      name: 'Ферма', 
      cost: { seeds: 1 }, 
      desc: 'Требует семена',
      onBuild: function(cell, npc) {
        cell.type = 'farm_plot';
        cell.farmGrowth = 0;
        if (typeof Reg !== 'undefined' && Reg.log) Reg.log(`${npc.name} подготовил грядку.`, 'good');
      }
    }
    // Будущее здание добавляется так:
    // pen: { name: 'Загон', cost: { wood: 5 }, onBuild: function(cell, npc) { ... } }
  };
  
  setTimeout(() => {
    if (document.getElementById('btn-build-panel')) return;
    
    // Кнопка "Строить" (справа от "Приказы")
    const btn = document.createElement('div');
    btn.id = 'btn-build-panel';
    btn.innerText = 'Строить';
    btn.style.cssText = 'position:fixed; bottom:70px; left:50%; transform:translateX(45px); width:70px; height:36px; background:#1e1a16; border:2px solid #7aba7a; color:#7aba7a; display:flex; justify-content:center; align-items:center; font-size:12px; cursor:pointer; z-index:999999; font-family:Georgia; user-select:none;';
    document.body.appendChild(btn);

    // Панель строительства
    const panel = document.createElement('div');
    panel.id = 'build-action-panel';
    panel.style.cssText = 'display:none; position:fixed; bottom:112px; left:50%; transform:translateX(45px); background:#1a1008; border:2px solid #5a4a3a; padding:5px; z-index:999999; flex-direction:column; gap:5px; width:100px;';
    document.body.appendChild(panel);

    let activeBuild = null;

    function updateButtonText() {
        if (activeBuild) {
            btn.innerText = 'Режим: ' + window.BUILDINGS[activeBuild].name;
            btn.style.borderColor = '#ffaa00';
        } else {
            btn.innerText = 'Строить';
            btn.style.borderColor = '#7aba7a';
        }
    }

    btn.onclick = () => {
        if (panel.style.display === 'flex') {
            panel.style.display = 'none';
            return;
        }
        panel.innerHTML = '';
        for (let id in window.BUILDINGS) {
            const b = window.BUILDINGS[id];
            const bBtn = document.createElement('button');
            bBtn.innerText = b.name;
            bBtn.style.cssText = 'padding:5px; background:#2a1e14; border:1px solid #5a4a3a; color:#c9c4b4; cursor:pointer; font-family:Georgia;';
            bBtn.onclick = () => { 
                activeBuild = id; 
                panel.style.display = 'none'; 
                updateButtonText(); 
            };
            panel.appendChild(bBtn);
        }
        
        // Кнопка отмены в панели
        const cancelBtn = document.createElement('button');
        cancelBtn.innerText = 'Отмена';
        cancelBtn.style.cssText = 'padding:5px; background:#5a1a1a; border:1px solid #a83838; color:#ffaaaa; cursor:pointer; margin-top:5px; font-family:Georgia;';
        cancelBtn.onclick = () => {
            activeBuild = null;
            panel.style.display = 'none';
            updateButtonText();
        };
        panel.appendChild(cancelBtn);
        
        panel.style.display = 'flex';
    };

    // Обработка клика по карте
    const canvas = document.getElementById('gameCanvas');
    canvas.addEventListener('click', (e) => {
        if (!activeBuild) return;
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width; 
        const scaleY = canvas.height / rect.height;
        const clickX = (e.clientX - rect.left) * scaleX; 
        const clickY = (e.clientY - rect.top) * scaleY;
        
        const CW = 32, CH = 32; 
        const COLS = Math.floor(canvas.width / CW); 
        const ROWS = Math.floor(canvas.height / CH);
        
        let _selId = null; 
        try { _selId = eval('selectedNpcId'); } catch(e) {}
        
        let camX = state.forgePos.x - Math.floor(COLS/2); 
        let camY = state.forgePos.y - Math.floor(ROWS/2);
        
        if (_selId) { 
            const n = state.npcs.find(n => n.id === _selId && n.alive); 
            if (n) { 
                camX = n.x - Math.floor(COLS/2); 
                camY = n.y - Math.floor(ROWS/2); 
            } 
        }
        
        const wx = Math.floor(clickX / CW) + camX; 
        const wy = Math.floor(clickY / CH) + camY;
        const cell = getCell(wx, wy);
        
        if (cell.type !== 'floor' && cell.type !== 'grass') { 
            Reg.log('Строить можно только на полу.', 'sys'); 
            return; 
        }
        
        const existing = state.playerOrders.find(o => o.x === wx && o.y === wy);
        if (existing) { 
            state.playerOrders = state.playerOrders.filter(o => o !== existing); 
            Reg.log('Приказ на стройку отменен.', 'sys');
        } else { 
            state.playerOrders.push({ x: wx, y: wy, type: 'build', buildType: activeBuild }); 
            Reg.log(`[Стройка] Приказ: ${window.BUILDINGS[activeBuild].name} в (${wx}, ${wy}).`, 'sys'); 
        }
    });
  }, 1500);
})();
