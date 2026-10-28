(function(){
  Reg.usageRules = Reg.usageRules || [];

  const isSharp = item => item.shape && item.shape.includes('sharp');
  const isCloth = item => item.material === 'cloth';
  const isWood = item => item.material === 'wood';
  const isMetal = item => item.material === 'metal';
  const isBone = item => item.material === 'bone';
  const isFood = item => item.tags && item.tags.includes('edible') && !item.tags.includes('poisonous');
  const isPoisonous = item => item.tags && item.tags.includes('poisonous');
  const isHerb = item => item.tags && item.tags.includes('herb');
  const isInCombat = npc => npc.task && npc.task.type === 'fight';

  const hasBleeding = (npc) => {
    if (!npc.body) return false;
    for (const p in npc.body) {
      if (npc.body[p].bleeding > 0) return true;
    }
    return false;
  };
  const lostLimb = (npc) => {
    if (!npc.body) return null;
    for (const p in npc.body) {
      if (npc.body[p].status === 'severed' && p !== 'head' && p !== 'torso') return p;
    }
    return null;
  };
  const hasInfection = (npc) => npc.infections && npc.infections.length > 0;
  const isWounded = (npc) => npc.hp < npc.maxHp * 0.7;
  const isDying = (npc) => npc.hp < npc.maxHp * 0.3;

  Reg.usageRules.push(
    // === ЛЕЧЕНИЕ БАНДАЖОМ ===
    {
      id: 'bandage_self',
      evaluate: (npc, item) => {
        if (!isCloth(item)) return null;
        if (!hasBleeding(npc)) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 150,
          successChance: 0.75,
          consequence: { hp: 5, emo: { joy: 10, stress: -10 }, destroyItem: true }
        };
      }
    },
    {
      id: 'bandage_friend',
      evaluate: (npc, item) => {
        if (!isCloth(item)) return null;
        if (!window.state || !window.state.npcs) return null;
        if (!npc.facets || npc.facets.altruism < 50) return null;
        const woundedFriend = window.state.npcs.find(n =>
          n.alive && n.id !== npc.id && n.hp < n.maxHp * 0.5 &&
          Math.abs(n.x - npc.x) + Math.abs(n.y - npc.y) <= 2
        );
        if (!woundedFriend) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 120,
          successChance: 0.8,
          consequence: { hp: 8, emo: { joy: 15, stress: -10 }, destroyItem: true }
        };
      }
    },

    // === ЛЕЧЕБНЫЕ ТРАВЫ ===
    {
      id: 'eat_herb_healing',
      evaluate: (npc, item) => {
        if (!isHerb(item)) return null;
        if (!isWounded(npc)) return null;
        return {
          action: 'eat', actionKey: 'eat_food',
          weight: 100,
          successChance: 0.85,
          consequence: { hp: 15, emo: { joy: 10, stress: -10 }, destroyItem: true }
        };
      }
    },
    {
      id: 'apply_herb_friend',
      evaluate: (npc, item) => {
        if (!isHerb(item)) return null;
        if (!window.state || !window.state.npcs) return null;
        if (!npc.facets || npc.facets.altruism < 60) return null;
        const friend = window.state.npcs.find(n =>
          n.alive && n.id !== npc.id && n.hp < n.maxHp * 0.5 &&
          Math.abs(n.x - npc.x) + Math.abs(n.y - npc.y) <= 2
        );
        if (!friend) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 90,
          successChance: 0.9,
          consequence: { hp: 20, emo: { joy: 15, stress: -10 }, destroyItem: true }
        };
      }
    },

    // === ОТРАВЛЕНИЕ (случайное) ===
    {
      id: 'eat_poison_wounded',
      evaluate: (npc, item) => {
        if (!isPoisonous(item)) return null;
        if (!isWounded(npc)) return null;
        if (!npc.facets || npc.facets.curiosity < 50) return null;
        return {
          action: 'eat', actionKey: 'eat_food',
          weight: 30,
          successChance: 0.2,
          consequence: { hp: -20, emo: { stress: 20, fear: 10 }, destroyItem: true }
        };
      }
    },

    // === ПРИРАЩИВАНИЕ ОРУЖИЯ К КУЛЬТЕ ===
    {
      id: 'attach_sharp_to_stump',
      evaluate: (npc, item) => {
        if (!isSharp(item)) return null;
        if (!lostLimb(npc)) return null;
        if (!npc.facets || npc.facets.curiosity < 30) return null;
        return {
          action: 'equip', actionKey: 'attach',
          weight: 70,
          successChance: 0.6,
          createsRumor: true, rumorType: 'fear',
          consequence: { hp: -3, emo: { joy: 5, stress: 15, fear: 5 }, attachToStump: true }
        };
      }
    },
    {
      id: 'attach_bone_to_stump',
      evaluate: (npc, item) => {
        if (!isBone(item)) return null;
        if (!lostLimb(npc)) return null;
        if (!npc.facets || npc.facets.curiosity < 40) return null;
        return {
          action: 'equip', actionKey: 'attach',
          weight: 50,
          successChance: 0.5,
          createsRumor: true, rumorType: 'fear',
          consequence: { hp: -2, emo: { joy: 5, stress: 10 }, attachToStump: true }
        };
      }
    },
    {
      id: 'attach_metal_weapon_stump',
      evaluate: (npc, item) => {
        if (!isMetal(item) || !isSharp(item)) return null;
        if (!lostLimb(npc)) return null;
        if (!npc.facets || npc.facets.courage < 60) return null;
        return {
          action: 'equip', actionKey: 'attach',
          weight: 100,
          successChance: 0.75,
          createsRumor: true, rumorType: 'fear',
          consequence: { hp: -2, emo: { joy: 10, stress: 5 }, attachToStump: true }
        };
      }
    },

    // === УНИВЕРСАЛЬНЫЙ ПРОТЕЗ (Любой предмет) ===
    {
      id: 'attach_anything_to_stump',
      evaluate: (npc, item) => {
        if (!lostLimb(npc)) return null;
        if (!item || !item.name) return null;
        // Не прикрепляем еду и то, что уже носят
        if (item.tags && (item.tags.includes('food') || item.tags.includes('drink'))) return null;
        if (item.tags && (item.tags.includes('weapon') || item.tags.includes('armor')) && npc.equipment) {
            // Если это экипированное оружие/броня — не трогаем (пусть лучше наденет)
            if (npc.equipment.weapon === item || npc.equipment.armor === item) return null;
        }
        return {
          action: 'equip', actionKey: 'attach',
          weight: 30, // Низкий приоритет — только если нет лучшего варианта
          successChance: 0.5,
          createsRumor: true, rumorType: 'fear',
          consequence: { hp: -2, emo: { joy: 3, stress: 10 }, attachToStump: true }
        };
      }
    },

    // === ОТКАЗ ОТ ПРИРАЩИВАНИЯ (страх боли) ===
    {
      id: 'refuse_attach_coward',
      evaluate: (npc, item) => {
        if (!isSharp(item)) return null;
        if (!lostLimb(npc)) return null;
        if (!npc.facets || npc.facets.courage >= 30) return null;
        return {
          action: 'ignore', actionKey: 'ignore',
          weight: 100,
          successChance: 1.0,
          consequence: { emo: { fear: 10, stress: 5 } }
        };
      }
    },

    // === ЛЕЧЕНИЕ ИНФЕКЦИИ ===
    {
      id: 'treat_infection_herb',
      evaluate: (npc, item) => {
        if (!isHerb(item)) return null;
        if (!hasInfection(npc)) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 120,
          successChance: 0.7,
          consequence: { hp: 10, emo: { joy: 10, stress: -10 }, destroyItem: true }
        };
      }
    },
    {
      id: 'treat_infection_booze',
      evaluate: (npc, item) => {
        if (!item.tags || !item.tags.includes('booze')) return null;
        if (!hasInfection(npc)) return null;
        return {
          action: 'drink', actionKey: 'drink',
          weight: 80,
          successChance: 0.5,
          consequence: { hp: 5, emo: { joy: 5, drunk: 10 }, destroyItem: true }
        };
      }
    },
    {
      id: 'treat_infection_desperate',
      evaluate: (npc, item) => {
        if (!isHerb(item)) return null;
        if (!hasInfection(npc)) return null;
        if (npc.hp > npc.maxHp * 0.3) return null;
        return {
          action: 'eat', actionKey: 'eat_food',
          weight: 200,
          successChance: 0.4,
          consequence: { hp: 20, emo: { joy: 15, stress: -15 }, destroyItem: true }
        };
      }
    },

    // === ОБЕЗБОЛИВАЮЩЕЕ ===
    {
      id: 'drink_booze_for_pain',
      evaluate: (npc, item) => {
        if (!item.tags || !item.tags.includes('booze')) return null;
        if (!isWounded(npc)) return null;
        if (npc.emo.stress < 50) return null;
        return {
          action: 'drink', actionKey: 'drink',
          weight: 80,
          successChance: 0.9,
          consequence: { emo: { joy: 10, drunk: 20, stress: -15, fear: -5 }, destroyItem: true }
        };
      }
    },

    // === ЕДА ПРИ РАНЕНИИ ===
    {
      id: 'eat_to_heal',
      evaluate: (npc, item) => {
        if (!isFood(item)) return null;
        if (!isWounded(npc)) return null;
        if (npc.hunger > 50) return null;
        return {
          action: 'eat', actionKey: 'eat_food',
          weight: 80,
          successChance: 0.95,
          consequence: { hp: 5, emo: { joy: 10, stress: -5 }, destroyItem: true }
        };
      }
    },

    // === БЕЗУМИЕ + КРОВОТЕЧЕНИЕ ===
    {
      id: 'self_harm_madness',
      evaluate: (npc, item) => {
        if (!isSharp(item)) return null;
        if (!npc.hasGoneInsane) return null;
        if (!npc.facets || npc.facets.aggression < 50) return null;
        return {
          action: 'attack', actionKey: 'attack_slash',
          weight: 100,
          successChance: 0.8,
          createsRumor: true, rumorType: 'fear',
          consequence: { hp: -10, emo: { stress: 20, joy: 5 } }
        };
      }
    },

    // === ИГНОРИРОВАТЬ РАНУ (трудяга) ===
    {
      id: 'ignore_wound_hardworking',
      evaluate: (npc, item) => {
        if (!isWounded(npc)) return null;
        if (!npc.trait || npc.trait.id !== 'hardworking') return null;
        if (isDying(npc)) return null;
        return {
          action: 'ignore', actionKey: 'ignore',
          weight: 50,
          successChance: 1.0,
          consequence: { emo: { stress: 5 } }
        };
      }
    },

    // === ПАНКИА ПО ПОВОДУ РАНЫ (трус) ===
    {
      id: 'panic_wound_coward',
      evaluate: (npc, item) => {
        if (!isCloth(item)) return null;
        if (!hasBleeding(npc)) return null;
        if (!npc.facets || npc.facets.courage >= 30) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 150,
          successChance: 0.5,
          consequence: { emo: { stress: -5, fear: -10 } }
        };
      }
    },

    // === ОТРУБЛЕННАЯ КОНЕЧНОСТЬ + МОЛИТВА ===
    {
      id: 'pray_after_sever',
      evaluate: (npc, item) => {
        if (!isCloth(item)) return null;
        if (!lostLimb(npc)) return null;
        if (!npc.trait || npc.trait.id !== 'pious') return null;
        return {
          action: 'pray', actionKey: 'pray',
          weight: 80,
          successChance: 1.0,
          consequence: { emo: { joy: 5, stress: -15 } }
        };
      }
    },

    // === СОБРАТЬ СВОЮ КРОВЬ ===
    {
      id: 'collect_own_blood',
      evaluate: (npc, item) => {
        if (!isCloth(item)) return null;
        if (!hasBleeding(npc)) return null;
        if (!npc.hasGoneInsane) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 40,
          successChance: 0.9,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { stress: 15 } }
        };
      }
    },

    // === ИСПОЛЬЗОВАТЬ ОСТРИЁ ДЛЯ ОПЕРАЦИИ ===
    {
      id: 'self_surgery',
      evaluate: (npc, item) => {
        if (!isSharp(item)) return null;
        if (!hasInfection(npc)) return null;
        if (npc.hp < 20) return null;
        if (!npc.facets || npc.facets.courage < 70) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 50,
          successChance: 0.3,
          createsRumor: true, rumorType: 'fear',
          consequence: { hp: 15, emo: { stress: 20, fear: 10 } }
        };
      }
    },

    // === ПРОСТО ИЗУЧИТЬ СВОЮ РАНУ ===
    {
      id: 'examine_wound',
      evaluate: (npc, item) => {
        if (!isWounded(npc)) return null;
        if (!npc.facets || npc.facets.curiosity < 50) return null;
        return {
          action: 'examine', actionKey: 'examine',
          weight: 30,
          successChance: 1.0,
          consequence: { emo: { stress: 5 } }
        };
      }
    },

    // === ТЕЛО ТОВАРИЩА (труп) ===
    {
      id: 'examine_corpse',
      evaluate: (npc, item) => {
        if (!item.tags || !item.tags.includes('corpse')) return null;
        if (npc.facets && npc.facets.altruism > 50) return null;
        return {
          action: 'examine', actionKey: 'examine',
          weight: 60,
          successChance: 1.0,
          consequence: { emo: { stress: 15, fear: 5 } }
        };
      }
    },
    {
      id: 'grieve_corpse',
      evaluate: (npc, item) => {
        if (!item.tags || !item.tags.includes('corpse')) return null;
        if (!npc.facets || npc.facets.altruism < 60) return null;
        return {
          action: 'examine', actionKey: 'examine',
          weight: 80,
          successChance: 1.0,
          consequence: { emo: { stress: 20, joy: -10 } }
        };
      }
    },

    // === ИСПОЛЬЗОВАТЬ КОСТЬ КАК ШИНУ ===
    {
      id: 'bone_as_splint',
      evaluate: (npc, item) => {
        if (!isBone(item)) return null;
        if (!npc.body) return null;
        const hasFracture = Object.values(npc.body).some(p => p.status === 'fracture');
        if (!hasFracture) return null;
        if (!npc.facets || npc.facets.curiosity < 40) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 60,
          successChance: 0.6,
          consequence: { hp: 5, emo: { joy: 5, stress: -5 }, destroyItem: true }
        };
      }
    },

    // === ОТКАЗ ОТ ЕДЫ (самоистязание) ===
    {
      id: 'refuse_eat_madness',
      evaluate: (npc, item) => {
        if (!isFood(item)) return null;
        if (!npc.hasGoneInsane) return null;
        if (npc.emo.stress < 90) return null;
        return {
          action: 'ignore', actionKey: 'ignore',
          weight: 100,
          successChance: 1.0,
          consequence: { hp: -3, emo: { stress: 15 } }
        };
      }
    },

    // === ПИТЬ КРОВЬ (безумие) ===
    {
      id: 'drink_blood_madness',
      evaluate: (npc, item) => {
        if (!item.tags || !item.tags.includes('blood')) return null;
        if (!npc.hasGoneInsane) return null;
        return {
          action: 'drink', actionKey: 'drink',
          weight: 80,
          successChance: 0.9,
          createsRumor: true, rumorType: 'fear',
          consequence: { hp: 5, emo: { joy: 10, stress: 20 } }
        };
      }
    },

    // === КОПАТЬ С РАНЕНОЙ РУКОЙ ===
    {
      id: 'keep_digging_wounded',
      evaluate: (npc, item) => {
        if (!npc.task || npc.task.type !== 'dig') return null;
        if (!isWounded(npc)) return null;
        if (!npc.facets || npc.facets.diligence < 60) return null;
        return {
          action: 'ignore', actionKey: 'ignore',
          weight: 40,
          successChance: 1.0,
          consequence: { emo: { stress: 5 } }
        };
      }
    }
  );

  console.log(`[Usage Rules: Body] Добавлено 30 правил тела.`);
})();
