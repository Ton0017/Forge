(function(){
  setTimeout(() => {
    const origKillNpc = window.killNpc;
    if (origKillNpc) {
      window.killNpc = function(npc, reason) {
        if (!npc.alive) return;
        
        // Сохраняем тело в клетке
        const cell = getCell(npc.x, npc.y);
        if (cell) {
           if (!cell.dead_bodies) cell.dead_bodies = [];
           cell.dead_bodies.push({
              name: npc.name,
              sprite: npc.skinFile || 'Hobbit.png',
              type: 'dwarf',
              reason: reason,
              time: Date.now()
           });
           Reg.log(`[Смерть] Тело ${npc.name} остается лежать здесь.`, 'sys');
        }
        
        return origKillNpc(npc, reason);
      };
    }
  }, 1000);
})();
