// 1. СИНЕРГИЯ И СОПРОТИВЛЕНИЕ (Меняем функцию changeFacet в dynamic_traits.js)
// Мы переопределяем функцию, чтобы она учитывала другие черты
const originalChangeFacet = window.changeFacet; // Сохраняем старую (если есть)

Reg.changeFacetWithLogic = function(npc, facetName, amount) {
  if (!npc.facets) return;
  
  // А. Синергия: Если черта уже высокая, она растет быстрее
  if (npc.facets[facetName] > 60 && amount > 0) {
    amount *= 1.5; // Усиление
  }
  
  // Б. Сопротивление: Противоположная черта блокирует рост
  if (facetName === 'diligence' && npc.facets.laziness > 70 && amount > 0) {
    amount *= 0.2; // Трудоголик не может стать ленивым
  }
  if (facetName === 'anger' && npc.facets.peacefulness > 70 && amount > 0) {
    amount *= 0.2; // Миролюбивый не станет злым
  }
  
  // В. Применяем изменение с ограничением (0-100)
  npc.facets[facetName] = Math.max(0, Math.min(100, npc.facets[facetName] + amount));
};

// 2. ПОРОГОВЫЕ ЭФФЕКТЫ (Влияние на ИИ)
// Подписываемся на тик, чтобы влиять на веса действий
Reg.on('npc_tick', (npc, state) => {
  if (!npc.alive) return;

  // Если Храбрость > 80 -> Иммунитет к страху (вес боя всегда высокий)
  if (npc.facets.courage > 80) {
    npc.emo.fear = 0; // Сбрасываем страх
    // Добавляем скрытый модификатор для ИИ (можно использовать в utility_ai)
    npc.tempMods = npc.tempMods || {};
    npc.tempMods.fightWeight = 500; // Приоритет боя
  }

  // Если Тревожность > 80 -> Отказ от копания вглубь (если он вдали от базы)
  if (npc.facets.anxiety > 80 && Math.abs(npc.x) + Math.abs(npc.y) > 10) {
    npc.tempMods = npc.tempMods || {};
    npc.tempMods.digWeight = -100; // Отказ копать
  }

  // Если Жадность > 80 -> Он ищет чужую руду для кражи
  if (npc.facets.greed > 80) {
    npc.tempMods = npc.tempMods || {};
    npc.tempMods.stealWeight = 200; // Приоритет кражи
  }

  // Если Религиозность > 80 -> Постоянно идет молиться
  if (npc.facets.religiosity > 80) {
    npc.tempMods = npc.tempMods || {};
    npc.tempMods.prayWeight = 100;
  }
});

// 3. ВЛИЯНИЕ НА ОТНОШЕНИЯ (Альтруизм vs Гнев)
// Переопределяем функцию изменения отношений (если она есть)
Reg.on('tick', (state) => {
  if (state.tick % 100 !== 0) return; // Раз в 5 дней
  
  state.npcs.forEach(npc => {
    if (!npc.relations || !npc.alive) return;
    
    for (let id in npc.relations) {
      // Если Альтруизм > 70 -> Прощает обиды (отношения растут)
      if (npc.facets.altruism > 70 && npc.relations[id] < 0) {
        npc.relations[id] += 1;
      }
      // Если Гнев > 70 -> Злопамятный (отношения падают)
      if (npc.facets.anger > 70 && npc.relations[id] < 0) {
        npc.relations[id] -= 1;
      }
    }
  });
});
