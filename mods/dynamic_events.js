(function(){
  setTimeout(() => {
    // Перехватываем Reg.addThought
    const origAddThought = Reg.addThought;
    Reg.addThought = function(npc, eventId) {
      if (eventId === 'woke_up') {
        // Дварф проснулся. Генерируем мысль о кровати (или о том, что видит)
        let target = 'bed';
        const c = getCell(npc.x, npc.y);
        if (c && c.type === 'floor') target = 'wall'; // Если кровати нет, смотрит на стену
        
        const thought = Reg.composer.generate(npc, target, 'wakeup');
        if (thought) {
          Reg.addMemory(npc, thought.text, thought.emo);
          return;
        }
      }
      // Остальные события идут через оригинал
      return origAddThought(npc, eventId);
    };
  }, 800);
})();
