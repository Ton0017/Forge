'use strict';
const TICK_MS = 1000;
let state = null;
let timerId = null;
let selectedNpcId = null;

const $ = id => document.getElementById(id);
const ck = (x, y) => x + ',' + y;

const imgCache = {};
function getImg(src) {
  if (!src) return null;
  if (imgCache[src]) return imgCache[src];
  const img = new Image();
  img.src = encodeURI(src);
  imgCache[src] = img;
  return img;
}

// Вспомогательная функция для модов (поиск пути)
window.GameUtils = {
  findPath: function(sx, sy, tx, ty, type) {
    const queue = [{x: sx, y: sy, path: []}];
    const visited = new Set([ck(sx, sy)]);
    while (queue.length > 0) {
      const cur = queue.shift();
      for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]) {
        const nx = cur.x + dx, ny = cur.y + dy;
        const nk = ck(nx, ny);
        const nCell = getCell(nx, ny);
        if (nx === tx && ny === ty && nCell.type === type) return cur.path;
        if (nCell.type === 'floor' && !nCell.monster && !visited.has(nk)) {
          visited.add(nk);
          queue.push({x: nx, y: ny, path: [...cur.path, {x: nx, y: ny}]});
        }
      }
    }
    return [];
  }
};

function getCell(x, y) { 
  const k = ck(x, y);
  if (!state.cells[k]) {
    state.cells[k] = { type: 'stone', seed: Math.floor(Math.random() * 100000), monster: null, corpse: null };
  }
  return state.cells[k]; 
}

function initWorld() {
  state = { day: 1, tick: 0, gold: 200, ore: 0, food: 20, cells: {}, npcs: [], log: [], forgePos: { x: 0, y: 0 } };
  
  for (let y = -4; y <= 4; y++) {
    for (let x = -4; x <= 4; x++) {
      const isWall = (x === -4 || x === 4 || y === -4 || y === 4);
      state.cells[ck(x, y)] = { type: isWall ? 'stone' : 'floor', seed: Math.floor(Math.random() * 100000), monster: null, corpse: null };
    }
  }
  state.cells[ck(0, 0)].type = 'forge';
  
  // Вызов модов для расстановки мебели!
  Reg.fire('world_init', state);
  
  hireNpc(true);
  addLog('Вы восстановили древнюю кузню.', 'sys');
}

function addLog(text, type = 'normal') {
  if (state.log.length > 0) {
    const last = state.log[state.log.length - 1];
    if (last.text === text && last.day === state.day) return; 
  }
  state.log.push({ day: state.day, text, type });
  if (state.log.length > 100) state.log.shift();
  if ($('panel-chronicle').classList.contains('active')) renderChronicle();
}

function hireNpc(free = false) {
  if (!free && state.gold < 50) { alert('Не хватает золота!'); return; }
  if (!free) state.gold -= 50;
  
  const data = Reg.df.generate();
  const spawnPos = findFreeFloor(0, 0);
  
  const npc = {
    id: 'npc_' + Date.now() + Math.random(),
    ...data,
    x: spawnPos.x, y: spawnPos.y,
    task: { type: 'idle', path: [] },
    alive: true,
    inv: { ore: 0 }
  };
  
  state.npcs.push(npc);
  addLog(`Нанят ${npc.name} (${npc.profession.name}).`, 'good');
  Reg.fire('npc_hired', npc);
  
  if (!selectedNpcId) selectedNpcId = npc.id;
  if ($('panel-crew').classList.contains('active')) renderCrew();
}

function findFreeFloor(cx, cy) {
  for (let r = 1; r < 10; r++) {
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) {
        const c = getCell(x, y);
        if (c && c.type === 'floor' && !c.monster && !state.npcs.find(n => n.x === x && n.y === y)) return { x, y };
      }
    }
  }
  return { x: cx, y: cy };
}

function findAdjacentMonster(x, y) {
  for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]) {
    const c = getCell(x + dx, y + dy);
    if (c && c.monster) return { ...c.monster, x: x + dx, y: y + dy };
  }
  return null;
}

function findPathToClosestWall(startX, startY) {
  const queue = [{x: startX, y: startY, path: []}];
  const visited = new Set([ck(startX, startY)]);
  while (queue.length > 0) {
    const cur = queue.shift();
    for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const nx = cur.x + dx, ny = cur.y + dy;
      const nk = ck(nx, ny);
      const nCell = getCell(nx, ny);
      if (nCell.type === 'stone' || nCell.type === 'ore') return cur.path;
      if (nCell.type === 'floor' && !nCell.monster && !visited.has(nk)) {
        visited.add(nk);
        queue.push({x: nx, y: ny, path: [...cur.path, {x: nx, y: ny}]});
      }
    }
  }
  return [];
}

