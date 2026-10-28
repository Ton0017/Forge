(function(){
  // Ждем загрузки движка и базовых монстров
  setTimeout(() => {
    if (!Reg.monsters) {
      console.log('[Monster Graphics] Reg.monsters не найден!');
      return;
    }

    // Карта соответствия ID монстра -> файл из assets/animals/
    const SPRITES = {
      goblin: 'goblin.png',
      skeleton: 'skeleton.png',
      rat: 'raccoon.png',
      troll: 'troll.png',
      zombie: 'zombie.png',
      ork: 'ork.png',
      giant_rat: 'raccoon.png',
      minotaur: 'minotaur.png'
    };

    // Проходимся по всем монстрам в базе
    for (let id in Reg.monsters) {
      const file = SPRITES[id] || (id + '.png');
      
      // Добавляем функцию draw прямо в объект монстра
      Reg.monsters[id].draw = function(ctx, sx, sy) {
        // 1. Сначала рисуем пол под монстром
        if (Reg.tiles['floor']) Reg.tiles['floor'](ctx, sx, sy);
        else { ctx.fillStyle = '#2a1e10'; ctx.fillRect(sx, sy, 32, 32); }
        
        // 2. Загружаем и рисуем картинку из твоей папки animals
        const img = getImg('assets/animals/' + file);
        if (img && img.complete && img.naturalWidth > 0) {
          ctx.drawImage(img, sx, sy, 32, 32);
        } else {
          // Заглушка (розовый квадрат), если файл не найден
          ctx.fillStyle = '#ff00ff';
          ctx.fillRect(sx + 8, sy + 8, 16, 16);
        }
      };
    }
    
    console.log('[Monster Graphics] Спрайты привязаны. Монстры больше не невидимы.');
  }, 1200);
})();
