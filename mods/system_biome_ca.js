(function(){
  Reg.on('tick', (state) => {
    // Работает раз в 5 тиков, чтобы не грузить процессор
    if (state.tick % 5 !== 0) return;

    const keys = Object.keys(state.cells);
    if (keys.length === 0) return;

    // Выбираем 100 случайных клеток для обработки
    for (let i = 0; i < 100; i++) {
      const k = keys[Math.floor(Math.random() * keys.length)];
      const cell = state.cells[k];
      if (!cell) continue;

      const [x, y] = k.split(',').map(Number);
      const below = state.cells[(x) + ',' + (y+1)];
      const left = state.cells[(x-1) + ',' + y];
      const right = state.cells[(x+1) + ',' + y];
      const up = state.cells[(x) + ',' + (y-1)];

      // 1. ПЕСОК (Осыпается)
      if (cell.type === 'desert') {
        if (below && (below.type === 'floor' || below.type === 'water')) {
          // Песок падает вниз
          cell.type = 'floor';
          below.type = 'desert';
        }
      }

      // 2. ЛАВА (Течет, жжет и ОСТЫВАЕТ)
      if (cell.type === 'lava') {
        // Счетчик жизни лавы
        cell._lavaLife = (cell._lavaLife || 0) + 1;

        // Остывание через 100 тиков
        if (cell._lavaLife > 100) {
          cell.type = 'volcanic';
          continue; // Больше не течет
        }

        if (below && below.type === 'floor') {
          cell.type = 'floor';
          below.type = 'lava';
          below._lavaLife = 0; // Новая лава начинает счет заново
        } else if (below && (below.type === 'grass' || below.type === 'wood' || below.type === 'mushroom')) {
          below.type = 'dead_land'; // Сгорает
        }
        
        // Поджигает соседей
        [left, right, up].forEach(adj => {
          if (adj && (adj.type === 'grass' || adj.type === 'wood')) {
            adj.type = 'dead_land';
          }
        });
      }

      // 3. ГРИБЫ (Заражают трупы и дерево)
      if (cell.type === 'mushroom') {
        if (Math.random() < 0.05) {
          [left, right, up, below].forEach(adj => {
            if (adj && (adj.type === 'wood' || adj.corpse)) {
              adj.type = 'mushroom';
            }
          });
        }
      }

      // 4. МЕРТВАЯ ЗЕМЛЯ (Душит траву)
      if (cell.type === 'dead_land') {
        if (Math.random() < 0.03) {
          [left, right, up, below].forEach(adj => {
            if (adj && adj.type === 'grass') {
              adj.type = 'dead_land';
            }
          });
        }
      }
    }
  });
  console.log('[Biome CA] Клеточный автомат биомов запущен.');
})();
