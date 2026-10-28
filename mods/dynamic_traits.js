// Функция изменения грани (0-100)
function changeFacet(npc, facetName, amount) {
  if (!npc.facets || npc.facets[facetName] === undefined) return;
  let newVal = npc.facets[facetName] + amount;
  
  // ЗАЩИТА ОТ ПЕРЕКОСА: Если уходит в крайность (выше 85 или ниже 15), 
  // сила изменения уменьшается (сопротивление)
  if (newVal > 85 && amount > 0) amount *= 0.3;
  if (newVal < 15 && amount < 0) amount *= 0.3;
  
  npc.facets[facetName] = Math.max(0, Math.min(100, npc.facets[facetName] + amount));
}

// Функция изменения ценности (-50..50)
function changeValue(npc, valueName, amount) {
  if (!npc.values || npc.values[valueName] === undefined) return;
  let newVal = npc.values[valueName] + amount;
  
  if (newVal > 40 && amount > 0) amount *= 0.3;
  if (newVal < -40 && amount < 0) amount *= 0.3;
  
  npc.values[valueName] = Math.max(-50, Math.min(50, npc.values[valueName] + amount));
}

// ЗАТУХАНИЕ (Decay): Раз в день характеристики тяготеют к норме (50 для граней, 0 для ценностей)
Reg.on('tick', (state) => {
  if (state.tick % 20 !== 0) return; // Раз в день

  state.npcs.forEach(npc => {
    if (!npc.alive) return;
    
    // Затухание для граней (медленно тянет к 50)
    for (let key in npc.facets) {
      if (npc.facets[key] > 60) npc.facets[key] -= 0.1;
      else if (npc.facets[key] < 40) npc.facets[key] += 0.1;
    }
    
    // Затухание для ценностей (тянет к 0)
    for (let key in npc.values) {
      if (npc.values[key] > 5) npc.values[key] -= 0.05;
      else if (npc.values[key] < -5) npc.values[key] += 0.05;
    }
  });
});

// СОБЫТИЙНЫЕ ИЗМЕНЕНИЯ (Только когда что-то происходит)
Reg.on('monsterDeath', (monster, npc, state) => {
  if (!npc) return;
  // Убил монстра -> растет гнев и храбрость
  changeFacet(npc, 'anger', 0.5);
  changeFacet(npc, 'courage', 0.5);
  
  if (monster.id === 'troll') {
    changeFacet(npc, 'courage', 2);
    changeValue(npc, 'martial_prowess', 1);
  }
});

Reg.on('tile_dug', (cell, npc, state) => {
  if (!npc) return;
  // Копнул камень -> растет трудолюбие
  changeFacet(npc, 'diligence', 0.1);
  // Если нашел руду -> радость
  if (cell.type === 'ore') changeFacet(npc, 'cheer', 0.2);
});

// Питье (если вызывается из ИИ)
Reg.on('tick', (state) => {
  if (state.tick % 50 !== 0) return;
  state.npcs.forEach(npc => {
    if (npc.alive && npc.emo && npc.emo.drunk > 50) {
      changeFacet(npc, 'diligence', -0.1);
      changeFacet(npc, 'cheer', 0.2);
    }
  });
});
