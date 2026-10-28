(function(){
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || !npc.task || npc.task.type === 'fight' || npc.task.type === 'rest') return false;

    // 1. ПОИСК РЕСУРСОВ НА ПОЛУ
    let targetCell = null;
    let targetX = -1, targetY = -1;

    // Сканируем 3x3 клетки вокруг дварфа
    for (let sx = -1; sx <= 1; sx++) {
      for (let sy = -1; sy <= 1; sy++) {
        const c = getCell(npc.x + sx, npc.y + sy);
        if (c && c.items && c.items.length > 0) {
          targetCell = c;
          targetX = npc.x + sx;
          targetY = npc.y + sy;
          break;
        }
      }
      if (targetCell) break;
    }

    // Если нашли предмет и дварф жадный/трудолюбивый, он идет за ним
    if (targetCell) {
      let pickUpWeight = 20;
      if (npc.facets && npc.facets.greed > 60) pickUpWeight += 50;
      if (npc.facets && npc.facets.diligence > 60) pickUpWeight += 30;

      if (Math.random() * 100 < pickUpWeight && npc.task.type !== 'go_to_pickup') {
         npc.task = { type: 'go_to_pickup', path: [], target: { x: targetX, y: targetY } };
         return true;
      }
    }

    // 2. ЛОГИКА ПОДБОРА (Если он уже идет к предмету)
    if (npc.task.type === 'go_to_pickup') {
        const t = npc.task.target;
        const dist = Math.abs(npc.x - t.x) + Math.abs(npc.y - t.y);

        if (dist <= 1) {
            const c = getCell(t.x, t.y);
            if (c && c.items && c.items.length > 0) {
                if (!npc.inventory) npc.inventory = [];
                // Берем все предметы из клетки
                c.items.forEach(item => npc.inventory.push(item));
                c.items = []; // Очищаем клетку
                Reg.log(`${npc.name} подобрал ресурсы.`, 'sys');
            }
            npc.task = { type: 'idle', path: [] };
            return true;
        } else {
            // Двигаемся к цели
            npc.x += Math.sign(t.x - npc.x);
            npc.y += Math.sign(t.y - npc.y);
            return true;
        }
    }

    // 3. ИСПОЛЬЗОВАНИЕ РЕСУРСОВ (Крафт у наковальни)
    let hasAnvil = false;
    for (let dx = -3; dx <= 3; dx++) {
      for (let dy = -3; dy <= 3; dy++) {
        const c = getCell(npc.x + dx, npc.y + dy);
        if (c && (c.type === 'forge' || c.type === 'anvil')) { hasAnvil = true; break; }
      }
    }

    // Если у него нет руды, он ищет её на полу рядом
    let hasOre = npc.inventory && npc.inventory.some(i => i.tags && i.tags.includes('iron_ore'));
    if (!hasOre) {
        const cell = getCell(npc.x, npc.y);
        if (cell && cell.items) {
            const oreItem = cell.items.find(i => i.tags && i.tags.includes('iron_ore'));
            if (oreItem) {
                if (!npc.inventory) npc.inventory = [];
                npc.inventory.push(oreItem);
                cell.items = cell.items.filter(i => i !== oreItem);
                hasOre = true;
                Reg.log(`${npc.name} берет руду со склада.`, 'sys');
            }
        }
    }

    if (hasAnvil && hasOre && npc.task.type !== 'crafting') {
       let craftType = 'pickaxe';
       if (npc.facets && npc.facets.aggression > 60) craftType = 'sword';
       else if (npc.facets && npc.facets.bravery < 30) craftType = 'armor';

       npc.task = { type: 'crafting', path: [], craftType: craftType, timer: 10 };
       Reg.log(`${npc.name} начинает ковать что-то на наковальне.`, 'sys');
       return true;
    }

    // 4. ПРОЦЕСС КРАФТА
    if (npc.task.type === 'crafting') {
       npc.task.timer--;
       if (npc.task.timer <= 0) {
          const itemName = npc.task.craftType === 'pickaxe' ? 'Железная кирка' : 'Железный меч';
          const itemTags = npc.task.craftType === 'pickaxe' ? ['tool', 'pickaxe'] : ['weapon', 'sword'];

          npc.inventory = npc.inventory.filter(i => !(i.tags && i.tags.includes('iron_ore')));

          if (npc.task.craftType === 'pickaxe') {
              // Кирка кладется в инвентарь как объект
              npc.inventory.push({
                  name: 'Железная кирка',
                  type: 'tool',
                  tags: ['tool', 'pickaxe', 'metal', 'heavy', 'weapon'],
                  file: '⛏️',
                  isEmoji: true,
                  mass: 5,
                  hardness: 8,
                  durability: 100,
                  dmgMod: 5
              });
          } else {
              // Оружие падает на пол
              const c = getCell(npc.x, npc.y);
              if (c) {
                  if (!c.items) c.items = [];
                  c.items.push({ name: itemName, type: 'weapon', tags: ['weapon', 'sword'], dmgMod: 10, file: 'thick iron sword.png', integrity: 100, parts: [{name:'лезвие', hp: 60}, {name:'рукоять', hp: 40}] });
              }
          }

          Reg.log(`[Крафт] ${npc.name} выковал ${itemName}!`, 'good');
          Reg.addMemory(npc, `Я выковал ${itemName}. Неплохая работа.`, { type: 'joy', power: 25, category: 'craft' });
          npc.task = { type: 'idle', path: [] };
       }
       return true;
    }

    return false;
  });
  console.log('[Emergent Economy] Дварфы теперь сами решают, что делать с ресурсами.');
})();
