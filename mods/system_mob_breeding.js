(function(){
  function initBreeding(mob) {
    if (mob.id !== 'cat' && mob.id !== 'rabbit' && mob.id !== 'boar' && mob.id !== 'deer') return;
    if (!mob.gender) mob.gender = Math.random() < 0.5 ? 'male' : 'female';
    if (mob.age === undefined) mob.age = Math.floor(Math.random() * 500);
    if (mob.adultAt === undefined) mob.adultAt = 500; // Взрослый через 500 тиков
    if (mob.pregnancy === undefined) mob.pregnancy = 0;
    if (mob.pregnancyTicks === undefined) mob.pregnancyTicks = mob.id === 'rabbit' ? 200 : 500; // Кролики быстрее
    if (mob.litterSize === undefined) mob.litterSize = mob.id === 'rabbit' ? 4 : (mob.id === 'cat' ? 2 : 1);
    if (mob.breedCooldown === undefined) mob.breedCooldown = 0;
    mob.canBreed = true;
  }

  Reg.on('tick', (state) => {
    if (state.tick % 100 !== 0) return; // Работает раз в 100 тиков (10 сек)

    let population = {};
    let mobs = [];

    for (let k in state.cells) {
      const c = state.cells[k];
      if (c.animal) {
         initBreeding(c.animal);
         if (c.animal.canBreed) {
             population[c.animal.id] = (population[c.animal.id] || 0) + 1;
             mobs.push({ mob: c.animal, x: c.animal.x, y: c.animal.y });
         }
      }
    }

    for (let m of mobs) {
      const mob = m.mob;
      
      // Взросление
      if (mob.age < mob.adultAt) { mob.age += 100; continue; }
      if (mob.breedCooldown > 0) { mob.breedCooldown--; continue; }

      // Беременность и роды
      if (mob.gender === 'female' && mob.pregnancy > 0) {
        mob.pregnancy--;
        if (mob.pregnancy <= 0) {
          if ((population[mob.id] || 0) < 20) { // Лимит популяции
            let born = 0;
            for (let i = 0; i < mob.litterSize; i++) {
               const rx = mob.x + Math.floor(Math.random()*3)-1;
               const ry = mob.y + Math.floor(Math.random()*3)-1;
               const rc = getCell(rx, ry);
               if (rc && rc.type === 'floor' && !rc.animal && !rc.monster) {
                   const baby = Object.assign({}, mob, { 
                       age: 0, hp: Math.ceil(mob.maxHp/2), maxHp: Math.ceil(mob.maxHp/2), 
                       pregnancy: 0, breedCooldown: mob.adultAt, bondedTo: null 
                   });
                   rc.animal = baby;
                   born++;
               }
            }
            if (born > 0) {
              Reg.log(`У ${mob.name} родилось потомство: ${born} детенышей.`, 'good');
              mob.breedCooldown = 2000;
              population[mob.id] = (population[mob.id] || 0) + born;
            }
          }
        }
        continue;
      }

      // Поиск партнера
      if (mob.gender === 'male' && (population[mob.id] || 0) < 20) {
        for (let f of mobs) {
          const female = f.mob;
          if (female.id === mob.id && female.gender === 'female' && female.age >= female.adultAt && female.pregnancy === 0 && female.breedCooldown === 0) {
            const dist = Math.abs(female.x - mob.x) + Math.abs(female.y - mob.y);
            if (dist <= 3 && Math.random() < 0.2) {
              female.pregnancy = female.pregnancyTicks;
              mob.breedCooldown = 1000;
              Reg.log(`${mob.name} проявляет интерес к ${female.name}.`, 'sys');
              break;
            }
          }
        }
      }
    }
  });
  console.log('[Mob Breeding] Шестерёнка размножения запущена.');
})();
