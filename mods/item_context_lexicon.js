(function(){
  if (window.ItemLex) return;

  window.ItemLex = {
    // 1. ДЕЙСТВИЯ ПО ТИПУ ПРЕДМЕТА
    actions: {
      weapon:   ["взвешивает", "проводит пальцем по лезвию", "пробует баланс", "вертит в руке", "представляет, как вонзает его в гоблина", "стучит по древку", "оценивает замах"],
      food:     ["нюхает", "представляет вкус", "сглатывает слюну", "вертит в руках", "смотрит на него с вожделением", "пробует на язык"],
      tool:     ["проверяет рукоять", "стучит по", "оценивает прочность", "вертит в руках", "вспоминает, как сломал прошлую", "пробует на вес"],
      resource: ["оценивает", "прикидывает, что можно сделать", "взвешивает в руке", "разглядывает", "думает о будущей вещи", "ощупывает"],
      armor:    ["прикладывает к груди", "проверяет ремни", "представляет, как надевает", "стучит по нагруднику", "нюхает кожу"],
      accessory:["вертит в руках", "прикладывает к шее", "любуется блеском", "прячет в карман", "смотрит сквозь него"],
      scrap:    ["разглядывает", "вертит в руках", "думает, что можно переплавить", "отбрасывает в сторону", "пинает ногой"]
    },

    // 2. ПРИЧИНЫ (ЗАВИСЯТ ОТ СВОЙСТВ)
    reasons: {
      mass_heavy:  ["потому что он тяжелый, как камень", "потому что оттягивает руки", "потому что с ним не побегаешь"],
      mass_light:  ["потому что он легкий, как перышко", "потому что почти ничего не весит"],
      sharp:       ["потому что он острый, как бритва", "потому что лезвие блестит", "потому что им можно перерезать горло"],
      blunt:       ["потому что он тупой, как полено", "потому что им можно только орехи колоть"],
      hard:        ["потому что он твердый, как кость", "потому что его не сломать"],
      fragile:     ["потому что он хрупкий", "потому что от него только щепки летят"],
      masterwork:  ["потому что это шедевр", "потому что работа безупречна", "потому что таким только любоваться"],
      broken:      ["потому что он сломан", "потому что он никуда не годится", "потому что его место в мусоре"],
      rusty:       ["потому что он ржавый", "потому что от него пахнет железом", "потому что он видел лучшие дни"],
      wood:        ["потому что он пахнет смолой", "потому что он теплый", "потому что он живой"],
      metal:       ["потому что он холодный на ощупь", "потому что он звенит", "потому что он пахнет кузней"],
      food_smell:  ["потому что он вкусно пахнет", "потому что от него пахнет мясом", "потому что он свежий"],
      food_rotten: ["потому что он гнилой", "потому что от него воняет", "потому что его нельзя есть"]
    },

    // 3. ЭМОЦИИ (ЗАВИСЯТ ОТ ГРАНЕЙ)
    emotions: {
      greed_high:   ["и уже прикидывает, за сколько это продать", "и прячет за пазуху", "и оглядывается, не видел ли кто"],
      aesthetics_high: ["и любуется игрой света", "и проводит пальцем по граням", "и не может отвести взгляд"],
      curiosity_high: ["и хочет разобрать это на части", "и пытается понять, как это сделано", "и вертит так и эдак"],
      courage_low:  ["и боится обжечься", "и отдергивает руку", "и обходит стороной"],
      diligence_high: ["и думает, что это отвлекает от работы", "и хочет поскорее вернуться к делу"],
      altruism_high: ["и думает, кому это может пригодиться", "и решает поделиться"],
      neutral:      ["и кладет в рюкзак", "и откладывает в сторону", "и идет дальше", "и пожимает плечами"]
    },

    // 4. ФИНАЛЫ
    finals: {
      weapon:   ["Он проверяет хват.", "Он довольно кивает.", "Он хмурится.", "Он сжимает рукоять."],
      food:     ["Желудок урчит.", "Он облизывается.", "Он откусывает кусочек.", "Он довольно жует."],
      tool:     ["Он проверяет, не шатается ли.", "Он довольно мычит.", "Он думает о работе."],
      resource: ["Он думает о будущем.", "Он уже видит в этом изделие.", "Он отряхивает руки."],
      default:  ["Он кивает.", "Он идет дальше.", "Он довольно вздыхает.", "Он хмурится."]
    }
  };

  // Функция сборки
  window.generateItemContextThought = function(npc, item) {
    const L = window.ItemLex;
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    const tags = item.tags || [];
    let type = 'default';
    if (tags.includes('weapon')) type = 'weapon';
    else if (tags.includes('food') || tags.includes('edible')) type = 'food';
    else if (tags.includes('tool')) type = 'tool';
    else if (tags.includes('armor')) type = 'armor';
    else if (tags.includes('accessory')) type = 'accessory';
    else if (tags.includes('scrap')) type = 'scrap';
    else if (tags.includes('wood') || tags.includes('iron_ore') || tags.includes('stone') || tags.includes('coal')) type = 'resource';

    // 1. Действие
    const action = pick(L.actions[type] || L.actions.resource);

    // 2. Причина (проверяем свойства предмета)
    let reasonPool = [];
    if (item.mass > 10) reasonPool.push(...L.reasons.mass_heavy);
    if (item.mass < 3) reasonPool.push(...L.reasons.mass_light);
    if (item.sharpness > 4) reasonPool.push(...L.reasons.sharp);
    if (item.sharpness === 0) reasonPool.push(...L.reasons.blunt);
    if (item.hardness > 7) reasonPool.push(...L.reasons.hard);
    if (item.hardness < 3) reasonPool.push(...L.reasons.fragile);
    if (item.quality === 'masterwork') reasonPool.push(...L.reasons.masterwork);
    if (item.quality === 'broken') reasonPool.push(...L.reasons.broken);
    if (item.material === 'wood') reasonPool.push(...L.reasons.wood);
    if (item.material === 'metal') reasonPool.push(...L.reasons.metal);
    
    if (reasonPool.length === 0) reasonPool.push("потому что это просто вещь");

    const reason = pick(reasonPool);

    // 3. Эмоция (зависит от граней)
    let emoPool = [];
    const f = npc.facets || {};
    if (f.greed > 60) emoPool.push(...L.emotions.greed_high);
    if (f.aesthetics > 60) emoPool.push(...L.emotions.aesthetics_high);
    if (f.curiosity > 60) emoPool.push(...L.emotions.curiosity_high);
    if (f.courage < 40) emoPool.push(...L.emotions.courage_low);
    if (f.diligence > 60) emoPool.push(...L.emotions.diligence_high);
    if (f.altruism > 60) emoPool.push(...L.emotions.altruism_high);
    
    if (emoPool.length === 0) emoPool = L.emotions.neutral;
    
    const emotion = pick(emoPool);

    // 4. Финал
    const final = pick(L.finals[type] || L.finals.default);

    return {
      text: `${npc.name} ${action} ${item.name}, ${reason} ${emotion}. ${final}`,
      emo: { type: 'neutral', power: 5, category: 'equipment' }
    };
  };
})();
