(function(){
  setTimeout(() => {
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;

    // Создаем модалку
    if (!document.getElementById('mob-modal')) {
      const modal = document.createElement('div');
      modal.id = 'mob-modal';
      modal.style.cssText = 'display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); width:340px; max-height:80vh; overflow-y:auto; background:#12100e; border:2px solid #c87b32; border-radius:6px; padding:12px; z-index:10000; color:#e0d8c8; font-family:"Courier New", monospace; font-size:13px; box-shadow:0 0 20px rgba(0,0,0,0.8);';
      document.body.appendChild(modal);
    }

    // Ловим события на всем документе (обходим блокировки UI)
    document.addEventListener('pointerdown', function(e) {
      // Если кликнули не по канвасу — игнорируем
      if (e.target.id !== 'gameCanvas') return;

      if (!window.state || !window.state.cells) return;

      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      const clickX = (e.clientX - rect.left) * scaleX;
      const clickY = (e.clientY - rect.top) * scaleY;

      const CW = 32; const CH = 32;
      const COLS = Math.floor(canvas.width / CW);
      const ROWS = Math.floor(canvas.height / CH);
      
      // Вычисляем камеру (точно как в core.js)
      let camX = window.state.forgePos.x - Math.floor(COLS / 2);
      let camY = window.state.forgePos.y - Math.floor(ROWS / 2);
      
      // Пытаемся прочитать selectedNpcId (глобальная переменная)
      try {
        if (typeof selectedNpcId !== 'undefined' && selectedNpcId) {
           const n = window.state.npcs.find(x => x.id === selectedNpcId);
           if (n && n.alive) { 
              camX = n.x - Math.floor(COLS / 2); 
              camY = n.y - Math.floor(ROWS / 2); 
           }
        }
      } catch(err) {}

      const gridX = Math.floor(clickX / CW) + camX;
      const gridY = Math.floor(clickY / CH) + camY;
      const cell = window.state.cells[gridX + ',' + gridY];

      if (cell) {
        // 1. ЖИВОТНОЕ
        if (cell.animal) {
          showMobCard(cell.animal, 'Животное', gridX, gridY);
        } 
        // 2. МОНСТР
        else if (cell.monster) {
          showMobCard(cell.monster, 'Монстр', gridX, gridY);
        }
        // 3. ОБЪЕКТ (Кровать, Склад, Вода и т.д.)
        else if (cell.type && Reg.composer.objects[cell.type]) {
          const obj = Reg.composer.objects[cell.type];
          
          // Генерируем описание объекта через композер (от лица первого дварфа)
          let generatedText = "Обычный объект.";
          if (window.state.npcs[0]) {
             const thought = Reg.composer.generate(window.state.npcs[0], cell.type);
             if (thought) generatedText = thought.text;
          }

          showObjectCard(obj.name, cell.type, generatedText, gridX, gridY);
        } 
        else {
          document.getElementById('mob-modal').style.display = 'none';
        }
      }
    }, {passive: true});

    // Функция для отображения МОБОВ
    function showMobCard(a, typeName, x, y) {
      const modal = document.getElementById('mob-modal');
      const hpPct = Math.max(0, Math.min(100, (a.hp / (a.maxHp || a.hp || 10)) * 100));
      const bar = (val, color) => `<div style="width:100%; height:8px; background:#333; border:1px solid #000; margin-top:2px;"><div style="width:${Math.max(0, Math.min(100, val))}%; height:100%; background:${color};"></div></div>`;
      let spriteSrc = 'assets/animals/' + (a.id || 'goblin') + '.png';

      modal.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid #3a3528; padding-bottom:8px; margin-bottom:8px;">
          <div style="display:flex; gap:10px;">
            <img src="${spriteSrc}" style="width:48px; height:48px; image-rendering:pixelated; background:#1a1713; border:1px solid #3a3528;" onerror="this.style.display='none'">
            <div>
              <div style="color:#c87b32; font-weight:bold; font-size:16px;">${a.name || a.id}</div>
              <div style="color:#888; font-size:11px;">${typeName} [X:${x}, Y:${y}]</div>
            </div>
          </div>
          <button onclick="document.getElementById('mob-modal').style.display='none'" style="background:#a83838; border:1px solid #ff8888; color:#fff; padding:2px 8px; border-radius:4px; font-family:inherit;">X</button>
        </div>
        <div style="margin-bottom:8px;">
          <div>Здоровье: ${Math.floor(a.hp)}/${a.maxHp || a.hp || 10} ${bar(hpPct, '#a83838')}</div>
          ${typeName === 'Животное' ? `
            <div>Голод: ${Math.floor(a.hunger || 0)}/100 ${bar(a.hunger || 0, '#c87b32')}</div>
            <div>Жажда: ${Math.floor(a.thirst || 0)}/100 ${bar(a.thirst || 0, '#327ac8')}</div>
          ` : ''}
        </div>
        <div style="background:#1e1a16; padding:8px; border:1px solid #3a3528; border-radius:4px; margin-bottom:8px; font-size:12px;">
          <div style="color:#a0a0a0; margin-bottom:4px;">Личность:</div>
          <div style="line-height:1.4;">${a.description || 'Обычное существо.'}</div>
        </div>
        <div style="font-style:italic; color:#a09080;">"${a.thought || 'Он просто живет своей жизнью.'}"</div>
      `;
      modal.style.display = 'block';
    }

    // Функция для отображения ОБЪЕКТОВ (Кровати, Склады и т.д.)
    function showObjectCard(name, type, generatedText, x, y) {
      const modal = document.getElementById('mob-modal');
      
      modal.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid #3a3528; padding-bottom:8px; margin-bottom:8px;">
          <div>
            <div style="color:#c87b32; font-weight:bold; font-size:16px; text-transform:capitalize;">${name}</div>
            <div style="color:#888; font-size:11px;">Объект [X:${x}, Y:${y}]</div>
          </div>
          <button onclick="document.getElementById('mob-modal').style.display='none'" style="background:#a83838; border:1px solid #ff8888; color:#fff; padding:2px 8px; border-radius:4px; font-family:inherit;">X</button>
        </div>
        <div style="background:#1e1a16; padding:8px; border:1px solid #3a3528; border-radius:4px; margin-bottom:8px; font-size:12px;">
          <div style="color:#a0a0a0; margin-bottom:4px;">Описание (из генератора):</div>
          <div style="line-height:1.4; color:#7aba7a;">${generatedText}</div>
        </div>
        <div style="font-size:11px; color:#666;">ID объекта: ${type}</div>
      `;
      modal.style.display = 'block';
    }

    console.log("[Universal Inspector] Работает на весь экран (pointerdown).");
  }, 1000);
})();
