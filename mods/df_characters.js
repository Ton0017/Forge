Reg.df = {
  names: ['Урист', 'Гром', 'Торин', 'Балин', 'Двалин', 'Фили', 'Кили', 'Оин', 'Глоин', 'Бифур', 'Бофур', 'Бомбур'],
  surnames: ['Железнорук', 'Каменный', 'Темный', 'Кровавый', 'Золотой', 'Молот', 'Топор', 'Рудный'],
  professions: [
    { id: 'miner', name: 'Шахтер', color: '#8a6a4a' },
    { id: 'smith', name: 'Кузнец', color: '#aa4a4a' },
    { id: 'guard', name: 'Стражник', color: '#4a4a8a' }
  ],
  traits: [
    { id: 'hardworking', name: 'Трудоголик' },
    { id: 'lazy', name: 'Лентяй' },
    { id: 'brave', name: 'Храбрец' },
    { id: 'coward', name: 'Трус' },
    { id: 'greedy', name: 'Жадный' },
    { id: 'pious', name: 'Набожный' },
    { id: 'bloodthirsty', name: 'Кровожадный' },
    { id: 'optimist', name: 'Оптимист' }
  ],
  habits: ['Курит трубку', 'Боится темноты', 'Поет за работой', 'Молится перед сном'],
  
  generate() {
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    const p = pick(this.professions);
    
    // ЖЕСТКИЙ БЕЛЫЙ СПИСОК (Только проверенные дварфы и люди)
    const allowedSkins = [
      'skeleton_0.png', 'goblin_0.png'
    ];
    
    // Оставляем только те, которые реально лежат в папке игры
    const validSkins = allowedSkins;
    
    // Если вдруг ничего не нашли, берем базового дварфа (но НЕ монстра)
    const sk = pick(validSkins);

    if (!window._traitIdx) window._traitIdx = Math.floor(Math.random() * 4);
    const selectedTrait = this.traits[window._traitIdx % this.traits.length];
    window._traitIdx++;

    // ПОЛ И ВОЗРАСТ
    const _gender = Math.random() < 0.5 ? 'male' : 'female';
    const _age = 20 + Math.floor(Math.random() * 20); // 20-40 лет

    // Скин одинаков для всех полов (скелеты/гоблины/рыцари)
    let _finalSkin = sk;

    return {
      name: pick(this.names) + ' ' + pick(this.surnames),
      profession: p,
      trait: selectedTrait,
      habit: pick(this.habits),
      skinFile: _finalSkin,
      gender: _gender,
      age: _age,
      familyNeed: 0,
      pregnancy: 0,
      children: [],
      isChild: false,
      hp: 100, maxHp: 100,
      hunger: 20, maxHunger: 100
    };
  }
};
