(function(){
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || state.tick % 50 !== 0) return false;
    if (!npc.inventory || npc.inventory.length === 0) return false;
    if (npc.task && npc.task.type === 'fight') return false; // В бою не едим

    // Пробегаем по инвентарю и ищем, что можно применить
    for (let i = 0; i < npc.inventory.length; i++) {
        const item = npc.inventory[i];
        if (!item) continue;
        
        // Пропускаем оружие и броню (они не "используются", а надеваются)
        if (item.tags && (item.tags.includes('weapon') || item.tags.includes('armor'))) continue;
        
        // Проверяем, есть ли правило для этого предмета
        const chosen = Reg.chooseUsageRule ? Reg.chooseUsageRule(npc, item) : null;
        if (chosen) {
            // Если правило есть — применяем
            Reg.applyItemUsage(npc, item);
            return true; // Одно действие за тик
        }
    }
    return false;
  });

  console.log('[System Inventory] Дварфы теперь активно используют предметы из рюкзака.');
})();