function updateNpc(npc) {
  if (!npc.alive) return;
  
  // ХУК: Если мод (utility_ai.js) обработал тик, ядро останавливается.
  if (Reg.fire('npc_tick', npc, state)) return;

  npc.hunger += 1;
  if (npc.hunger >= 100) {
    npc.hp -= 5;
    if (npc.hp <= 0) killNpc(npc, 'умер от голода');
    return;
  }

  if (npc.hunger > 70 && state.food > 0) {
    state.food--;
    npc.hunger = 0;
    npc.hp = Math.min(npc.maxHp, npc.hp + 20);
    addLog(`${npc.name} поел.`, 'normal');
    npc.task = { type: 'idle', path: [] };
    return;
  }

  const monster = findAdjacentMonster(npc.x, npc.y);
  if (monster) {
    npc.task = { type: 'fight' };
    Reg.fire('combat_start', npc, monster);
    monster.hp -= 15;
    if (monster.hp <= 0) {
      getCell(monster.x, monster.y).monster = null;
      addLog(`${npc.name} убил ${monster.name}!`, 'good');
    } else {
      npc.hp -= monster.atk;
      if (npc.hp <= 0) killNpc(npc, `убит ${monster.name}`);
    }
    return; 
  }

  let adjacentWall = null;
  for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]) {
    const c = getCell(npc.x + dx, npc.y + dy);
    if (c && (c.type === 'stone' || c.type === 'ore')) { adjacentWall = { x: npc.x + dx, y: npc.y + dy }; break; }
  }

  if (adjacentWall) {
    npc.task = { type: 'dig', path: [] };
    const cell = getCell(adjacentWall.x, adjacentWall.y);
    const wasOre = cell.type === 'ore';
    cell.type = 'floor';
    state.ore += (wasOre ? 3 : 1);
    if (wasOre) addLog(`${npc.name} нашел руду!`, 'good');
    return;
  }

  if (!npc.task.path || npc.task.path.length === 0) {
    const newPath = findPathToClosestWall(npc.x, npc.y);
    if (newPath.length > 0) npc.task = { type: 'move_to_wall', path: newPath };
    else npc.task = { type: 'wander', path: [] };
  }

  if (npc.task.type === 'move_to_wall' && npc.task.path.length > 0) {
    const nextStep = npc.task.path.shift();
    if (!state.npcs.find(n => n.alive && n.x === nextStep.x && n.y === nextStep.y)) { npc.x = nextStep.x; npc.y = nextStep.y; return; }
    else npc.task.path = [];
  }

  if (npc.task.type === 'wander') {
    const dirs = [[0,1],[0,-1],[1,0],[-1,0]].sort(() => Math.random() - 0.5);
    for (const [dx, dy] of dirs) {
      const nx = npc.x + dx, ny = npc.y + dy;
      const c = getCell(nx, ny);
      if (c && c.type === 'floor' && !c.monster) { npc.x = nx; npc.y = ny; break; }
    }
  }
}

function killNpc(npc, reason) {
  npc.alive = false;
  npc.hp = 0;
  getCell(npc.x, npc.y).corpse = { name: npc.name, ticksLeft: 15 };
  addLog(`Смерть: ${npc.name} ${reason}.`, 'death');
  if (selectedNpcId === npc.id) {
    const aliveNpc = state.npcs.find(n => n.alive);
    selectedNpcId = aliveNpc ? aliveNpc.id : null;
  }
  if ($('panel-crew').classList.contains('active')) renderCrew();
}

function spawnMonster() {
  const floors = [];
  for (const k in state.cells) {
    const c = state.cells[k];
    if (c.type === 'floor' && !c.monster) {
      const [x, y] = k.split(',').map(Number);
      if (Math.abs(x) > 5 || Math.abs(y) > 5) floors.push({ x, y });
    }
  }
  if (floors.length === 0) return;
  const p = floors[Math.floor(Math.random() * floors.length)];
  const cell = getCell(p.x, p.y);
  const mDef = Math.random() < 0.8 ? Reg.monsters.rat : Reg.monsters.zombie;
  cell.monster = { ...mDef, x: p.x, y: p.y, hp: mDef.hp };
}

