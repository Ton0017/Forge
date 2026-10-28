// Перехватываем ИИ на этапе поиска пути к мебели
Reg.on('npc_tick', (npc, state) => {
  if (!npc.alive) return;
  if (!npc.task) npc.task = { type: 'idle', path: [] };

  // Если он уже идет куда-то, не мешаем
  if (npc.task.type.startsWith('go_to_') && npc.task.path && npc.task.path.length > 0) return;

  // Проверяем, не хочет ли он пить (ищем beer_tap)
  let adjBeer = null;
  for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]) {
    const c = getCell(npc.x + dx, npc.y + dy);
    if (c && c.type === 'beer_tap') adjBeer = { x: npc.x + dx, y: npc.y + dy };
  }

  // Если рядом есть пиво и у него есть деньги
  if (adjBeer && (npc.wallet || 0) >= 5 && (npc.emo.stress > 30 || npc.hunger > 50)) {
    npc.wallet -= 5;
    npc.emo.drunk = Math.min(100, (npc.emo.drunk || 0) + 30);
    npc.emo.stress = Math.max(0, npc.emo.stress - 40);
    Reg.log(`${npc.name} покупает эль и пьет.`, 'sys');
    Reg.addMemory(npc, `Он выпил эля в таверне.`, { type: 'joy', power: 15, category: 'tavern' });
    npc.task = { type: 'idle', path: [] };
    return;
  }

  // Проверяем, не хочет ли он молиться (ищем altar)
  let adjAltar = null;
  for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]) {
    const c = getCell(npc.x + dx, npc.y + dy);
    if (c && c.type === 'altar') adjAltar = { x: npc.x + dx, y: npc.y + dy };
  }

  if (adjAltar && npc.faithNeed > 50) {
    npc.faithNeed = Math.max(0, npc.faithNeed - 40);
    npc.emo.stress = Math.max(0, npc.emo.stress - 30);
    Reg.log(`${npc.name} молится у алтаря.`, 'sys');
    Reg.addMemory(npc, `Он помолился. На душе стало легче.`, { type: 'joy', power: 15, category: 'religion' });
    npc.task = { type: 'idle', path: [] };
    return;
  }

  // Если он голоден, но не может найти путь к котлу (встроенному), 
  // мы заставим его найти соседнюю клетку.
  // (Эта логика уже есть в utility_ai, мы просто чиним поиск пути ниже)
});

// Перехватываем функцию поиска пути, чтобы она искала СВОБОДНУЮ клетку рядом с целью
const originalFindPath = window.GameUtils.findPath;
window.GameUtils.findPath = function(sx, sy, tx, ty, targetType) {
  // Если цель - это мебель (pot, bed, table, storage, altar, beer_tap)
  if (['pot', 'bed', 'table', 'storage', 'altar', 'beer_tap', 'bar_snack'].includes(targetType)) {
    // Ищем свободную клетку вокруг объекта
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
    for (let [dx, dy] of dirs) {
      const nx = tx + dx, ny = ty + dy;
      const cell = getCell(nx, ny);
      // Если там пол и нет монстров — идем туда
      if (cell && cell.type === 'floor' && !cell.monster) {
        return originalFindPath(sx, sy, nx, ny, 'floor');
      }
    }
    // Если вокруг всё занято, идем в центр (на саму мебель)
    return originalFindPath(sx, sy, tx, ty, targetType);
  }
  
  // Для обычного пола используем стандартный поиск
  return originalFindPath(sx, sy, tx, ty, targetType);
};
