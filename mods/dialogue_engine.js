// База для генератора
Reg.dlgWords = {
  verbsAngry: ['накричал на', 'прорычал', 'обругал', 'ткнул пальцем в сторону', 'злобно зыркнул на'],
  verbsSad: ['пожаловался', 'устало вздохнул', 'рассказал о своих бедах', 'прошептал', 'поделился печалью с'],
  verbsHappy: ['похвастался перед', 'рассмеялся и хлопнул по плечу', 'радостно сообщил', 'подмигнул'],
  verbsNeutral: ['обратился к', 'заговорил с', 'спросил совет у', 'обсудил дела с'],

  reactionsAngry: ['Он в ужасе отшатнулся.', 'Он разозлился в ответ.', 'Он молча сжал кулаки.', 'Он сплюнул на пол.'],
  reactionsSad: ['Он понимающе кивнул.', 'Он тяжело вздохнул в ответ.', 'Он предложил ему свою поддержку.', 'Он промолчал, глядя в стену.'],
  reactionsHappy: ['Он рассмеялся.', 'Он улыбнулся в ответ.', 'Он хлопнул его по спине.', 'Он разделил его радость.'],
  reactionsNeutral: ['Он кивнул.', 'Он внимательно выслушал.', 'Он пожал плечами.', 'Он просто продолжал работать.']
};

// Генератор контекста (на что смотрит, что делает)
Reg.getDialogueContext = function(npc, state) {
  // 1. Проверяем, есть ли рядом объекты (мебель, монстры)
  for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]) {
    const c = getCell(npc.x + dx, npc.y + dy);
    if (!c) continue;
    
    if (c.type === 'bed') return { topic: 'ненавистную кровать', type: 'sad', reason: 'потому что она слишком жесткая' };
    if (c.type === 'forge') return { topic: 'раскаленную кузню', type: 'neutral', reason: 'обсуждая планы на завтра' };
    if (c.type === 'pot') return { topic: 'пустой котел', type: 'sad', reason: 'из-за вечного голода' };
    if (c.type === 'storage') return { topic: 'гору руды на складе', type: 'happy', reason: 'радуясь хорошей добыче' };
    if (c.type === 'altar') return { topic: 'древний алтарь', type: 'neutral', reason: 'размышляя о богах' };
    if (c.monster) return { topic: `монстра (${c.monster.name})`, type: 'angry', reason: 'который чуть не убил его' };
  }

  // 2. Проверяем состояние персонажа
  if (npc.emo.stress > 60) return { topic: 'эту проклятую шахту', type: 'angry', reason: 'потому что он больше не может терпеть' };
  if (npc.hunger > 60) return { topic: 'свою пустую миску', type: 'sad', reason: 'из-за голода' };
  if (npc.fatigue > 60) return { topic: 'свою работу', type: 'sad', reason: 'потому что спина отваливается' };
  if (npc.facets && npc.facets.anger > 60) return { topic: 'управляющего шахтой', type: 'angry', reason: 'который заставляет их работать без отдыха' };
  if (npc.facets && npc.facets.aesthetics > 60) return { topic: 'красоту подземных камней', type: 'happy', reason: 'восхищаясь их формой' };

  // 3. Если ничего нет, дефолт
  return { topic: 'тяжелый рабочий день', type: 'neutral', reason: 'просто чтобы скоротать время' };
};

