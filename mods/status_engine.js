// Глобальный реестр состояний
Reg.states = {};

// API: Регистрация нового состояния для модов
Reg.registerState = function(def) {
  Reg.states[def.id] = def;
};

// Применение состояния к персонажу
Reg.applyState = function(npc, stateId) {
  if (!npc.states) npc.states = {};
  if (npc.states[stateId]) return; // Уже есть
  
  const def = Reg.states[stateId];
  if (!def) return;
  
  npc.states[stateId] = { duration: 0, level: 1 };
  Reg.log(`[Состояние] ${npc.name}: ${def.name}`, 'sys');
  
  // Добавляем мысль
  if (def.thought) {
    Reg.addMemory(npc, def.thought, {});
  }
};

// Снятие состояния
Reg.removeState = function(npc, stateId) {
  if (npc.states && npc.states[stateId]) {
    delete npc.states[stateId];
  }
};

// Инициализация при найме
Reg.on('npc_hired', (npc) => {
  npc.states = {};
  npc.emo = { stress: 0, joy: 20, fear: 0, drunk: 0, paranoia: 0 };
  npc.longTerm = { alcoholism: 0, greed: 0, trauma: 0 };
});

// ГЛАВНЫЙ ЦИКЛ ОБНОВЛЕНИЯ СОСТОЯНИЙ
Reg.on('npc_tick', (npc, state) => {
  if (!npc.states) return;
  if (!npc.emo) npc.emo = { stress: 0, joy: 20, fear: 0, drunk: 0, paranoia: 0 };

  // 1. Проверяем триггеры для новых состояний
  for (let id in Reg.states) {
    const def = Reg.states[id];
    if (!npc.states[id] && def.trigger && def.trigger(npc)) {
      Reg.applyState(npc, id);
    }
  }

  // 2. Обновляем активные состояния (эффекты, длительность)
  for (let id in npc.states) {
    const def = Reg.states[id];
    const inst = npc.states[id];
    
    inst.duration++;
    
    // Эффект каждого тика (например, урон от ломки)
    if (def.onTick) def.onTick(npc, inst);
    
    // Проверка на исцеление
    if (def.cure && def.cure(npc)) {
      Reg.removeState(npc, id);
    }
  }
});
