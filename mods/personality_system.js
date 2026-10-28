// Значения от -50 до +50
Reg.valueNames = {
  law: 'Закон', loyalty: 'Лояльность', family: 'Семья', friendship: 'Дружба',
  power: 'Власть', truth: 'Правда', cunning: 'Хитрость', eloquence: 'Красноречие',
  fairness: 'Справедливость', decorum: 'Приличия', tradition: 'Традиции',
  artwork: 'Искусство', cooperation: 'Сотрудничество', independence: 'Независимость',
  stoicism: 'Стоицизм', introspection: 'Самоанализ', self_control: 'Самоконтроль',
  tranquility: 'Спокойствие', harmony: 'Гармония', martial_prowess: 'Воинская доблесть',
  skill: 'Мастерство', hard_work: 'Трудолюбие', sacrifice: 'Жертвенность',
  competition: 'Соперничество', perseverance: 'Упорство'
};

Reg.facetNames = {
  love: 'Любовь', hate: 'Ненависть', envy: 'Зависть', cheer: 'Веселье',
  depression: 'Депрессия', anger: 'Гнев', anxiety: 'Тревожность',
  friendship: 'Дружелюбие', gregariousness: 'Общительность', assertiveness: 'Напористость',
  activity_level: 'Активность', excitement_seeking: 'Поиск острых ощущений',
  cheerful: 'Оптимизм', imagination: 'Воображение', artistic_interest: 'Интерес к искусству',
  liberalism: 'Свободолюбие', altruism: 'Альтруизм', dutifulness: 'Исполнительность',
  orderliness: 'Любовь к порядку', perfectionism: 'Перфекционизм',
  volatility: 'Вспыльчивость', peacefulness: 'Миролюбие', tolerance: 'Терпимость'
};

Reg.on('npc_hired', (npc) => {
  // 1. Генерируем ЦЕННОСТИ (от -50 до +50)
  npc.values = {};
  for (let key in Reg.valueNames) {
    // Обычно большинство значений около 0, но некоторые могут быть крайними
    let val = Math.floor(Math.random() * 101) - 50; 
    npc.values[key] = val;
  }

  // 2. Генерируем ГРАНИ (от 0 до 100)
  npc.facets = {};
  for (let key in Reg.facetNames) {
    npc.facets[key] = Math.floor(Math.random() * 101);
  }

  // 3. Навыки
  npc.skills = { mining: 0, smithing: 0, combat: 0, fishing: 0 };

  // 4. Память (8 слотов краткосрочной, 8 долговременной)
  npc.memory = { shortTerm: [], longTerm: [] };

  // 5. Стартовая эмоция
  npc.emo = { stress: 0, joy: 20, fear: 0, drunk: 0, anger: 0 };
  
  // 6. Генерируем стартовую историю (на основе ценностей)
  Reg.generateBackstory(npc);
});
