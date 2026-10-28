// Генератор биомов на основе площади шахты
Reg.on('tile_dug', (cell, npc, state) => {
  if (!cell || !npc) return;

  // 1. Считаем площадь шахты
  const dugCells = Object.values(state.cells).filter(c => ['floor','water','ruins','mushroom','ore','grass'].includes(c.type)).length;
  
  let depth = 1;
  if (dugCells > 100) depth = 2;
  if (dugCells > 300) depth = 3;
  if (dugCells > 600) depth = 4;
  if (dugCells > 1000) depth = 5;

  // 2. Бросаем кубик
  const r = Math.random();

  // ВОДА (Глубина 2+, шанс 4%)
  if (depth >= 2 && r < 0.04) {
    cell.type = 'water';
    // СВОЙСТВА ВОДЫ
    cell.water = {
        temperature: 5 + Math.floor(Math.random() * 15),
        purity: Math.random() < 0.7 ? 'clean' : (Math.random() < 0.8 ? 'stagnant' : 'infected'),
        depth: 1 + Math.floor(Math.random() * 3),
        salinity: Math.random() < 0.85 ? 'fresh' : 'salt',
        // РЫБА: зависит от глубины
        fishPopulation: (1 + Math.floor(Math.random() * 3)) * (1 + Math.floor(Math.random() * 3)),
        fishType: null,
        lastRegen: 0
    };
    if (cell.water.depth === 1) cell.water.fishType = 'small';
    else if (cell.water.depth === 2) cell.water.fishType = 'medium';
    else cell.water.fishType = 'big';
    Reg.log(`[Событие] ${npc.name} пробивает стену, и в туннель хлещет ледяная подземная вода!`, 'combat');
    return;
  }

  // ГРИБЫ (Глубина 2+, шанс 6%)
  if (depth >= 2 && r >= 0.04 && r < 0.10) {
    cell.type = 'mushroom';
    if (Math.random() < 0.5) {
        if (!cell.items) cell.items = [];
        const herb = (typeof window.createItem === 'function') ? window.createItem('herb') : { name: 'Лечебная трава', type: 'misc', tags: ['herb', 'medical'] };
        cell.items.push(herb);
    }
    Reg.log(`[Событие] В камне оказалась пустота, заросшая светящимися грибами.`, 'sys');
    return;
  }

  // РУИНЫ (Глубина 3+, шанс 4%)
  if (depth >= 3 && r >= 0.10 && r < 0.14) {
    cell.type = 'ruins';
    Reg.log(`[Событие] За стеной обнаружились древние руины.`, 'sys');
    return;
  }

  // РУДА (Глубина 3+, шанс 8%)
  if (depth >= 3 && r >= 0.14 && r < 0.22) {
    cell.type = 'ore';
    return;
  }

  // ПУСТЫНЯ (Песок, Глубина 2+, шанс 4%)
  if (depth >= 2 && r >= 0.22 && r < 0.26) {
    cell.type = 'desert';
    Reg.log(`[Событие] Из стены высыпается сухой песок пустыни.`, 'sys');
    return;
  }

  // МЕРТВАЯ ЗЕМЛЯ (Глубина 3+, шанс 4%)
  if (depth >= 3 && r >= 0.26 && r < 0.30) {
    cell.type = 'dead_land';
    Reg.log(`[Событие] За стеной — выжженная мертвая земля.`, 'sys');
    return;
  }

  // ЛАВА / ВУЛКАНИЧЕСКАЯ ПОРОДА (Глубина 4+, шанс 3%)
  if (depth >= 4 && r >= 0.30 && r < 0.33) {
    cell.type = 'lava'; // Тип специально для автомата
    Reg.log(`[ОПАСНОСТЬ] Из трещин сочится раскаленная лава!`, 'death');
    return;
  }
});
