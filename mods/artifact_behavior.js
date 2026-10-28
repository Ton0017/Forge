(function(){
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  // 1. ТРИГГЕР СТРАННОГО НАСТРОЕНИЯ
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive) return false;
    if (npc.moodCooldown && state.tick < npc.moodCooldown) return false;
    
    // Проверка на наковальню
    let hasAnvil = false;
    if (state.cells) for (let k in state.cells) { if (state.cells[k].type === 'anvil' || state.cells[k].type === 'forge') { hasAnvil = true; break; } }
    if (!hasAnvil) return false;

    // Триггер: сильный стресс или голод, но с шансом
    if (!npc.isInMood && (npc.emo.stress > 80 || npc.hunger > 85)) {
       if (Math.random() < 0.002) { 
          npc.isInMood = true;
          npc.moodTimer = 300;
          npc.moodNeed = 'iron_ore'; // Ищем только руду, так как она падает с камня
          npc.moodPhase = 'seek';
          Reg.log(`[Настроение] ${npc.name} впадает в транс. Он бормочет: "Я должен найти руду..."`, 'combat');
          Reg.addMemory(npc, `Я одержим. Мне нужна руда.`, { type: 'fear', power: 50, category: 'mood' });
          return true;
       }
    }

    // ПОВЕДЕНИЕ В ТРАНСЕ
    if (npc.isInMood) {
        npc.moodTimer--;
        
        // В трансе он всё равно хочет пить и есть, и получает урон, если не может
        npc.thirst = Math.min(100, (npc.thirst || 0) + 0.4);
        if (npc.thirst >= 100) {
            npc.hp -= 2;
            if (npc.hp <= 0) { 
                if (window.killNpc) window.killNpc(npc, "умер от жажды в приступе безумия"); 
                else { npc.alive = false; }
                return true; 
            }
        }
        
        npc.hunger = Math.min(100, (npc.hunger || 0) + 1);
        if (npc.hunger >= 100) {
            npc.hp -= 5;
            if (npc.hp <= 0) { 
                if (window.killNpc) window.killNpc(npc, "умер от голода в приступе безумия"); 
                else { npc.alive = false; }
                return true; 
            }
        }
        
        if (npc.moodPhase === 'seek') {
            let hasMat = npc.inventory && npc.inventory.find(i => i.tags && i.tags.includes(npc.moodNeed));
            if (hasMat) {
                npc.moodPhase = 'go_to_anvil';
                return true;
            }

            // Ищем руду в радиусе 10 клеток
            let found = false;
            for (let dx = -10; dx <= 10 && !found; dx++) {
                for (let dy = -10; dy <= 10 && !found; dy++) {
                    const cell = getCell(npc.x + dx, npc.y + dy);
                    if (cell && cell.items) {
                        const item = cell.items.find(i => i.tags && i.tags.includes(npc.moodNeed));
                        if (item) {
                            if (!npc.inventory) npc.inventory = [];
                            npc.inventory.push(item);
                            cell.items = cell.items.filter(i => i !== item);
                            found = true;
                            Reg.log(`${npc.name} находит руду. Его руки трясутся.`, 'sys');
                        }
                    }
                }
            }

            if (!found) {
                // Если нет руды — блуждает в панике
                npc.emo.stress = Math.min(100, npc.emo.stress + 0.5);
                if (npc.moodTimer <= 0) {
                    Reg.log(`[Трагедия] ${npc.name} не нашел руду. Его разум помутился.`, 'death');
                    npc.isInMood = false;
                    npc.moodCooldown = state.tick + 2000;
                    npc.emo.stress = 100; 
                    // Не трогаем несуществующий mentalBreak, пусть работает штатное безумие игры
                }
                return true; 
            }
        }

        if (npc.moodPhase === 'go_to_anvil') {
            const t = state.forgePos;
            const dist = Math.abs(npc.x - t.x) + Math.abs(npc.y - t.y);
            
            if (dist <= 1) {
                npc.moodPhase = 'crafting';
                npc.moodTimer = 100; // 100 тиков на ковку
            } else {
                // ИСПОЛЬЗУЕМ ПОИСК ПУТИ
                if (!npc.task.path || npc.task.path.length === 0) {
                    if (window.GameUtils && window.GameUtils.findPath) {
                        const path = window.GameUtils.findPath(npc.x, npc.y, t.x, t.y, 'forge');
                        if (path && path.length > 0) {
                            npc.task = { type: 'go_to_craft', path: path };
                        } else {
                            npc.moodTimer = 0; // Не смог найти путь
                        }
                    }
                } else {
                    // Идем по пути
                    const nextStep = npc.task.path.shift();
                    if (nextStep) { npc.x = nextStep.x; npc.y = nextStep.y; }
                }
            }
            return true;
        }

        if (npc.moodPhase === 'crafting') {
            if (npc.moodTimer % 20 === 0) Reg.log(`Стук молота... ${npc.name} выковывает нечто великое.`, 'sys');
            if (npc.moodTimer <= 0) {
                // СОЗДАЕМ АРТЕФАКТ
                if (window.generateArtifact) {
                    const artifact = window.generateArtifact(npc);
                    const c = getCell(npc.x, npc.y);
                    if (c) { if (!c.items) c.items = []; c.items.push(artifact); }
                    
                    // Удаляем 3 руды (или сколько есть)
                    let removed = 0;
                    npc.inventory = npc.inventory.filter(i => {
                        if (removed < 3 && i.tags && i.tags.includes(npc.moodNeed)) { removed++; return false; }
                        return true;
                    });
                    
                    Reg.log(`[Артефакт] ${npc.name} завершает работу! Создан: ${artifact.name}. ${artifact.aura_desc}`, 'good');
                    Reg.addMemory(npc, `Я создал артефакт: ${artifact.name}.`, { type: 'joy', power: 100, category: 'artifact' });
                    
                    // Сброс
                    npc.isInMood = false;
                    npc.moodCooldown = state.tick + 5000;
                    npc.emo.stress = Math.max(0, npc.emo.stress - 50);
                    npc.emo.joy = Math.min(100, npc.emo.joy + 40);
                    npc.task = { type: 'idle', path: [] };
                }
                return true;
            }
        }
        return true; 
    }
    return false;
  });

  // 2. ВЗАИМОДЕЙСТВИЕ С АРТЕФАКТАМИ (С троттлингом)
  Reg.on('npc_tick', (npc, state) => {
    // Проверяем только раз в 10 тиков (чтобы не лагало)
    if (state.tick % 10 !== 0) return false;
    if (!npc.alive || npc.isInMood || npc.task.type !== 'idle') return false;
    if (npc.artifactCooldown && state.tick < npc.artifactCooldown) return false;

    let targetArtifact = null; let targetCell = null;
    for (let dx = -5; dx <= 5 && !targetArtifact; dx++) {
        for (let dy = -5; dy <= 5 && !targetArtifact; dy++) {
            const cell = getCell(npc.x + dx, npc.y + dy);
            if (cell && cell.items) {
                const art = cell.items.find(i => i.tags && i.tags.includes('artifact'));
                if (art) { targetArtifact = art; targetCell = cell; }
            }
        }
    }
    if (!targetArtifact) return false;

    const f = npc.facets || {};
    
    // Не крадем у самих себя
    if (npc.inventory && npc.inventory.includes(targetArtifact)) return false;

    let weights = [];
    weights.push({ type: 'admire', w: (f.aesthetics || 50) * (targetArtifact.beauty / 50) });
    weights.push({ type: 'steal', w: (f.greed || 50) * 1.5 });
    if (targetArtifact.tags.includes('cursed')) weights.push({ type: 'fear', w: (100 - (f.courage || 50)) * 2 });
    if (targetArtifact.tags.includes('light') || targetArtifact.tags.includes('whisper')) weights.push({ type: 'worship', w: (f.altruism || 50) * 1.2 });

    weights.sort((a, b) => b.w - a.w);
    const best = weights[0];

    if (best.w > 50) {
        if (best.type === 'admire') {
            Reg.log(`${npc.name} замирает, любуясь ${targetArtifact.name}.`, 'sys');
            Reg.addMemory(npc, `Я видел невероятную красоту: ${targetArtifact.name}.`, { type: 'joy', power: 20, category: 'artifact' });
            npc.emo.joy = Math.min(100, npc.emo.joy + 15);
        } else if (best.type === 'steal') {
            if (!npc.inventory) npc.inventory = [];
            npc.inventory.push(targetArtifact);
            targetCell.items = targetCell.items.filter(i => i !== targetArtifact);
            Reg.log(`${npc.name} оглядывается и хватает ${targetArtifact.name}.`, 'combat');
            Reg.addMemory(npc, `Я украл артефакт.`, { type: 'fear', power: 30, category: 'crime' });
        } else if (best.type === 'fear') {
            Reg.log(`${npc.name} в ужасе обходит ${targetArtifact.name} стороной.`, 'sys');
            npc.emo.stress = Math.min(100, npc.emo.stress + 10);
        } else if (best.type === 'worship') {
            Reg.log(`${npc.name} шепчет молитвы над ${targetArtifact.name}.`, 'sys');
            npc.emo.joy = Math.min(100, npc.emo.joy + 10);
        }
        npc.artifactCooldown = state.tick + 1000;
        return true;
    }
    return false;
  });
})();
