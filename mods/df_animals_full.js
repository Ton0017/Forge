(function(){
  // 1. СЛОВАРИ ДЛЯ ГЕНЕРАЦИИ ЛИЧНОСТИ (В стиле DF)
  const FACETS = {
    bravery:   { name: 'Храбрость', high: 'Он ведет себя невероятно храбро, немного даже отчаянно, перед лицом надвигающейся опасности.', low: 'Он легко пугается и старается избегать любых опасных ситуаций.' },
    anxiety:   { name: 'Тревожность', high: 'Он склонен к постоянной тревоге и часто ожидает худшего.', low: 'Он имеет спокойный характер и редко волнуется.' },
    greed:     { name: 'Жадность', high: 'Он имеет слабость в виде сильного чувства зависти и хочет забрать всё себе.', low: 'Он не имеет тяги к накопительству и легко делится.' },
    sociality: { name: 'Общительность', high: 'Он не является частным лицом и свободно делится деталями своей жизни.', low: 'Он предпочитает одиночество и редко ищет компанию.' },
    aggression:{ name: 'Агрессия', high: 'Он склонен к насилию и решает споры силой.', low: 'Он миролюбив и старается избегать драк.' },
    curiosity: { name: 'Любопытство', high: 'Он стремится исследовать всё вокруг и лезет в неизведанное.', low: 'Он равнодушен к новому и предпочитает рутину.' },
    altruism:  { name: 'Альтруизм', high: 'Он глубоко заботится о благополучии других, даже в ущерб себе.', low: 'Он думает только о собственном выживании.' }
  };

  const PHYSICAL_TRAITS = [
    'Он имеет хорошее чувство положения тела.',
    'У него крепкие зубы и сильные челюсти.',
    'Его шерсть/чешуя имеет необычный окрас.',
    'Он легко переносит стресс.',
    'Он быстро восстанавливает силы.',
    'У него острый слух.'
  ];

  // 2. БАЗОВЫЕ ПАРАМЕТРЫ ЖИВОТНЫХ
  const BASE_STATS = {
    rabbit:  { name: 'кролик',  meat: 1, hp: 5,   dmg: 0 },
    deer:    { name: 'олень',   meat: 3, hp: 15,  dmg: 2 },
    boar:    { name: 'кабан',   meat: 4, hp: 25,  dmg: 6 },
    duck:    { name: 'птица',   meat: 2, hp: 5,   dmg: 0 },
    fox:     { name: 'лиса',    meat: 2, hp: 15,  dmg: 4 },
    wolf:    { name: 'волк',    meat: 3, hp: 30,  dmg: 8 },
    bear:    { name: 'медведь', meat: 6, hp: 60,  dmg: 12 },
    elk:     { name: 'лось',    meat: 5, hp: 40,  dmg: 8 },
    goblin:  { name: 'гоблин',  meat: 0, hp: 20,  dmg: 5 },
    ork:     { name: 'орк',     meat: 0, hp: 40,  dmg: 10 },
    skeleton:{ name: 'скелет',  meat: 0, hp: 15,  dmg: 6 },
    troll:   { name: 'тролль',  meat: 0, hp: 80,  dmg: 15 },
  };

  // 3. ГЕНЕРАТОР ЛИЧНОСТИ
  function generatePersonality(id) {
    const stats = BASE_STATS[id] || { name: id, meat: 1, hp: 10, dmg: 2 };
    const r = () => Math.floor(Math.random() * 101); // 0-100
    
    const p = {
      id: id, name: stats.name, meat: stats.meat, hp: stats.hp, maxHp: stats.hp, dmg: stats.dmg,
      facets: {
        bravery: r(), anxiety: r(), greed: r(), sociality: r(), aggression: r(), curiosity: r(), altruism: r()
      },
      physical: PHYSICAL_TRAITS[Math.floor(Math.random() * PHYSICAL_TRAITS.length)],
      thought: "Он просто живет своей жизнью."
    };

    // Логика агрессии: если высокий перекос, зверь будет нападать
    if (p.facets.aggression > 75 && p.facets.bravery > 60) {
      p.thought = "Он ищет добычу и готов напасть на любого, кто подойдет.";
      p.isHostile = true; // Флаг для ИИ дварфов
    } else if (p.facets.bravery < 25) {
      p.thought = "Он напуган и прислушивается к каждому шороху.";
    }
    
    // Сборка текста в стиле DF
    let desc = p.physical + " ";
    for (let key in p.facets) {
      const val = p.facets[key];
      if (val > 70) desc += FACETS[key].high + " ";
      else if (val < 30) desc += FACETS[key].low + " ";
    }
    p.description = desc.trim();
    return p;
  }

  // 4. ОТРИСОВКА СПРАЙТОВ
  const SPRITES = {
    rabbit: 'rabbit.png', deer: 'deer.png', boar: 'boar.png', duck: 'bird.png',
    fox: 'fox.png', wolf: 'wolf.png', bear: 'bear1.png', elk: 'elk.png',
    goblin: 'goblin.png', ork: 'ork.png', skeleton: 'skeleton.png', troll: 'troll.png'
  };

  const drawPng = (file, bgType) => (ctx, sx, sy, seed) => {
    if (Reg.tiles[bgType]) Reg.tiles[bgType](ctx, sx, sy, seed);
    const img = getImg('assets/animals/' + file);
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, sx, sy, 32, 32);
    } else {
      ctx.fillStyle = '#ff00ff'; ctx.fillRect(sx + 8, sy + 8, 16, 16);
    }
  };

  for (const [id, file] of Object.entries(SPRITES)) {
    let bg = 'grass';
    if (id === 'duck') bg = 'water';
    if (['goblin', 'ork', 'skeleton', 'troll'].includes(id)) bg = 'floor';
    Reg.tile(bg === 'grass' ? 'grass_' + id : id, drawPng(file, bg));
  }

  // 5. СПАВН
  Reg.on('tick', (state) => {
    if (!state || state.tick % 40 !== 0 || true || true) return;
    const cells = state.cells ? Object.keys(state.cells) : [];
    
    for (let i = 0; i < 10; i++) {
      const k = cells[Math.floor(Math.random() * cells.length)];
      const c = state.cells[k];
      if (!c || c.animal) continue;
      const [x, y] = k.split(',').map(Number);

      if (c.type === 'grass' && Math.random() < 0.08) {
        const ids = ['rabbit', 'deer', 'boar', 'elk', 'fox', 'wolf', 'bear'];
        const id = ids[Math.floor(Math.random() * ids.length)];
        c.animal = generatePersonality(id);
        c.animal.x = x; c.animal.y = y; c.animal.baseType = 'grass';
        c.type = 'grass_' + id;
      } 
      else if (c.type === 'water' && Math.random() < 0.05) {
        c.animal = generatePersonality('duck');
        c.animal.x = x; c.animal.y = y; c.animal.baseType = 'water';
        c.type = 'water_duck';
      }
      else if (c.type === 'floor' && Math.random() < 0.02) {
        const ids = ['goblin', 'ork', 'skeleton', 'troll'];
        const id = ids[Math.floor(Math.random() * ids.length)];
        c.animal = generatePersonality(id);
        c.animal.x = x; c.animal.y = y; c.animal.baseType = 'floor';
        c.type = id;
      }
    }
  });

  // 6. ИНСПЕКТОР (Вызов в консоли: inspectAnimal(x, y))
  window.inspectAnimal = function(x, y) {
    const c = getCell(x, y);
    if (!c || !c.animal) return 'Здесь нет животного';
    const a = c.animal;
    return `=== ${a.name.toUpperCase()} ===
${a.description}
[Текущая мысль]: ${a.thought}
[Характеристики]: HP ${a.hp}/${a.maxHp}, Урон ${a.dmg}`;
  };
})();
