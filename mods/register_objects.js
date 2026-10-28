// Мебель
Reg.composer.register('bed', {
  name: 'кровать',
  verbs: ['смотрит на', 'касается', 'вздыхает при виде'],
  adjectives: ['скрипучую', 'жесткую', 'старую', 'пыльную'],
  traits: {
    lazy: { emotion: 'сильную усталость', text: 'Он мечтает поскорее завалиться спать.', emoType: 'sadness' },
    diligence: { emotion: 'раздражение', text: 'Работа важнее сна. Он хмурится.' }
  }
});

Reg.composer.register('forge', {
  name: 'наковальня',
  verbs: ['смотрит на', 'оценивает', 'стоит рядом с'],
  adjectives: ['раскаленную', 'гудящую', 'древнюю'],
  traits: {
    diligence: { emotion: 'прилив сил', text: 'Он с нетерпением ждет, когда сможет начать ковать.', emoType: 'joy' },
    curiosity: { emotion: 'интерес', text: 'Он пытается понять, как устроен этот горн.' }
  }
});

Reg.composer.register('storage', {
  name: 'склад',
  verbs: ['смотрит на', 'пересчитывает', 'охраняет'],
  adjectives: ['полный', 'богатый', 'аккуратный'],
  traits: {
    greed: { emotion: 'жадность', text: 'В его глазах блестит жадность. Он хочет присвоить это золото.', emoType: 'anger' },
    altruism: { emotion: 'гордость', text: 'Он радуется, что общий склад пополняется.' }
  }
});

Reg.composer.register('beer_tap', {
  name: 'бочка с элем',
  verbs: ['косится на', 'обнюхивает', 'смотрит на'],
  adjectives: ['полную', 'початую', 'заманчивую'],
  traits: {
    lazy: { emotion: 'сильное желание', text: 'Пиво — лучшая награда за тяжелый день.', emoType: 'joy' },
    greed: { emotion: 'сомнение', text: 'Он думает, не слишком ли дорого просят за эль.', emoType: 'sadness' }
  }
});

// Монстры
Reg.composer.register('monster', {
  name: 'монстр',
  verbs: ['смотрит на', 'оценивает', 'готовится атаковать'],
  adjectives: ['отвратительного', 'огромного', 'кровожадного'],
  traits: {
    courage: { emotion: 'азарт', text: 'Он сжимает кирку крепче. Он готов к бою.', emoType: 'anger' },
    anxiety: { emotion: 'ужас', text: 'Его руки дрожат. Он хочет убежать.', emoType: 'fear' }
  }
});


Reg.composer.register('gold', {
  name: 'золото',
  verbs: ['смотрит на', 'трогает', 'взвешивает', 'прячет', 'считает'],
  adjectives: ['блестящее', 'тяжелое', 'желтое'],
  traits: {
    greed: { emotion: 'жадность', text: 'Его глаза загораются. Он хочет забрать это себе.', emoType: 'joy' },
    altruism: { emotion: 'ответственность', text: 'Он думает о том, как это поможет всей артели.', emoType: 'joy' },
    curiosity: { emotion: 'интерес', text: 'Он изучает структуру металла.', emoType: 'joy' }
  }
});

Reg.composer.register('ore', {
  name: 'руда',
  verbs: ['смотрит на', 'оценивает', 'откалывает от'],
  adjectives: ['богатую', 'тяжелую', 'сырую'],
  traits: {
    diligence: { emotion: 'азарт', text: 'Отличная работа. Нужно копать глубже.', emoType: 'joy' }
  }
});
// Объекты для событий находок
// Удален дубликат: gold

// Удален дубликат: ore

Reg.composer.register('mushroom', {
  name: 'гриб',
  verbs: ['смотрит на', 'принюхивается к', 'срывает', 'изучает'],
  adjectives: ['светящийся', 'ядовитый', 'странный', 'огромный'],
  traits: {
    curiosity: { emotion: 'интерес', text: 'Он хочет попробовать его на вкус.', emoType: 'joy' },
    courage: { emotion: 'азарт', text: 'Он бесстрашно откусывает кусок.', emoType: 'joy' }
  }
});

Reg.composer.register('crime', {
  name: 'преступление',
  verbs: ['думает о', 'осуждает', 'ненавидит'],
  traits: {
    altruism: { emotion: 'гнев', text: 'Это подло. Он хочет восстановить справедливость.', emoType: 'anger' },
    courage: { emotion: 'решимость', text: 'Я сам с ним разберусь.', emoType: 'anger' },
    greed: { emotion: 'интерес', text: 'Если он ворует, то и я смогу.', emoType: 'joy' }
  }
});

// Удален дубликат: monster

Reg.composer.register('water', {
  name: 'вода',
  verbs: ['смотрит на', 'пьет из', 'касается', 'прислушивается к'],
  adjectives: ['холодную', 'темную', 'чистую', 'глубокую'],
  traits: {
    curiosity: { emotion: 'интерес', text: 'Он размышляет о том, откуда здесь вода.', emoType: 'joy' },
    anxiety: { emotion: 'беспокойство', text: 'Он боится, что вода может подняться.', emoType: 'fear' }
  }
});
