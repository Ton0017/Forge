Reg.on('npc_hired', (npc) => {
  npc.emo = { stress: 0, joy: 20, fear: 0, drunk: 0 };
  npc.states = {}; npc.mass = 65 + Math.floor(Math.random() * 15); npc.size = 3; npc.materials = ['flesh', 'bone'];

  npc.facets = {
    greed: Math.floor(Math.random() * 100),
    diligence: Math.floor(Math.random() * 100),
    courage: Math.floor(Math.random() * 100),
    curiosity: Math.floor(Math.random() * 100),
    aesthetics: Math.floor(Math.random() * 100),
    altruism: Math.floor(Math.random() * 100)
  };
  
  npc.memory = {
    shortTerm: [],
    longTerm: []
  };
  
  const story = Reg.generateBackstory(npc);
  // ВАЖНО: Ставим power: 100, чтобы воспоминание ушло в Долгосрочную память!
  Reg.addMemory(npc, story, { type: 'sadness', power: 100 });
});
