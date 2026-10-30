(function(){
  // РЕЕСТР РЕЦЕПТОВ (данные отдельно от поведения)
  window.CRAFTABLES = {
    pickaxe: {
      name: 'Кирка',
      cost: { iron_ore: 3, wood: 1 },
      time: 30,
      signal: 'no_pickaxe'
    },
    sword: {
      name: 'Меч',
      cost: { iron_ore: 4, wood: 1 },
      time: 40,
      signal: 'danger'
    },
    armor: {
      name: 'Нагрудник',
      cost: { iron_ore: 5 },
      time: 50,
      signal: 'danger'
    },
    fishing_rod: {
      name: 'Удочка',
      cost: { wood: 2, cloth: 1 },
      time: 20,
      signal: 'low_food'
    },
    cheap_ale: {
      name: 'Дешевый эль',
      cost: { wheat: 2 },
      time: 10,
      signal: 'thirst'
    },
    slop: {
      name: 'Падаль',
      cost: { edible: 2 }, // Любые 2 съедобных предмета
      time: 5,
      signal: 'hunger'
    }
  };

  // ОЧЕРЕДЬ ЗАДАНИЙ
  Reg.on('world_init', (state) => {
    state.craftQueue = [];
  });

  // Добавить в очередь (вызывается из UI)
  window.addToCraftQueue = function(id) {
    if (!window.CRAFTABLES[id]) return false;
    if (!state.craftQueue) state.craftQueue = [];
    const existing = state.craftQueue.find(j => j.id === id);
    if (existing) {
      existing.count++;
    } else {
      state.craftQueue.push({ id, count: 1, claimed: 0 });
    }
    return true;
  };

  // Проверка: есть ли у дварфа ресурсы для рецепта
  window.canCraft = function(npc, id) {
    const recipe = window.CRAFTABLES[id];
    if (!recipe || !npc.inventory) return false;
    for (let res in recipe.cost) {
      const need = recipe.cost[res];
      let have = npc.inventory.filter(i => (i.id === res || (i.tags && i.tags.includes(res)))).length;
      
      // Если не хватает в рюкзаке, ищем на складах
      if (have < need && window.state && window.state.cells) {
        for (let k in window.state.cells) {
          const c = window.state.cells[k];
          if (c && c.type === 'storage' && c.items) {
            have += c.items.filter(i => (i.id === res || (i.tags && i.tags.includes(res)))).length;
          }
        }
      }
      
      if (have < need) return false;
    }
    return true;
  };

  // Списать ресурсы
  window.consumeResources = function(npc, id) {
    const recipe = window.CRAFTABLES[id];
    if (!recipe || !npc.inventory) return;
    for (let res in recipe.cost) {
      let need = recipe.cost[res];
      
      // Списываем из рюкзака
      npc.inventory = npc.inventory.filter(item => {
        if (need > 0 && (item.id === res || (item.tags && item.tags.includes(res)))) {
          need--;
          return false;
        }
        return true;
      });
      
      // Если не хватило, списываем со склада
      if (need > 0 && window.state && window.state.cells) {
        for (let k in window.state.cells) {
          if (need <= 0) break;
          const c = window.state.cells[k];
          if (c && c.type === 'storage' && c.items) {
            c.items = c.items.filter(item => {
              if (need > 0 && (item.id === res || (item.tags && item.tags.includes(res)))) {
                need--;
                return false;
              }
              return true;
            });
          }
        }
      }
    }
  };

  // Чистка "зависших" бронирований (дварф умер или давно не заявлялся)
  Reg.on('tick', (state) => {
    if (state.tick % 100 !== 0) return;
    if (!state.craftQueue) return;
    state.craftQueue.forEach(job => {
      if (!job.claimedBy) return;
      job.claimedBy = job.claimedBy.filter(entry => {
        const n = state.npcs.find(x => x.id === entry.id);
        if (!n || !n.alive) return false;
        if (state.tick - entry.tick > 200) return false;
        return true;
      });
    });
  });

  console.log('[System Crafting] Реестр CRAFTABLES и очередь заданий загружены.');
})();
