Reg.on('npc_hired', (npc) => {
  npc.monsterStats = { kills: {}, trauma: {} };
});

// При убийстве монстра
Reg.on('monsterDeath', (monster, npc, state) => {
  if (!npc.monsterStats) return;
  const mType = monster.id;
  
  npc.monsterStats.kills[mType] = (npc.monsterStats.kills[mType] || 0) + 1;
  
  if (Math.random() < 0.5) {
    // Берем фразу из пула убийств или абсурда
    const pool = Math.random() < 0.8 ? Reg.monsterPool.kill : Reg.monsterPool.absurd;
    const phrase = pool[Math.floor(Math.random() * pool.length)];
    const text = `${phrase} (${monster.name})`;
    Reg.addMemory(npc, text, { type: 'joy', power: 15, category: 'monster_kill' });
  }
});

// При получении травмы
let lastHp = {};
Reg.on('npc_tick', (npc, state) => {
  if (!npc.monsterStats) return;
  
  if (lastHp[npc.id] !== undefined && npc.hp < lastHp[npc.id]) {
    const monster = findAdjacentMonster(npc.x, npc.y);
    if (monster) {
      npc.monsterStats.trauma[monster.id] = (npc.monsterStats.trauma[monster.id] || 0) + 1;
      
      if (npc.monsterStats.trauma[monster.id] === 1) {
        // Берем фразу из пула травм
        const pool = Reg.monsterPool.trauma;
        const phrase = pool[Math.floor(Math.random() * pool.length)];
        const text = `${phrase} (${monster.name})`;
        Reg.addMemory(npc, text, { type: 'fear', power: 60, category: 'monster_trauma' });
      }
    }
  }
  lastHp[npc.id] = npc.hp;
});
