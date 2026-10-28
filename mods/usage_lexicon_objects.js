(function(){
  // Ключ = атомы предмета, значение = пул описаний
  Reg.usageObjects = {
    // ЕДА
    "food_fresh": ["свежий хлеб", "тёплую краюху", "мягкий ломоть", "свежую еду", "еду", "кусок хлеба",
                   "тёплую пищу", "добрый кусок", "пахучую краюху", "горячую еду"],
    "food_old": ["чёрствый хлеб", "засохшую корку", "старую краюху", "жёсткую горбушку",
                 "окаменевший кусок", "плесневелый ломоть"],
    "food_meat": ["кусок мяса", "сырое мясо", "жёсткую говядину", "кусок дичи", "окровавленную вырезку"],
    "food_mushroom": ["странный гриб", "поганку", "светящийся гриб", "гриб с пятнами"],

    // ДЕРЕВО
    "wood_soft": ["кусок дерева", "щепу", "обломок", "деревяшку", "палку", "ветку", "полено",
                  "чурку", "дощечку"],
    "wood_long": ["длинную палку", "жердь", "ветку", "длинное полено", "палку подлиннее"],

    // МЕТАЛЛ
    "metal_sharp": ["клинок", "лезвие", "остриё", "меч", "кинжал", "топор", "саблю", "тесак"],
    "metal_heavy": ["тяжёлый молот", "булаву", "кувалду", "тяжёлый лом", "кусок железа"],
    "metal_armor": ["кирасу", "нагрудник", "кольчугу", "чешуйчатый доспех", "броню"],

    // СТЕКЛО
    "glass_hollow": ["стеклянную колбу", "склянку", "флакон", "стеклянный сосуд", "бутыль",
                     "пузырёк", "флягу"],
    "glass_brittle": ["стекляшку", "осколок", "тонкую колбу", "стеклянную бутыль"],

    // КОСТЬ
    "bone_hard": ["кость", "череп", "бедренную кость", "рог", "челюсть"],

    // ТКАНЬ
    "cloth_flat": ["свиток", "пергамент", "ткань", "лоскут", "тряпку", "обрывок ткани"],
    "cloth_soft": ["тряпку", "лоскут", "мягкую ткань", "ветошь"],

    // КАМЕНЬ
    "stone_hard": ["камень", "булыжник", "кусок породы", "обломок скалы", "валун"],

    // МАГИЯ
    "magic_weapon": ["мерцающий клинок", "светящийся меч", "рунный топор", "странный посох",
                     "клинок с гравировкой"],
    "magic_armor": ["мерцающий доспех", "рунный нагрудник", "странную кирасу"],
    "magic_misc": ["свиток с рунами", "камень с гравировкой", "амулет с камнем",
                   "кольцо с печатью", "странную вещь"],

    // АКСЕССУАРЫ
    "ring": ["кольцо", "перстень", "печатку", "обручальное кольцо"],
    "amulet": ["амулет", "оберег", "подвеску", "кулон"],
    "belt": ["пояс", "ремень", "кушак"],
    "boots": ["сапоги", "ботинки", "обувь"],

    // ПРОЧЕЕ
    "container": ["сосуд", "ёмкость", "мешок", "корзину", "ящик"],
    "generic": ["предмет", "вещь", "находку", "штуковину", "что-то странное"]
  };

  // Поиск по атомам
  Reg.getObjectDescriptions = function(item) {
    // Имя предмета берется из самого предмета (физика: объект = сам предмет)
    if (item && item.name) return [item.name];
    const tags = item.tags || [];
    const material = item.material || '';
    const shape = item.shape || [];
    
    // Приоритетный поиск по конкретным тегам
    if (tags.includes('food')) {
      if (item.name && item.name.includes('мяс')) return Reg.usageObjects.food_meat;
      if (item.name && item.name.includes('гриб')) return Reg.usageObjects.food_mushroom;
      if (item.condition === 'old') return Reg.usageObjects.food_old;
      return Reg.usageObjects.food_fresh;
    }
    if (tags.includes('magic')) {
      if (tags.includes('weapon')) return Reg.usageObjects.magic_weapon;
      if (tags.includes('armor')) return Reg.usageObjects.magic_armor;
      return Reg.usageObjects.magic_misc;
    }
    if (tags.includes('weapon')) {
      if (shape.includes('heavy')) return Reg.usageObjects.metal_heavy;
      return Reg.usageObjects.metal_sharp;
    }
    if (tags.includes('armor')) return Reg.usageObjects.metal_armor;
    if (material === 'wood') return shape.includes('long') ? Reg.usageObjects.wood_long : Reg.usageObjects.wood_soft;
    if (material === 'glass') return shape.includes('hollow') ? Reg.usageObjects.glass_hollow : Reg.usageObjects.glass_brittle;
    if (material === 'bone') return Reg.usageObjects.bone_hard;
    if (material === 'cloth') return shape.includes('flat') ? Reg.usageObjects.cloth_flat : Reg.usageObjects.cloth_soft;
    if (material === 'stone') return Reg.usageObjects.stone_hard;
    
    // По имени
    const name = (item.name || '').toLowerCase();
    if (name.includes('ring') || name.includes('кольц')) return Reg.usageObjects.ring;
    if (name.includes('amulet') || name.includes('амулет')) return Reg.usageObjects.amulet;
    if (name.includes('belt') || name.includes('пояс')) return Reg.usageObjects.belt;
    if (name.includes('boots') || name.includes('сапог')) return Reg.usageObjects.boots;
    if (tags.includes('container')) return Reg.usageObjects.container;
    
    return Reg.usageObjects.generic;
  };
})();
