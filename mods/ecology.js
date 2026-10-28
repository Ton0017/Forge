(function(){
  // 1. ЯГОДЫ (Новая еда для всех)
  Reg.tile('grass_berry', (ctx, sx, sy, seed) => {
    if (Reg.tiles['grass']) Reg.tiles['grass'](ctx, sx, sy, seed);
    ctx.fillStyle = '#2a5a2a'; ctx.fillRect(sx+10, sy+15, 12, 10); // куст
    ctx.fillStyle = '#3a7a3a'; ctx.fillRect(sx+12, sy+14, 8, 8);
    ctx.fillStyle = '#c83838'; // ягоды
    ctx.fillRect(sx+12, sy+16, 2, 2); ctx.fillRect(sx+16, sy+18, 2, 2); ctx.fillRect(sx+14, sy+20, 2, 2);
  });

  // Спавн ягод на траве
  Reg.on('tick', (state) => {
    if (!state || state.tick % 100 !== 0) return; // Раз в 5 секунд
    const cells = state.cells ? Object.keys(state.cells) : [];
    for (let i = 0; i < 5; i++) {
      const c = state.cells[cells[Math.floor(Math.random() * cells.length)]];
      if (c && c.type === 'grass' && !c.animal && Math.random() < 0.1) c.type = 'grass_berry';
    }
  });

  // Дварфы собирают ягоды
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || !npc.task) return false;
    const c = getCell(npc.x, npc.y);
    if (c && c.type === 'grass_berry') {
      c.type = 'grass';
      state.food = (state.food || 0) + 2;
      Reg.log(`${npc.name} собирает ягоды. (+2 еды)`, 'good');
      Reg.addMemory(npc, 'Он собрал горсть ягод.', { type: 'joy', power: 5, category: 'food' });
      npc.task = { type: 'idle', path: [] };
      return true;
    }
    return false;
  });

  // 2. ЖИЗНЬ ЖИВОТНЫХ
  Reg.on('tick', (state) => {
    if (!state || state.tick % 20 !== 0) return; // Животные думают раз в 2 секунды
    const cells = state.cells; if (!cells) return;

    for (const k in cells) {
      const c = cells[k];
      if (!c.animal || c.animal.hp <= 0) continue;
      const a = c.animal;

      // Потребности растут
      a.hunger = (a.hunger || 0) + 1;
      a.thirst = (a.thirst || 0) + 1;
      a.fatigue = (a.fatigue || 0) + 1;

      // Эмерджентная смерть от голода/жажды
      // Смерть от голода временно отключена (чтобы звери не исчезали)
      // if (a.hunger > 100 || a.thirst > 100) { ... }

      // Сон (усталость > 80)
      if (a.fatigue > 80) {
        a.fatigue = Math.max(0, a.fatigue - 15);
        continue; // Спит, пропускает ход
      }

      // ПИТОМЦЫ (следуют за хозяином)
      if (a.isPet) {
        const owner = state.npcs.find(n => n.alive && n.id === a.ownerId);
        if (!owner) { a.isPet = false; continue; }
        if (Math.random() < 0.4 && (owner.x !== a.x || owner.y !== a.y)) {
           const stepX = Math.sign(owner.x - a.x);
           const stepY = Math.sign(owner.y - a.y);
           const nx = a.x + stepX, ny = a.y + stepY;
           const nc = cells[nx + ',' + ny];
           if (!nc) continue; // Если клетки нет (тьма), не идем туда
           if (nc && !nc.animal && !nc.monster) {
             nc.animal = a; nc.type = a.baseType + '_' + a.id; nc.seed = nc.seed || 1;
             c.animal = null; c.type = a.baseType;
           }
        }
        continue;
      }

      // ПРИРУЧЕНИЕ временно отключено

      // ХИЩНИКИ (Волк, Медведь, Гоблин)
      if (a.isHostile || a.aggression > 0.6) {
        let prey = null, preyCell = null;
        // Ищем жертву рядом (мирных травоядных)
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            if (dx === 0 && dy === 0) continue;
            const pc = cells[(a.x + dx) + ',' + (a.y + dy)];
            if (pc && pc.animal && !pc.animal.isHostile && pc.animal.id !== a.id) {
              prey = pc.animal; preyCell = pc; break;
            }
          }
        }
        if (prey) {
           prey.hp -= a.dmg;
           Reg.log(`${a.name} вцепляется в ${prey.name}!`, 'sys');
           if (prey.hp <= 0) {
              Reg.log(`${a.name} разрывает ${prey.name}.`, 'death');
              c.animal = null; c.type = a.baseType; // Хищник на месте
              preyCell.animal = null; preyCell.type = prey.baseType; // Жертва исчезла
              a.hunger = Math.max(0, a.hunger - 40); // Наелся
           }
           continue;
        }
      }

      // ПОИСК ВОДЫ ИЛИ ЯГОД
      let targetType = null;
      if (a.thirst > 60) targetType = 'water';
      else if (a.hunger > 60 && a.aggression < 0.6) targetType = 'grass_berry';

      if (targetType) {
        let found = null;
        for (let dx = -6; dx <= 6; dx++) {
          for (let dy = -6; dy <= 6; dy++) {
            const pc = cells[(a.x + dx) + ',' + (a.y + dy)];
            if (pc && pc.type === targetType) { found = { x: a.x + dx, y: a.y + dy }; break; }
          }
        }
        if (found) {
          const stepX = Math.sign(found.x - a.x), stepY = Math.sign(found.y - a.y);
          const nx = a.x + stepX, ny = a.y + stepY;
          const nc = cells[nx + ',' + ny];
          if (nc && !nc.animal && !nc.monster) {
             nc.animal = a; nc.type = a.baseType + '_' + a.id; nc.seed = nc.seed || 1;
             c.animal = null; c.type = a.baseType;
             if (nx === found.x && ny === found.y) {
               if (targetType === 'water') { 
                  const w = nc.water || {};
                  
                  // Температура
                  if (w.temperature > 40) { a.hp -= 2; }
                  else if (w.temperature < 5) { a.hp -= 1; }
                  
                  // Соль
                  if (w.salinity === 'salt') a.thirst = Math.max(0, a.thirst - 20);
                  else a.thirst = 0;
                  
                  // Чистота
                  if (w.purity === 'infected' || nc.infected_water) {
                      a.contamination = 'bacteria';
                      Reg.log(`[Болезнь] ${a.name} пьет зараженную воду.`, 'death');
                  }
                  
                  // Глубина
                  if (w.depth >= 3 && a.size < 3) {
                      a.hp -= 2;
                      if (a.hp <= 0) {
                          nc.animal = null;
                          Reg.log(`[Утопление] ${a.name} утонул в глубокой воде.`, 'death');
                          return;
                      }
                  }
                  
                  Reg.log(`${a.name} пьет воду.`, 'sys'); 
              }
               else { a.hunger = 0; nc.type = 'grass'; Reg.log(`${a.name} ест ягоды.`, 'sys'); }
             }
          }
          continue;
        }
      }

      // БЛУЖДАНИЕ (если делать нечего)
      if (Math.random() < 0.3) {
        const [dx, dy] = [[0,1],[0,-1],[1,0],[-1,0]][Math.floor(Math.random()*4)];
        const nx = a.x + dx, ny = a.y + dy;
        const nc = cells[nx + ',' + ny];
        if (nc && !nc.animal && !nc.monster) {
           let canWalk = false;
           if (a.baseType === 'grass' && nc.type.indexOf('grass') === 0) canWalk = true;
           else if (a.baseType === 'water' && nc.type === 'water') canWalk = true;
           else if (['floor','ruins','mushroom','ore'].includes(a.baseType) && ['floor','ruins','mushroom'].includes(nc.type)) canWalk = true;

           if (canWalk) {
             nc.animal = a; nc.type = (nc.type === 'grass') ? 'grass_' + a.id : a.id;
             c.animal = null; c.type = a.baseType;
           }
        }
      }
    }
  });

  // Перерегистрируем тайлы для животных на полу (на случай если они убежали с травы)
  const SPRITES = {
    rabbit: 'rabbit.png', deer: 'deer.png', boar: 'boar.png', duck: 'bird.png',
    fox: 'fox.png', wolf: 'wolf.png', bear: 'bear1.png', elk: 'elk.png'
  };
  for (const [id, file] of Object.entries(SPRITES)) {
    Reg.tile(id, (ctx, sx, sy, seed) => {
      if (Reg.tiles['floor']) Reg.tiles['floor'](ctx, sx, sy, seed);
      const img = getImg('assets/animals/' + file);
      if (img && img.complete && img.naturalWidth > 0) ctx.drawImage(img, sx, sy, 32, 32);
      else { ctx.fillStyle = '#ff00ff'; ctx.fillRect(sx+8, sy+8, 16, 16); }
    });
  }
})();
