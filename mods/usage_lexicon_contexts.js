(function(){
  Reg.usageContexts = {
    // По задаче
    dig: ["не отрываясь от забоя", "прямо у стены", "в тёмном туннеле", "не выпуская кирки",
          "в забое", "у самого камня", "не глядя по сторонам", "в пыли и крошке",
          "у недавно пробитой жилы", "в тесном проходе"],
    rest: ["лёжа на кровати", "не открывая глаз", "повернувшись к стене",
           "укрывшись одеялом", "в полудрёме", "не выпуская из рук"],
    eat: ["у котла", "за столом", "прямо у огня", "не отходя от наковальни",
          "присев на камень", "глотая стоя", "у стены", "в компании"],
    pray: ["перед алтарём", "склонив голову", "глядя на пламя свечи",
           "в тишине", "опустившись на колени", "не отрывая взгляда от алтаря"],
    socialize: ["у стола", "в таверне", "у бочки с элем", "рядом с товарищем",
                "в компании", "у костра", "перебрасываясь словами"],
    fight: ["не опуская оружия", "закрывая голову", "в клубах пыли",
            "не давая врагу опомниться", "глядя в глаза противнику", "сжав зубы"],
    idle: ["глядя в стену", "не двигаясь", "уставившись в пустоту",
           "прислушиваясь", "опустив руки", "в задумчивости"],
    wander: ["не разбирая дороги", "в темноте", "наугад", "по памяти",
             "держась стены", "в неизвестном направлении"],
    craft: ["у наковальни", "над горном", "у алхимического стола",
            "разложив инструменты", "у верстака", "с полными руками"],
    explore: ["в неизвестном туннеле", "освещая путь факелом", "в темноте",
              "в незнакомом месте", "за поворотом", "в неисследованной галерее"],

    // По окружению (дополняют задачу)
    near_fire: ["у огня", "рядом с костром", "в тепле", "у пылающих углей"],
    in_dark: ["в темноте", "в тени", "при слабом свете", "в полумраке"],
    near_water: ["у воды", "у подземного ручья", "у озера", "у кромки воды"],
    near_monster: ["рядом с монстром", "в двух шагах от врага", "на линии атаки"],
    near_ally: ["рядом с товарищем", "бок о бок с другим дварфом", "в компании"],
    alone: ["в одиночестве", "без свидетелей", "один в темноте"],

    // НОВЫЕ КОНТЕКСТЫ (физиология и снаряжение)
    has_shrapnel: ["морщась от боли", "с осколком в теле", "превозмогая боль", "стиснув зубы", "едва двигаясь", "с торчащим металлом из раны", "шипя от каждого шага"],
    has_prosthetic: ["скрипя протезом", "с лезвием вместо руки", "неловко орудуя протезом", "с тяжелой культей", "приноравливаясь к протезу", "с металлом в кости"],
    has_infection: ["с горящей раной", "едва держась на ногах", "с пожелтевшей кожей", "дрожа от жара", "в бреду", "покрываясь испариной", "с гниющей раной"],
    covered_in_dirt: ["перепачканный грязью", "в угольной пыли", "с черными руками", "покрытый копотью", "грязный до ушей", "в засохшей крови"],
    in_pain: ["корчась от боли", "с трудом сдерживая стон", "стиснув зубы", "морщась", "сжав кулаки", "бледнея"],
    in_hot_water: ["обжигаясь", "с паром над водой", "морщась от жара", "отдергивая руки"],
    in_cold_water: ["дрожа от холода", "стуча зубами", "с ледяными руками", "посинев от холода"],
    in_salt_water: ["давясь соленой водой", "морщась от соли", "сплевывая горечь"]
  };

  // Функция выбора контекста
  Reg.getContext = function(npc, item) {
    const task = npc.task ? npc.task.type : 'idle';
    const pools = [];
    
    // Основной контекст по задаче
    if (Reg.usageContexts[task]) pools.push(...Reg.usageContexts[task]);
    
    // Дополнительный контекст по окружению
    const cell = window.getCell ? window.getCell(npc.x, npc.y) : null;
        if (cell) {
        if (cell.type === 'campfire') pools.push(...Reg.usageContexts.near_fire);
        if (cell.type === 'water') {
            pools.push(...Reg.usageContexts.near_water);
            if (cell.water) {
                if (cell.water.temperature > 40) pools.push(...Reg.usageContexts.in_hot_water);
                if (cell.water.temperature < 5) pools.push(...Reg.usageContexts.in_cold_water);
                if (cell.water.salinity === 'salt') pools.push(...Reg.usageContexts.in_salt_water);
            }
        }
    }
    
    // Если в бою
    if (task === 'fight') pools.push(...Reg.usageContexts.near_monster);

    // ФИЗИОЛОГИЯ И СНАРЯЖЕНИЕ (наши новые системы)
    if (npc.body) {
        let hasShrapnel = false;
        let hasProsthetic = false;
        let hasInfection = false;
        for (let part in npc.body) {
            const b = npc.body[part];
            if (b.embedded && b.embedded.length > 0) hasShrapnel = true;
            if (b.status === 'prosthetic') hasProsthetic = true;
            if (b.infection > 0) hasInfection = true;
        }
        if (hasShrapnel) pools.push(...Reg.usageContexts.has_shrapnel);
        if (hasProsthetic) pools.push(...Reg.usageContexts.has_prosthetic);
        if (hasInfection) pools.push(...Reg.usageContexts.has_infection);
    }
    if (npc.dirt && npc.dirt > 40) pools.push(...Reg.usageContexts.covered_in_dirt);
    if (npc.pain && npc.pain > 30) pools.push(...Reg.usageContexts.in_pain);
    
    // Если никого рядом
    const nearby = window.state && window.state.npcs ? 
      window.state.npcs.filter(n => n.alive && n.id !== npc.id && Math.abs(n.x - npc.x) + Math.abs(n.y - npc.y) <= 2) : [];
    if (nearby.length === 0) pools.push(...Reg.usageContexts.alone);
    else if (nearby.length > 0) pools.push(...Reg.usageContexts.near_ally);
    
    if (pools.length === 0) return '';
    return pools[Math.floor(Math.random() * pools.length)];
  };
})();
