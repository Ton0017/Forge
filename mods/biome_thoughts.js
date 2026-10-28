Reg.composer.register('water', {
  name: 'подземная вода',
  verbs: ['смотрит на', 'касается', 'обходит', 'избегает'],
  adjectives: ['ледяную', 'темную', 'глубокую', 'мутную'],
  traits: {
    courage: { emotion: 'облегчение', emoType: 'joy' },
    anxiety: { emotion: 'страх', emoType: 'fear' }
  }
});

Reg.composer.register('ruin_floor', {
  name: 'древние руины',
  verbs: ['изучает', 'обходит', 'разглядывает', 'касается'],
  adjectives: ['древние', 'разрушенные', 'проклятые', 'забытые'],
  traits: {
    curiosity: { emotion: 'благоговение', emoType: 'awe' },
    religiosity: { emotion: 'трепет', emoType: 'fear' },
    greed: { emotion: 'жадность', emoType: 'anger' }
  }
});

Reg.composer.register('mushroom', {
  name: 'светящиеся грибы',
  verbs: ['срывает', 'нюхает', 'изучает', 'смотрит на'],
  adjectives: ['странные', 'ядовитые', 'съедобные', 'светящиеся'],
  traits: {
    greed: { emotion: 'радость', emoType: 'joy' },
    lazy: { emotion: 'голод', emoType: 'sadness' },
    curiosity: { emotion: 'интерес', emoType: 'awe' }
  }
});
