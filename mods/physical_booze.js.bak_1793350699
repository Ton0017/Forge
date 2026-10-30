(function(){
  Reg.on('world_init', (state) => {
    // 1. Убираем старую бочку, которую ставит tavern_temple.js
    for (let k in state.cells) {
       if (state.cells[k].type === 'beer_tap') state.cells[k].type = 'floor';
    }

    // 2. Ставим 20 новых бочек вокруг таверны
    let placed = 0;
    const cx = 3, cy = 0;

    for (let i = 0; i < 20; i++) {
       let found = false;
       for (let r = 1; r <= 15 && !found; r++) {
          for (let dx = -r; dx <= r && !found; dx++) {
             for (let dy = -r; dy <= r && !found; dy++) {
                const x = cx + dx, y = cy + dy;
                const cell = getCell(x, y);
                if (cell && cell.type === 'floor' && !cell.items && !cell.monster && !cell.animal) {
                   cell.type = 'beer_tap';
                   placed++;
                   found = true;
                }
             }
          }
       }
    }
    state.booze = placed;
    Reg.log(`[Таверна] Завезено ${placed} бочек эля.`, 'good');
  });

  // Пересчет полностью убран. Счетчик state.booze теперь управляется только выпиванием в utility_ai.js.
  console.log('[Physical Booze] Бочки теперь физические (20 штук на старте).');
})();
