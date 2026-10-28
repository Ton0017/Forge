(function(){
  function applyPatch() {
    if (!window.GameUtils || !window.GameUtils.findPath) {
      setTimeout(applyPatch, 500);
      return;
    }
    if (window.GameUtils._emergentPatched) return;

    // Полная замена функции поиска пути
    window.GameUtils.findPath = function(sx, sy, tx, ty, targetType) {
      // Все эти клетки считаются проходимыми (включая мебель)
      const WALKABLE = ['floor', 'grass', 'grass_berry', 'water', 'ruins', 'mushroom', 
                        'bed', 'table', 'storage', 'altar', 'beer_tap', 'campfire', 
                        'anvil', 'forge', 'chair', 'library', 'tent'];

      function isWalkable(x, y) {
          const c = getCell(x, y);
          if (!c) return false;
          if (c.monster) return false; // Монстры блокируют путь
          
          // Если это цель, мы можем туда наступить (даже если это не пол)
          if (x === tx && y === ty) return true;
          
          return WALKABLE.includes(c.type);
      }

      const queue = [{x: sx, y: sy, path: []}];
      const visited = new Set([sx + ',' + sy]);
      
      let closestPath = [];
      let closestDist = Math.abs(sx - tx) + Math.abs(sy - ty);

      while (queue.length > 0) {
        const cur = queue.shift();
        
        const dist = Math.abs(cur.x - tx) + Math.abs(cur.y - ty);
        if (dist < closestDist) {
            closestDist = dist;
            closestPath = cur.path;
        }
        
        if (cur.x === tx && cur.y === ty) {
            return cur.path; // Дошли до цели
        }

        for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]) {
          const nx = cur.x + dx;
          const ny = cur.y + dy;
          const nk = nx + ',' + ny;
          
          if (!visited.has(nk) && isWalkable(nx, ny)) {
            visited.add(nk);
            queue.push({x: nx, y: ny, path: [...cur.path, {x: nx, y: ny}]});
          }
        }
      }
      // Если не дошли, возвращаем путь до ближайшей точки
      return closestPath; 
    };
    
    window.GameUtils._emergentPatched = true;
    console.log('[Pathfinding] Умный поиск пути активирован (мебель проходима).');
  }

  setTimeout(applyPatch, 1000);
})();
