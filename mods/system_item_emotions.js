(function(){
  // 1. ИНИЦИАЛИЗАЦИЯ ЭМОЦИЙ (при получении предмета)
  Reg.on('item_taken', (npc, item) => {
    if (!item.emotionalBond) item.emotionalBond = 0;
    // Немного радуется новой вещи
    if (npc.emo && Math.random() < 0.5) {
        npc.emo.joy = Math.min(100, (npc.emo.joy || 0) + 2);
    }
  });

  // 2. ЭМОЦИИ ПРИ ИСПОЛЬЗОВАНИИ
  Reg.on('item_used', (npc, item) => {
    if (!item.emotionalBond) item.emotionalBond = 0;
    
    // Если предмет — оружие/инструмент, он привыкает
    if (item.tags && (item.tags.includes('weapon') || item.tags.includes('tool'))) {
        item.emotionalBond = Math.min(100, item.emotionalBond + 1);
        
        // Иногда он обращает на него внимание
        if (Math.random() < 0.05) {
            Reg.log(`[Привязанность] ${npc.name} любовно поглаживает ${item.name}.`, 'sys');
            Reg.addMemory(npc, `Мой ${item.name} — отличная вещь.`, { type: 'joy', power: 5, category: 'item' });
        }
    }
  });

  // 3. ЭМОЦИИ ПРИ ПОЛОМКЕ
  Reg.on('item_broken', (npc, item) => {
    if (!item.emotionalBond) item.emotionalBond = 0;
    item.emotionalBond = Math.max(-100, item.emotionalBond - 20);
    
    Reg.log(`[Ненависть] ${npc.name} с отвращением смотрит на сломанный ${item.name}.`, 'sys');
    Reg.addMemory(npc, `Проклятый ${item.name} сломался!`, { type: 'anger', power: 15, category: 'item' });
    if (npc.emo) npc.emo.stress = Math.min(100, (npc.emo.stress || 0) + 10);
  });

  // 4. СЛУЧАЙНЫЕ МЫСЛИ О СУМКЕ (Раз в 100 тиков, но редко)
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || state.tick % 100 !== 0) return false;
    if (!npc.inventory || npc.inventory.length === 0) return false;
    if (Math.random() > 0.1) return false; // 10% шанс, что он задумается о вещах

    const item = npc.inventory[Math.floor(Math.random() * npc.inventory.length)];
    if (!item) return false;

    if (item.emotionalBond > 50) {
        Reg.addMemory(npc, `Я смотрю на свой ${item.name}. Хорошая вещь.`, { type: 'joy', power: 2, category: 'item' });
    } else if (item.emotionalBond < -50) {
        Reg.addMemory(npc, `Этот ${item.name} меня раздражает.`, { type: 'anger', power: 2, category: 'item' });
    } else {
        Reg.addMemory(npc, `Так, что у меня в сумке? Ах да, ${item.name}.`, { type: 'neutral', power: 1, category: 'item' });
    }
    return false;
  });

  console.log('[System Item Emotions] Эмоции к предметам теперь событийные.');
})();
