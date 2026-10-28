(function(){
  // 1. СПРАЙТЫ ДЕРЕВЬЕВ (ЭМОДЗИ)
  Reg.tile('tree', (ctx, sx, sy, seed) => {
    // Фон — пол (или трава, если есть)
    if (Reg.tiles['floor']) Reg.tiles['floor'](ctx, sx, sy, seed);
    ctx.save();
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🌳", sx + 16, sy + 16);
    ctx.restore();
  });

  Reg.tile('tree_pine', (ctx, sx, sy, seed) => {
    if (Reg.tiles['floor']) Reg.tiles['floor'](ctx, sx, sy, seed);
    ctx.save();
    ctx.font = "24px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("🌲", sx + 16, sy + 16);
    ctx.restore();
  });

  // 2. УМНЫЙ СПАВН ДЕРЕВЬЕВ
  Reg.on('world_init', (state) => {
    let count = 0;
    const forgeX = state.forgePos ? state.forgePos.x : 0;
    const forgeY = state.forgePos ? state.forgePos.y : 0;

    for (let k in state.cells) {
        const c = state.cells[k];
        const allowedTypes = ['floor', 'grass', 'grass_berry'];
        if (!allowedTypes.includes(c.type)) continue;

        const [x, y] = k.split(',').map(Number);
        if (Math.abs(x - forgeX) + Math.abs(y - forgeY) < 6) continue;

        // 1. Считаем соседей (деревья и траву)
        let treeNeighbors = 0;
        let grassNeighbors = 0;
        for (let dx = -2; dx <= 2; dx++) {
            for (let dy = -2; dy <= 2; dy++) {
                if (dx === 0 && dy === 0) continue;
                const nc = state.cells[(x + dx) + ',' + (y + dy)];
                if (!nc) continue;
                if (nc.type === 'tree' || nc.type === 'tree_pine') treeNeighbors++;
                if (nc.type === 'grass' || nc.type === 'grass_berry') grassNeighbors++;
            }
        }

        // 2. Определяем шанс
        let chance = 0;
        
        if (c.type === 'grass' || c.type === 'grass_berry') {
            // На траве — густой лес
            chance = 0.5;
        } else if (grassNeighbors > 0) {
            // На полу рядом с травой — опушка
            chance = 0.25;
        } else {
            // На голом полу — редко
            chance = 0.05;
        }
        
        // 3. Кластеризация (если рядом уже есть деревья — шанс выше)
        if (treeNeighbors > 0) {
            chance = Math.max(chance, 0.8);
        }

        if (Math.random() < chance) {
            c.type = (Math.random() < 0.5) ? 'tree' : 'tree_pine';
            c.treeHp = 60 + Math.floor(Math.random() * 40);
            c.woodAmount = 3 + Math.floor(Math.random() * 3);
            c.material = 'wood';
            c.mass = 50;
            count++;
        }
    }
    if (count > 0) Reg.log(`[Мир] В лесу выросло ${count} деревьев (🌳 и 🌲).`, 'sys');
  });

  // ДЕРЕВЬЯ ПРОРАСТАЮТ ПРИ КОПАНИИ
  Reg.on('tile_dug', (cell, npc, state) => {
      if (!cell || (cell.type !== 'floor' && cell.type !== 'grass')) return;
      
      let cx = npc.x, cy = npc.y;
      for (let k in state.cells) { if (state.cells[k] === cell) { const p = k.split(','); cx = +p[0]; cy = +p[1]; break; } }
      
      let treeNeighbors = 0;
      let grassNeighbors = 0;
      for (let dx = -2; dx <= 2; dx++) {
          for (let dy = -2; dy <= 2; dy++) {
              if (dx === 0 && dy === 0) continue;
              const nc = state.cells[(cx + dx) + ',' + (cy + dy)];
              if (!nc) continue;
              if (nc.type === 'tree' || nc.type === 'tree_pine') treeNeighbors++;
              if (nc.type === 'grass' || nc.type === 'grass_berry') grassNeighbors++;
          }
      }
      
      let chance = 0;
      if (grassNeighbors > 0) chance = 0.2;
      if (treeNeighbors > 0) chance = 0.4;
      
      if (Math.random() < chance) {
          cell.type = (Math.random() < 0.5) ? 'tree' : 'tree_pine';
          cell.treeHp = 60 + Math.floor(Math.random() * 40);
          cell.woodAmount = 3 + Math.floor(Math.random() * 3);
          cell.material = 'wood';
          cell.mass = 50;
          Reg.log(`[Природа] На новом месте проросло дерево.`, 'sys');
      }
  });
})();
