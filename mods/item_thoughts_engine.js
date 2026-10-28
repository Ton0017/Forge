(function(){
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  // 1. ДЕЙСТВИЯ (Что дварф хочет сделать с предметом)
  const ACTIONS = {
    want_break: ["хочет сломать", "хочет разбить", "хочет расколотить"],
    want_take: ["хочет поднять", "хочет взять себе", "хочет забрать"],
    want_wear: ["хочет надеть", "хочет примерить", "хочет облачиться в"],
    wants_hide: ["хочет спрятать", "хочет закопать", "хочет утаить"],
    wants_sell: ["хочет продать", "хочет сбыть с рук", "хочет обменять"],
    hates: ["ненавидит", "презирает", "не выносит"],
    fears: ["боится", "опасается", "избегает"],
    ignores: ["игнорирует", "проходит мимо", "не замечает"],
    loves: ["обожает", "восхищается", "дорожит"],
    wants_show: ["хочет показать всем", "хочет похвастаться", "хочет продемонстрировать"],
    not_worthy: ["не решается взять", "считает себя недостойным", "боится прикоснуться к"],
    wants_burn: ["хочет сжечь", "хочет предать огню", "хочет уничтожить"],
    wants_eat: ["хочет съесть", "хочет попробовать на зуб", "хочет сожрать"]
  };

  // 2. ПРИЧИНЫ (Зависят от граней, ценностей, состояний и тегов)
  const REASONS = {
    // ЖАДНОСТЬ
    greed_high: ["потому что видит в этом только деньги", "потому что уже прикидывает цену", "потому что хочет забрать это себе"],
    greed_low: ["потому что ему плевать на богатство", "потому что это ничего не стоит в его глазах"],
    
    // ХРАБРОСТЬ
    courage_high: ["потому что не боится боли", "потому что готов сражаться", "потому что смерть его не пугает"],
    courage_low: ["потому что боится обжечься", "потому что это слишком опасно", "потому что он трус"],
    
    // ТРУДОЛЮБИЕ
    diligence_high: ["потому что это отвлекает от работы", "потому что с этим надо возиться", "потому что его дело — копать, а не сражаться"],
    diligence_low: ["потому что это требует лишних усилий", "потому что ему лень с этим возиться"],
    
    // АЛЬТРУИЗМ
    altruism_high: ["потому что это поможет артели", "потому что это спасет товарищей"],
    altruism_low: ["потому что это нужно только ему", "потому что плевать на остальных"],
    
    // ЛЮБОПЫТСТВО
    curiosity_high: ["потому что хочет понять, как это работает", "потому что это загадка для него"],
    curiosity_low: ["потому что это скучно", "потому что он не любит новое"],
    
    // ЭСТЕТИКА
    aesthetics_high: ["потому что это уродливо", "потому что это оскорбляет его взгляд", "потому что это прекрасно"],
    aesthetics_low: ["потому что это просто кусок металла", "потому что красота — это глупости"],
    
    // ЦЕННОСТИ (Взгляды)
    law_high: ["потому что это противозаконно", "потому что так нельзя по закону"],
    law_low: ["потому что закон ему не писан"],
    tradition_high: ["потому что это противоречит традициям", "потому что предки не одобрили бы"],
    power_high: ["потому что это дает власть", "потому что это сделает его сильнее"],
    truth_high: ["потому что он хочет знать правду", "потому что это скрывает тайну"],
    family_high: ["потому что это напоминает о семье", "потому что это для его рода"],
    art_high: ["потому что это произведение искусства", "потому что это красиво"],
    
    // ЧЕРТЫ ХАРАКТЕРА
    hardworking: ["потому что это мешает работе", "потому что с этим надо сражаться, а не копать"],
    lazy: ["потому что это требует усилий", "потому что ему лень"],
    brave: ["потому что он не боится", "потому что он готов"],
    coward: ["потому что это слишком опасно", "потому что он боится"],
    greedy: ["потому что он хочет это себе", "потому что это богатство"],
    bloodthirsty: ["потому что он хочет крови", "потому что это оружие"],
    pious: ["потому что это против воли богов", "потому что это святотатство"],
    optimist: ["потому что это отличный день", "потому что это к лучшему"],
    
    // СОСТОЯНИЯ
    stress_high: ["потому что голоса шепчут ему", "потому что он больше не может терпеть", "потому что он сошел с ума"],
    drunk_high: ["потому что он пьян и ему всё равно", "потому что он не соображает, что делает"],
    fear_high: ["потому что он в ужасе", "потому что он дрожит от страха"],
    anger_high: ["потому что он в ярости", "потому что он хочет крушить"],
    hunger_high: ["потому что он голоден и злится", "потому что это не еда"],
    
    // НЕЙТРАЛ
    neutral: ["потому что это просто предмет", "потому что ему всё равно"]
  };

  // 3. ОПРЕДЕЛЕНИЕ ДОМИНИРУЮЩЕЙ ХАРАКТЕРИСТИКИ
  function getDominantTrait(npc, item) {
    let traits = [];
    
    // Фасеты (грани)
    if (npc.facets) {
      if (npc.facets.greed > 70) traits.push({ key: 'greed_high', value: npc.facets.greed });
      if (npc.facets.greed < 30) traits.push({ key: 'greed_low', value: 100 - npc.facets.greed });
      if (npc.facets.courage > 70) traits.push({ key: 'courage_high', value: npc.facets.courage });
      if (npc.facets.courage < 30) traits.push({ key: 'courage_low', value: 100 - npc.facets.courage });
      if (npc.facets.diligence > 70) traits.push({ key: 'diligence_high', value: npc.facets.diligence });
      if (npc.facets.diligence < 30) traits.push({ key: 'diligence_low', value: 100 - npc.facets.diligence });
      if (npc.facets.altruism > 70) traits.push({ key: 'altruism_high', value: npc.facets.altruism });
      if (npc.facets.altruism < 30) traits.push({ key: 'altruism_low', value: 100 - npc.facets.altruism });
      if (npc.facets.curiosity > 70) traits.push({ key: 'curiosity_high', value: npc.facets.curiosity });
      if (npc.facets.curiosity < 30) traits.push({ key: 'curiosity_low', value: 100 - npc.facets.curiosity });
      if (npc.facets.aesthetics > 70) traits.push({ key: 'aesthetics_high', value: npc.facets.aesthetics });
      if (npc.facets.aesthetics < 30) traits.push({ key: 'aesthetics_low', value: 100 - npc.facets.aesthetics });
    }
    
    // Ценности (Взгляды)
    if (npc.values) {
      if (npc.values.law > 20) traits.push({ key: 'law_high', value: npc.values.law + 50 });
      if (npc.values.law < -20) traits.push({ key: 'law_low', value: 100 - (npc.values.law + 50) });
      if (npc.values.tradition > 20) traits.push({ key: 'tradition_high', value: npc.values.tradition + 50 });
      if (npc.values.power > 20) traits.push({ key: 'power_high', value: npc.values.power + 50 });
      if (npc.values.truth > 20) traits.push({ key: 'truth_high', value: npc.values.truth + 50 });
      if (npc.values.family > 20) traits.push({ key: 'family_high', value: npc.values.family + 50 });
      if (npc.values.art > 20) traits.push({ key: 'art_high', value: npc.values.art + 50 });
    }
    
    // Черты характера
    if (npc.trait && npc.trait.id) {
      const t = npc.trait.id;
      if (REASONS[t]) traits.push({ key: t, value: 80 });
    }
    
    // Состояния
    if (npc.emo) {
      if (npc.emo.stress > 70) traits.push({ key: 'stress_high', value: npc.emo.stress });
      if (npc.emo.drunk > 50) traits.push({ key: 'drunk_high', value: npc.emo.drunk });
      if (npc.emo.fear > 50) traits.push({ key: 'fear_high', value: npc.emo.fear });
      if (npc.emo.anger > 50) traits.push({ key: 'anger_high', value: npc.emo.anger });
      if (npc.hunger > 60) traits.push({ key: 'hunger_high', value: npc.hunger });
    }
    
    if (traits.length === 0) return { key: 'neutral', value: 50 };
    
    traits.sort((a, b) => b.value - a.value);
    return traits[0];
  }

  // 4. ВЫБОР ДЕЙСТВИЯ (На основе тегов предмета и доминирующей характеристики)
  function chooseAction(npc, item, dominantTrait) {
    const tags = item.tags || [];
    const key = dominantTrait.key;
    
    // Огонь + трусость = страх
    if (tags.includes('fire') && (key === 'courage_low' || key === 'fear_high' || key === 'coward')) return pick(ACTIONS.fears);
    // Проклятое + стресс = сломать
    if (tags.includes('cursed') && (key === 'stress_high' || key === 'anger_high')) return pick(ACTIONS.want_break);
    // Магия + жадность = продать
    if (tags.includes('magic') && key === 'greed_high') return pick(ACTIONS.wants_sell);
    // Оружие + трудолюбие = ненавидит (мешает копать)
    if (tags.includes('weapon') && key === 'diligence_high') return pick(ACTIONS.hates);
    // Оружие + храбрость = взять
    if (tags.includes('weapon') && key === 'courage_high') return pick(ACTIONS.want_take);
    // Тяжелое + трудолюбие = ненавидит
    if (tags.includes('heavy') && key === 'diligence_high') return pick(ACTIONS.hates);
    // Еда + голод = съесть
    if (tags.includes('food') && key === 'hunger_high') return pick(ACTIONS.wants_eat);
    // Магия + низкая самооценка = не решается
    if (tags.includes('magic') && key === 'aesthetics_high') return pick(ACTIONS.not_worthy);
    // Традиции + магия = сломать (святотатство)
    if (tags.includes('magic') && key === 'tradition_high') return pick(ACTIONS.want_break);
    // Святое + набожность = обожает
    if (tags.includes('holy') && key === 'pious') return pick(ACTIONS.loves);
    // Пьяный = хочет показать всем
    if (key === 'drunk_high') return pick(ACTIONS.wants_show);
    // Трусость = боится
    if (key === 'courage_low' || key === 'coward') return pick(ACTIONS.fears);
    // Жадность = взять
    if (key === 'greed_high') return pick(ACTIONS.want_take);
    // Лень = игнорирует
    if (key === 'lazy' || key === 'diligence_low') return pick(ACTIONS.ignores);
    
    // По умолчанию
    return pick(ACTIONS.want_take);
  }

  // 5. ГЕНЕРАТОР
  window.generateItemThought = function(npc, item) {
    if (!item) return null;
    
    const dominant = getDominantTrait(npc, item);
    const action = chooseAction(npc, item, dominant);
    const reason = pick(REASONS[dominant.key] || REASONS.neutral);
    
    // Иногда добавляем контекст из памяти
    let extraContext = "";
    if (npc.memory && npc.memory.shortTerm) {
        const memory = npc.memory.shortTerm.find(m => m.text && m.text.includes(item.name));
        if (memory) extraContext = " Он помнит, как это было раньше.";
    }
    
    return {
        text: `${npc.name} ${action} ${item.name}, ${reason}.${extraContext}`,
        emo: { type: 'neutral', power: 5, category: 'equipment' }
    };
  };

  console.log('[Item Thoughts] Атомарный генератор мыслей о предметах готов.');
})();
