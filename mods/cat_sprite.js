(function(){
  let _catCanvas = null;

  function _buildCatCanvas() {
    if (_catCanvas) return _catCanvas;
    const c = document.createElement('canvas');
    c.width = 16;
    c.height = 16;
    const cx = c.getContext('2d');
    cx.imageSmoothingEnabled = false;
    cx.textAlign = 'center';
    cx.textBaseline = 'middle';
    // Пробуем разные шрифты эмодзи (Android → Noto Color Emoji)
    cx.font = '15px "Noto Color Emoji", "Apple Color Emoji", "Segoe UI Emoji", sans-serif';
    cx.fillText('🐈', 8, 9);
    _catCanvas = c;
    return c;
  }

  Reg.tile('cat', (ctx, sx, sy, seed) => {
    if (Reg.tiles['floor']) Reg.tiles['floor'](ctx, sx, sy, seed);
    const c = _buildCatCanvas();
    ctx.save();
    // Отключаем сглаживание — вот тут пиксели становятся чёткими
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(c, sx, sy, 32, 32);
    ctx.restore();
  });

  console.log('[Cat Sprite] Эмодзи 🐈 отрисован как пиксельный спрайт.');
})();
