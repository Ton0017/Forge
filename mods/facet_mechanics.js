(function(){
  // 1. СТОИЦИЗМ (stoicism) - уменьшает стресс от плохих событий
  setTimeout(() => {
    if (!Reg.addMemory) return;
    const origAddMemory = Reg.addMemory;

    Reg.addMemory = function(npc, text, emotion) {
      // Если это негативная эмоция и у дварфа высокий стоицизм
      if (emotion && (emotion.type === 'fear' || emotion.type === 'sadness' || emotion.type === 'anger')) {
        if (npc.values && npc.values.stoicism > 20) {
          // Уменьшаем силу эмоции (и, соответственно, стресс)
          emotion.power = Math.max(1, Math.floor(emotion.power * 0.7));
        }
      }
      return origAddMemory(npc, text, emotion);
    };
  }, 800);

  // 2. УПОРСТВО (fortitude) - замедляет рост усталости
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive) return false;
    
    // В utility_ai усталость растет на 0.5 каждый тик. 
    // Если упорство высокое, мы немного компенсируем этот рост (условно уменьшаем на 0.15)
    if (npc.values && npc.values.fortitude > 20) {
       if (npc.fatigue > 0) {
          npc.fatigue = Math.max(0, npc.fatigue - 0.15);
       }
    }
    return false;
  });

  // 3. ТРАДИЦИИ (traditions) - ненавидят новшества, любят стабильность
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || state.tick % 100 !== 0) return false;
    
    if (npc.values && npc.values.traditions > 30) {
      // Если рядом есть грибы или вода (новые биомы), они нервничают
      const c = getCell(npc.x, npc.y);
      if (c && (c.type === 'mushroom' || c.type === 'water')) {
         npc.emo.stress = Math.min(100, npc.emo.stress + 1);
      }
    }
    return false;
  });

  // 4. СОПЕРНИЧЕСТВО (competitiveness) - повышает шанс драк
  // (Мы добавим эту логику чуть позже, когда будем трогать incident_engine)

  console.log('[Facet Mechanics] Грани (Стоицизм, Упорство, Традиции) теперь влияют на игру.');
})();
