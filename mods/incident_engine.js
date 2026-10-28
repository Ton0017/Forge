// Кулдауны для инцидентов, чтобы не спамили
const cooldowns = {};

Reg.on('tick', (state) => {
  // Проверяем раз в 5 тиков, чтобы не грузить браузер
  if (state.tick % 5 !== 0) return;

  // 1. КОНФЛИКТ: Воровство еды (Голод + Жадность)
  // Ищем голодного дварфа и того, у кого есть еда (или на складе)
  state.npcs.forEach(npc => {
    if (!npc.alive || npc.hunger < 70) return;
    if (cooldowns['steal_food_' + npc.id] > state.tick) return;

    // Если у него высокая жадность или низкая лояльность
    const isGreedy = npc.facets && npc.facets.greed > 60;
    const isDisloyal = npc.values && npc.values.loyalty < -10;

    if ((isGreedy || isDisloyal) && state.food > 0 && Math.random() < 0.3) {
      // Ворует еду у общины
      state.food--;
      npc.hunger = 0;
      cooldowns['steal_food_' + npc.id] = state.tick + 100; // 100 тиков кулдаун

      Reg.log(`${npc.name} тайком пробирается к котлу и ворует еду!`, 'combat');
      Reg.addMemory(npc, `Он украл еду. Никто не видел. Или видел?`, { type: 'fear', power: 15, category: 'crime' });

      // Если рядом есть другой дварф, он может стать свидетелем
      const witness = state.npcs.find(n => n.alive && n.id !== npc.id && Math.abs(n.x - npc.x) + Math.abs(n.y - npc.y) <= 3);
      if (witness) {
        // Свидетель осуждает вора
        if (!witness.relations) witness.relations = {};
        witness.relations[npc.id] = (witness.relations[npc.id] || 0) - 30;
        Reg.log(`${witness.name} заметил, как ${npc.name} ворует еду!`, 'combat');
        Reg.addMemory(witness, `Он видел, как ${npc.name} ворует. Это низко.`, { type: 'anger', power: 20, category: 'social' });
      }
    }
  });

  // 2. КОНФЛИКТ: Ссора из-за работы (Стресс + Плохие отношения)
  state.npcs.forEach(npc => {
    if (!npc.alive || !npc.relations) return;
    if (npc.emo.stress < 60) return;
    if (cooldowns['argument_' + npc.id] > state.tick) return;

    // Ищем рядом того, с кем плохие отношения
    const enemy = state.npcs.find(n => 
      n.alive && n.id !== npc.id && 
      Math.abs(n.x - npc.x) + Math.abs(n.y - npc.y) <= 2 &&
      npc.relations[n.id] < -20
    );

    if (enemy && Math.random() < 0.2) {
      cooldowns['argument_' + npc.id] = state.tick + 150;
      cooldowns['argument_' + enemy.id] = state.tick + 150;

      Reg.log(`${npc.name} срывается на ${enemy.name}: "Ты копаешь слишком медленно, бездельник!"`, 'combat');
      
      // Эмоции и отношения
      npc.emo.stress += 10;
      enemy.emo.stress += 20;
      npc.relations[enemy.id] -= 10;
      enemy.relations[npc.id] = (enemy.relations[npc.id] || 0) - 10;

      Reg.addMemory(npc, `Он накричал на ${enemy.name}. Стало легче.`, { type: 'anger', power: 10, category: 'social' });
      Reg.addMemory(enemy, `${npc.name} оскорбил его. Он этого не забудет.`, { type: 'anger', power: 25, category: 'social' });
    }
  });

  // 3. ИНЦИДЕНТ: Психический срыв (Высокий стресс + Одиночество)
  state.npcs.forEach(npc => {
    if (!npc.alive || npc.emo.stress < 85) return;
    if (cooldowns['breakdown_' + npc.id] > state.tick) return;

    // Если рядом никого нет
    const alone = !state.npcs.find(n => n.alive && n.id !== npc.id && Math.abs(n.x - npc.x) + Math.abs(n.y - npc.y) <= 3);
    
    if (alone && Math.random() < 0.1) {
      cooldowns['breakdown_' + npc.id] = state.tick + 200;
      
      Reg.log(`${npc.name} остается один в темноте. Он начинает громко рыдать.`, 'death');
      
      // Ищем ближайший камень, чтобы ударить по нему
      const adjWall = [[0,1],[0,-1],[1,0],[-1,0]].map(([dx,dy]) => getCell(npc.x+dx, npc.y+dy)).find(c => c && c.type === 'stone');
      
      if (adjWall) {
        adjWall.type = 'floor'; // Ломает камень от злости
        Reg.log(`${npc.name} в ярости разбивает камень голыми руками.`, 'combat');
        npc.hp -= 10;
      }
      
      Reg.addMemory(npc, `Он остался один. Никто не придет.`, { type: 'sadness', power: 30, category: 'trauma' });
    }
  });

  // 4. ИНЦИДЕНТ: Пьяная драка (Таверна)
  const drunkDwarves = state.npcs.filter(n => n.alive && n.emo.drunk > 60);
  if (drunkDwarves.length >= 2) {
    const a = drunkDwarves[0];
    const b = drunkDwarves[1];
    if (Math.abs(a.x - b.x) + Math.abs(a.y - b.y) <= 2 && Math.random() < 0.1) {
      if (cooldowns['bar_fight_' + a.id] > state.tick) return;
      cooldowns['bar_fight_' + a.id] = state.tick + 100;
      
      Reg.log(`Пьяный ${a.name} затевает драку с ${b.name} в таверне!`, 'combat');
      a.hp -= 15;
      b.hp -= 15;
      if (!a.relations) a.relations = {};
      if (!b.relations) b.relations = {};
      
      a.relations[b.id] = (a.relations[b.id] || 0) - 40;
      b.relations[a.id] = (b.relations[a.id] || 0) - 40;
      
      Reg.addMemory(a, `Он подрался с ${b.name} в таверне.`, { type: 'anger', power: 20, category: 'social' });
      Reg.addMemory(b, `Пьяный ${a.name} набросился на него.`, { type: 'anger', power: 25, category: 'social' });
      
      if (a.hp <= 0) killNpc(a, 'убит в пьяной драке');
      if (b.hp <= 0) killNpc(b, 'убит в пьяной драке');
    }
  }
});
