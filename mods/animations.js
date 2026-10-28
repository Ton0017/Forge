setTimeout(() => {
  window.activeEffects = [];

  // Поиск иконки по ключевому слову в твоей папке assets/icons
  function findIcon(keyword) {
    if (!Reg.assets || !Reg.assets.icons) return null;
    return Reg.assets.icons.find(i => i.toLowerCase().includes(keyword.toLowerCase()));
  }

  // Функция создания эффекта
  Reg.spawnEffect = function(x, y, keyword) {
    const file = findIcon(keyword);
    if (file) {
      activeEffects.push({
        x: x, y: y,
        file: 'assets/icons/' + encodeURI(file),
        life: 15, // Живет 15 тиков (1.5 секунды)
        maxLife: 15,
        offsetY: 0
      });
    }
  };

  // Обновление эффектов (каждый тик они поднимаются вверх и теряют жизнь)
  Reg.on('tick', (state) => {
    for (let i = activeEffects.length - 1; i >= 0; i--) {
      let e = activeEffects[i];
      e.life--;
      e.offsetY -= 0.8;
      if (e.life <= 0) activeEffects.splice(i, 1);
    }
  });

  // === ПРИВЯЗКА ЭФФЕКТОВ К СОБЫТИЯМ ===
  
  // 1. Бой (Искры и Кровь)
  Reg.on('combat_start', (npc, monster) => {
    Reg.spawnEffect(monster.x, monster.y, 'bloody'); // 26 bloody splashes
    Reg.spawnEffect(npc.x, npc.y, 'sword'); // 14th icon regular sword
  });

  // 2. Копание (Вспышки)
  Reg.on('tile_dug', (cell, npc, state) => {
    Reg.spawnEffect(npc.x, npc.y, 'flash'); // 23 flash
  });

  // 3. Повседневные действия (Сон, Еда, Общение)
  Reg.on('npc_tick', (npc, state) => {
    // Сон
    if (npc.task.type === 'rest' && Math.random() < 0.1) {
      Reg.spawnEffect(npc.x, npc.y, 'hourglass'); // 25 hourglass
    }
    // Еда
    if ((npc.task.type === 'eat' || npc.task.type === 'go_to_eat') && Math.random() < 0.15) {
      Reg.spawnEffect(npc.x, npc.y, 'boiler'); // boiler.png
    }
    // Общение
    if (npc.task.type === 'socialize' && Math.random() < 0.15) {
      Reg.spawnEffect(npc.x, npc.y, 'heart'); // 13red heart icon
    }
  });

  // === ОТРИСОВКА ЭФФЕКТОВ ===
  if (window.renderMap && !window._animWrapped) {
      window._animWrapped = true;
      const origRenderMap = window.renderMap;
      
      window.renderMap = function() {
          origRenderMap();
          
          if (!window.activeEffects || window.activeEffects.length === 0) return;
          
          const canvas = document.getElementById('gameCanvas');
          if (!canvas) return;
          const ctx = canvas.getContext('2d');
          
          const CW = 32, CH = 32;
          const COLS = Math.floor(canvas.width / CW);
          const ROWS = Math.floor(canvas.height / CH);
          
          const s = (typeof state !== 'undefined') ? state : window.state;
          if (!s || !s.forgePos) return;
          
          let camX = s.forgePos.x - Math.floor(COLS/2) + (window.camOffsetX || 0);
          let camY = s.forgePos.y - Math.floor(ROWS/2) + (window.camOffsetY || 0);
          
          if (window.selectedNpcId) {
              const n = s.npcs.find(n => n.id === window.selectedNpcId && n.alive);
              if (n) {
                  camX = n.x - Math.floor(COLS/2);
                  camY = n.y - Math.floor(ROWS/2);
              }
          }
          
          window.activeEffects.forEach(e => {
              const sx = (e.x - camX) * CW;
              const sy = (e.y - camY) * CH + e.offsetY;
              
              if (sx < -32 || sy < -32 || sx > canvas.width || sy > canvas.height) return;
              
              const img = getImg(e.file);
              if (img && img.complete && img.naturalWidth > 0) {
                  const alpha = e.life / e.maxLife;
                  ctx.globalAlpha = alpha;
                  ctx.drawImage(img, sx, sy, 32, 32);
                  ctx.globalAlpha = 1.0;
              }
          });
      };
  }
}, 2000);
