(function(){
  // Перехватываем тик для животных и монстров
  Reg.on('npc_tick', (npc, state) => {
    // Если это не обычный дварф (у зверей нет skinFile или они в cell.animal/monster)
    const isWild = !npc.skinFile || npc.isAnimal || npc.isMonster;
    if (!isWild || !npc.alive) return false;

    // Инициализируем память, если ее нет
    if (!npc.longTerm) npc.longTerm = { alcoholism: 0, cirrhosis: 0 };
    if (!npc.emo) npc.emo = { stress: 0, joy: 20, fear: 0, drunk: 0 };

    // Ищем бочку с элем поблизости (радиус 2 клетки)
    let barrelPos = null;
    for (let dx = -2; dx <= 2; dx++) {
      for (let dy = -2; dy <= 2; dy++) {
        const c = getCell(npc.x + dx, npc.y + dy);
        if (c && c.type === 'beer_tap') { barrelPos = { x: npc.x + dx, y: npc.y + dy }; break; }
      }
    }

    // Если бочка найдена, зверь хочет пить
    if (barrelPos) {
      const dist = Math.abs(npc.x - barrelPos.x) + Math.abs(npc.y - barrelPos.y);
      
      if (dist <= 1) {
         // Зверь уже у бочки. Пьет!
         if (state.booze === undefined) state.booze = 20;
         
         if (state.booze > 0) {
            if (Math.random() < 0.1) { // Пьет не каждый тик, а с шансом 10%
               state.booze -= 1;
               
               // Бочка опустошается и исчезает!
               getCell(barrelPos.x, barrelPos.y).type = 'floor';
               
               // ЗАПИСЫВАЕМ ДЕЙСТВИЕ
               if (window.recordMobAction) {
                   window.recordMobAction(npc, 'drank_booze');
               }
               Reg.log(`Бочка опустела и исчезла.`, 'sys');
               
               npc.emo.drunk = Math.min(100, (npc.emo.drunk || 0) + 30);
               npc.longTerm.alcoholism = (npc.longTerm.alcoholism || 0) + 2;
               
               const _drinkTxt = window.generateMobActionText ? window.generateMobActionText(npc) : 'Он выпил эль.';
               Reg.log(`${npc.name}: ${_drinkTxt}`, 'sys');
               Reg.addMemory(npc, `Я выпил эля. Голова кружится.`, { type: 'joy', power: 10, category: 'tavern' });
               
               // Если напился до чертиков, может уснуть прямо там
               if (npc.emo.drunk > 80 && Math.random() < 0.3) {
                   npc.task = { type: 'rest', path: [] };
                   Reg.log(`${npc.name} напился и уснул у бочки.`, 'sys');
               }
            }
         }
      } else {
         // Идем к бочке (простой шаг)
         const stepX = Math.sign(barrelPos.x - npc.x);
         const stepY = Math.sign(barrelPos.y - npc.y);
         const nextCell = getCell(npc.x + stepX, npc.y + stepY);
         
         // Если на пути нет стены
         if (nextCell && nextCell.type !== 'stone') {
            npc.x += stepX;
            npc.y += stepY;
            return true;
         }
      }
    }
    return false;
  });

  console.log('[Drunk Wildlife] Звери и монстры теперь могут спиваться.');
})();
