(function(){
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || !npc.task) return false;

    if (npc.task.type === 'dig' && npc.digProgress === undefined) {
        npc.digProgress = 0;
    }

    if (npc.task.type === 'dig') {
        npc.digProgress++;
        
        if (npc.digProgress > 1) {
            npc.digProgress = 0;
            
            // Шанс 15% найти что-то дополнительно
            if (Math.random() < 0.03) {
                if (window.GAME_ITEMS && window.GAME_ITEMS.length > 0) {
                    const randomItem = window.GAME_ITEMS[Math.floor(Math.random() * window.GAME_ITEMS.length)];
                    
                    const cell = getCell(npc.x, npc.y);
                    if (cell) {
                        if (!cell.items) cell.items = [];
                        
                        // СОХРАНЯЕМ ОРИГИНАЛЬНЫЙ ТИП (weapon, armor, accessory, resource)
                        // Чтобы дварфы могли их надевать!
                        const newItem = { ...randomItem };
                        
                        // Даем случайную прочность, если ее нет
                        if (newItem.integrity === undefined) {
                            newItem.integrity = 50 + Math.floor(Math.random() * 50);
                        }

                        cell.items.push(newItem);
                        
                        Reg.log(`[Находка] ${npc.name} выкопал ${newItem.name}!`, 'good');
                        if (Reg.addMemory) Reg.addMemory(npc, `Я нашел ${newItem.name} в камне.`, { type: 'joy', power: 10, category: 'luck' });
                    }
                }
            }
        }
    }
    return false;
  });

  console.log('[Mining Loot] Лут из всех спрайтов (с сохранением типа) активирован.');
})();
