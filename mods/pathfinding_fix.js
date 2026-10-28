setTimeout(() => {
  const originalFindPath = window.GameUtils.findPath;
  
  window.GameUtils.findPath = function(sx, sy, tx, ty, targetType) {
    // Если цель - мебель, используем стандартный поиск (он уже починен)
    if (['pot', 'bed', 'table', 'storage', 'altar', 'beer_tap', 'bar_snack'].includes(targetType)) {
      return originalFindPath(sx, sy, tx, ty, targetType);
    }

    // Кастомный BFS, который позволяет ходить по новым биомам
    const queue = [{x: sx, y: sy, path: []}];
    const visited = new Set([sx + ',' + sy]);
    
    // Список проходимых тайлов
    const walkable = ['floor', 'forge', 'ruin_floor', 'mushroom'];

    while (queue.length > 0) {
      const cur = queue.shift();
      if (cur.x === tx && cur.y === ty) return cur.path;
      
      for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]) {
        const nx = cur.x + dx, ny = cur.y + dy;
        const nk = nx + ',' + ny;
        if (visited.has(nk)) continue;
        
        const nCell = getCell(nx, ny);
        if (!nCell) continue;
        
        // Если клетка проходима и там нет монстра
        if (walkable.includes(nCell.type) && !nCell.monster) {
          visited.add(nk);
          queue.push({x: nx, y: ny, path: [...cur.path, {x: nx, y: ny}]});
        }
      }
    }
    return []; // Путь не найден
  };
}, 1000);
