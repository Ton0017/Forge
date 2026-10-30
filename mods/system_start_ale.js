(function(){
  Reg.on('world_init', (state) => {
    setTimeout(() => {
      // Ставим 20 beer_tap вокруг кузни (они будут рисоваться как ale.png)
      let placed = 0;
      const cx = state.forgePos.x, cy = state.forgePos.y;
      for (let r = 1; r <= 10 && placed < 20; r++) {
        for (let dx = -r; dx <= r && placed < 20; dx++) {
          for (let dy = -r; dy <= r && placed < 20; dy++) {
            const c = getCell(cx + dx, cy + dy);
            if (c && c.type === 'floor' && !c.items && !c.monster && !c.animal) {
              c.type = 'beer_tap';
              placed++;
            }
          }
        }
      }
      state.booze = placed;
      Reg.log(`[Таверна] Завезено ${placed} кружек эля.`, 'good');
    }, 2000);
  });
})();
