(function(){
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  // === ВЫБОР ОРУЖИЯ ===
  function shouldGrabImprovised(npc) {
    if (!npc.facets && !npc.trait) return Math.random() < 0.5;
    if (npc.facets && npc.facets.courage < 30) return Math.random() < 0.1;
    if (npc.trait && npc.trait.id === 'bloodthirsty') return true;
    if (npc.facets && npc.facets.aggression > 70) return true;
    if (npc.trait && npc.trait.id === 'hardworking') return Math.random() < 0.3;
    return Math.random() < 0.5;
  }

  function getWeaponInHand(npc) {
    // ФИЗИКА: Проверяем протезы-оружие (воткнутые в культю)
    if (npc.body) {
        for (let part in npc.body) {
            if (npc.body[part].status === 'prosthetic' && npc.body[part].prostheticType === 'weapon') {
                return { item: npc.body[part].attached, source: 'equipped' }; 
            }
        }
    }
    if (npc.equipment && npc.equipment.weapon) {
      return { item: npc.equipment.weapon, source: 'equipped' };
    }
    if (shouldGrabImprovised(npc) && npc.inventory && npc.inventory.length > 0) {
      const candidates = npc.inventory.filter(i => i && i.name);
      if (candidates.length > 0) return { item: pick(candidates), source: 'improvised' };
    }
    return null;
  }

  function getDamageTypeFromItem(item) {
    if (!item) return 'blunt';
    const name = (item.name || '').toLowerCase();
    const tags = item.tags || [];
    if (tags.includes('weapon') && (tags.includes('sword') || tags.includes('axe'))) return 'slashing';
    if (name.includes('sword') || name.includes('axe') || name.includes('меч') || name.includes('топор')) return 'slashing';
    if (name.includes('spear') || name.includes('dagger') || name.includes('pick') || name.includes('копье') || name.includes('кирка')) return 'piercing';
    return 'blunt';
  }

  function getBaseDamage(npc, weaponInfo) {
    const combatSkill = (npc.skills && npc.skills.combat) || 0;
    if (!weaponInfo) return 5 + Math.floor(combatSkill);
    const item = weaponInfo.item;
    if (weaponInfo.source === 'equipped') {
      let baseDmg = 8 + Math.floor(combatSkill) + (item.dmgMod || 0);
      // ФИЗИКА ДЕГРАДАЦИИ
      if (item.condition === 'bent') baseDmg = Math.floor(baseDmg * 0.5);
      if (item.condition === 'cracked') baseDmg = Math.floor(baseDmg * 0.2);
      return baseDmg;
    }
    const tags = item.tags || [];
    let base = 4 + Math.floor(combatSkill * 0.5);
    if (tags.includes('metal') && tags.includes('heavy')) base += 4;
    else if (tags.includes('metal')) base += 2;
    else if (tags.includes('wood')) base += 1;
    else if (tags.includes('food') || tags.includes('light')) base -= 2;
    return Math.max(1, base);
  }

  function getWeaponLabel(weaponInfo) {
    if (!weaponInfo) return 'кулаки';
    if (weaponInfo.source === 'improvised') return weaponInfo.item.name + ', в руке';
    return weaponInfo.item.name;
  }

  const PARTS = [
    { key: 'head', mult: 2.0 },
    { key: 'torso', mult: 1.0 },
    { key: 'left_arm', mult: 0.6 },
    { key: 'right_arm', mult: 0.6 },
    { key: 'left_leg', mult: 0.7 },
    { key: 'right_leg', mult: 0.7 }
  ];

  // === ГЕНЕРАТОР БОЕВОЙ СЦЕНЫ ===
  function buildCombatScene(npc, target, weaponInfo, dmgType, part, finalDmg, isCrit) {
    const lex = Reg.combatLex || { verbs: {}, parts: {}, results: {}, sounds: [], reactions: {}, weapon_effects: {} };
    const weaponLabel = getWeaponLabel(weaponInfo);

    // 1. ГЛАГОЛ
    const verb = pick((lex.verbs && lex.verbs[dmgType]) || ['бьет']);

    // 2. НАЗВАНИЕ ЧАСТИ ТЕЛА
    let partKey = part.key;
    let partCategory = 'torso';
    if (partKey === 'head') partCategory = 'head';
    else if (partKey === 'torso') partCategory = 'torso';
    else if (partKey.includes('arm')) partCategory = 'arms';
    else if (partKey.includes('leg')) partCategory = 'legs';

    const partName = pick((lex.parts && lex.parts[partKey]) || ['тело']);

    // 3. ПОСЛЕДСТВИЕ (зависит от силы удара)
    let resultTier = 'light';
    if (finalDmg >= 10 || isCrit) resultTier = 'heavy';
    else if (finalDmg >= 5) resultTier = 'medium';

    let resultPool = null;
    if (lex.results && lex.results[resultTier] && lex.results[resultTier][dmgType]) {
        resultPool = lex.results[resultTier][dmgType];
    }
    const result = resultPool ? pick(resultPool) : 'нанося удар';

    // 4. ЗВУК
    const sound = (lex.sounds && Math.random() < 0.4) ? pick(lex.sounds) : '';

    // 5. РЕАКЦИЯ ЖЕРТВЫ (только если жива)
    let reaction = '';
    const targetAlive = (target.hp > 0);
    if (targetAlive && Math.random() < 0.4) {
       const reactPool = lex.reactions && lex.reactions[partCategory];
       if (reactPool) reaction = pick(reactPool);
    }

    // 6. ЭФФЕКТ ОРУЖИЯ (огонь/проклятие)
    let weaponEffect = '';
    if (weaponInfo && weaponInfo.source === 'equipped' && weaponInfo.item.tags) {
        const wTags = weaponInfo.item.tags;
        if (wTags.includes('fire') && Math.random() < 0.3) {
            weaponEffect = pick(lex.weapon_effects.fire || []);
            target.burning = 3;
        } else if (wTags.includes('cursed') && Math.random() < 0.2) {
            weaponEffect = pick(lex.weapon_effects.cursed || []);
        } else if (wTags.includes('magic') && Math.random() < 0.2) {
            weaponEffect = pick(lex.weapon_effects.magic || []);
        }
    }

    // === СБОРКА ФРАЗЫ ===
    let text = `${npc.name} ${verb} ${partName} ${target.name} (${weaponLabel}), ${result}.`;
    if (sound) text += ' ' + sound;
    if (weaponEffect) text += ' ' + weaponEffect;
    if (reaction) text += ' ' + reaction;

    return text;
  }

  Reg.doCombat = function(npc, target, state) {
    if (!npc.alive || !target) return;
    
    // ДИАГНОСТИКА: Видим, что бой начался
    console.log(`[FIGHT] ${npc.name} атакует ${target.name}. HP цели: ${target.hp}, body: ${target.body ? 'есть' : 'нет'}`);

    const weaponInfo = getWeaponInHand(npc);
    const dmgType = getDamageTypeFromItem(weaponInfo ? weaponInfo.item : null);
    const part = pick(PARTS);

    const baseDmg = getBaseDamage(npc, weaponInfo);
    const finalDmg = Math.max(1, Math.floor(baseDmg * part.mult));

    // === ПОЛОМКА ИМПРОВИЗАЦИИ ===
    if (weaponInfo && weaponInfo.source === 'improvised' && Math.random() < 0.3) {
      const idx = npc.inventory.findIndex(i => i === weaponInfo.item);
      if (idx >= 0) {
        npc.inventory.splice(idx, 1);
        Reg.log(`[ИМПРОВИЗАЦИЯ] ${npc.name} сломал ${weaponInfo.item.name} об ${target.name}!`, 'combat');
      }
    }

    // === ПОЛОМКА НАСТОЯЩЕГО ОРУЖИЯ ===
    if (weaponInfo && weaponInfo.source === 'equipped' && weaponInfo.item.integrity !== undefined) {
      weaponInfo.item.integrity -= 10;
      if (weaponInfo.item.parts && weaponInfo.item.parts.length > 0) {
        const wPart = weaponInfo.item.parts[0];
        if (wPart) wPart.hp -= 10;
        
        // СТАДИИ ДЕГРАДАЦИИ
        if (weaponInfo.item.integrity < 50 && !weaponInfo.item.condition) {
            weaponInfo.item.condition = 'bent';
            Reg.log(`[Износ] ${weaponInfo.item.name} погнулось. Урон снижен.`, 'sys');
        }
        if (weaponInfo.item.integrity < 20 && weaponInfo.item.condition === 'bent') {
            weaponInfo.item.condition = 'cracked';
            Reg.log(`[Износ] ${weaponInfo.item.name} треснуло! Скоро сломается.`, 'sys');
        }

        if (wPart && wPart.hp <= 0) {
          Reg.log(`[ПОЛОМКА] ${npc.name} сломал ${weaponInfo.item.name}! ${wPart.name} разлетелось на осколки.`, 'combat');
          npc.equipment.weapon = null;
          npc.weapon = null;
          
          // ФИЗИКА ШРАПНЕЛИ: 3-5 осколков разлетаются
          const pieces = 3 + Math.floor(Math.random() * 3);
          for (let i = 0; i < pieces; i++) {
              const dx = Math.floor(Math.random() * 3) - 1;
              const dy = Math.floor(Math.random() * 3) - 1;
              const tx = npc.x + dx;
              const ty = npc.y + dy;
              const targetCell = getCell(tx, ty);
              
              let victim = null;
              if (window.state) {
                  victim = window.state.npcs.find(n => n.alive && n.x === tx && n.y === ty);
                  if (!victim && targetCell) {
                      victim = targetCell.monster || targetCell.animal;
                  }
              }

              if (victim) {
                  const shrapnelDmg = 3 + Math.floor(Math.random() * 5);
                  if (window.applyBodyDamage) {
                      window.applyBodyDamage(victim, shrapnelDmg, 'piercing', 'torso', false, npc);
                  } else {
                      victim.hp -= shrapnelDmg;
                  }
                  Reg.log(`[ШРАПНЕЛЬ] Осколок ${weaponInfo.item.name} врезается в ${victim.name}!`, 'combat');
              } else if (targetCell && targetCell.type !== 'stone') {
                  if (!targetCell.items) targetCell.items = [];
                  targetCell.items.push({ name: 'Металлолом', type: 'scrap', tags: ['scrap', 'metal'], file: 'assets/icons/53 question trap.png', weight: 2 });
              }
          }
        }
      }
    }

    // === ГЕНЕРАЦИЯ И ВЫВОД ЛОГА ===
    const isCrit = (finalDmg >= 10 && dmgType === 'slashing' && part.key !== 'head' && part.key !== 'torso');
    const sceneText = buildCombatScene(npc, target, weaponInfo, dmgType, part, finalDmg, isCrit);
    Reg.log(sceneText, 'combat');

    // === УРОН В ТЕЛО ===
    if (window.applyBodyDamage) {
      target.lastAttackerId = npc.id;
      window.applyBodyDamage(target, finalDmg, dmgType, part.key, isCrit, npc);
    } else {
      target.hp -= finalDmg;
    }

    // === ОГЛУШЕНИЕ ===
    if (part.key === 'head' && Math.random() < 0.3) {
      target.stunned = 2;
      Reg.log(`${target.name} оглушен!`, 'combat');
    }

    // === СМЕРТЬ ===
    let isDead = (target.hp <= 0);
    if (target.body) {
      // Смерть только при разрушении ЖИЗНЕННО ВАЖНЫХ органов (голова, торс)
      // Отрубленная рука или нога - это травма, но не смерть
      if (target.body.head.hp <= 0 || target.body.head.status === 'severed') isDead = true;
      if (target.body.torso.hp <= 0 || target.body.torso.status === 'severed') isDead = true;
    }
    if (isDead) {
      Reg.log(`${target.name} падает замертво!`, 'good');
      const cell = getCell(target.x, target.y);
      if (target.isAnimal && cell) {
          if (!cell.items) cell.items = [];
          let meatCount = target.meat || 1;
          for(let i=0; i<meatCount; i++) {
              cell.items.push({ name: 'Сырое мясо', type: 'food', tags: ['meat', 'raw'], file: 'assets/animals/boar.png' });
          }
      }
      if (cell) {
        if (target.isAnimal) { cell.animal = null; cell.type = target.baseType || 'floor'; }
        else { cell.monster = null; }
      }
      npc.task = { type: 'idle', path: [] };
      return;
    }

    // === ОТВЕТНЫЙ УДАР ===
    if (target.stunned > 0) {
      target.stunned--;
      Reg.log(`${target.name} не может двигаться от боли.`, 'sys');
      return;
    }

        // === ФИЗИКА: ОПРЕДЕЛЯЕМ ТИП АТАКИ ЗВЕРЯ ===
    const lex = Reg.combatLex || { verbs: {}, parts: {} };
    let counterAttackType = 'blunt';
    const tName = (target.name || '').toLowerCase();
    const tTags = target.tags || [];
    
    if (tName.includes('волк') || tName.includes('лиса') || tName.includes('акула') || tName.includes('паук') || tTags.includes('predator')) {
        counterAttackType = 'bite';
    } else if (tName.includes('медведь') || tName.includes('кабан') || tName.includes('тигр') || tName.includes('голем')) {
        counterAttackType = 'claw';
    } else if (tName.includes('лось') || tName.includes('олень') || tName.includes('лошадь')) {
        counterAttackType = 'trample';
    }

    // Выбор глагола и части тела
    const counterVerb = lex.verbs[counterAttackType] ? lex.verbs[counterAttackType][Math.floor(Math.random() * lex.verbs[counterAttackType].length)] : 'бьет';
    const hitPart = ['head', 'torso', 'left_arm', 'right_arm', 'left_leg', 'right_leg'][Math.floor(Math.random() * 6)];
    const counterPartName = lex.parts[hitPart] ? lex.parts[hitPart][Math.floor(Math.random() * lex.parts[hitPart].length)] : hitPart;

    // === БРОНЯ И УРОН ===
    let armorDefense = 0;
    let armorText = '';
    
    if (npc.equipment && npc.equipment.armor && (hitPart === 'torso' || hitPart === 'head')) {
        const armor = npc.equipment.armor;
        
        // ИНИЦИАЛИЗАЦИЯ ПРОЧНОСТИ (для старых сейвов)
        if (armor.integrity === undefined) armor.integrity = 100;
        
        // ИЗНОС БРОНИ
        armor.integrity -= 10;
        
        // Деградация
        if (armor.integrity < 50 && !armor.condition) {
            armor.condition = 'dented';
            Reg.log(`[Износ] ${armor.name} помялась. Защита снижена.`, 'sys');
        }
        if (armor.integrity < 20 && armor.condition === 'dented') {
            armor.condition = 'cracked';
            Reg.log(`[Износ] ${armor.name} треснула! Скоро развалится.`, 'sys');
        }
        
        // Поломка
        if (armor.integrity <= 0) {
            Reg.log(`[ПОЛОМКА] ${npc.name} разорвал ${armor.name} в клочья!`, 'combat');
            npc.equipment.armor = null;
            const c = getCell(npc.x, npc.y);
            if (c) {
                if (!c.items) c.items = [];
                c.items.push({ name: 'Обрывки брони', type: 'scrap', tags: ['scrap', 'cloth'], file: 'assets/icons/53 question trap.png', weight: 1 });
            }
            armorDefense = 0;
        } else {
            // Защита зависит от состояния
            let defMult = 1.0;
            if (armor.condition === 'dented') defMult = 0.5;
            if (armor.condition === 'cracked') defMult = 0.2;
            
            armorDefense = Math.floor((armor.hardness || 1) * 2 * defMult);
            
            if (armor.material === 'metal') armorText = ` Раздается звон! Когти/зубы скрежещут по ${armor.name}.`;
            else if (armor.material === 'leather') armorText = ` Удар приходится в ${armor.name}, смягчая удар.`;
        }
    }

    const enemyAtk = target.atk || target.dmg || 5;
    let inMassMod = (target.mass && npc.mass) ? Math.max(0.2, Math.min(3.0, target.mass / npc.mass)) : 1.0;
    const rawCounterDmg = Math.max(1, Math.floor((enemyAtk * inMassMod) - armorDefense));
    
    // === ГЕНЕРАЦИЯ ТЕКСТА (Используем counterScene) ===
    let counterScene = `${target.name} ${counterVerb} ${counterPartName} ${npc.name}.`;
    
    if (armorText) {
        counterScene += armorText;
    } else {
        if (rawCounterDmg >= 10) counterScene += " Хлыщет кровь, раздается тошнотворный хруст!";
        else if (rawCounterDmg >= 5) counterScene += " Остается глубокая, кровоточащая рана.";
        else counterScene += " Царапина, но больно.";
    }

    Reg.log(counterScene, 'combat');

    // === ПРИМЕНЕНИЕ УРОНА ===
    if (window.applyBodyDamage) {
      window.applyBodyDamage(npc, rawCounterDmg, counterAttackType === 'bite' ? 'piercing' : (counterAttackType === 'claw' ? 'slashing' : 'blunt'), hitPart, rawCounterDmg >= 10, target);
    } else {
      npc.hp -= rawCounterDmg;
    }

    if (npc.hp <= 0) killNpc(npc, `убит ${target.name}`);
  };
})();
