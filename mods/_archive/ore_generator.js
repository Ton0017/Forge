// Перехватываем функцию создания клеток в core.js
setTimeout(() => {
  const originalGetCell = window.getCell;
  
  window.getCell = function(x, y) {
    const k = x + ',' + y;
    
    // Если клетки еще нет, создаем ее
    if (!state.world.cells[k]) {
      // Вычисляем глубину
      const depth = Math.floor((Math.abs(x) + Math.abs(y)) / 15);
      
      // Шанс, что это будет руда (чем глубже, тем больше шанс)
      let oreChance = 0.05; // Базовый шанс 5%
      if (depth > 2) oreChance = 0.15; // На глубине > 2: 15%
      if (depth > 5) oreChance = 0.30; // На глубине > 5: 30%
      if (depth > 10) oreChance = 0.50; // На глубине > 10: 50%
      
      const isOre = Math.random() < oreChance;
      
      state.world.cells[k] = {
        type: isOre ? 'ore' : 'stone',
        seed: Math.floor(Math.random() * 100000),
        monster: null,
        corpse: null,
        explored: false
      };
    }
    
    return state.world.cells[k];
  };
}, 1000);
