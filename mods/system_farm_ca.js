(function(){
  Reg.on('tick', (state) => {
    if (state.tick % 20 !== 0) return;
    
    for (let k in state.cells) {
      const c = state.cells[k];
      if (c.type !== 'farm_plot' && c.type !== 'farm_sprout' && c.type !== 'farm_ready') continue;
      
      const [x, y] = k.split(',').map(Number);
      if (c.farmGrowth === undefined) c.farmGrowth = 0;

      // --- ЛОГИКА ПЕРЕРОЖДЕНИЯ ---
      // Если грядка уже собрана (флаг harvested) и пшеницу убрали с пола
      if (c.harvested) {
        // Тик каждые 20 игровых тиков, уменьшаем таймер на 20
        c.regrowTimer = (c.regrowTimer || 0) - 20;
        
        // Ждем, пока пшеницу уберут с земли (items пустой) И таймер истечет
        const itemsEmpty = !c.items || c.items.length === 0;
        if (c.regrowTimer <= 0 && itemsEmpty) {
          c.type = 'farm_plot';
          c.farmGrowth = 0;
          c.harvested = false;
          c.regrowTimer = 0;
        }
        continue;
      }

      // --- ПРОВЕРКА ОКРУЖЕНИЯ ---
      let hasWater = false, hasLava = false;
      for (let dx = -3; dx <= 3; dx++) {
        for (let dy = -3; dy <= 3; dy++) {
          const nc = getCell(x + dx, y + dy);
          if (nc) {
            if (nc.type === 'water') hasWater = true;
            if (nc.type === 'lava' || nc.type === 'fire') hasLava = true;
          }
        }
      }

      if (hasLava) { 
        c.type = 'floor'; 
        c.farmGrowth = 0; 
        c.harvested = false;
        c.regrowTimer = 0;
        continue; 
      }
      
      if (!hasWater) {
        if (c.farmGrowth > 0) c.farmGrowth -= 2;
        if (c.farmGrowth <= 0) { c.type = 'dead_land'; continue; }
      } else {
        c.farmGrowth += 1;
      }

      // --- СМЕНА ВИЗУАЛЬНЫХ СТАДИЙ ---
      if (c.farmGrowth <= 0) {
        c.type = 'farm_plot';
      } else if (c.farmGrowth > 0 && c.farmGrowth < 60) {
        c.type = 'farm_sprout';
      } else if (c.farmGrowth >= 60) {
        c.type = 'farm_ready';
        // УРОЖАЙ: если еще не собран
        if (!c.harvested) {
          c.harvested = true;
          c.regrowTimer = 150 + Math.floor(Math.random() * 100); // 150-250 тиков
          if (!c.items) c.items = [];
          const wheatCount = 2 + Math.floor(Math.random() * 2); // 2-3 пшеницы
          for (let i = 0; i < wheatCount; i++) {
            if (typeof window.createItem === 'function') {
              c.items.push(window.createItem('wheat'));
            }
          }
          // 1 семечко на следующий посев
          if (typeof window.createItem === 'function') {
            c.items.push(window.createItem('seeds'));
          }
        }
      }
    }
  });
  console.log('[Farm CA] Клеточный автомат фермы (с урожаем и регеном) активен.');
})();
