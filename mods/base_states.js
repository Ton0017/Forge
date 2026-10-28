// --- ПСИХИЧЕСКИЕ ---
Reg.registerState({
  id: 'insane',
  name: 'Безумие',
  thought: 'Мир рушится. Камни шепчут его имя.',
  trigger: (npc) => npc.emo.stress >= 100,
  cure: (npc) => npc.emo.stress < 50,
  onTick: (npc) => { npc.hp -= 2; npc.task = { type: 'insane', path: [] }; },
  modifyWeight: (npc, action) => action === 'dig' ? -999 : 0
});

Reg.registerState({
  id: 'depressed',
  name: 'Депрессия',
  thought: 'Всё кажется серым и бессмысленным.',
  trigger: (npc) => npc.emo.joy <= 0,
  cure: (npc) => npc.emo.joy > 30,
  onTick: (npc) => { npc.emo.stress += 2; npc.emo.joy += 1; },
  modifyWeight: (npc, action) => action === 'dig' ? -20 : 0
});

Reg.registerState({
  id: 'paranoid',
  name: 'Паранойя',
  thought: 'Он уверен, что стены двигаются. За ним следят.',
  trigger: (npc) => npc.emo.fear >= 90,
  cure: (npc) => npc.emo.fear < 30,
  onTick: (npc) => { npc.emo.stress += 1; },
  modifyWeight: (npc, action) => action === 'rest' ? -50 : 0
});

Reg.registerState({
  id: 'inspired',
  name: 'Вдохновение',
  thought: 'Он чувствует, что может свернуть горы.',
  trigger: (npc) => npc.emo.joy >= 90,
  cure: (npc) => npc.emo.joy < 50,
  onTick: (npc) => { npc.emo.stress = Math.max(0, npc.emo.stress - 2); },
  modifyWeight: (npc, action) => action === 'dig' ? +50 : 0
});

// --- ФИЗИЧЕСКИЕ И ЗАВИСИМОСТИ ---
Reg.registerState({
  id: 'alcoholic',
  name: 'Алкоголизм',
  thought: 'Руки трясутся. Нужно найти выпивку.',
  trigger: (npc) => npc.longTerm && npc.longTerm.alcoholism >= 100,
  onTick: (npc) => { 
    npc.emo.drunk = Math.max(0, npc.emo.drunk - 2);
    if (npc.emo.drunk <= 0) npc.hp -= 1; // Ломка
  },
  modifyWeight: (npc, action) => action === 'drink' ? +200 : (action === 'dig' ? -30 : 0)
});

Reg.registerState({
  id: 'cirrhosis',
  name: 'Цирроз печени',
  thought: 'Внутри всё горит. Он чувствует, что умирает.',
  trigger: (npc) => npc.longTerm && npc.longTerm.cirrhosis >= 100,
  onTick: (npc) => { npc.hp -= 1; if (Math.random() < 0.01) killNpc(npc, 'умер от цирроза'); },
  modifyWeight: (npc, action) => action === 'dig' ? -100 : 0
});

Reg.registerState({
  id: 'bloodlust',
  name: 'Кровожадность',
  thought: 'Он хочет слышать хруст костей.',
  trigger: (npc) => npc.profession && npc.profession.id === 'guard' && npc.emo.fear === 0 && Math.random() < 0.01,
  onTick: (npc) => { npc.emo.joy += 2; },
  modifyWeight: (npc, action) => action === 'fight' ? +150 : 0
});

// --- СОЦИАЛЬНЫЕ И КУРЬЕЗЫ ---
Reg.registerState({
  id: 'in_love',
  name: 'Влюбленность',
  thought: 'При мысли о коллеге сердце бьется чаще.',
  trigger: (npc) => Math.random() < 0.005, // Редкий шанс
  onTick: (npc) => { npc.emo.joy += 1; npc.emo.stress -= 1; },
  modifyWeight: (npc, action) => action === 'talk' ? +100 : 0
});

Reg.registerState({
  id: 'greedy_obsession',
  name: 'Одержимость золотом',
  thought: 'Золото... Оно должно быть моим.',
  trigger: (npc) => npc.trait && npc.trait.id === 'greedy' && Math.random() < 0.01,
  onTick: (npc) => { npc.emo.stress += 2; },
  modifyWeight: (npc, action) => action === 'deposit' ? +50 : (action === 'eat' ? -20 : 0)
});

Reg.registerState({
  id: 'claustrophobia',
  name: 'Клаустрофобия',
  thought: 'Стены давят. Ему нужно на поверхность.',
  trigger: (npc) => npc.emo.fear > 60 && Math.abs(npc.x) > 15 && Math.abs(npc.y) > 15,
  onTick: (npc) => { npc.emo.stress += 3; },
  modifyWeight: (npc, action) => action === 'dig' ? -50 : (action === 'rest' ? +20 : 0)
});

Reg.registerState({
  id: 'strike',
  name: 'Забастовка',
  thought: 'Он не будет работать, пока ему не заплатят.',
  trigger: () => false,
  cure: (npc) => npc.emo.stress < 30,
  onTick: (npc) => { npc.task = { type: 'idle', path: [] }; },
  modifyWeight: (npc, action) => {
    if (action === 'dig' || action === 'deposit') return -999;
    if (action === 'socialize' || action === 'drink') return +50;
    return 0;
  }
});
