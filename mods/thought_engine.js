Reg.triggers = {};
Reg.addTrigger = function(itemType, config) { Reg.triggers[itemType] = config; };

Reg.addMemory = function(npc, text, emotion) {
  // ЗАЩИТА: Если эмоция пришла не объектом, а строкой, превращаем её в объект
  if (typeof emotion === 'string') {
    emotion = { type: 'neutral', power: 5, category: 'default' };
  }
  if (!emotion.category) emotion.category = 'default';
  if (!emotion.power) emotion.power = 5;

  if (!npc.memory) return;
  if (!npc.emo) npc.emo = { stress: 0, joy: 20, fear: 0, drunk: 0, anger: 0 };
  if (!text || text === 'undefined') return;
  
  if (npc.memory.shortTerm.length > 0 && npc.memory.shortTerm[0].text === text) return;

  if (emotion.category === 'backstory') {
    const mem = { text, emotion, time: Date.now() };
    npc.memory.longTerm.unshift(mem);
    return;
  }

  const mem = { text, emotion, time: Date.now() };

  // 1. Группировка
  const existingIndex = npc.memory.shortTerm.findIndex(m => m.emotion.category === emotion.category);
  
  if (existingIndex !== -1) {
    const existing = npc.memory.shortTerm[existingIndex];
    if (Math.abs(emotion.power) > Math.abs(existing.emotion.power)) {
      npc.memory.shortTerm.splice(existingIndex, 1);
      npc.memory.shortTerm.unshift(mem);
    }
  } else {
    npc.memory.shortTerm.unshift(mem);
  }

  // 2. Перенос в долгосрочную
  if (Math.abs(emotion.power) >= 30) {
    const longExists = npc.memory.longTerm.find(m => m.emotion.category === emotion.category);
    if (!longExists || Math.abs(emotion.power) > Math.abs(longExists.emotion.power)) {
      npc.memory.longTerm = npc.memory.longTerm.filter(m => m.emotion.category !== emotion.category);
      npc.memory.longTerm.unshift(mem);
      if (npc.memory.longTerm.length > 8) npc.memory.longTerm.pop();
    }
  }

  if (npc.memory.shortTerm.length > 8) npc.memory.shortTerm.pop();

  if (emotion.type === 'joy' || emotion.type === 'awe') npc.emo.joy = Math.min(100, npc.emo.joy + emotion.power / 2);
  if (emotion.type === 'fear' || emotion.type === 'anger' || emotion.type === 'sadness') if (npc.emo.stress < 80) npc.emo.stress = Math.min(100, npc.emo.stress + emotion.power / 2);
};

Reg.on('npc_tick', (npc, state) => {
  if (!npc.memory) return;
  if (Math.random() > 0.05) return;

  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  // 1. Сканируем окружение (включая клетку, на которой стоим)
  for (const [dx, dy] of [[0,0],[0,1],[0,-1],[1,0],[-1,0]]) {
    const c = getCell(npc.x + dx, npc.y + dy);
    if (!c) continue;
    
    let objId = c.type;
    if (c.monster) objId = 'monster';

    // Если объект зарегистрирован в композере, генерируем мысль
    if (Reg.composer.objects[objId]) {
      // С шансом 40% обращаем внимание на объект (чтобы не спамить)
      if (Math.random() < 0.4) {
        const result = Reg.composer.generate(npc, objId);
        if (result) {
          Reg.addMemory(npc, result.text, result.emo);
          return;
        }
      }
    }
  }

  // 2. Если вокруг ничего интересного — мысли о состоянии
  if (npc.emo.stress > 70) {
    Reg.addMemory(npc, pick(["Эта тьма сводит его с ума.", "Он больше не может терпеть."]), { type: 'fear', power: 15, category: 'stress' });
  } else if (npc.hunger > 60) {
    Reg.addMemory(npc, pick(["Живот сводит от голода.", "Он готов съесть камень."]), { type: 'sadness', power: 10, category: 'hunger' });
  } else {
    Reg.addMemory(npc, pick(["Он просто копает.", "Он прислушивается к тишине."]), { type: 'neutral', power: 2, category: 'idle' });
  }
});
