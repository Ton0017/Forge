(function(){
  setTimeout(() => {
    // 1. ИНИЦИАЛИЗАЦИЯ ИНВЕНТАРЯ ПРИ НАЙМЕ
    Reg.on('npc_hired', (npc) => {
      if (!npc.inventory) npc.inventory = [];
      if (!npc.equipment) npc.equipment = { weapon: null, armor: null, accessory: null };
      
      // ВЫДАЧА СТАРТОВЫХ ИНСТРУМЕНТОВ
      if (typeof window.createItem === 'function') {
          // Топор
          if (!npc.inventory.find(i => i.tags && i.tags.includes('axe'))) {
              npc.inventory.push(window.createItem('axe'));
          }
          // Кирка
          if (!npc.inventory.find(i => i.tags && i.tags.includes('pickaxe'))) {
              npc.inventory.push(window.createItem('pickaxe'));
          }
      } else {
          console.error('[КРИТИЧЕСКАЯ ОШИБКА] data_items.js не загружен!');
      }
    });

    // 2. СПАВН ПРЕДМЕТОВ НА ПОЛУ
    Reg.on('tile_dug', (cell, npc, state) => {
      if (cell && cell.type === 'ruins') {
        if (!cell.items) cell.items = [];
        const allItems = window.GAME_ITEMS || [];
        if (allItems.length === 0) return;

        const commonItems = allItems.filter(i => !i.tags.includes('magic') && !i.tags.includes('cursed') && !i.tags.includes('rare'));
        const rareItems = allItems.filter(i => i.tags.includes('magic') || i.tags.includes('cursed') || i.tags.includes('rare'));

        const roll = Math.random() * 100;

        if (roll < 0.1 && rareItems.length > 0) {
          const item = rareItems[Math.floor(Math.random() * rareItems.length)];
          cell.items.push(item);
          Reg.log(`[ЛЕГЕНДА] Среди пыли и камней найден артефакт: ${item.name}!`, 'good');
          if (Reg.addMemory) Reg.addMemory(npc, `Я нашел ${item.name}. Это легенда!`, { type: 'joy', power: 50, category: 'find' });
        } else if (roll < 0.9 && commonItems.length > 0) {
          const item = commonItems[Math.floor(Math.random() * commonItems.length)];
          cell.items.push(item);
          Reg.log(`[Находка] Среди камней что-то блеснуло: ${item.name}.`, 'sys');
          if (Reg.addMemory) Reg.addMemory(npc, `Я нашел ${item.name} в руинах.`, { type: 'joy', power: 15, category: 'find' });
        }
      }
    });

    // 3. ПОДБОР ПРЕДМЕТА (С защитой от вылетов)
    Reg.on('npc_tick', (npc, state) => {
      // Защита: если это не дварф, или он мертв, или занят — пропускаем
      if (!npc.alive || (npc.task && npc.task.type === 'fight') || state.tick % 20 !== 0) return false;
      
      // ЗАЩИТА: Торговец не подбирает предметы
      if (npc.isCaravanTrader) return false;

      // ЗАЩИТА: Торговец не подбирает предметы
      if (npc.isCaravanTrader) return false;

      // ЗАЩИТА: Создаем рюкзак и слоты, если их нет (для Жреца и старых сейвов)
      if (!npc.inventory) npc.inventory = [];
      if (!npc.equipment) npc.equipment = { weapon: null, armor: null, accessory: null };

      const cell = getCell(npc.x, npc.y);
      if (!cell || !cell.items || cell.items.length === 0) return false;

      const itemToTake = cell.items[0];
      if (!itemToTake || !itemToTake.name) { cell.items.shift(); return false; }
      let canEquip = false;
      
      // Проверяем, можно ли надеть
      if (itemToTake.type === 'weapon' && !npc.equipment.weapon) { npc.equipment.weapon = itemToTake; canEquip = true; }
      else if (itemToTake.type === 'armor' && !npc.equipment.armor) { npc.equipment.armor = itemToTake; canEquip = true; }
      else if (itemToTake.type === 'accessory' && !npc.equipment.accessory) { npc.equipment.accessory = itemToTake; canEquip = true; }
      
      // Берем предмет, если можно надеть ИЛИ если в рюкзаке есть место
      if (canEquip || true) {
        cell.items.splice(0, 1); 
        
        if (!canEquip) {
          npc.inventory.push(itemToTake); 
        } else if (itemToTake.type === 'weapon') {
          // npc.weapon убран, используем npc.equipment.weapon
        }

        // ПРЕДМЕТ ПОДОБРАН — теперь дварф решает, что с ним делать
        // ПРЕДМЕТ ПОДОБРАН — генерируем мысль
        let thought = null;
        
        try {
            if (window.generateItemContextThought) {
                thought = window.generateItemContextThought(npc, itemToTake);
            }
        } catch(e) {
            console.error('[ItemContext] Ошибка нового генератора:', e);
        }
        
        if (!thought || !thought.text) {
            try {
                if (window.generateItemThought) {
                    thought = window.generateItemThought(npc, itemToTake);
                }
            } catch(e) {
                console.error('[ItemThoughts] Ошибка старого генератора:', e);
            }
        }

        if (thought && thought.text && Reg.addMemory) Reg.addMemory(npc, thought.text, thought.emo);
        Reg.log(npc.name + ' подбирает ' + itemToTake.name + '.', 'sys');
        
        // Вызываем движок применения (если он готов)
        if (window.Reg && Reg.applyItemUsage) {
            setTimeout(() => {
                try {
                    Reg.applyItemUsage(npc, itemToTake);
                } catch(e) {
                    console.error('[PhysicalItems] Ошибка в применении:', e);
                }
            }, 100);
        }
        
        return true;
      }
      return false;
    });

    // 4. ВЫБРАСЫВАНИЕ ПРЕДМЕТОВ ПРИ СМЕРТИ
    const origKillNpc = window.killNpc;
    if (origKillNpc) {
      window.killNpc = function(npc, reason) {
        if (!npc.alive) return;
        const cell = getCell(npc.x, npc.y);
        if (cell) {
          if (!cell.items) cell.items = [];
          if (npc.equipment) {
             if (npc.equipment.weapon) cell.items.push(npc.equipment.weapon);
             if (npc.equipment.armor) cell.items.push(npc.equipment.armor);
             if (npc.equipment.accessory) cell.items.push(npc.equipment.accessory);
          }
          if (npc.inventory) cell.items.push(...npc.inventory);
        }
        return origKillNpc(npc, reason);
      };
    }

    console.log('[Physical Items] Предметы в мире активны (защита от вылетов включена).');
  }, 2000);
})();