// Главный цикл общения
Reg.on('npc_tick', (npc, state) => {
  // Если он не хочет общаться, он молчит
  if (npc.socialNeed !== undefined && npc.socialNeed < 10) return; // Снизили порог до 10, чтобы они больше общались

  // Инициализация кулдауна
  if (npc.dlgCooldown === undefined) npc.dlgCooldown = 0;
  
  // Если кулдаун еще идет, уменьшаем его и НЕ ГОВОРИМ
  if (npc.dlgCooldown > 0) {
    npc.dlgCooldown--;
    return;
  }

  if (Math.random() > 0.25) return; // 25% шанс заговорить
  if (npc.task.type === 'fight' || npc.task.type === 'insane' || npc.task.type === 'rest') return;

  // Ищем собеседника поблизости
  // Ищем того, кто сидит за столом (социальный) или просто рядом
  const partner = state.npcs.find(n => n.id !== npc.id && n.alive && (n.task.type === 'socialize' || Math.abs(n.x - npc.x) + Math.abs(n.y - npc.y) <= 2) && n.task.type !== 'fight' && n.task.type !== 'insane');
  if (!partner) return;

  // Получаем контекст для разговора
  const ctx = Reg.getDialogueContext(npc, state);
  
  // Выбираем глагол и реакцию на основе эмоции
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  let verb, reaction;
  
  if (ctx.type === 'angry') {
    verb = pick(Reg.dlgWords.verbsAngry);
    reaction = pick(Reg.dlgWords.reactionsAngry);
  } else if (ctx.type === 'sad') {
    verb = pick(Reg.dlgWords.verbsSad);
    reaction = pick(Reg.dlgWords.reactionsSad);
  } else if (ctx.type === 'happy') {
    verb = pick(Reg.dlgWords.verbsHappy);
    reaction = pick(Reg.dlgWords.reactionsHappy);
  } else {
    verb = pick(Reg.dlgWords.verbsNeutral);
    reaction = pick(Reg.dlgWords.reactionsNeutral);
  }

  // СОБИРАЕМ ПРЕДЛОЖЕНИЕ
  const dialogueText = `${npc.name} ${verb} ${partner.name}, жалуясь на ${ctx.topic} (${ctx.reason}). ${reaction}`;
  
  // Пишем в летопись
  Reg.log(dialogueText, ctx.type === 'angry' ? 'death' : 'normal');

  // ЗАПИСЫВАЕМ В ПАМЯТЬ ДВУХ ПЕРСОНАЖЕЙ
  if (npc.memory) {
    let selfThought = '';
    let selfEmo = { type: 'joy', power: 10 };
    
    if (ctx.type === 'angry') {
      selfThought = `Он высказал ${partner.name} всё, что думает о ${ctx.topic}. Ему стало немного легче.`;
      selfEmo = { type: 'anger', power: 15 };
    } else if (ctx.type === 'sad') {
      selfThought = `Он поделился с ${partner.name} своими переживаниями о ${ctx.topic}.`;
      selfEmo = { type: 'sadness', power: 10 };
    } else if (ctx.type === 'happy') {
      selfThought = `Он похвастался перед ${partner.name} насчет ${ctx.topic}.`;
      selfEmo = { type: 'joy', power: 20 };
    } else {
      selfThought = `Он поговорил с ${partner.name} о ${ctx.topic}.`;
    }
    Reg.addMemory(npc, selfThought, { ...selfEmo, category: 'social' });
  }

  if (partner.memory) {
    const partnerThought = `Он поговорил с ${npc.name}, который жаловался на ${ctx.topic}.`;
    Reg.addMemory(partner, partnerThought, { type: 'neutral', power: 5, category: 'social' });
  }

  // МЕНЯЕМ ОТНОШЕНИЯ
  if (npc.relations && partner.relations) {
    let relationChange = 0;
    if (ctx.type === 'angry') relationChange = -5; // Если он наорал, отношения падают
    else if (ctx.type === 'sad') relationChange = 3; // Если пожаловался, отношения растут (поддержка)
    else relationChange = 1;

    npc.relations[partner.id] = (npc.relations[partner.id] || 0) + relationChange;
    partner.relations[npc.id] = (partner.relations[npc.id] || 0) + relationChange;
    
    // Ограничиваем
    npc.relations[partner.id] = Math.max(-100, Math.min(100, npc.relations[partner.id]));
    partner.relations[npc.id] = Math.max(-100, Math.min(100, partner.relations[npc.id]));
  }

  // Убираем потребность в общении
  if (npc.socialNeed !== undefined) npc.socialNeed = 0;
  if (partner.socialNeed !== undefined) partner.socialNeed = 0;

  // ФИКС БЕСКОНЕЧНОГО ТРЕПА: Ставим кулдаун (200-300 тиков = 3-5 минут)
  npc.dlgCooldown = 50;
  partner.dlgCooldown = 50;

  // Сбрасываем задачу, чтобы они разошлись по делам (ИИ заставит их копать)
  npc.task = { type: 'idle', path: [] };
  partner.task = { type: 'idle', path: [] };
});
