Reg.combatText = {
  generate: function(npc, monster, action) {
    const verbs = action === 'hit' ? ['бьет', 'рубит', 'атакует', 'наносит удар'] : ['уворачивается от', 'отскакивает от'];
    const verb = verbs[Math.floor(Math.random() * verbs.length)];
    if (npc.trait.id === 'brave') return `${npc.name} с яростью ${verb} ${monster.name}!`;
    if (npc.trait.id === 'coward') return `${npc.name} в ужасе ${verb} ${monster.name}, пытаясь выжить.`;
    if (npc.trait.id === 'bloodthirsty') return `${npc.name} с предвкушением ${verb} ${monster.name}. Он жаждет крови!`;
    if (npc.trait.id === 'optimist') return `${npc.name} с улыбкой ${verb} ${monster.name}. "Да мы его сейчас!"`;
    if (npc.trait.id === 'pious') return `${npc.name} ${verb} ${monster.name}, шепча молитву.`;
    return `${npc.name} ${verb} ${monster.name}.`;
  }
};

// Перехватываем событие начала боя
Reg.on('combat_start', (npc, monster) => {
  // Защита: если он уже думал об этом монстре в последних 5 мыслях, не спамим
  if (npc.memory && npc.memory.shortTerm.length > 0) {
    const recentMonsterThought = npc.memory.shortTerm.slice(0, 5).find(m => m.text.includes(monster.name));
    if (recentMonsterThought) return;
  }

  const text = Reg.combatText.generate(npc, monster, 'hit');
  Reg.log(text, 'combat');

  if (npc.memory) {
    let thought = '';
    let emotion = { type: 'fear', power: 20 };

    if (npc.trait.id === 'brave') {
      thought = `Он смотрит в глаза ${monster.name}. Внутри него просыпается азарт. Это будет хорошая драка.`;
      emotion = { type: 'joy', power: 30 };
    } else if (npc.trait.id === 'coward') {
      thought = `Перед ним ${monster.name}. Его колени трясутся от страха. Он хочет сбежать, но не может.`;
      emotion = { type: 'fear', power: 60 };
    } else {
      thought = `Ему преградил путь ${monster.name}. Придется драться. Он сжимает кирку крепче.`;
    }
    Reg.addMemory(npc, thought, emotion);
  }
});
