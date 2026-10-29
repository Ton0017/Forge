// Биомы → пулы мобов. Каждый тип клетки = свой мир.
(function(){
  // === ФОЛЛБЕК-ТАЙЛЫ (если руины/грибы ещё не нарисованы) ===
  if (!Reg.tiles['ruins']) {
    Reg.tile('ruins', (ctx, sx, sy, seed) => {
      if (Reg.tiles['floor']) Reg.tiles['floor'](ctx, sx, sy, seed);
      const r = (seed||1) % 100;
      ctx.fillStyle = '#3a3530';
      ctx.fillRect(sx + (r%20)+2, sy + (r%15)+5, 8, 4);
      ctx.fillStyle = '#2a2520';
      ctx.fillRect(sx + (r%18)+10, sy + (r%20)+12, 10, 3);
    });
  }
  if (!Reg.tiles['mushroom']) {
    Reg.tile('mushroom', (ctx, sx, sy, seed) => {
      if (Reg.tiles['floor']) Reg.tiles['floor'](ctx, sx, sy, seed);
      ctx.fillStyle = '#5a3a5a'; ctx.fillRect(sx+8, sy+16, 4, 6);
      ctx.fillStyle = '#a83a8a'; ctx.fillRect(sx+6, sy+12, 8, 4);
      ctx.fillStyle = '#d85ab8'; ctx.fillRect(sx+14, sy+18, 4, 6);
      ctx.fillStyle = '#c84aa8'; ctx.fillRect(sx+12, sy+14, 8, 4);
    });
  }

  // === СТАТЫ МОБОВ ===
  const MOB_STATS = {
    // Лес
    rabbit:   { name:'кролик',   meat:1, hp:5,   dmg:0, mass: 2, size: 1,  sprite:'rabbit.png',  bg:'grass' },
    deer:     { name:'олень',    meat:3, hp:15,  dmg:2, mass: 50, size: 4,  sprite:'deer.png',    bg:'grass' },
    boar:     { name:'кабан',    meat:4, hp:25,  dmg:6, mass: 70, size: 4,  sprite:'boar.png',    bg:'grass' },
    fox:      { name:'лиса',     meat:2, hp:15,  dmg:4, mass: 15, size: 2,  sprite:'fox.png',     bg:'grass' },
    wolf:     { name:'волк',     meat:3, hp:30,  dmg:8, mass: 45, size: 3,  sprite:'wolf.png',    bg:'grass' },
    bear:     { name:'медведь',  meat:6, hp:60,  dmg:12, mass: 150, size: 6, sprite:'bear1.png',   bg:'grass' },
    elk:      { name:'лось',     meat:5, hp:40,  dmg:8, mass: 120, size: 5,  sprite:'elk.png',     bg:'grass' },
    // Вода
    duck:     { name:'птица',    meat:2, hp:5,   dmg:0, mass: 2, size: 1,  sprite:'bird.png',    bg:'water' },
    fish:     { name:'рыба',     meat:1, hp:3,   dmg:0, mass: 5, size: 1,  sprite:'fish1.png',   bg:'water' },
    shark:    { name:'акула',    meat:4, hp:40,  dmg:10, mass: 100, size: 5, sprite:'shark1.png',  bg:'water' },
    // Руины
    skeleton: { name:'скелет',   meat:0, hp:15,  dmg:6, mass: 20, size: 3,  sprite:'skeleton.png',bg:'floor' },
    ghost:    { name:'призрак',  meat:0, hp:20,  dmg:5, mass: 0, size: 3,  sprite:'ghost.png',   bg:'floor' },
    zombie:   { name:'зомби',    meat:0, hp:30,  dmg:7, mass: 70, size: 3,  sprite:'zombie.png',  bg:'floor' },
    knight:   { name:'рыцарь',   meat:0, hp:50,  dmg:12, mass: 80, size: 3, sprite:'knight1.png', bg:'floor' },
    // Грибы
    toad:     { name:'жаба',     meat:1, hp:8,   dmg:2, mass: 2, size: 1,  sprite:'toad.png',    bg:'floor' },
    goblin:   { name:'гоблин',   meat:0, hp:20,  dmg:5, mass: 40, size: 2,  sprite:'goblin.png',  bg:'floor' },
    raccoon:  { name:'енот',     meat:1, hp:10,  dmg:3, mass: 8, size: 1,  sprite:'raccoon.png', bg:'floor' },
    // Руда
    golem:    { name:'голем',    meat:0, hp:80,  dmg:15, mass: 300, size: 5, sprite:"golem's hand.png", bg:'floor' },
    troll:    { name:'тролль',   meat:0, hp:60,  dmg:12, mass: 250, size: 6, sprite:'troll.png',   bg:'floor' },
    // Глубина
    ork:      { name:'орк',      meat:0, hp:40,  dmg:10, mass: 80, size: 3, sprite:'ork.png',     bg:'floor' },
    minotaur: { name:'минотавр', meat:4, hp:70,  dmg:14, mass: 280, size: 6, sprite:'minotaur.png',bg:'floor' },
    dragon:   { name:'дракон',   meat:8, hp:150, dmg:25, mass: 1500, size: 15, sprite:'dragon1.png', bg:'floor' },
    
    // НОВЫЕ БИОМЫ
    demon:          { name:'демон',         meat:0, hp:60, dmg:15, sprite:'demon with an axe.png', bg:'infernal' },
    rooster_dragon: { name:'петух-дракон',  meat:2, hp:40, dmg:10, sprite:'rooster dragon.png',    bg:'volcanic' },
    wyvern:         { name:'виверна',       meat:3, hp:50, dmg:12, sprite:'wyvern 1.png',          bg:'volcanic' },
    wild_troll:     { name:'дикий тролль',  meat:5, hp:80, dmg:14, sprite:'wild troll.png',        bg:'ice' },
    blue_spider:    { name:'синий паук',    meat:0, hp:15, dmg:8,  sprite:'blue spider.png',       bg:'ice' },
    skeleton_sword: { name:'скелет-мечник', meat:0, hp:25, dmg:9,  sprite:'skeleton sword.png',    bg:'dead_land' },
    ghoul:          { name:'упырь',         meat:1, hp:35, dmg:11, sprite:'ghoul with a sword.png', bg:'desert' }
  };
  window.MOB_STATS = MOB_STATS;

  // === ПУЛЫ ПО БИОМАМ ===
  const BIOME_POOLS = {
    forest:   ['rabbit','rabbit','rabbit','deer','elk','boar','fox','wolf','bear','cat'],
    water:    ['duck','duck','fish','fish','shark'],
    ruins:    ['skeleton','skeleton','ghost','zombie','knight','cat'],
    mushroom: ['toad','toad','goblin','raccoon'],
    ore:      ['golem','troll'],
    deep:     ['ork','ork','minotaur','dragon'],
    dead_land:['skeleton_sword', 'skeleton_sword', 'ghost', 'ghoul'],
    desert:   ['ghoul', 'zombie', 'skeleton_sword'],
    ice:      ['blue_spider', 'wild_troll', 'wolf'],
    volcanic: ['wyvern', 'rooster_dragon', 'golem'],
    infernal: ['demon', 'demon', 'ghost', 'knight']
  };
  const CHANCES = { forest:0.08, water:0.06, ruins:0.04, mushroom:0.05, ore:0.02, deep:0.02, dead_land:0.05, desert:0.04, ice:0.04, volcanic:0.03, infernal:0.02 };

  // === ГЕНЕРАТОР ЛИЧНОСТИ (расширенный) ===
  const FACETS_KEYS = ['bravery','anxiety','greed','sociality','aggression','curiosity','altruism'];
  const PREFS_POOL = [
    'Презирает независимость','Не креативен','Тяжело впасть в депрессию',
    'Презирает столицу','Поклоняется природе','Поклоняется костям',
    'Любит мясо','Любит траву','Любит сражаться','Избегает конфликтов',
    'Ценит силу','Ценит хитрость','Боится огня','Боится воды'
  ];
  const WEAKNESSES = ['Слабость','Хрупкость','Медлительность','Слепота','Трусость'];
  const PHYS = [
    'Он имеет хорошее чувство положения тела.',
    'У него крепкие зубы и сильные челюсти.',
    'Его шкура имеет необычный окрас.',
    'Он легко переносит стресс.',
    'У него острый слух.'
  ];
  const FACETS_DESC = {
    bravery:   { high:'Он ведет себя невероятно храбро перед лицом опасности.', low:'Он легко пугается и избегает опасных ситуаций.' },
    anxiety:   { high:'Он склонен к постоянной тревоге.', low:'Он имеет спокойный характер.' },
    greed:     { high:'Он имеет слабость в виде сильного чувства зависти.', low:'Он не имеет тяги к накопительству.' },
    sociality: { high:'Он свободно делится деталями своей жизни.', low:'Он предпочитает одиночество.' },
    aggression:{ high:'Он склонен к насилию и решает споры силой.', low:'Он миролюбив и старается избегать драк.' },
    curiosity: { high:'Он стремится исследовать всё вокруг.', low:'Он равнодушен к новому.' },
    altruism:  { high:'Он глубоко заботится о благополучии других.', low:'Он думает только о собственном выживании.' }
  };

  function generatePersonality(id) {
    const stats = MOB_STATS[id] || { name:id, meat:1, hp:10, dmg:2 };
    const r = () => Math.floor(Math.random()*101);
    const p = {
      id, name:stats.name, meat:stats.meat, hp:stats.hp, maxHp:stats.hp, dmg:stats.dmg,
      sprite: stats.sprite || (id + '.png'),
      mass: stats.mass || 10, size: stats.size || 2, // <--- ДОБАВЛЯЕМ МАССУ И РАЗМЕР
      draw: Reg.tiles[id],
      facets:{}, physical: PHYS[Math.floor(Math.random()*PHYS.length)],
      prefs: [], weakness: WEAKNESSES[Math.floor(Math.random()*WEAKNESSES.length)],
      aggression: 0, fear: 0.5, thought: 'Он просто живет своей жизнью.'
    };
    FACETS_KEYS.forEach(k => p.facets[k] = r());
    const prefSet = new Set();
    while (prefSet.size < 3) prefSet.add(PREFS_POOL[Math.floor(Math.random()*PREFS_POOL.length)]);
    p.prefs = Array.from(prefSet);
    p.aggression = p.facets.aggression / 100;
    p.fear = 1 - p.facets.bravery / 100;
    if (p.facets.aggression > 75 && p.facets.bravery > 60) {
      p.thought = 'Он ищет добычу и готов напасть на любого.';
      p.isHostile = true;
    } else if (p.facets.bravery < 25) {
      p.thought = 'Он напуган и прислушивается к каждому шороху.';
    }
    let desc = p.physical + ' ';
    FACETS_KEYS.forEach(k => {
      const v = p.facets[k];
      if (v > 70) desc += FACETS_DESC[k].high + ' ';
      else if (v < 30) desc += FACETS_DESC[k].low + ' ';
    });
    p.description = desc.trim();
    
    // Генерируем и сохраняем атомарный профиль НАВСЕГДА при спавне
    if (window.initAtomicProfile) {
        window.initAtomicProfile(p);
    }
    
    return p;
  }

  // === РЕГИСТРАЦИЯ СПРАЙТОВ ===
  const drawPng = (file, bgType) => (ctx, sx, sy, seed) => {
    if (bgType && Reg.tiles[bgType]) Reg.tiles[bgType](ctx, sx, sy, seed);
    else { ctx.fillStyle = '#2a1e10'; ctx.fillRect(sx, sy, 32, 32); }
    const img = getImg('assets/animals/' + file);
    if (img && img.complete && img.naturalWidth > 0) {
        ctx.drawImage(img, sx, sy, 32, 32);
    } else {
        // Ждем загрузки картинки, не рисуем уродливый фиолетовый квадрат
    }
  };

  for (const [id, s] of Object.entries(MOB_STATS)) {
    if (s.bg === 'grass') Reg.tile('grass_' + id, drawPng(s.sprite, 'grass'));
    Reg.tile(id, drawPng(s.sprite, s.bg));
  }

  // === ОПРЕДЕЛЕНИЕ БИОМА ===
  function getBiome(x, y, cellType) {
    if (!cellType) return null;
    if (cellType === 'water') return 'water';
    if (cellType === 'ruins') return 'ruins';
    if (cellType === 'mushroom') return 'mushroom';
    if (cellType === 'ore') return 'ore';
    if (cellType === 'dead_land') return 'dead_land';
    if (cellType === 'desert') return 'desert';
    if (cellType === 'ice') return 'ice';
    if (cellType === 'volcanic') return 'volcanic';
    if (cellType === 'infernal') return 'infernal';
    if (typeof cellType === 'string' && cellType.startsWith('grass')) return 'forest';
    if (cellType === 'floor') {
      const depth = Math.floor((Math.abs(x) + Math.abs(y)) / 15);
      if (depth >= 3) return 'deep';
    }
    return null;
  }
  window.getBiome = getBiome;

  // === СПАВН ПО БИОМАМ ===
  Reg.on('tick', (state) => {
    if (!state || state.tick % 40 !== 0) return;
    const cells = state.cells;
    if (!cells) return;
    const keys = Object.keys(cells);
    if (!keys.length) return;

    for (let i = 0; i < 15; i++) {
      const k = keys[Math.floor(Math.random() * keys.length)];
      const c = cells[k];
      if (!c || c.animal) continue;
      const [x, y] = k.split(',').map(Number);
      const biome = getBiome(x, y, c.type);
      if (!biome) continue;
      const pool = BIOME_POOLS[biome];
      if (!pool) continue;
      if (Math.random() > (CHANCES[biome] || 0.03)) continue;

      const id = pool[Math.floor(Math.random() * pool.length)];
      if (!MOB_STATS[id]) continue;

      const origType = c.type;
      c.monster = generatePersonality(id); // Было c.animal
      c.animal.x = x; c.animal.y = y;
      c.animal.baseType = origType;
      if (origType.startsWith('grass')) {
        c.type = 'grass_' + id;
      } else {
        c.type = id;
      }
    }
  });

  window.debugBiomes = function() {
    const s = window.state;
    if (!s || !s.cells) return 'нет state';
    const counts = {};
    for (const k in s.cells) {
      const c = s.cells[k];
      const [x, y] = k.split(',').map(Number);
      const b = getBiome(x, y, c.type) || 'none';
      counts[b] = (counts[b]||0) + 1;
    }
    return counts;
  };
})();