function worldTick() {
  state.tick++;
  if (state.tick % 20 === 0) state.day++;
  
  // ВЫЗЫВАЕМ ГЛОБАЛЬНОЕ СОБЫТИЕ ТИКА ДЛЯ МОДОВ (Караваны, Экономика, Слухи)
  Reg.fire('tick', state);
  
  state.npcs.forEach(npc => { if (npc.alive) updateNpc(npc); });

  for (const k in state.cells) {
    const c = state.cells[k];
    if (c.corpse) {
      c.corpse.ticksLeft--;
      if (c.corpse.ticksLeft <= 0) {
        c.corpse = null;
        const mDef = Reg.monsters.zombie;
        const [x, y] = k.split(',').map(Number);
        c.monster = { ...mDef, x, y, hp: mDef.hp };
        addLog(`Тело остается гнить.`, 'death');
      }
    }
    if (c.monster) {
      const [mx, my] = k.split(',').map(Number);
      const targetNpc = state.npcs.find(n => n.alive && Math.abs(n.x - mx) + Math.abs(n.y - my) < 6);
      if (targetNpc) {
        const dx = Math.sign(targetNpc.x - mx);
        const dy = Math.sign(targetNpc.y - my);
        const nc = getCell(mx + dx, my + dy);
        if (nc && nc.type === 'floor' && !nc.monster) {
          nc.monster = c.monster;
          nc.monster.x = mx + dx; nc.monster.y = my + dy;
          c.monster = null;
        }
      }
    }
  }

  if (Math.random() < 0.15) spawnMonster();
  if (state.tick % 20 === 0) saveGame();
  renderUI();
}

function renderUI() {
  $('ui-gold').textContent = state.gold;
  $('ui-ore').textContent = state.ore;
  $('ui-food').textContent = state.food;
  $('ui-day').textContent = 'День ' + state.day;
  renderMap();
  if ($('panel-crew').classList.contains('active')) renderCrew();
}

function renderMap() {
  const canvas = $('gameCanvas');
  const ctx = canvas.getContext('2d');
  const CW = 32, CH = 32;
  const COLS = Math.floor(canvas.width / CW);
  const ROWS = Math.floor(canvas.height / CH);
  
  let camX = state.forgePos.x - Math.floor(COLS/2);
  let camY = state.forgePos.y - Math.floor(ROWS/2);
  if (selectedNpcId) {
    const n = state.npcs.find(n => n.id === selectedNpcId && n.alive);
    if (n) { camX = n.x - Math.floor(COLS/2); camY = n.y - Math.floor(ROWS/2); }
  }

  ctx.fillStyle = '#0a0a0f';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let ry = 0; ry < ROWS; ry++) {
    for (let rx = 0; rx < COLS; rx++) {
      const wx = camX + rx, wy = camY + ry;
      const cell = getCell(wx, wy);
      const sx = rx * CW, sy = ry * CH;
      
      const fn = Reg.tiles[cell.type];
      if (fn) fn(ctx, sx, sy, cell.seed);
      
      if (cell.corpse) { ctx.fillStyle = '#555'; ctx.fillRect(sx + 10, sy + 18, 12, 8); }
      if (cell.monster && cell.monster.draw) cell.monster.draw(ctx, sx, sy);
    }
  }

  for (const npc of state.npcs) {
    if (!npc.alive) continue;
    const sx = (npc.x - camX) * CW;
    const sy = (npc.y - camY) * CH;
    if (sx < -32 || sy < -32 || sx > canvas.width || sy > canvas.height) continue;

    let drewImage = false;
    if (npc.skinFile) {
      const img = getImg('assets/skins/' + npc.skinFile);
      if (img && img.complete && img.naturalWidth > 0) { ctx.drawImage(img, sx, sy, 32, 32); drewImage = true; }
    }
    if (!drewImage) {
      ctx.fillStyle = '#a83838'; ctx.fillRect(sx + 4, sy + 4, 24, 24);
      ctx.fillStyle = '#fff'; ctx.font = '14px monospace'; ctx.fillText(npc.name[0], sx + 12, sy + 20);
    }

    ctx.fillStyle = '#000'; ctx.fillRect(sx, sy - 6, 32, 4);
    ctx.fillStyle = '#a83838'; ctx.fillRect(sx, sy - 6, 32 * (npc.hp / npc.maxHp), 4);
    if (npc.id === selectedNpcId) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.strokeRect(sx, sy, CW, CH); }
  }
}

