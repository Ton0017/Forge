(function(){
  // ВЗВЕШЕННЫЙ РАНДОМ
  function weightedPick(candidates) {
    const total = candidates.reduce((s, c) => s + (c.weight || 1), 0);
    let roll = Math.random() * total;
    for (const c of candidates) {
      roll -= (c.weight || 1);
      if (roll <= 0) return c;
    }
    return candidates[candidates.length - 1];
  }

  // ВЫБОР СЛОЯ ПО КОНТЕКСТУ
  function pickSubject(npc) {
    if (npc.hasGoneInsane) return ["безумец", "одержимый", "безумный дварф", "тот, кто потерял рассудок"];
    if (npc.emo && npc.emo.drunk > 50) return ["пьяный дварф", "пьяница", "тот, кто не просыхает"];
    if (npc.task && npc.task.type === 'fight') return ["воин", "защитник", "боец"];
    if (npc.task && npc.task.type === 'dig') return ["шахтёр", "копатель", "дварф с киркой"];
    if (npc.facets && npc.facets.greed > 70) return ["жадина", "скряга", "тот, кто любит золото"];
    if (npc.facets && npc.facets.courage < 30) return ["трус", "боязливый дварф", "тот, кто боится тени"];
    return [npc.name, "дварф", "он", "работяга"];
  }

  function pickAdverb(npc) {
    if (npc.hunger > 80) return Reg.usageAdvs.hunger_high;
    if (npc.emo && npc.emo.stress > 70) return Reg.usageAdvs.stress_high;
    if (npc.emo && npc.emo.fear > 50) return Reg.usageAdvs.fear_high;
    if (npc.emo && npc.emo.drunk > 50) return Reg.usageAdvs.drunk;
    if (npc.emo && npc.emo.anger > 50) return Reg.usageAdvs.anger_high;
    if (npc.facets && npc.facets.diligence > 70) return Reg.usageAdvs.diligent;
    if (npc.trait && npc.trait.id === 'lazy') return Reg.usageAdvs.lazy;
    if (npc.facets && npc.facets.courage > 70) return Reg.usageAdvs.brave;
    if (npc.facets && npc.facets.courage < 30) return Reg.usageAdvs.coward;
    if (npc.facets && npc.facets.greed > 70) return Reg.usageAdvs.greedy;
    if (npc.facets && npc.facets.curiosity > 70) return Reg.usageAdvs.curious;
    if (npc.trait && npc.trait.id === 'pious') return Reg.usageAdvs.pious;
    return Reg.usageAdvs.neutral;
  }

  // СБОРКА ФРАЗЫ
  Reg.buildUsageText = function(npc, item, actionType, actionKey, success) {
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    
    // 1. Подлежащее
    const subject = pick(pickSubject(npc));
    // Если subject — имя, добавляем "(он)" для связки
    const isName = subject === npc.name;
    
    // 2. Глагол
    // ВЫБОР ГЛАГОЛА С УЧЕТОМ СОСТОЯНИЯ
    let verbPool = Reg.usageVerbs[actionKey] || Reg.usageVerbs.ignore;
    
    let stateSuffix = '';
    if (npc.body) {
        let isInjured = false; let hasShrapnel = false; let hasInfection = false; let hasProsthetic = false;
        for (let p in npc.body) {
            if (npc.body[p].bleeding > 0 || npc.body[p].status === 'cut' || npc.body[p].status === 'fracture') isInjured = true;
            if (npc.body[p].embedded && npc.body[p].embedded.length > 0) hasShrapnel = true;
            if (npc.body[p].infection > 0) hasInfection = true;
            if (npc.body[p].status === 'prosthetic') hasProsthetic = true;
        }
        if (hasInfection) stateSuffix = '_infected';
        else if (hasShrapnel) stateSuffix = '_shrapnel';
        else if (isInjured) stateSuffix = '_injured';
        else if (hasProsthetic) stateSuffix = '_prosthetic';
    }

    if (stateSuffix && Reg.usageVerbs[actionKey + stateSuffix]) {
        verbPool = Reg.usageVerbs[actionKey + stateSuffix];
    }
    
    const verb = pick(verbPool);
    
    // 3. Наречие
    const adverb = pick(pickAdverb(npc));
    
    // 4. Объект
    const objPool = Reg.getObjectDescriptions(item);
    const obj = pick(objPool);
    
    // 5. Контекст
    const ctx = Reg.getContext(npc, item);
    const ctxPart = ctx ? ", " + ctx : "";
    
    // 6. Финал
    // ВЫБОР ФИНАЛА С УЧЕТОМ СОСТОЯНИЯ
    let final = null;
    if (stateSuffix && Reg.usageFinals[actionType + stateSuffix]) {
        const pool = Reg.usageFinals[actionType + stateSuffix];
        final = pool[Math.floor(Math.random() * pool.length)];
    } else {
        final = Reg.getFinal(actionType, success);
    }
    const finalPart = final ? " " + final + "." : "";
    
    // СБОРКА
    let text = "";
    if (isName) {
      text = subject + " " + adverb + " " + verb + " " + obj + ctxPart + ".";
    } else {
      text = subject.charAt(0).toUpperCase() + subject.slice(1) + " " + adverb + " " + verb + " " + obj + ctxPart + ".";
    }
    text += finalPart;
    
    return text;
  };

  // ВЫБОР ПРАВИЛА
  Reg.chooseUsageRule = function(npc, item) {
    if (!Reg.usageRules || Reg.usageRules.length === 0) return null;
    
    const candidates = [];
    for (const rule of Reg.usageRules) {
      try {
        const result = rule.evaluate(npc, item);
        if (result) {
          candidates.push({ ...result, rule });
        }
      } catch(e) {
        console.error('[Usage] Ошибка в правиле:', rule.id, e);
      }
    }
    
    if (candidates.length === 0) return null;
    return weightedPick(candidates);
  };

  // ГЛАВНЫЙ ВЫЗОВ: дварф получает предмет и решает, что с ним делать
  Reg.applyItemUsage = function(npc, item) {
    const chosen = Reg.chooseUsageRule(npc, item);
    if (!chosen) {
      // Если правил нет — просто ничего
      return null;
    }
    
    // Бросок на успех (по умолчанию 80%)
    const successChance = chosen.rule.successChance || 0.8;
    const success = Math.random() < successChance;
    
    // Сборка текста
    const text = Reg.buildUsageText(npc, item, chosen.action, chosen.actionKey, success);
    
    // Применение последствий
    if (chosen.consequence) {
      // Выбираем последствие: при успехе — обычное, при провале — failConsequence (если есть, иначе обычное)
      let c = success ? chosen.consequence : (chosen.failConsequence || chosen.consequence);
      
      if (c) {
        if (c.hp && npc.hp !== undefined) npc.hp += c.hp;
        if (c.hunger !== undefined && npc.hunger !== undefined) {
            npc.hunger = Math.max(0, npc.hunger + c.hunger);
        }
        if (c.emo) {
          for (const key in c.emo) {
            if (npc.emo[key] !== undefined) {
              npc.emo[key] = Math.max(0, Math.min(100, npc.emo[key] + c.emo[key]));
            }
          }
        }
        if (c.itemCondition && item) item.condition = c.itemCondition;
        
        // МЕХАНИКА ПРОТЕЗОВ (Любой предмет в культю)
        if (c.attachToStump && npc.body) {
            for (let part in npc.body) {
                if (npc.body[part].status === 'severed') {
                    // Генерируем свойства протеза из свойств предмета
                    const isWeapon = item.tags && item.tags.includes('weapon');
                    const isMetal = item.material === 'metal';
                    const isBone = item.material === 'bone' || (item.tags && item.tags.includes('bone'));
                    const isWood = item.material === 'wood';
                    
                    // Описание протеза
                    let desc = '';
                    if (isWeapon) desc = `Острое лезвие (${item.name}) торчит из культи. Опасно для врагов.`;
                    else if (isBone) desc = `Кость (${item.name}) заменяет утраченную конечность. Тяжело и надежно.`;
                    else if (isWood) desc = `Деревянный ${item.name} примотан к культе. Грубая, но рабочая замена.`;
                    else if (isMetal) desc = `Металлический ${item.name} приделан к культе. Тяжело, но прочно.`;
                    else desc = `${item.name} примотан к культе. Странное, но работающее решение.`;
                    
                    npc.body[part].attached = item;
                    npc.body[part].status = 'prosthetic';
                    npc.body[part].prostheticDesc = desc;
                    npc.body[part].prostheticDamage = isWeapon ? (item.dmgMod || 5) : (isMetal ? 3 : 1);
                    npc.body[part].prostheticType = isWeapon ? 'weapon' : (isBone ? 'bone' : (isWood ? 'wood' : 'misc'));
                    
                    if (npc.inventory) npc.inventory = npc.inventory.filter(i => i !== item);
                    
                    if (Reg.log) Reg.log(`[ПРОТЕЗ] ${npc.name} прикрепляет ${item.name} к культе. ${desc}`, 'combat');
                    if (Reg.addMemory) Reg.addMemory(npc, `Я воткнул ${item.name} в культю. ${desc}`, { type: 'fear', power: 25, category: 'medical' });
                    break;
                }
            }
        }
        
        // ЛОГИКА РАСХОДА ПРЕДМЕТА
        if (c.destroyItem) {
          // Если destroyItem: true — удаляем сразу
          if (npc.inventory) npc.inventory = npc.inventory.filter(i => i !== item);
        } else {
          // Если destroyItem: false (или нет), проверяем uses
          if (item.uses !== undefined) {
              item.uses--;
              if (item.uses <= 0) {
                  if (npc.inventory) npc.inventory = npc.inventory.filter(i => i !== item);
                  if (Reg.log) Reg.log(`[Износ] ${item.name} пришел в негодность.`, 'sys');
              }
          } else if (item.tags && (item.tags.includes('food') || item.tags.includes('drink') || item.tags.includes('edible'))) {
              // Еда и питье всегда исчезают после использования
              if (npc.inventory) npc.inventory = npc.inventory.filter(i => i !== item);
          }
        }
      }
    }
    
    // Запись в память
    if (Reg.addMemory && text) {
      Reg.addMemory(npc, text, { 
        type: success ? 'joy' : 'sadness', 
        power: 10, 
        category: 'usage' 
      });
    }
    
    // Лог
    if (Reg.log) Reg.log(text, success ? 'sys' : 'death');
    
    // СВИДЕТЕЛИ (если поступок постыдный/странный)
    Reg.registerUsageWitnesses(npc, item, text, chosen.rule);
    
    return { text, success, rule: chosen.rule.id };
  };

  // РЕГИСТРАЦИЯ СВИДЕТЕЛЕЙ
  Reg.registerUsageWitnesses = function(npc, item, text, rule) {
    if (!rule || !rule.createsRumor) return;
    if (!window.state || !window.state.npcs) return;
    if (!window.dwarvenRumors) window.dwarvenRumors = [];
    
    // Ищем свидетелей в радиусе 5
    const witnesses = window.state.npcs.filter(other => 
      other.alive && other.id !== npc.id &&
      Math.abs(other.x - npc.x) + Math.abs(other.y - npc.y) <= 5
    );
    
    if (witnesses.length === 0) return;
    
    // Создаём слух
    const rumor = {
      culprit: npc.id,
      culpritName: npc.name,
      crime: text,
      type: rule.rumorType || 'crime',
      witnesses: [npc.id, ...witnesses.map(w => w.id)],
      time: window.state.tick
    };
    
    // Проверяем дубли (тот же виновник + тот же текст за последние 100 тиков)
    const isDuplicate = window.dwarvenRumors.find(r => 
      r.culprit === npc.id && 
      r.crime === text && 
      window.state.tick - r.time < 100
    );
    if (isDuplicate) return;
    
    window.dwarvenRumors.push(rumor);
    
    // Свидетели записывают в память
    witnesses.forEach(w => {
      if (Reg.addMemory) {
        Reg.addMemory(w, `Он видел, как ${npc.name} ${text}`, { 
          type: 'fear', power: 15, category: 'witness' 
        });
      }
    });
    
    if (Reg.log) Reg.log(`[Слух] ${witnesses.length} дварфов видели это. Слух разойдётся по шахте.`, 'sys');
  };

  console.log('[Usage Engine] Атомарный движок применения предметов готов.');
})();
