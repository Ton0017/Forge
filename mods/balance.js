// Ждем загрузки ядра (core.js), чтобы перехватить управление
setTimeout(() => {
  // 1. Переопределяем функцию спавна монстров из core.js
  const originalSpawn = window.spawnMonster;
  window.spawnMonster = function() {
    // Оставляем всего 2% шанс, что монстр вообще появится (вместо 15% в ядре)
    if (Math.random() > 0.02) return; 
    
    // Проверяем, сколько монстров уже есть
    let count = 0;
    for (let k in state.cells) {
      if (state.cells[k].monster) count++;
    }
    
    // Если на карте уже есть 1 монстр, больше не спавним
    if (count >= 1) return;

    if (originalSpawn) originalSpawn();
  };

  // 2. Каждый тик проверяем, чтобы монстров не было больше 1
  Reg.on('tick', (state) => {
    let monsterCount = 0;
    for (let k in state.cells) {
      if (state.cells[k].monster) {
        monsterCount++;
        if (monsterCount > 1) {
          state.cells[k].monster = null; // Удаляем лишних
        }
      }
    }
  });
}, 1000); // Задержка в 1 секунду, чтобы core.js успел загрузиться

// 3. Делаем монстров чуть слабее, чтобы один дварф мог справиться
Reg.monsters.zombie.hp = 15; 
Reg.monsters.zombie.atk = 2; 
Reg.monsters.rat.hp = 5;
Reg.monsters.rat.atk = 1;