function renderCrew() {
  const list = $('crew-list');
  list.innerHTML = '';
  for (const npc of state.npcs) {
    if (!npc.alive) continue;
    const card = document.createElement('div');
    card.className = 'npc-card';
    if (npc.id === selectedNpcId) card.style.borderColor = '#fff';
    
    let imgHtml = npc.skinFile ? `<img src="assets/skins/${encodeURI(npc.skinFile)}" alt="skin">` : `<div style="width:48px;height:48px;background:${npc.profession.color};"></div>`;

    card.innerHTML = `
      ${imgHtml}
      <div class="npc-info">
        <div class="name">${npc.name}</div>
        <div class="task">${npc.profession.name} | ${npc.trait.name}</div>
        <div class="task" style="color:#a09080;">Задача: ${
          npc.task.type === 'dig' ? 'Копает' : 
          npc.task.type === 'fight' ? 'Драка!' : 
          npc.task.type === 'go_to_eat' ? 'Идет к котлу' : 
          npc.task.type === 'go_to_deposit' ? 'Идет на склад' : 
          npc.task.type === 'go_to_rest' ? 'Идет спать' : 'Отдыхает'
        }</div>
        <div class="bar-bg"><div class="bar-fill bar-hp" style="width:${(npc.hp/npc.maxHp)*100}%"></div></div>
        <div class="bar-bg"><div class="bar-fill bar-food" style="width:${100 - npc.hunger}%"></div></div>
      </div>
    `;
    card.onclick = () => { selectedNpcId = npc.id; closePanels(); renderMap(); renderCrew(); };
    list.appendChild(card);
  }
}

function renderChronicle() {
  const el = $('chronicle-text');
  el.innerHTML = state.log.slice().reverse().map(l => `<div class="log-entry ${l.type}"><b>День ${l.day}:</b> ${l.text}</div>`).join('');
}

window.closePanels = function() {
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
};

function saveGame() { try { localStorage.setItem('forge_save', JSON.stringify({ state, tick: state.tick })); } catch (e) {} }
function loadGame() {
  try {
    const data = localStorage.getItem('forge_save');
    if (data) { 
      state = JSON.parse(data).state; 
      if (state && state.cells) {
         const hasPot = Object.values(state.cells).some(c => c.type === 'pot');
         if (!hasPot) Reg.fire('world_init', state);
      }
      return true; 
    }
  } catch (e) {}
  return false;
}

window.BootGame = function() {
  Reg.log = addLog;
  const canvas = $('gameCanvas');
  function resizeCanvas() {
    canvas.width = $('canvas-container').clientWidth;
    canvas.height = $('canvas-container').clientHeight;
    if (state) renderMap();
  }
  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 100);

  const findIcon = (name) => {
    const f = Reg.assets.icons.find(i => i.toLowerCase().includes(name.toLowerCase()));
    return f ? 'assets/icons/' + encodeURI(f) : '';
  };
  
  $('ui-gold-icon').src = findIcon('silver coins');
  $('ui-ore-icon').src = findIcon('ore') || findIcon('diamond');
  $('ui-food-icon').src = findIcon('boiler');
  $('tab-icon-crew').src = findIcon('people show up') || findIcon('thumbs up');
  $('tab-icon-forge').src = findIcon('anvil');
  $('tab-icon-trade').src = findIcon('open chest');
  $('tab-icon-chronicle').src = 'assets/equipment/' + encodeURI('cursed parchment.png');

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.onclick = () => {
      const isActive = btn.classList.contains('active');
      closePanels();
      if (!isActive) {
        btn.classList.add('active');
        $('panel-' + btn.dataset.tab).classList.add('active');
        if (btn.dataset.tab === 'chronicle') renderChronicle();
        if (btn.dataset.tab === 'crew') renderCrew();
      }
    };
  });

  $('btn-hire').onclick = () => hireNpc(false);

  $('btn-start').onclick = () => { $('menu-overlay').classList.add('hidden'); initWorld(); if (!timerId) timerId = setInterval(worldTick, TICK_MS); renderUI(); };
  $('btn-continue').onclick = () => { if (loadGame()) { $('menu-overlay').classList.add('hidden'); if (!timerId) timerId = setInterval(worldTick, TICK_MS); renderUI(); } else alert('Сохранений не найдено'); };
};
