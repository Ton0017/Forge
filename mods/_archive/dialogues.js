// Слушаем событие начала боя
Reg.on('combat_start', (npc, monster) => {
  // 70% шанс промолчать, чтобы не забивать летопись
  if (Math.random() > 0.3) return; 

  if (npc.trait.id === 'coward') {
    Reg.log(`${npc.name} в ужасе отшатывается от ${monster.name}.`, 'combat');
  } 
  else if (npc.trait.id === 'brave') {
    Reg.log(`${npc.name} с ревом бьет ${monster.name}: "Умри!"`, 'combat');
  }
  else if (npc.trait.id === 'lazy') {
    Reg.log(`${npc.name} лениво отмахивается от ${monster.name}.`, 'combat');
  }
  else if (npc.trait.id === 'hardworking') {
    Reg.log(`${npc.name} методично убивает ${monster.name}.`, 'combat');
  }
});
