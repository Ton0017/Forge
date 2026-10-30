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
      'dwarf1.png', 'dwarf2.png', 'dwarf3.png', 'dwarf4.png',
      'dwarf5.png', 'dwarf6.png', 'dwarf7.png', 'dwarf8.png',
      'dwarf miner.png', 'dwarf warrior.png', 'dwarf engineer.png',
      'dwarf king.png', 'dwarf mage.png', 'dwarf ranger.png', 'dwarf scientist.png',
      'common man.png', 'human1.png', 'human child.png', 'human girl.png'
    ];
    
    // Оставляем только те, которые реально лежат в папке игры
    const validSkins = allowedSkins.filter(skin => Reg.assets.skins.includes(skin));
    
    // Если вдруг ничего не нашли, берем базового дварфа (но НЕ монстра)
    const sk = validSkins.length > 0 ? pick(validSkins) : 'dwarf1.png';

    if (!window._traitIdx) window._traitIdx = Math.floor(Math.random() * 4);
    const selectedTrait = this.traits[window._traitIdx % this.traits.length];
    window._traitIdx++;

    // ПОЛ И ВОЗРАСТ
    const _gender = Math.random() < 0.5 ? 'male' : 'female';
    const _age = 20 + Math.floor(Math.random() * 20); // 20-40 лет

    // Скин по полу (женские спрайты из папки)
    let _finalSkin = sk;
    if (_gender === 'female' && Reg.assets && Reg.assets.skins) {
      if (Reg.assets.skins.includes('commoner man woman.png')) _finalSkin = 'commoner man woman.png';
      else if (Reg.assets.skins.includes('man woman 1.png')) _finalSkin = 'man woman 1.png';
    }

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
