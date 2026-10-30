setTimeout(() => {
  // Карта объектов: ID -> файл, размеры и смещение
  const objectSprites = {
    'bed':      { file: 'кровать.png', w: 24, h: 48, ox: 4, oy: -16 },
    'altar':    { file: 'altar.png', w: 24, h: 48, ox: 4, oy: -16 },
    'storage':  { file: 'chest.png', w: 32, h: 32, ox: 0, oy: 0 },
    
    // Остальные (24x24) центрируем в клетке 32x32
    'pot':      { file: 'котел.png', w: 24, h: 24, ox: 4, oy: 4 },
    'forge':    { file: 'forge.png', w: 24, h: 24, ox: 4, oy: 4 },
    'alchemy':  { file: 'magic table.png', w: 24, h: 24, ox: 4, oy: 4 },
    'table':    { file: 'table.png', w: 24, h: 24, ox: 4, oy: 4 },
    'bar_snack':{ file: 'table with snacks.png', w: 24, h: 24, ox: 4, oy: 4 },
    // 'beer_tap' убран (рисуется в booze_sprite.js как ale.png)
    'campfire': { file: 'костер.png', w: 24, h: 24, ox: 4, oy: 4 },
    'mushroom': { file: 'грибы.png', w: 24, h: 24, ox: 4, oy: 4 }
  };

  for (let type in objectSprites) {
    const data = objectSprites[type];
    
    Reg.tile(type, (ctx, sx, sy, seed) => {
      // 1. Рисуем пол
      if (Reg.tiles['floor']) Reg.tiles['floor'](ctx, sx, sy, seed);
      
      // 2. Рисуем красивую тень под объектом (чтобы он стоял на земле, а не парил)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      // Тень по центру клетки
      ctx.ellipse(sx + 16, sy + 26, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      // 3. Рисуем сам спрайт
      const img = getImg('assets/objects/' + data.file);
      
      if (img && img.complete && img.naturalWidth > 0) {
        // Отключаем сглаживание для четкости пикселей
        ctx.imageSmoothingEnabled = false; 
        ctx.drawImage(img, sx + data.ox, sy + data.oy, data.w, data.h);
      } else {
        // Заглушка, если картинка не загрузилась
        ctx.fillStyle = '#555'; 
        ctx.fillRect(sx + 8, sy + 8, 16, 16);
      }
    });
  }
}, 3000);
