(function(){
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  
  // 1. СЛОИ ГЕНЕРАЦИИ
  const FORMS = [
    { id: 'sword', name: 'меч', type: 'weapon', file: 'thick iron sword.png', tags: ['weapon', 'sword', 'sharp'] },
    { id: 'axe', name: 'топор', type: 'weapon', file: 'axe.png', tags: ['weapon', 'axe', 'sharp'] },
    { id: 'pickaxe', name: 'кирка', type: 'tool', file: 'dwarf hammer.png', tags: ['tool', 'pickaxe'] },
    { id: 'helmet', name: 'шлем', type: 'armor', file: 'iron helmet.png', tags: ['armor', 'helmet'] },
    { id: 'armor', name: 'нагрудник', type: 'armor', file: 'iron armor.png', tags: ['armor'] },
    { id: 'amulet', name: 'амулет', type: 'accessory', file: 'amulet of power.png', tags: ['accessory'] },
    { id: 'ring', name: 'кольцо', type: 'accessory', file: 'assets/equipment/amethyst ring.png', tags: ['accessory'] },
    { id: 'statue', name: 'статуэтка', type: 'misc', file: 'assets/icons/48 people show off their strength..png', tags: ['misc', 'art'] },
    { id: 'goblet', name: 'кубок', type: 'misc', file: 'assets/icons/boiler.png', tags: ['misc', 'art'] }
  ];

  const MATERIALS = [
    { id: 'iron', name: 'железа', adj: 'железный', hardness: 8, weight: 5 },
    { id: 'steel', name: 'стали', adj: 'стальной', hardness: 9, weight: 6 },
    { id: 'bone', name: 'кости', adj: 'костяной', hardness: 3, weight: 2 },
    { id: 'obsidian', name: 'обсидиана', adj: 'обсидиановый', hardness: 7, weight: 4 },
    { id: 'stone', name: 'камня', adj: 'каменный', hardness: 5, weight: 8 },
    { id: 'gold', name: 'золота', adj: 'золотой', hardness: 4, weight: 10 }
  ];

  const QUALITIES = [
    { name: 'Шедевр', mult: 2.0, beauty: 100, tag: 'masterpiece' },
    { name: 'Добротный', mult: 1.0, beauty: 50, tag: 'normal' },
    { name: 'Кривой', mult: 0.5, beauty: 10, tag: 'shoddy' },
    { name: 'Бракованный', mult: 0.3, beauty: 5, tag: 'broken' },
    { name: 'Проклятый', mult: 1.2, beauty: 20, tag: 'cursed' }
  ];

  const AURAS = [
    { name: 'Светящийся', tag: 'light', desc: 'Он испускает мягкий свет.' },
    { name: 'Шепчущий', tag: 'whisper', desc: 'Он шепчет голосами мертвых.' },
    { name: 'Ледяной', tag: 'ice', desc: 'Он покрыт вечным инеем.' },
    { name: 'Огненный', tag: 'fire', desc: 'Он горячий на ощупь.' },
    { name: 'Плачущий', tag: 'blood', desc: 'С него капает кровь.' },
    { name: 'Невидимый', tag: 'invisible', desc: 'Его сложно заметить.' },
    { name: 'Тошнотворный', tag: 'poison', desc: 'От него пахнет гнилью.' },
    { name: 'Обычный', tag: 'none', desc: 'Он не обладает магией.' }
  ];

  const SYL1 = ['Ур', 'Грим', 'Тор', 'Ак', 'Бал', 'Дур', 'Каз', 'Мор', 'Нар', 'Зул'];
  const SYL2 = ['ин', 'ак', 'ур', 'из', 'от', 'ар', 'ум', 'ор', 'ан', 'ил', 'ас', 'ек'];

  function generateArtifactName() {
    return pick(SYL1) + pick(SYL2) + (Math.random() < 0.3 ? pick(SYL2) : '');
  }

  window.generateArtifact = function(npc) {
    const f = npc.facets || {};
    const form = pick(FORMS);
    const mat = pick(MATERIALS);
    
    // Качество зависит от граней кузнеца
    let qPool = [QUALITIES[1]]; // Добротный (база)
    if (f.diligence > 60 || f.aesthetics > 60) qPool.push(QUALITIES[0]); // Шедевр
    if (f.courage < 40) qPool.push(QUALITIES[2]); // Кривой
    if (f.curiosity > 70) qPool.push(QUALITIES[4]); // Проклятый (из-за экспериментов)
    if (f.diligence < 30) qPool.push(QUALITIES[3]); // Бракованный
    const qual = pick(qPool);

    // Аура (магия) зависит от качества и удачи
    let aura = AURAS[7]; // Обычный
    if (qual.tag === 'cursed' && Math.random() < 0.7) aura = AURAS[5]; // Шепчущий
    else if (qual.tag === 'masterpiece' && Math.random() < 0.5) aura = pick(AURAS.slice(0, 6));

    // Имя и история
    const name = generateArtifactName();
    const finalName = `${qual.name === 'Шедевр' ? '' : qual.name + ' '}${form.name} из ${mat.name} "${name}"`;
    
    // Сборка предмета
    let item = {
      name: finalName,
      type: form.type,
      file: form.file,
      tags: [...form.tags, 'artifact', qual.tag, aura.tag],
      material: mat.id,
      integrity: Math.floor(100 * qual.mult * (mat.hardness / 5)),
      beauty: qual.beauty,
      mystery: aura.tag !== 'none' ? 1 : 0,
      aura_desc: aura.desc,
      parts: form.type === 'weapon' ? [{name:'лезвие', hp: 60}, {name:'рукоять', hp: 40}] : [{name:'основа', hp: 100}]
    };

    // ГЕНЕРИРУЕМ ЛЕГЕНДУ (Если есть движок)
    if (window.generateArtifactLegend) {
        // Собираем свидетелей (дварфы в радиусе 5 клеток)
        let witnesses = [];
        if (window.state && window.state.npcs) {
            window.state.npcs.forEach(n => {
                if (n.alive && Math.abs(n.x - npc.x) <= 5 && Math.abs(n.y - npc.y) <= 5) witnesses.push(n);
            });
        }
        item.legend = window.generateArtifactLegend(item, npc, witnesses);
    }

    return item;
  };
})();
