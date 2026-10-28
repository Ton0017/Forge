(function(){
  Reg.on('tick', (state) => {
    // Работаем раз в 10 тиков, чтобы не грузить телефон
    if (state.tick % 10 !== 0) return;

    for (let k in state.cells) {
      const c = state.cells[k];
      const mob = c.animal || c.monster;
      if (!mob || !mob.alive) continue; // (если у мобов есть alive)

      const [x, y] = k.split(',').map(Number);
      
      // 1. ОГОНЬ И ЛАВА
      if (c.type === 'lava' || c.type === 'fire' || c.type === 'campfire') {
        // Огонь больно жжет
        const dmg = c.type === 'lava' ? 10 : 5;
        if (window.applyBodyDamage) {
           window.applyBodyDamage(mob, dmg, 'fire', 'torso', false, null);
        } else {
           mob.hp -= dmg;
        }
        
        // Горение
        mob.burning = 3;
        
        // Кричим в лог (только если живой, чтобы не спамить смертью)
        if (mob.hp > 0 && Math.random() < 0.3) {
           Reg.log(`${mob.name} обжигается о ${c.type === 'lava' ? 'раскаленную лаву' : 'огонь'}!`, 'combat');
        }
        
        // Смерть от огня
        if (mob.hp <= 0) {
           c.animal = null; c.monster = null;
           if (!c.corpse) c.corpse = { name: mob.name, sprite: mob.sprite };
           Reg.log(`${mob.name} сгорает заживо.`, 'death');
           continue;
        }
      }

      // 2. ВОДА (Утопление)
      if (c.type === 'water' && c.water && c.water.depth >= 3) {
        // Шанс утонуть зависит от размера (кошки маленькие)
        let drownChance = 0.3;
        if (mob.size <= 1) drownChance = 0.8; // Маленькие тонут легко
        if (mob.size >= 4) drownChance = 0.1; // Большие (лоси, медведи) выгребают
        
        if (Math.random() < drownChance) {
           const dmg = 5;
           if (window.applyBodyDamage) {
              window.applyBodyDamage(mob, dmg, 'blunt', 'torso', false, null);
           } else {
              mob.hp -= dmg;
           }
           
           if (mob.hp > 0 && Math.random() < 0.3) {
              Reg.log(`${mob.name} захлебывается в глубокой воде!`, 'combat');
           }
           
           if (mob.hp <= 0) {
              c.animal = null; c.monster = null;
              if (!c.corpse) c.corpse = { name: mob.name, sprite: mob.sprite };
              Reg.log(`${mob.name} тонет.`, 'death');
              continue;
           }
        }
      }

      // 3. ГИГИЕНА (Мобы пачкаются и моются)
      if (mob.dirt === undefined) mob.dirt = 0;
      
      if (c.type === 'water') {
          if (mob.dirt > 0) mob.dirt = Math.max(0, mob.dirt - 10); // Пассивно моются в воде
      } else if (c.type === 'floor' || c.type === 'stone') {
          if (Math.random() < 0.05) mob.dirt = Math.min(100, mob.dirt + 1); // Пачкаются при ходьбе
      }

      // 4. ЗАРАЖЕННАЯ ВОДА (Инфекция)
      if (c.type === 'water' && c.infected_water) {
         // Если моб пьет (в water_life.js жажда сбрасывается), он может заразиться
         if (mob.thirst === 0 && Math.random() < 0.05) {
            if (!mob.infections) mob.infections = [];
            if (!mob.infections.includes('bacteria')) {
               mob.infections.push('bacteria');
               Reg.log(`${mob.name} пьет зараженную воду и заражается.`, 'combat');
            }
         }
      }
    }
  });
  console.log('[Mob Environment] Мобы теперь чувствуют огонь, воду и заразу.');
})();
