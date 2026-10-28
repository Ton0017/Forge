(function(){
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || state.tick % 50 !== 0) return false;
    if (npc.task && npc.task.type === 'fight') return false;

    // 1. ПРОВЕРЯЕМ, ЕСТЬ ЛИ У НАС ЛЕКАРСТВО В РЮКЗАКЕ
    const hasItem = npc.inventory && npc.inventory.find(i =>
        (i.material === 'cloth' || (i.tags && i.tags.includes('herb'))) &&
        !i.tags.includes('weapon') && !i.tags.includes('armor')
    );

    // 2. ЛЕЧИМ ДРУГА (Если мы добрые и есть чем лечить)
    if (hasItem && npc.facets && npc.facets.altruism > 50) {
        const friend = state.npcs.find(n =>
            n.alive && n.id !== npc.id && n.hp < n.maxHp * 0.6 &&
            Math.abs(n.x - npc.x) + Math.abs(n.y - npc.y) <= 5
        );

        if (friend) {
            const dist = Math.abs(npc.x - friend.x) + Math.abs(npc.y - friend.y);
            if (dist <= 1) {
                // Лечим друга
                Reg.log(`[МЕДИЦИНА] ${npc.name} перевязывает ${friend.name}.`, 'good');
                friend.hp = Math.min(friend.maxHp, friend.hp + 15);
                if (friend.body) {
                    for(let p in friend.body) { if(friend.body[p].bleeding > 0) friend.body[p].bleeding -= 2; }
                }
                npc.inventory = npc.inventory.filter(i => i !== hasItem);
                Reg.addMemory(npc, `Я помог ${friend.name}.`, { type: 'joy', power: 15, category: 'medical' });
            } else {
                // Идем к другу
                if (window.GameUtils && window.GameUtils.findPath) {
                    const path = window.GameUtils.findPath(npc.x, npc.y, friend.x, friend.y, 'floor');
                    if (path && path.length > 0) npc.task = { type: 'go_to_heal_friend', path: path, targetId: friend.id };
                }
            }
            return true;
        }
    }

    // 3. ЛЕЧИМ СЕБЯ
    let needsHealing = false;
    let hasEmbedded = false;

    if (npc.body) {
        for (let part in npc.body) {
            if (npc.body[part].bleeding > 0) needsHealing = true;
            if (npc.body[part].embedded && npc.body[part].embedded.length > 0) { needsHealing = true; hasEmbedded = true; }
            if (npc.body[part].infection > 0) needsHealing = true;
        }
    }
    if (!needsHealing && npc.hp > npc.maxHp * 0.7) return false;

    if (hasItem) {
        if (Reg.applyItemUsage) Reg.applyItemUsage(npc, hasItem);
        return true;
    }

    // 4. ИЩЕМ ЛЕКАРСТВО НА ПОЛУ (РАДИУС 5)
    let targetItem = null;
    let targetCell = null;
    for (let dx = -5; dx <= 5 && !targetItem; dx++) {
        for (let dy = -5; dy <= 5 && !targetItem; dy++) {
            const c = getCell(npc.x + dx, npc.y + dy);
            if (c && c.items) {
                const found = c.items.find(i => i.material === 'cloth' || (i.tags && i.tags.includes('herb')));
                if (found) { targetItem = found; targetCell = c; }
            }
        }
    }

    if (targetItem) {
        if (window.GameUtils && window.GameUtils.findPath) {
            let cellKey = null;
            for(let k in state.cells) { if(state.cells[k] === targetCell) { cellKey = k; break; } }
            if (cellKey) {
                const [cx, cy] = cellKey.split(',').map(Number);
                const dist = Math.abs(npc.x - cx) + Math.abs(npc.y - cy);
                if (dist <= 1) {
                    const idx = targetCell.items.indexOf(targetItem);
                    if (idx !== -1) {
                        targetCell.items.splice(idx, 1);
                        if (!npc.inventory) npc.inventory = [];
                        npc.inventory.push(targetItem);
                        if (Reg.applyItemUsage) Reg.applyItemUsage(npc, targetItem);
                        return true;
                    }
                } else {
                    const path = window.GameUtils.findPath(npc.x, npc.y, cx, cy, 'floor');
                    if (path && path.length > 0) npc.task = { type: 'go_to_heal', path: path };
                }
            }
        }
    }

    // 5. ВЫТАСКИВАЕМ ОСКОЛКИ ГОЛЫМИ РУКАМИ
    if (hasEmbedded && !hasItem) {
        for (let part in npc.body) {
            const b = npc.body[part];
            if (b.embedded && b.embedded.length > 0) {
                b.embedded.shift();
                npc.hp -= 2;
                b.bleeding += 2;
                Reg.log(`[МЕДИЦИНА] ${npc.name} вытаскивает осколок из ${part} голыми руками. Кровь идет сильнее.`, 'death');
                Reg.addMemory(npc, `Я вытащил осколок. Было больно.`, { type: 'fear', power: 10, category: 'medical' });
                return true;
            }
        }
    }

    return false;
  });

  console.log('[System Medical] Дварфы теперь лечат себя и друзей.');
})();
