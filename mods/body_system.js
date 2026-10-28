(function(){
  // 1. ИНИЦИАЛИЗАЦИЯ ТЕЛА (С материалами)
  const initBody = (entity) => {
    if (entity.body) return;

    const baseHp = entity.maxHp || entity.hp || 20;

    // Определяем материал
    let bodyMaterial = 'flesh';
    const nm = entity.name || '';
    if ((entity.id && entity.id.includes('skeleton')) || nm.includes('скелет')) bodyMaterial = 'bone';
    if ((entity.id && entity.id.includes('golem')) || nm.includes('голем')) bodyMaterial = 'metal';

    // Ищем анатомию по id (cat, rabbit, goblin...). Если нет — берём дварфийскую (универсальную)
    const MOB_ANATOMY = {
      cat:     { head: 0.4, torso: 0.8, front_left_leg: 0.25, front_right_leg: 0.25, back_left_leg: 0.25, back_right_leg: 0.25, tail: 0.15 },
      rabbit:  { head: 0.4, torso: 0.8, left_leg: 0.25, right_leg: 0.25 },
      fox:     { head: 0.4, torso: 0.8, left_leg: 0.25, right_leg: 0.25, tail: 0.15 },
      wolf:    { head: 0.4, torso: 0.8, left_leg: 0.25, right_leg: 0.25, tail: 0.15 },
      deer:    { head: 0.4, torso: 0.8, left_leg: 0.3, right_leg: 0.3 },
      boar:    { head: 0.4, torso: 0.8, left_leg: 0.3, right_leg: 0.3 },
      bear:    { head: 0.4, torso: 0.8, left_leg: 0.3, right_leg: 0.3 },
      elk:     { head: 0.4, torso: 0.8, left_leg: 0.3, right_leg: 0.3 },
      goblin:  { head: 0.5, torso: 1, left_arm: 0.3, right_arm: 0.3, left_leg: 0.4, right_leg: 0.4 },
      ork:     { head: 0.5, torso: 1, left_arm: 0.35, right_arm: 0.35, left_leg: 0.4, right_leg: 0.4 },
      troll:   { head: 0.4, torso: 1, left_arm: 0.35, right_arm: 0.35, left_leg: 0.4, right_leg: 0.4 },
      skeleton:{ head: 0.4, torso: 1, left_arm: 0.25, right_arm: 0.25, left_leg: 0.3, right_leg: 0.3 },
      dwarf:   { head: 0.5, torso: 1, left_arm: 0.3, right_arm: 0.3, left_leg: 0.4, right_leg: 0.4 }
    };

    const anatomy = MOB_ANATOMY[entity.id] || MOB_ANATOMY.dwarf;

    entity.body = {};
    for (const part in anatomy) {
      const hp = Math.max(1, Math.floor(baseHp * anatomy[part]));
      entity.body[part] = { 
        hp: hp, max: hp, 
        status: 'ok', bleeding: 0, infection: 0, 
        material: bodyMaterial 
      };
    }
    entity.blood = 100;
    entity.injuries = [];
  };

  Reg.on('npc_hired', initBody);

  // Твердость материалов (чем выше, тем сложнее пробить)
  const HARDNESS = { flesh: 2, bone: 6, metal: 10 };

  // 2. НАНЕСЕНИЕ УРОНА
  window.applyBodyDamage = function(entity, damage, damageType, partName, isCrit, attacker) {
    initBody(entity);

    // Динамический список частей — берём из реальной анатомии существа
    const parts = Object.keys(entity.body);
    const part = (partName && entity.body[partName]) ? partName : parts[Math.floor(Math.random() * parts.length)];
    const bodyPart = entity.body[part];
    if (!bodyPart) return;
    if (!bodyPart) return;

    if (bodyPart.status === 'severed') return 0;

    const targetHardness = HARDNESS[bodyPart.material] || 2;
    let actualDmg = damage;
    let newStatus = bodyPart.status;

    // ФИЗИКА: Взаимодействие урона и материала
    if (damageType === 'slashing') {
        if (bodyPart.material === 'flesh') {
            bodyPart.bleeding += Math.floor(damage / 2);
            newStatus = 'cut';
            
            // ФИЗИКА ИНФЕКЦИИ (Без рандома)
            let infectionRisk = 0;
            // Если атакующий — переносчик бактерий (пил зараженную воду)
            if (attacker && attacker.contamination === 'bacteria') infectionRisk += 0.8;
            // Если у жертвы грязные руки/тело (копалась в грязи)
            if (entity.dirt && entity.dirt > 50) infectionRisk += 0.4;
            
            if (infectionRisk > 0 && Math.random() < infectionRisk && bodyPart.infection === 0) {
                bodyPart.infection = 1;
                if (Reg.log) Reg.log(`[ИНФЕКЦИЯ] Грязь попала в рану ${part} у ${entity.name}!`, 'death');
            }
            // Крит режущим по плоти отрубает
            if (isCrit && part !== 'head' && part !== 'torso') {
                bodyPart.hp = 0;
                bodyPart.status = 'severed';
                bodyPart.bleeding += 20;
                if (Reg.log) Reg.log(`[ОТРУБЛЕНО] ${entity.name} лишился ${part}!`, 'death');
                return actualDmg;
            }
        } else if (bodyPart.material === 'bone' || bodyPart.material === 'metal') {
            // Меч скользит по кости/металлу — урона почти нет
            actualDmg = Math.floor(damage * 0.1);
            if (Reg.log && Math.random() < 0.2) Reg.log(`[Бой] Меч скрежещет по ${bodyPart.material} ${entity.name}, не оставляя царапин.`, 'combat');
        }
    } else if (damageType === 'blunt') {
        // Дробящий урон
        if (bodyPart.material === 'flesh') {
            actualDmg = Math.floor(damage * 1.2); // Дробящий больнее для мяса
        } else if (bodyPart.material === 'bone') {
            // Молот крошит кости
            actualDmg = Math.floor(damage * 1.5);
            if (Math.random() < 0.6 && bodyPart.status !== 'fracture') {
                newStatus = 'fracture';
                if (!entity.injuries.includes(part + '_fracture')) {
                   entity.injuries.push(part + '_fracture');
                   if (Reg.log) Reg.log(`[Травма] У ${entity.name} перелом: ${part}.`, 'death');
                }
            }
        } else if (bodyPart.material === 'metal') {
            actualDmg = Math.floor(damage * 0.5); // По металлу молот бьет слабее
        }
    } else if (damageType === 'piercing') {
        if (bodyPart.material === 'flesh') {
            bodyPart.bleeding += Math.floor(damage / 3);
            newStatus = 'cut';
            // Колотые раны тоже могут инфицироваться
            if (Math.random() < 0.3 && bodyPart.infection === 0) {
                bodyPart.infection = 1;
            }
        } else {
            actualDmg = Math.floor(damage * 0.2);
        }
    }

    // Применяем урон
    bodyPart.hp -= actualDmg;
    if (newStatus !== 'ok') bodyPart.status = newStatus;

    // Смерть от разрушения жизненно важных органов
    if (bodyPart.hp <= 0) {
      if (part === 'head' || part === 'torso') {
        entity.body[part].status = 'severed';
        entity.blood = 0;
        if (window.killNpc) window.killNpc(entity, `разрушена ${part === 'head' ? 'голова' : 'грудь'}`);
      } else {
        // Отрубаем конечность
        entity.body[part].status = 'severed';
        entity.body[part].bleeding += 10;
        if (Reg.log) Reg.log(`[УЖАС] ${entity.name} потерял ${part}!`, 'death');
      }
    }

    entity.hp = Math.max(0, (entity.body.torso.hp / 2) + (entity.body.head.hp / 2));
    return actualDmg;
  };

  // 3. ТИК КРОВОТЕЧЕНИЯ И ИНФЕКЦИЙ
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || !npc.body) return false;

    if (state.tick % 10 === 0) {
      let totalBleed = 0;
      let totalInfection = 0;

      for (let part in npc.body) {
        const bPart = npc.body[part];
        if (bPart.status === 'severed') continue;

        if (bPart.bleeding > 0) {
          totalBleed += bPart.bleeding;
          if (Math.random() < 0.1) bPart.bleeding--; // Заживление
        }

        if (bPart.infection > 0) {
          totalInfection += bPart.infection * 2; // Инфекция наносит урон
          if (Math.random() < 0.05) bPart.infection++; // Инфекция прогрессирует
        }
      }

      if (totalBleed > 0) {
        npc.blood -= totalBleed;
        if (Math.random() < 0.3) {
           const thought = Reg.composer.generate(npc, 'injury', 'bleed', { part: 'torso', type: 'cut' });
           if (thought) Reg.addMemory(npc, thought.text, thought.emo);
        }
      }

      if (totalInfection > 0) {
        npc.hp -= totalInfection;
        if (Math.random() < 0.1) {
            if (Reg.log) Reg.log(`[Болезнь] ${npc.name} страдает от гангрены.`, 'death');
        }
      }

      if (npc.blood <= 0) {
        if (window.killNpc) window.killNpc(npc, 'истек кровью');
        return true;
      }
      if (npc.hp <= 0) {
        if (window.killNpc) window.killNpc(npc, 'умер от инфекции');
        return true;
      }
    }
    return false;
  });

  // 4. ЭФФЕКТЫ ПЕРЕЛОМОВ
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || !npc.body) return false;

    if (npc.body.left_leg.status === 'fracture' || npc.body.right_leg.status === 'fracture') {
      npc.speed = 0.3;
    }
    if (npc.body.right_arm.status === 'fracture' || npc.body.right_arm.status === 'severed') {
      if (!npc.weaponDamagePenalty) {
         npc.weaponDamagePenalty = true;
         if (Reg.log) Reg.log(`${npc.name} не может держать оружие из-за травмы руки.`, 'sys');
      }
    }
    return false;
  });

  console.log('[Body System] Анатомия и физика материалов активированы.');
})();
