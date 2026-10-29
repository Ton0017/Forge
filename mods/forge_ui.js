(function(){
  let _gameState = null;
  Reg.on('world_init', (s) => { _gameState = s; });
  Reg.on('tick', (s) => { _gameState = s; });

  setTimeout(() => {
    const forgePanel = document.getElementById('panel-forge');
    if (!forgePanel) return;

    forgePanel.innerHTML = '<h3 style="color:#c87b32; margin-bottom:10px;">Кузня</h3>';

    const container = document.createElement('div');
    container.id = 'forge-custom-content';
    container.style.cssText = 'display:flex; flex-direction:column; gap:8px;';

    container.innerHTML = `
      <button id="btn-hire" class="btn" style="width:100%; padding:10px; background:#1e1a16; border:1px solid #c87b32; color:#c87b32; cursor:pointer;">
        Нанять работягу (50 золота)
      </button>

      <button id="btn-hire-priest" class="btn" style="padding:10px; background:#1e1a16; border:1px solid #7aba7a; color:#7aba7a; cursor:pointer;">
        Нанять Жреца (100 золота)
      </button>
    `;
    forgePanel.appendChild(container);

    // === БЛОК КРАФТА (автоматически из CRAFTABLES) ===
    const craftContainer = document.createElement('div');
    craftContainer.id = 'forge-craft-content';
    craftContainer.style.cssText = 'display:flex; flex-direction:column; gap:6px; margin-top:15px;';
    forgePanel.appendChild(craftContainer);

    function refreshCraftUI() {
        if (!window.CRAFTABLES) {
            craftContainer.innerHTML = '<div style="color:#a83838;">Реестр крафта не загружен.</div>';
            return;
        }
        const _s = _gameState;
        if (!_s) {
            craftContainer.innerHTML = '<div style="color:#888;">Загрузка...</div>';
            setTimeout(refreshCraftUI, 500);
            return;
        }
        
        const names = { iron_ore: 'руда', wood: 'бревно', coal: 'уголь', cloth: 'ткань', stone: 'камень' };
        let html = '<h3 style="color:#d4a040; margin-bottom:8px; border-bottom:1px solid #d4a040; padding-bottom:3px;">Крафт</h3>';
        for (let id in window.CRAFTABLES) {
            const r = window.CRAFTABLES[id];
            const queued = (_s.craftQueue || []).find(j => j.id === id);
            const queueCount = queued ? queued.count : 0;
            let costStr = [];
            for (let res in r.cost) {
                costStr.push(r.cost[res] + ' ' + (names[res] || res));
            }
            const badge = queueCount > 0 ? `<span style="color:#ffd860; font-size:11px;">[в очереди: ${queueCount}]</span>` : '';
            html += `<button class="craft-btn" data-id="${id}" style="width:100%; padding:8px; background:#0a0a0a; border:1px solid #d4a040; color:#d4a040; cursor:pointer; text-align:left; font-family:Georgia; display:flex; justify-content:space-between; align-items:center;">
              <span>${r.name}</span>
              <span style="color:#a08060; font-size:11px;">${costStr.join(', ')} ${badge}</span>
            </button>`;
        }
        craftContainer.innerHTML = html;
        craftContainer.querySelectorAll('.craft-btn').forEach(btn => {
            btn.onclick = () => {
                const id = btn.getAttribute('data-id');
                if (window.addToCraftQueue && window.addToCraftQueue(id)) {
                    Reg.log(`[Кузня] Заказ: ${window.CRAFTABLES[id].name}.`, 'sys');
                    refreshCraftUI();
                }
            };
        });
    }
    refreshCraftUI();

    // ФУНКЦИЯ ПОИСКА СВОБОДНОГО МЕСТА (Сначала у наковальни, потом где угодно)
    function findFreeSpot() {
      let s = null;
      try { s = state; } catch(e) {}
      if (!s && window.state) s = window.state;
      
      // 1. Ищем рядом с кузней
      for (let r = 1; r <= 5; r++) {
        for (let dx = -r; dx <= r; dx++) {
          for (let dy = -r; dy <= r; dy++) {
            const cell = getCell(s.forgePos.x + dx, s.forgePos.y + dy);
            if (cell && cell.type === 'floor' && (!cell.items || cell.items.length === 0)) {
              return cell;
            }
          }
        }
      }
      
      // 2. Если рядом нет — ищем ЛЮБУЮ свободную клетку на карте
      for (let k in s.cells) {
         const cell = s.cells[k];
         if (cell.type === 'floor' && (!cell.items || cell.items.length === 0)) {
             return cell;
         }
      }
      return null;
    }

    // --- ОБРАБОТЧИКИ КНОПОК ---

    const hireBtn = document.getElementById('btn-hire');
    if (hireBtn) {
        hireBtn.onclick = () => {
            if (typeof hireNpc === 'function') hireNpc(false);
            else if (window.hireNpc) window.hireNpc(false);
            else alert('Ошибка: функция найма не найдена.');
        };
    }

    document.getElementById('btn-hire-priest').onclick = () => {
      if (window.hirePriest) window.hirePriest();
      else alert('Ошибка: Функция найма жреца не найдена в коде!');
    };

    console.log('[Forge UI] Интерфейс Кузни обновлен (поиск места по всей карте).');
  }, 1500);
})();
