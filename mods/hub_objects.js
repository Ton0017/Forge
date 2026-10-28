Reg.tile('pot', (ctx,sx,sy,seed) => { Reg.tiles['floor'](ctx,sx,sy,seed); ctx.fillStyle='#222'; ctx.fillRect(sx+8,sy+16,16,12); ctx.fillStyle='#444'; ctx.fillRect(sx+6,sy+14,20,4); ctx.fillStyle='#a06030'; ctx.fillRect(sx+10,sy+18,12,6); });
Reg.tile('bed', (ctx,sx,sy,seed) => { Reg.tiles['floor'](ctx,sx,sy,seed); ctx.fillStyle='#5a3a20'; ctx.fillRect(sx+4,sy+10,24,16); ctx.fillStyle='#aaa'; ctx.fillRect(sx+6,sy+12,20,12); ctx.fillStyle='#e0e0e0'; ctx.fillRect(sx+6,sy+12,8,6); });
Reg.tile('table', (ctx,sx,sy,seed) => { Reg.tiles['floor'](ctx,sx,sy,seed); ctx.fillStyle='#4a3a2a'; ctx.fillRect(sx+4,sy+12,24,8); ctx.fillStyle='#2a1a10'; ctx.fillRect(sx+6,sy+20,4,8); ctx.fillRect(sx+22,sy+20,4,8); ctx.fillStyle='#ccc'; ctx.fillRect(sx+10,sy+10,4,4); ctx.fillRect(sx+18,sy+10,4,4); });
Reg.tile('storage', (ctx,sx,sy,seed) => { Reg.tiles['floor'](ctx,sx,sy,seed); ctx.fillStyle='#5a3a10'; ctx.fillRect(sx+6,sy+12,20,16); ctx.fillStyle='#3a2a10'; ctx.fillRect(sx+6,sy+12,20,2); ctx.fillStyle='#a08040'; ctx.fillRect(sx+10,sy+16,12,4); });
Reg.tile('alchemy', (ctx,sx,sy,seed) => { Reg.tiles['floor'](ctx,sx,sy,seed); ctx.fillStyle='#333'; ctx.fillRect(sx+8,sy+14,16,14); ctx.fillStyle='#3a6a9a'; ctx.fillRect(sx+12,sy+8,8,8); ctx.fillStyle='#7aba7a'; ctx.fillRect(sx+14,sy+12,4,4); });

// ВОТ ОН, АЛТАРЬ! (Которого не хватало)
Reg.tile('altar', (ctx,sx,sy,seed) => {
  Reg.tiles['floor'](ctx,sx,sy,seed);
  ctx.fillStyle='#555'; ctx.fillRect(sx+8,sy+14,16,14);
  ctx.fillStyle='#888'; ctx.fillRect(sx+10,sy+10,12,4);
  ctx.fillStyle='#f0c040'; ctx.fillRect(sx+14,sy+6,4,4); // Свеча
});

Reg.on('world_init', (state) => {
  const put = (x, y, type) => {
    if (!state.cells[x+','+y]) state.cells[x+','+y] = { seed: Math.floor(Math.random()*10000), monster: null, corpse: null };
    state.cells[x+','+y].type = type;
  };
  put(0, -1, 'pot'); put(-1, 0, 'bed'); put(1, 0, 'alchemy');
  put(0, 1, 'storage'); put(-1, -1, 'table'); put(1, 1, 'altar');
});

Reg.addTrigger('table', {
  name: 'старый стол', verbs: ['смотрит на', 'изучает', 'касается'],
  defaultRule: { emotion: 'neutral', emotionText: 'ничего особенного', context: 'Просто стол.', power: 0 },
  rules: [
    { facet: 'diligence', threshold: 70, emotion: 'anger', emotionText: 'раздражение', context: 'Он думает, что тратит время впустую.', power: -20 },
    { facet: 'aesthetics', threshold: 60, emotion: 'joy', emotionText: 'удовольствие', context: 'Ему нравится текстура дерева.', power: 15 }
  ]
});
Reg.addTrigger('bed', {
  name: 'кровать', verbs: ['смотрит на', 'вздыхает при виде'],
  defaultRule: { emotion: 'sadness', emotionText: 'усталость', context: 'Как же хочется спать...', power: 10 }
});

// Фикс черного квадрата
Reg.tile('altar', (ctx,sx,sy,seed) => {
  Reg.tiles['floor'](ctx,sx,sy,seed);
  ctx.fillStyle='#555'; ctx.fillRect(sx+8,sy+14,16,14);
  ctx.fillStyle='#888'; ctx.fillRect(sx+10,sy+10,12,4);
  ctx.fillStyle='#f0c040'; ctx.fillRect(sx+14,sy+6,4,4); // Свеча
});

// Возвращаем кузню (наковальню)
Reg.tile('forge', (ctx, sx, sy, seed) => {
  Reg.tiles['floor'](ctx, sx, sy, seed);
  // Наковальня
  ctx.fillStyle='#1a1a1a'; ctx.fillRect(sx+6, sy+16, 20, 4);
  ctx.fillRect(sx+10, sy+20, 12, 8);
  ctx.fillRect(sx+8, sy+12, 16, 4);
  ctx.fillStyle='#4a4a4a'; ctx.fillRect(sx+8, sy+12, 16, 2);
  // Огонь
  ctx.fillStyle='#a03010'; ctx.fillRect(sx+24, sy+8, 8, 14);
  ctx.fillStyle='#e06020'; ctx.fillRect(sx+26, sy+10, 6, 10);
  ctx.fillStyle='#f0c040'; ctx.fillRect(sx+27, sy+14, 4, 4);
});

// Регистрируем абсурдные триггеры
// 1. Носок (как предмет в инвентаре или на полу)
Reg.addTrigger('sock', {
  name: 'одинокий носок',
  verbs: ['смотрит на', 'вертит в руках', 'принюхивается к'],
  defaultRule: { emotion: 'joy', emotionText: 'тревожное удовольствие', context: 'Ему кажется, что этот носок здесь не просто так.', power: 10 }
});

// 2. Странный камень (если мы добавим его на карту)
Reg.addTrigger('weird_rock', {
  name: 'странный камень',
  verbs: ['изучает', 'трогает', 'разговаривает с'],
  defaultRule: { emotion: 'curiosity', emotionText: 'смутное беспокойство', context: 'Камень кажется ему подозрительным.', power: 5 }
});

