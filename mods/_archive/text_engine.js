// Генератор текста. Собирает фразы из кусочков.
Reg.text = {
  // Словари для подстановки
  adjectives: {
    stress: ['измотанный', 'дерганный', 'уставший', 'на взводе'],
    joy: ['счастливый', 'воодушевленный', 'довольный'],
    fear: ['дрожащий', 'напуганный', 'бледный', 'затравленный']
  },
  
  // Главная функция генерации
  generate: function(npc, action, context = {}) {
    if (!npc.emo) npc.emo = { stress: 0, joy: 20, fear: 0 };
    
    // Определяем доминирующую эмоцию для прилагательного
    let adj = 'усталый';
    let maxEmo = npc.emo.stress;
    if (npc.emo.fear > maxEmo) { maxEmo = npc.emo.fear; adj = this.adjectives.fear[Math.floor(Math.random()*this.adjectives.fear.length)]; }
    else if (npc.emo.joy > maxEmo) { maxEmo = npc.emo.joy; adj = this.adjectives.joy[Math.floor(Math.random()*this.adjectives.joy.length)]; }
    else { adj = this.adjectives.stress[Math.floor(Math.random()*this.adjectives.stress.length)]; }

    // Собираем фразу в зависимости от действия
    if (action === 'find_chest') {
      if (npc.trait.id === 'greedy') return `${npc.name} (${adj}) жадно потирает руки: "Сокровища!"`;
      if (npc.trait.id === 'coward') return `${npc.name} (${adj}) отшатывается от старого сундука. А вдруг там ловушка?`;
      return `${npc.name} (${adj}) с удивлением обнаруживает в камне старый сундук.`;
    }

    if (action === 'see_monster') {
      if (npc.trait.id === 'brave') return `${npc.name} (${adj}) обнажает кирку: "Ну иди сюда, тварь!"`;
      if (npc.trait.id === 'coward') return `${npc.name} (${adj}) с визгом прячется за спину ближайшего соратника.`;
      return `${npc.name} (${adj}) замирает, увидев в темноте горящие глаза.`;
    }

    if (action === 'stress_break') {
      return `${npc.name} (${adj}) больше не может копать. Он бросает кирку и начинает биться головой о каменную стену.`;
    }

    // Дефолт
    return `${npc.name} (${adj}) продолжает копать.`;
  }
};
