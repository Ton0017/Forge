(function(){
  setTimeout(() => {
    // 1. Плавающая кнопка "СКЛАД" (справа, над бестиарием)
    const btn = document.createElement('div');
    btn.innerHTML = '<img src="assets/icons/boiler.png" style="width:32px; height:32px; image-rendering:pixelated;" onerror="this.outerHTML=\'<span style=\\\'color:#c87b32; font-weight:bold; font-size:14px;\\\'>СКЛАД</span>\'">';
    btn.style.cssText = 'position:fixed; bottom:180px; right:15px; width:48px; height:48px; background:#1e1a16; border:2px solid #c87b32; border-radius:4px; display:flex; justify-content:center; align-items:center; z-index:999999; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.8); user-select:none;';
    document.body.appendChild(btn);

    // 2. Модалка
    const modal = document.createElement('div');
    modal.id = 'storage-modal';
    modal.style.cssText = 'display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); width:380px; max-height:80vh; background:#12100e; border:2px solid #c87b32; border-radius:6px; padding:12px; z-index:1000000; color:#e0d8c8; font-family:"Courier New", monospace; font-size:13px; box-shadow:0 0 30px rgba(0,0,0,0.9); overflow-y:auto;';
    document.body.appendChild(modal);

    // 3. Открытие / Закрытие
    btn.onclick = () => {
      if (modal.style.display === 'block') {
        modal.style.display = 'none';
      } else {
        modal.style.display = 'block';
        renderStorage();
      }
    };

    // 4. Логика отрисовки
    function renderStorage() {
      // Безопасный доступ к state (в core.js она через let)
      const s = (typeof state !== 'undefined') ? state : (typeof window.state !== 'undefined' ? window.state : null);
      if (!s || !s.cells) {
          modal.innerHTML = '<div style="color:#a83838; padding:10px;">Ошибка: нет доступа к данным игры (state).</div><button id="close-storage" style="margin-top:10px; background:#a83838; border:1px solid #ff8888; color:#fff; padding:5px 15px; border-radius:4px; cursor:pointer; font-family:inherit;">Закрыть</button>';
          document.getElementById('close-storage').onclick = () => modal.style.display = 'none';
          return;
      }

      // Собираем все предметы с клеток storage
      let itemsMap = {}; // Для группировки (Руда х 10)
      
      for (let k in s.cells) {
        const cell = s.cells[k];
        if (cell.type === 'storage' && cell.items && cell.items.length > 0) {
          cell.items.forEach(item => {
            if (!item || !item.name) return;
            const name = item.name;
            if (!itemsMap[name]) {
              itemsMap[name] = { count: 0, itemData: item };
            }
            itemsMap[name].count++;
          });
        }
      }

      // Заголовок и кнопка закрытия
      let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #3a3528; padding-bottom:5px; margin-bottom:10px;">
          <h3 style="color:#c87b32; margin:0;">Общий Склад</h3>
          <button id="close-storage" style="background:#a83838; border:1px solid #ff8888; color:#fff; padding:2px 10px; border-radius:4px; cursor:pointer; font-family:inherit;">X</button>
        </div>
      `;

      const keys = Object.keys(itemsMap);
      if (keys.length === 0) {
        html += '<div style="color:#888; padding:10px;">Склад пуст. Дварфы скоро принесут сюда руду.</div>';
      } else {
        keys.forEach(name => {
          const data = itemsMap[name];
          // Пытаемся взять иконку предмета
          const icon = data.itemData.file ? `<img src="${data.itemData.file}" style="width:24px; height:24px; image-rendering:pixelated; margin-right:10px;">` : '';
          
          html += `
            <div class="storage-item" style="display:flex; align-items:center; background:#1e1a16; border:1px solid #3a3528; padding:8px; margin-bottom:5px;">
              ${icon}
              <div style="flex:1;">
                <div style="color:#c8c8b8;">${name}</div>
              </div>
              <div style="color:#ffcc00; font-weight:bold;">x${data.count}</div>
            </div>
          `;
        });
      }

      modal.innerHTML = html;

      // Вешаем обработчик закрытия
      document.getElementById('close-storage').onclick = () => modal.style.display = 'none';
    }
  }, 1000);
})();
