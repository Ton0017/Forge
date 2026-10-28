(function(){
  let _camX = 0, _camY = 0;
  let _lastUpdate = 0;

  function updateCamera() {
    const now = Date.now();
    if (now - _lastUpdate < 30) return; 
    _lastUpdate = now;
    
    if (!window.state || !window.state.forgePos) return;
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) return;
    
    const COLS = Math.floor(canvas.width / 32);
    const ROWS = Math.floor(canvas.height / 32);
    
    _camX = window.state.forgePos.x - Math.floor(COLS / 2);
    _camY = window.state.forgePos.y - Math.floor(ROWS / 2);
    
    let selected = null;
    try { selected = (typeof selectedNpcId !== 'undefined') ? selectedNpcId : null; } catch(e) {}
    if (!selected && window.selectedNpcId) selected = window.selectedNpcId;
    
    if (selected) {
      const n = window.state.npcs.find(x => x.id === selected);
      if (n && n.alive) {
        _camX = n.x - Math.floor(COLS / 2);
        _camY = n.y - Math.floor(ROWS / 2);
      }
    }
  }

  setTimeout(() => {
    const types = ['floor', 'grass', 'grass_berry', 'water', 'mushroom', 'ruins', 'ore'];
    types.forEach(type => {
      if (!Reg.tiles[type]) return;
      const orig = Reg.tiles[type];
      Reg.tiles[type] = function(ctx, sx, sy, seed) {
        if (!window.state || !window.state.cells) {
            orig.call(this, ctx, sx, sy, seed);
            return;
        }
        updateCamera();
        orig.call(this, ctx, sx, sy, seed);
        
        const wx = Math.floor(sx / 32) + _camX;
        const wy = Math.floor(sy / 32) + _camY;
        const cell = window.state.cells[wx + ',' + wy];
        
        if (cell && cell.dead_bodies && cell.dead_bodies.length > 0) {
            // 1. Рисуем лужу крови
            ctx.fillStyle = 'rgba(120, 0, 0, 0.4)';
            ctx.beginPath();
            ctx.arc(sx + 16, sy + 16, 14, 0, Math.PI * 2);
            ctx.fill();

            // 2. Рисуем труп (только верхний)
            const body = cell.dead_bodies[cell.dead_bodies.length - 1];
            const img = getImg('assets/skins/' + body.sprite);
            
            ctx.save();
            ctx.globalAlpha = 0.6; // Затемняем труп
            if (img && img.complete && img.naturalWidth > 0) {
                // Поворачиваем спрайт на 90 градусов (чтобы он лежал)
                ctx.translate(sx + 16, sy + 16);
                ctx.rotate(Math.PI / 2); 
                ctx.drawImage(img, -16, -16, 32, 32);
            } else {
                // Если спрайт не найден, рисуем серый крест
                ctx.fillStyle = '#555';
                ctx.fillRect(sx + 8, sy + 8, 16, 16);
            }
            ctx.restore();
        }
      };
    });
  }, 1500);
})();
