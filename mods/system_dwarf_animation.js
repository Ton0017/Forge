(function(){
  // РЕЕСТР АНИМАЦИЙ (для дварфов)
  const DWARF_ANIMS = {
    skeleton: { frames: 4, speed: 5, prefix: 'assets/anim/skeleton_' },
    goblin:   { frames: 4, speed: 5, prefix: 'assets/anim/goblin_' },
    knight:   { frames: 4, speed: 5, prefix: 'assets/anim/knight_' },
    wraith:   { frames: 4, speed: 5, prefix: 'assets/anim/wraith_' }
  };

  // Раз в тик обновляем кадры у дварфов
  Reg.on('tick', (state) => {
    if (!state.npcs) return;
    state.npcs.forEach(npc => {
      if (!npc.alive) return;
      // Определяем тип анимации по skinFile
      let animType = null;
      if (npc.skinFile && npc.skinFile.includes('skeleton')) animType = 'skeleton';
      else if (npc.skinFile && npc.skinFile.includes('goblin')) animType = 'goblin';
      else if (npc.skinFile && npc.skinFile.includes('knight')) animType = 'knight';
      else if (npc.skinFile && npc.skinFile.includes('wraith')) animType = 'wraith';
      
      if (!animType) return;
      const anim = DWARF_ANIMS[animType];
      if (state.tick % anim.speed !== 0) return;
      npc.animFrame = ((npc.animFrame || 0) + 1) % anim.frames;
    });
  });

  // Перехват renderMap для отрисовки дварфов
  function tryWrap() {
    if (!window.renderMap || window._dwarfAnimWrapped) return;
    window._dwarfAnimWrapped = true;
    const orig = window.renderMap;
    window.renderMap = function() {
      orig.apply(this, arguments);
      try {
        const s = (typeof state !== 'undefined') ? state : window.state;
        if (!s || !s.cells) return;
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const CW = 32, CH = 32;
        const COLS = Math.floor(canvas.width / CW);
        const ROWS = Math.floor(canvas.height / CH);

        let _selId = null;
        try { _selId = eval('selectedNpcId'); } catch(e) {}
        if (!_selId) _selId = window.selectedNpcId;

        let camX = s.forgePos.x - Math.floor(COLS/2);
        let camY = s.forgePos.y - Math.floor(ROWS/2);
        if (_selId) {
          const n = s.npcs.find(n => n.id === _selId && n.alive);
          if (n) { camX = n.x - Math.floor(COLS/2); camY = n.y - Math.floor(ROWS/2); }
        }

        // Проходим по всем дварфам и рисуем анимацию поверх
        s.npcs.forEach(npc => {
          if (!npc.alive) return;
          let animType = null;
          if (npc.skinFile && npc.skinFile.includes('skeleton')) animType = 'skeleton';
          else if (npc.skinFile && npc.skinFile.includes('goblin')) animType = 'goblin';
          else if (npc.skinFile && npc.skinFile.includes('knight')) animType = 'knight';
          else if (npc.skinFile && npc.skinFile.includes('wraith')) animType = 'wraith';
          
          if (!animType) return;

          const anim = DWARF_ANIMS[animType];
          const frame = npc.animFrame || 0;
          const sx = (npc.x - camX) * CW;
          const sy = (npc.y - camY) * CH;
          if (sx < -32 || sy < -32 || sx > canvas.width || sy > canvas.height) return;

          const img = getImg(anim.prefix + frame + '.png');
          if (img && img.complete && img.naturalWidth > 0) {
            ctx.save();
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(img, sx, sy, 32, 32);
            ctx.restore();
          }
        });
      } catch(e) { console.error('[DwarfAnim]', e); }
    };
    console.log('[Dwarf Animation] Анимации дварфов активны.');
  }

  tryWrap();
  let tries = 0;
  const iv = setInterval(() => { tryWrap(); tries++; if (tries > 50) clearInterval(iv); }, 100);
})();
