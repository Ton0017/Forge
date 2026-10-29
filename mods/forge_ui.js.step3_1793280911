(function(){
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
