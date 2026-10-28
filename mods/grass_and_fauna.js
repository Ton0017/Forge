(function(){
  const ANIMALS = {
    rabbit: { name: 'кролик', meat: 1, fear: 0.7 },
    deer:   { name: 'олень',   meat: 3, fear: 0.5 },
    boar:   { name: 'кабан',   meat: 4, fear: 0.3 },
    duck:   { name: 'утка',    meat: 2, fear: 0.6 }
  };

  let hasGrass = false;

  function seededRandom(seed) {
    let s = (seed || 1) >>> 0;
    return function() { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  // === ТРАВА ===
  if (!Reg.tiles || !Reg.tiles['grass']) {
    Reg.tile('grass', (ctx, sx, sy, seed) => {
      const rnd = seededRandom(seed || 1);
      ctx.fillStyle = '#2a1e10';
      ctx.fillRect(sx, sy, 32, 32);
      for (let i = 0; i < 14; i++) {
        const x = sx + Math.floor(rnd() * 30);
        const y = sy + Math.floor(rnd() * 30);
        ctx.fillStyle = ['#3a5a2a', '#4a6a3a', '#5a7a4a'][Math.floor(rnd() * 3)];
        ctx.fillRect(x, y, 3, 2);
      }
      for (let i = 0; i < 10; i++) {
        const x = sx + 2 + Math.floor(rnd() * 28);
        const y = sy + 2 + Math.floor(rnd() * 26);
        ctx.fillStyle = '#5a8a4a';
        ctx.fillRect(x, y, 1, 3);
      }
    });
  }

  // === КРОЛИК ===
  Reg.tile('grass_rabbit', (ctx, sx, sy, seed) => {
    Reg.tiles['grass'](ctx, sx, sy, seed);
    const x = sx + 7, y = sy + 15;
    ctx.fillStyle = '#a8a8a8'; ctx.fillRect(x+2, y+5, 13, 7);
    ctx.fillStyle = '#c0c0c0'; ctx.fillRect(x+3, y+4, 11, 4);
    ctx.fillStyle = '#b0b0b0'; ctx.fillRect(x+10, y+1, 5, 5);
    ctx.fillStyle = '#e0c8c8';
    ctx.fillRect(x+11, y-3, 1, 5);
    ctx.fillRect(x+13, y-4, 1, 6);
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x+13, y+2, 1, 1);
    ctx.fillStyle = '#e0a0a0'; ctx.fillRect(x+14, y+4, 1, 1);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x+1, y+7, 2, 2);
    ctx.fillStyle = '#888';
    ctx.fillRect(x+3, y+12, 2, 2);
    ctx.fillRect(x+11, y+12, 2, 2);
  });

  // === ОЛЕНЬ ===
  Reg.tile('grass_deer', (ctx, sx, sy, seed) => {
    Reg.tiles['grass'](ctx, sx, sy, seed);
    const x = sx + 4, y = sy + 7;
    ctx.fillStyle = '#8b6a3a';
    ctx.fillRect(x+5, y+8, 14, 7);
    ctx.fillRect(x+3, y+2, 4, 8);
    ctx.fillStyle = '#9a7a4a'; ctx.fillRect(x+2, y, 5, 4);
    ctx.fillStyle = '#5a4a2a';
    ctx.fillRect(x, y-3, 1, 4);
    ctx.fillRect(x+1, y-5, 1, 3);
    ctx.fillRect(x+3, y-4, 1, 4);
    ctx.fillRect(x+4, y-6, 1, 3);
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x+4, y+2, 1, 1);
    ctx.fillStyle = '#6a4a2a';
    ctx.fillRect(x+6, y+15, 2, 4);
    ctx.fillRect(x+9, y+15, 2, 4);
    ctx.fillRect(x+14, y+15, 2, 4);
    ctx.fillRect(x+17, y+15, 2, 4);
    ctx.fillRect(x+19, y+9, 2, 2);
  });

  // === КАБАН ===
  Reg.tile('grass_boar', (ctx, sx, sy, seed) => {
    Reg.tiles['grass'](ctx, sx, sy, seed);
    const x = sx + 4, y = sy + 11;
    ctx.fillStyle = '#4a3a2a'; ctx.fillRect(x+5, y+3, 15, 8);
    ctx.fillStyle = '#3a2a1a'; ctx.fillRect(x+2, y+5, 5, 6);
    ctx.fillStyle = '#5a4a3a'; ctx.fillRect(x, y+7, 3, 3);
    ctx.fillStyle = '#e0e0c0'; ctx.fillRect(x+1, y+10, 2, 1);
    ctx.fillStyle = '#c83838'; ctx.fillRect(x+3, y+6, 1, 1);
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(x+6, y+11, 2, 3);
    ctx.fillRect(x+10, y+11, 2, 3);
    ctx.fillRect(x+15, y+11, 2, 3);
    ctx.fillStyle = '#2a1a0a';
    ctx.fillRect(x+8, y+1, 1, 2);
    ctx.fillRect(x+12, y, 1, 3);
    ctx.fillRect(x+16, y+1, 1, 2);
  });

  // === УТКА ===
  Reg.tile('water_duck', (ctx, sx, sy, seed) => {
    if (Reg.tiles['water']) Reg.tiles['water'](ctx, sx, sy, seed);
    else { ctx.fillStyle = '#2a4a6a'; ctx.fillRect(sx, sy, 32, 32); }
    const x = sx + 8, y = sy + 13;
    ctx.fillStyle = '#e0d0a0'; ctx.fillRect(x, y+3, 12, 5);
    ctx.fillStyle = '#c0b080'; ctx.fillRect(x-1, y+2, 3, 3);
    ctx.fillStyle = '#e0d0a0'; ctx.fillRect(x+10, y-1, 5, 5);
    ctx.fillStyle = '#d08030'; ctx.fillRect(x+14, y+1, 3, 2);
    ctx.fillStyle = '#1a1a1a'; ctx.fillRect(x+12, y, 1, 1);
    ctx.fillStyle = '#f0e0b0'; ctx.fillRect(x+3, y+4, 6, 2);
  });

  // === ТРАВА ПОЯВЛЯЕТСЯ ПРИ КОПКЕ РЯДОМ С ВОДОЙ ===
  Reg.on('tile_dug', (cell, npc, state) => {
    if (!cell || !npc) return;
    if (cell.type !== 'floor') return;
    let waterCount = 0;
    for (let dx = -3; dx <= 3; dx++) {
      for (let dy = -3; dy <= 3; dy++) {
        const c = getCell(npc.x + dx, npc.y + dy);
        if (c && c.type === 'water') waterCount++;
      }
    }
    if (waterCount === 0) return;
    const chance = Math.min(0.6, waterCount * 0.1);
    if (Math.random() < chance) {
      cell.type = 'grass';
      cell.seed = cell.seed || Math.floor(Math.random() * 100000);
      hasGrass = true;
    }
  });

  // === СПАВН ЖИВОТНЫХ ===
  Reg.on('tick', (state) => {
    if (!state || state.tick % 40 !== 0) return;
    const cells = state.cells ? Object.keys(state.cells) : [];
    if (!cells.length) return;
    for (let i = 0; i < 10; i++) {
      const k = cells[Math.floor(Math.random() * cells.length)];
      const c = state.cells[k];
      if (!c || c.animal) continue;
      const [x, y] = k.split(',').map(Number);
      if (false) {
        const ids = ['rabbit', 'rabbit', 'rabbit', 'deer', 'boar'];
        const id = ids[Math.floor(Math.random() * ids.length)];
        c.animal = { id, baseType: 'grass', x, y };
        c.type = 'grass_' + id;
        hasGrass = true;
      } else if (false) {
        c.animal = { id: 'duck', baseType: 'water', x, y };
        c.type = 'water_duck';
      }
    }
  });

  // === ОХОТА ===
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || !npc.task) return false;

    if (npc.task.type === 'go_to_hunt') {
      const target = npc.task.target;
      if (!target) { npc.task = { type: 'idle', path: [] }; return true; }
      if (npc.task.path && npc.task.path.length > 0) {
        const step = npc.task.path.shift();
        npc.x = step.x; npc.y = step.y;
      }
      const dist = Math.abs(npc.x - target.x) + Math.abs(npc.y - target.y);
      if (dist <= 1) {
        const cell = getCell(target.x, target.y);
        if (cell && cell.animal && cell.animal.id === target.id) resolveHunt(npc, cell, state);
        else npc.task = { type: 'idle', path: [] };
      }
      return true;
    }

    const critical = ['eat','rest','fight','drink','drink_tavern','pray','madness','cook_meat',
      'go_to_eat','go_to_rest','go_to_drink','go_to_pray','go_to_equip','go_to_deposit','go_to_cook','go_to_snack'];
    if (critical.includes(npc.task.type)) return false;

    const hungry = (npc.hunger || 0) > 30;
    const foodLow = (state.food || 0) < 10;
    if (!hungry && !foodLow && Math.random() > 0.02) return false;

    const target = findNearbyAnimal(npc.x, npc.y, 6);
    if (!target) return false;

    const stand = findStandCell(target.x, target.y);
    if (!stand) return false;

    const path = window.GameUtils.findPath(npc.x, npc.y, stand.x, stand.y, 'floor');
    if (path && path.length > 0) {
      npc.task = { type: 'go_to_hunt', path, target };
      return true;
    }
    return false;
  });

  function findNearbyAnimal(x, y, radius) {
    let best = null, bestD = Infinity;
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dy = -radius; dy <= radius; dy++) {
        if (dx === 0 && dy === 0) continue;
        const c = getCell(x + dx, y + dy);
        if (c && c.animal) {
          const d = Math.abs(dx) + Math.abs(dy);
          if (d < bestD) { bestD = d; best = { x: x+dx, y: y+dy, id: c.animal.id }; }
        }
      }
    }
    return best;
  }

  function findStandCell(x, y) {
    const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
    for (const [dx, dy] of dirs) {
      const c = getCell(x + dx, y + dy);
      if (c && !c.monster && !c.animal && c.type && c.type.indexOf('grass') === 0 || (c && (c.type === 'floor' || c.type === 'mushroom' || c.type === 'ruins'))) {
        if (c && !c.monster && !c.animal) return { x: x+dx, y: y+dy };
      }
    }
    return null;
  }

  function resolveHunt(npc, cell, state) {
    const data = ANIMALS[cell.animal.id];
    if (!data) { cell.type = cell.animal.baseType; cell.animal = null; return; }

    if (Math.random() < data.fear) {
      const newPos = findFleeSpot(cell);
      if (newPos) {
        const nc = getCell(newPos.x, newPos.y);
        const baseType = cell.animal.baseType;
        const a = { ...cell.animal, x: newPos.x, y: newPos.y };
        cell.type = baseType;
        cell.animal = null;
        nc.animal = a;
        nc.type = baseType + '_' + a.id;
        nc.seed = nc.seed || Math.floor(Math.random() * 100000);
        Reg.log(`${data.name} убегает от ${npc.name}.`, 'sys');
        npc.task = { type: 'idle', path: [] };
        return;
      }
    }

    state.food = (state.food || 0) + data.meat;
    Reg.log(`${npc.name} убил ${data.name}. Добыча: ${data.meat} еды на складе.`, 'good');
    Reg.addMemory(npc, `Он убил ${data.name}. Мясо на складе.`, { type: 'joy', power: 10, category: 'hunt' });
    cell.type = cell.animal.baseType;
    cell.animal = null;
    npc.task = { type: 'idle', path: [] };
  }

  function findFleeSpot(cell) {
    const a = cell.animal;
    if (!a) return null;
    const dirs = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]];
    for (let i = dirs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
    }
    for (const [dx, dy] of dirs) {
      const c = getCell(a.x + dx, a.y + dy);
      if (c && c.type === a.baseType && !c.animal) return { x: a.x + dx, y: a.y + dy };
    }
    return null;
  }

  // === PATCH findPath: трава проходима ===
  setTimeout(() => {
    if (!window.GameUtils || !window.GameUtils.findPath) return;
    const orig = window.GameUtils.findPath;
    window.GameUtils.findPath = function(sx, sy, tx, ty, targetType) {
      if (!hasGrass) return orig.call(this, sx, sy, tx, ty, targetType);
      const world = window.state && window.state.cells;
      if (!world) return orig.call(this, sx, sy, tx, ty, targetType);
      const saved = [];
      for (const k in world) {
        const c = world[k];
        if (c && typeof c.type === 'string' && c.type.indexOf('grass') === 0) {
          saved.push([c, c.type]);
          c.type = 'floor';
        }
      }
      try { return orig.call(this, sx, sy, tx, ty, targetType); }
      finally { for (const [c, t] of saved) c.type = t; }
    };
  }, 200);

  // === Диагностика ===
  window.debugFauna = function() {
    const s = window.state;
    if (!s) return 'нет state';
    let grass = 0, animals = 0;
    const list = [];
    for (const k in s.cells) {
      const c = s.cells[k];
      if (c.type === 'grass') grass++;
      else if (c.animal) { animals++; list.push(`${c.animal.id} @ ${k}`); }
    }
    return { grassCells: grass, animals, list, food: s.food };
  };
})();
