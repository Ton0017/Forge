// Регистрируем "жажду" как объект для композера
Reg.composer.register('thirst', {
  name: 'жажду',
  // Глаголы для внутреннего состояния
  verbs: ['чувствует', 'ощущает', 'не может игнорировать', 'борется с', 'думает о'],
  adjectives: ['сильную', 'мучительную', 'невыносимую', 'легкую', 'странную'],
  traits: {
    diligence: { emotion: 'раздражение', emoType: 'anger' },
    lazy: { emotion: 'радость', emoType: 'joy' },
    greed: { emotion: 'жадность', emoType: 'anger' },
    anxiety: { emotion: 'тревогу', emoType: 'fear' }
  }
});

// Вызываем композер, когда жажда высокая
Reg.on('npc_tick', (npc, state) => {
  if (!npc.alive || !npc.memory) return;
  if (Math.random() > 0.15) return; // Шанс подумать

  const thirst = npc.thirst || 0;
  if (thirst < 50) return; // Думаем о жажде только если она высокая

  // Вызываем композер для генерации фразы
  const result = Reg.composer.generate(npc, 'thirst');
  
  if (result) {
    // Если жажда критическая, добавляем контекст "эль" (композер сам подберет слова)
    if (thirst > 80 && state.booze > 0) {
      // Добавляем мысль о бочке с элем
      const barrelResult = Reg.composer.generate(npc, 'beer_tap');
      if (barrelResult) {
         Reg.addMemory(npc, barrelResult.text, barrelResult.emo);
         return;
      }
    }
    Reg.addMemory(npc, result.text, result.emo);
  }
});
