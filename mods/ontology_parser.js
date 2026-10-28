(function(){
  // 1. СЛОВАРИ КЛЮЧЕВЫХ СЛОВ (Парсер)
  const BASE_TYPES = {
    'sword': 'weapon', 'axe': 'weapon', 'dagger': 'weapon', 'bow': 'weapon', 'staff': 'weapon', 'hammer': 'weapon', 'spear': 'weapon',
    'helmet': 'armor', 'armor': 'armor', 'cuirass': 'armor', 'boots': 'armor', 'shield': 'armor',
    'ring': 'accessory', 'amulet': 'accessory', 'earring': 'accessory', 'belt': 'accessory', 'cloak': 'accessory',
    'bag': 'container', 'quiver': 'container', 'book': 'tool', 'can': 'tool', 'flask': 'tool', 'torch': 'tool', 'hoe': 'tool', 'gun': 'weapon'
  };

  const ELEMENTS = {
    'fire': 'fire', 'flame': 'fire', 'lava': 'fire', 'burning': 'fire',
    'ice': 'ice', 'frozen': 'ice', 'snow': 'ice',
    'poison': 'poison', 'toxic': 'poison',
    'lightning': 'lightning', 'thunder': 'lightning', 'electric': 'lightning',
    'dark': 'dark', 'hellish': 'dark', 'cursed': 'dark', 'vampire': 'dark',
    'dragon': 'rare', 'unicorn': 'rare', 'angel': 'rare', 'magic': 'rare', 'mithril': 'rare'
  };

  const MATERIALS = {
    'wood': 'wood', 'tree': 'wood', 'branch': 'wood',
    'iron': 'metal', 'steel': 'metal', 'bronze': 'metal', 'copper': 'metal', 'gold': 'metal',
    'bone': 'bone', 'skull': 'bone', 'skeleton': 'bone',
    'leather': 'cloth', 'silk': 'cloth', 'cloth': 'cloth', 'fabric': 'cloth'
  };

  // 2. ФУНКЦИЯ ПАРСИНГА ИМЕНИ
  window.generateItemFromName = function(filename) {
    const nameLower = filename.toLowerCase();
    let item = { name: filename, tags: [], baseType: 'misc' };

    // А) Ищем базовый тип
    for (let word in BASE_TYPES) {
      if (nameLower.includes(word)) {
        item.baseType = BASE_TYPES[word];
        item.tags.push(item.baseType);
        break;
      }
    }

    // Б) Ищем магию/стихию
    for (let word in ELEMENTS) {
      if (nameLower.includes(word)) {
        item.tags.push(ELEMENTS[word]);
      }
    }

    // В) Ищем материал
    for (let word in MATERIALS) {
      if (nameLower.includes(word)) {
        item.tags.push(MATERIALS[word]);
      }
    }

    // Г) Особые случаи (еда)
    if (nameLower.includes('onion') || nameLower.includes('pumpkin') || nameLower.includes('fly agaric')) {
      item.baseType = 'food';
      item.tags.push('food', 'edible');
      if (nameLower.includes('poison') || nameLower.includes('agaric')) item.tags.push('poison');
    }

    // Д) Свойства (вес, прочность, урон) на основе тегов
    item.weight = item.tags.includes('metal') ? 3 : (item.tags.includes('wood') ? 1 : 0.5);
    item.hardness = item.tags.includes('metal') ? 8 : (item.tags.includes('wood') ? 4 : 2);
    item.dmgMod = item.tags.includes('weapon') ? (item.weight * item.hardness / 2) : 0;
    
    // Редкие вещи дороже
    item.value = item.tags.includes('rare') ? 1000 : (item.tags.includes('metal') ? 50 : 10);

    return item;
  };

  // 3. ТЕСТ (Генерируем предметы из твоих файлов)
  // В реальной игре мы будем брать список файлов из манифеста, а пока проверим пару примеров
  const testFiles = ['flaming sword.png', 'Red Dragon Armor.png', 'poisonous onion.png', 'iron can.png'];
  
  console.log("=== ТЕСТ ОНТОЛОГИИ ===");
  testFiles.forEach(file => {
    const item = window.generateItemFromName(file);
    console.log(`Предмет: ${item.name}`);
    console.log(`  Базовый тип: ${item.baseType}`);
    console.log(`  Теги: ${item.tags.join(', ')}`);
    console.log(`  Урон: ${item.dmgMod.toFixed(1)}, Цена: ${item.value}`);
  });

})();
