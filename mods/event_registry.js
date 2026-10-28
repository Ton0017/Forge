// Реестр всех возможных событий в игре
Reg.thoughtEvents = {
  // --- СОН ---
  'slept_well': { text: "Он хорошо выспался на кровати.", value: +5, category: 'rest', type: 'joy' },
  'slept_badly': { text: "Он спал на жесткой кровати. Спина затекла.", value: -3, category: 'rest', type: 'sadness' },
  'woke_up': { text: "Он проснулся. Надо идти работать.", value: 0, category: 'rest', type: 'neutral' },

  // --- ЕДА ---
  'ate_good_food': { text: "Он съел вкусную еду. Чувствует себя сытым.", value: +5, category: 'food', type: 'joy' },
  'ate_meat': { text: "Он съел кусок жареного мяса. Вкусно!", value: +8, category: 'food', type: 'joy' },
  'ate_corpse': { text: "Он съел гниющий труп. Это отвратительно.", value: -30, category: 'food', type: 'sadness' },
  'ate_corpse_dwarf': { text: "Он съел плоть своего товарища. Он больше не человек.", value: -100, category: 'food', type: 'sadness' },

  // --- РАБОТА ---
  'dug_stone': { text: "Он добыл камень. Работа идет.", value: +1, category: 'work', type: 'neutral' },
  'dug_ore': { text: "Он нашел руду! Это хорошая добыча.", value: +3, category: 'work', type: 'joy' },
  'found_gold': { text: "Он нашел золотую жилу! Глаза блестят.", value: +10, category: 'luck', type: 'joy' },
  'deposited_ore': { text: "Он сдал руду на склад. Долг выполнен.", value: +2, category: 'work', type: 'neutral' },

  // --- БОЙ ---
  'killed_rat': { text: "Он убил крысу. Мелкая победа.", value: +2, category: 'combat', type: 'joy' },
  'killed_goblin': { text: "Он убил гоблина. Чувствует удовлетворение.", value: +5, category: 'combat', type: 'joy' },
  'killed_troll': { text: "Он сразил тролля! Это великая победа.", value: +15, category: 'combat', type: 'joy' },
  'saw_monster': { text: "Он увидел монстра. Это вызывает страх.", value: -5, category: 'fear', type: 'fear' },
  'saw_corpse': { text: "Он видел труп. Это тревожит.", value: -15, category: 'death', type: 'fear' },
  'saw_dwarf_corpse': { text: "Он видел труп товарища. Это невыносимо.", value: -40, category: 'death', type: 'sadness' },

  // --- СОЦИАЛЬНОЕ ---
  'talked_to_friend': { text: "Он поговорил с другом. Это подняло настроение.", value: +5, category: 'social', type: 'joy' },
  'argued_with_enemy': { text: "Он поссорился с тем, кого ненавидит.", value: -10, category: 'social', type: 'anger' },
  'was_stolen_from': { text: "У него украли руду. Это возмутительно.", value: -15, category: 'crime', type: 'anger' },
  'stole_ore': { text: "Он украл руду. Внутри легкое чувство вины.", value: -5, category: 'crime', type: 'fear' },

  // --- СОСТОЯНИЯ ---
  'became_drunk': { text: "Он напился эля. Мир стал добрее.", value: +10, category: 'tavern', type: 'joy' },
  'got_hungry': { text: "Он голоден. Живот сводит.", value: -10, category: 'hunger', type: 'sadness' },
  'got_tired': { text: "Он устал. Спина отваливается.", value: -5, category: 'fatigue', type: 'sadness' },
  'went_insane': { text: "Он сошел с ума. Мир рухнул.", value: -50, category: 'trauma', type: 'fear' }
};

// Новая функция для вызова события по ID

// Новая функция для вызова события по ID
Reg.addThought = function(npc, eventId) {
  const ev = Reg.thoughtEvents[eventId];
  if (!ev) return;

  // Если у события есть объект (objId), генерируем текст через композер!
  if (ev.objId && Reg.composer) {
    const result = Reg.composer.generate(npc, ev.objId);
    if (result) {
      Reg.addMemory(npc, result.text, { 
        type: ev.type, 
        power: Math.abs(ev.value), 
        category: ev.category 
      });
      return;
    }
  }

  // Если композер не справился или объекта нет — используем старый текст (если он есть)
  if (ev.text) {
    Reg.addMemory(npc, ev.text, {
      type: ev.type,
      power: Math.abs(ev.value),
      category: ev.category,
      value: ev.value
    });
  }
};
