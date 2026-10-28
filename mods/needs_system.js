Reg.on('npc_hired', (npc) => {
  npc.needs = {
    social: 0, // Потребность в общении
    family: 0, // Потребность в семье
    recognition: 0 // Потребность в признании
  };
});

Reg.on('npc_tick', (npc, state) => {
  if (!npc.needs || !npc.values) return;

  // Потребности растут со временем, если их не удовлетворять
  npc.needs.social = Math.min(100, npc.needs.social + 0.5);
  npc.needs.family = Math.min(100, npc.needs.family + 0.2);
  npc.needs.recognition = Math.min(100, npc.needs.recognition + 0.3);

  // Если ценность FAMILY высокая, потребность в семье растет быстрее
  if (npc.values.family > 30) npc.needs.family = Math.min(100, npc.needs.family + 0.5);
  
  // Если ценность POWER высокая, потребность в признании растет быстрее
  if (npc.values.power > 30) npc.needs.recognition = Math.min(100, npc.needs.recognition + 0.5);

  // Если потребность слишком высокая, это вызывает стресс
  if (npc.needs.social > 80) npc.emo.stress = Math.min(100, npc.emo.stress + 0.5);
  if (npc.needs.family > 80) npc.emo.stress = Math.min(100, npc.emo.stress + 0.5);
  if (npc.needs.recognition > 80) npc.emo.stress = Math.min(100, npc.emo.stress + 0.5);
});
