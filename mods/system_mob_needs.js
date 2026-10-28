(function(){
  // ДИЕТА — данные
  const DIET = {
    carnivore: ['wolf', 'fox', 'bear', 'cat', 'troll', 'ork', 'goblin', 'skeleton', 'ghoul', 'knight'],
    herbivore: ['rabbit', 'deer', 'elk', 'duck', 'sheep', 'rooster', 'rhinoceros'],
    omnivore:  ['boar', 'rat', 'raccoon', 'toad', 'zombie']
  };
  function dietOf(id) {
    if (DIET.carnivore.includes(id)) return 'carnivore';
    if (DIET.herbivore.includes(id)) return 'herbivore';
    if (DIET.omnivore.includes(id)) return 'omnivore';
    return 'omnivore';
  }

  function findFood(state, x, y, diet) {
    let best = null, bestDist = 999;
    for (let dx = -3; dx <= 3; dx++) {
      for (let dy = -3; dy <= 3; dy++) {
        const d = Math.abs(dx) + Math.abs(dy);
        if (d === 0 || d >= bestDist) continue;
        const c = getCell(x + dx, y + dy);
        if (!c) continue;

        if (diet === 'carnivore' || diet === 'omnivore') {
          if (c.corpse) { best = { kind: 'corpse', x: x + dx, y: y + dy, cell: c }; bestDist = d; continue; }
          if (c.items && c.items.some(i => i.tags && i.tags.includes('meat'))) {
            best = { kind: 'meat', x: x + dx, y: y + dy, cell: c }; bestDist = d; continue;
          }
        }
        if (diet === 'herbivore' || diet === 'omnivore') {
          if (c.type === 'grass_berry' || c.type === 'mushroom') {
            best = { kind: 'plant', x: x + dx, y: y + dy, cell: c }; bestDist = d;
          }
        }
      }
    }
    return best;
  }

  function eatFood(mob, food) {
    if (food.kind === 'corpse') {
      food.cell.corpse = null;
      mob.hunger = Math.max(0, (mob.hunger || 0) - 50);
    } else if (food.kind === 'meat') {
      const idx = food.cell.items.findIndex(i => i.tags && i.tags.includes('meat'));
      if (idx >= 0) food.cell.items.splice(idx, 1);
      mob.hunger = Math.max(0, (mob.hunger || 0) - 50);
    } else if (food.kind === 'plant') {
      food.cell.type = 'floor';
      mob.hunger = Math.max(0, (mob.hunger || 0) - 30);
    }
    if (window.recordMobAction) window.recordMobAction(mob, 'ate');
    const txt = window.generateMobActionText ? window.generateMobActionText(mob) : 'Он поел.';
    Reg.log(`${mob.name}: ${txt}`, 'sys');
  }

  Reg.on('tick', (state) => {
    if (state.tick % 20 !== 0) return;

    for (let k in state.cells) {
      const c = state.cells[k];
      const mob = c.animal || c.monster;
      if (!mob) continue;

      const [x, y] = k.split(',').map(Number);

      mob.hunger = Math.min(100, (mob.hunger || 0) + 0.15);
      mob.thirst = Math.min(100, (mob.thirst || 0) + 0.25);

      if (mob.hunger >= 100) {
        c.animal = null; c.monster = null;
        if (!c.corpse) c.corpse = { name: mob.name, sprite: mob.sprite };
        if (window.recordMobAction) window.recordMobAction(mob, 'starved');
        const stxt = window.generateMobActionText ? window.generateMobActionText(mob) : 'умер от голода.';
        Reg.log(`${mob.name}: ${stxt}`, 'death');
        continue;
      }
      if (mob.thirst >= 100) {
        c.animal = null; c.monster = null;
        if (!c.corpse) c.corpse = { name: mob.name, sprite: mob.sprite };
        Reg.log(`${mob.name} умирает от жажды.`, 'death');
        continue;
      }

      if (mob.hunger > 70 && !mob._seekingFood) {
        const food = findFood(state, x, y, dietOf(mob.id));
        if (food) mob._seekingFood = { x: food.x, y: food.y, kind: food.kind };
      }

      if (mob._seekingFood) {
        const t = mob._seekingFood;
        const dist = Math.abs(x - t.x) + Math.abs(y - t.y);
        if (dist <= 1) {
          const food = findFood(state, x, y, dietOf(mob.id));
          if (food) eatFood(mob, food);
          mob._seekingFood = null;
        } else {
          const stepX = Math.sign(t.x - x);
          const stepY = Math.sign(t.y - y);
          const next = getCell(x + stepX, y + stepY);
          if (next && next.type !== 'stone' && next.type !== 'water' && !next.animal && !next.monster) {
            next.animal = mob;
            c.animal = null;
            mob.x = x + stepX;
            mob.y = y + stepY;
          } else {
            mob._seekingFood = null;
          }
        }
      }
    }
  });

  console.log('[Mob Needs] Шестерёнка голода и жажды запущена.');
})();
