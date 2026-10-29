(function(){
  setTimeout(() => {
    const ALL_FILES = [
      "Eye of Cthulhu", "Minotaur2", "bear1", "bear2", "bear3", "bee", "bird", "boar", "bug", 
      "burning skull", "caravan", "caravan2", "cat", "chicken", "cow", "crocodile", "dead deer", 
      "deer", "dragon1", "dragon2", "dragon3", "dragon4", "dragon5", "elephant", "elk", 
      "evil tree", "fish1", "fish2", "fish3", "fish4", "fish5", "fly agaric", "forest spirit", 
      "fox", "ghost", "giraffe", "goat", "goblin", "golem's hand", "gopher", "hippopotamus", 
      "horse1", "horse2", "kentaur1", "kentaur2", "knight1", "knight2", "knight3", "knight4", 
      "lion", "lizard", "magician", "mermaid1", "mermaid2", "minotaur", "monkey1", "monkey2", 
      "monkey3", "mosquito", "ork", "ostrich", "poison ivy", "rabbit", "raccoon", "raccoon2", 
      "rhinoceros", "rooster", "shadow", "shark1", "shark2", "shark3", "sheep", "skeleton", 
      "squirrel", "through", "tiger", "toad", "troll woman", "troll", "troll2", "vampire", 
      "vngel", "wings", "wolf", "worm", "zebra", "zombie"
    ];

    const AUTO_STATS = ALL_FILES.map(filename => {
      let id = filename.toLowerCase().replace(/\s+/g, '_');
      let name = filename;
      let hp = 10, dmg = 1, biome = 'forest', hostile = false;

      if (filename.includes('dragon') || filename.includes('Eye of')) { hp = 150; dmg = 25; biome = 'deep'; hostile = true; }
      else if (filename.includes('troll') || filename.includes('minotaur') || filename.includes('golem')) { hp = 80; dmg = 15; biome = 'ore'; hostile = true; }
      else if (filename.includes('skeleton') || filename.includes('ghost') || filename.includes('zombie') || filename.includes('vampire')) { hp = 30; dmg = 8; biome = 'ruins'; hostile = true; }
      else if (filename.includes('knight') || filename.includes('kentaur') || filename.includes('ork') || filename.includes('goblin')) { hp = 40; dmg = 10; biome = 'mushroom'; hostile = true; }
      else if (filename.includes('wolf') || filename.includes('bear') || filename.includes('tiger') || filename.includes('lion') || filename.includes('crocodile')) { hp = 35; dmg = 8; biome = 'forest'; hostile = true; }
      else if (filename.includes('shark')) { hp = 40; dmg = 12; biome = 'water'; hostile = true; }
      else if (filename.includes('fish') || filename.includes('mermaid')) { hp = 5; dmg = 0; biome = 'water'; hostile = false; }
      else if (filename.includes('bird') || filename.includes('chicken') || filename.includes('bee')) { hp = 3; dmg = 0; biome = 'forest'; hostile = false; }
      else if (filename.includes('rabbit') || filename.includes('squirrel') || filename.includes('gopher')) { hp = 4; dmg = 0; biome = 'forest'; hostile = false; }
      else if (filename.includes('cow') || filename.includes('sheep') || filename.includes('goat') || filename.includes('horse')) { hp = 15; dmg = 2; biome = 'forest'; hostile = false; }
      else if (filename.includes('deer') || filename.includes('elk') || filename.includes('zebra')) { hp = 12; dmg = 2; biome = 'forest'; hostile = false; }
      else if (filename.includes('bug') || filename.includes('mosquito') || filename.includes('worm')) { hp = 2; dmg = 1; biome = 'mushroom'; hostile = false; }

      // Отрисовка с защитой от фиолетового квадрата
      Reg.tile(id, (ctx, sx, sy, seed) => {
        let bg = biome === 'water' ? 'water' : (biome === 'forest' ? 'grass' : 'floor');
        if (Reg.tiles[bg]) Reg.tiles[bg](ctx, sx, sy, seed);
        
        const file = filename + '.png';
        const img = getImg('assets/animals/' + file);
        
        if (img && img.complete && img.naturalWidth > 0) {
           ctx.drawImage(img, sx, sy, 32, 32);
        } else {
           // Заглушка, если картинка не загрузилась (вместо фиолетового квадрата)
           ctx.fillStyle = hostile ? '#a83838' : '#7aba7a'; 
           ctx.beginPath();
           ctx.arc(sx + 16, sy + 16, 10, 0, Math.PI * 2);
           ctx.fill();
           // Если картинка не грузится, выводим в консоль (F12), чтобы знать какая
           if (img && !img.complete) console.log('[Sprite Loading] Ждем:', file);
        }
      });

      return { id, name, hp, dmg, biome, hostile, isAnimal: !hostile, sprite: filename + '.png' };
    });

    const POOLS = {
      forest: AUTO_STATS.filter(a => a.biome === 'forest').map(a => a.id),
      water: AUTO_STATS.filter(a => a.biome === 'water').map(a => a.id),
      ruins: AUTO_STATS.filter(a => a.biome === 'ruins').map(a => a.id),
      mushroom: AUTO_STATS.filter(a => a.biome === 'mushroom').map(a => a.id),
      ore: AUTO_STATS.filter(a => a.biome === 'ore').map(a => a.id),
      deep: AUTO_STATS.filter(a => a.biome === 'deep').map(a => a.id)
    };
    window.BIOME_POOLS = POOLS;

    // УВЕЛИЧЕННЫЙ СПАВН
    Reg.on('tick', (state) => {
      if (!state || state.tick % 20 !== 0) return; // Раз в 20 тиков (чаще)
      const cells = state.cells ? Object.keys(state.cells) : [];
      
      for (let i = 0; i < 30; i++) { // Проверяем 30 клеток за раз
        const k = cells[Math.floor(Math.random() * cells.length)];
        const c = state.cells[k];
        if (!c || c.animal || c.monster) continue;
        const [x, y] = k.split(',').map(Number);

        let b = null;
        if (c.type === 'water') b = 'water';
        else if (c.type === 'ruins') b = 'ruins';
        else if (c.type === 'mushroom') b = 'mushroom';
        else if (c.type === 'ore') b = 'ore';
        else if (c.type.startsWith('grass')) b = 'forest';
        else if (c.type === 'floor') {
           const depth = Math.floor((Math.abs(x) + Math.abs(y)) / 15);
           if (depth >= 3) b = 'deep';
        }

        if (!b || !POOLS[b] || POOLS[b].length === 0) continue;
        if (Math.random() > 0.3) continue; // Шанс 30% (было 10%)

        const randId = POOLS[b][Math.floor(Math.random() * POOLS[b].length)];
        const stats = AUTO_STATS.find(a => a.id === randId);
        if (!stats) continue;

        const baseType = c.type.startsWith('grass') ? 'grass' : c.type;
        
        if (stats.hostile) {
           if (!window.Reg.monsters) window.Reg.monsters = {};
           window.Reg.monsters[randId] = { name: stats.name, hp: stats.hp, atk: stats.dmg, draw: Reg.tiles[randId] };
           c.monster = { name: stats.name, hp: stats.hp, atk: stats.dmg, x, y, draw: Reg.tiles[randId] };
        } else {
           c.animal = { id: randId, name: stats.name, hp: stats.hp, maxHp: stats.hp, dmg: stats.dmg, meat: Math.ceil(stats.hp / 5), x, y, baseType };
           c.type = baseType.startsWith('grass') ? 'grass_' + randId : randId;
        }
      }
    });

    console.log(`[All Animals] Загружено ${ALL_FILES.length} видов. Спавн увеличен.`);
  }, 1500);
})();
