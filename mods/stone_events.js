Reg.on('tile_dug', (cell, npc, state) => {
  // Шанс 15%, что при копании произойдет что-то интересное
  if (Math.random() > 0.15) return;

  const roll = Math.random();

  if (roll < 0.3) {
    // 30% от 15% = 4.5% шанс найти золото
    const gold = 5 + Math.floor(Math.random() * 20);
    state.gold += gold;
    Reg.log(`${npc.name} находит в камне жилу с золотом! (+${gold} монет)`, 'good');
    const thought = Reg.composer.generate(npc, 'gold');
    if (thought) {
      // Добавляем уточнение "в камне", так как это добыча
      const finalText = thought.text.replace('золото', 'золото в камне');
      Reg.addMemory(npc, finalText, thought.emo);
    } else {
      Reg.addMemory(npc, "Он нашел золото в камне.", { type: 'joy', power: 20, category: 'luck' });
    }
  } 
  else if (roll < 0.6) {
    // 4.5% шанс найти гнездо монстров (спавним врага)
    const monsters = ['goblin', 'skeleton'];
    const mId = monsters[Math.floor(Math.random() * monsters.length)];
    if (Reg.monsters[mId]) {
      cell.monster = { ...Reg.monsters[mId], x: cell.x, y: cell.y, hp: Reg.monsters[mId].hp };
      Reg.log(`Стена обвалилась! Из гнезда вылез ${Reg.monsters[mId].name}!`, 'death');
    }
  }
  else if (roll < 0.8) {
    // 3% шанс найти странный гриб (лечим)
    npc.hp = Math.min(npc.maxHp, npc.hp + 20);
    Reg.log(`${npc.name} находит светящийся гриб и съедает его. Силы возвращаются!`, 'good');
    const mushThought = Reg.composer.generate(npc, 'mushroom');
    if (mushThought) {
       Reg.addMemory(npc, mushThought.text, { type: 'curiosity', power: 15, category: 'luck' });
    } else {
       Reg.addMemory(npc, `Он съел странный гриб. Голова кружится, но раны затягиваются.`, { type: 'curiosity', power: 15, category: 'luck' });
    }
  }
  else {
    // 3% шанс обвала (наносим урон)
    npc.hp -= 15;
    Reg.log(`Обвал! ${npc.name} придавило камнем.`, 'combat');
    // Умная реакция на обвал
    const c = getCell(npc.x, npc.y);
    const rockThought = Reg.composer.generate(npc, 'wall');
    if (rockThought) {
       Reg.addMemory(npc, rockThought.text + " Камень едва не раздавил его.", { type: 'fear', power: 25, category: 'trauma' });
    } else {
       Reg.addMemory(npc, "На него обрушился потолок. Больно.", { type: 'fear', power: 25, category: 'trauma' });
    }
    if (npc.hp <= 0) killNpc(npc, 'погиб при обвале');
  }
});
