(function(){
  Reg.usageRules = Reg.usageRules || [];

  const isWeapon = item => item.tags && item.tags.includes('weapon');
  const isArmor = item => item.tags && item.tags.includes('armor');
  const isSharp = item => item.shape && item.shape.includes('sharp');
  const isHeavy = item => (item.weight === 'heavy') || (item.shape && item.shape.includes('heavy'));
  const isLong = item => item.shape && item.shape.includes('long');
  const isMagical = item => item.tags && item.tags.includes('magic');
  const isCursed = item => item.tags && item.tags.includes('cursed');
  const isFire = item => item.tags && item.tags.includes('fire');
  const isFragile = item => item.tags && item.tags.includes('fragile');
  const isInCombat = npc => npc.task && npc.task.type === 'fight';
  const hasNoWeapon = npc => !npc.equipment || !npc.equipment.weapon;
  const hasNoArmor = npc => !npc.equipment || !npc.equipment.armor;
  const hasRightArm = npc => npc.body && npc.body.right_arm && npc.body.right_arm.status !== 'severed';
  const hasLeftArm = npc => npc.body && npc.body.left_arm && npc.body.left_arm.status !== 'severed';
  const lostRightArm = npc => npc.body && npc.body.right_arm && npc.body.right_arm.status === 'severed';
  const lostLeftArm = npc => npc.body && npc.body.left_arm && npc.body.left_arm.status === 'severed';

  Reg.usageRules.push(
    // === НАДЕТЬ НАСТОЯЩЕЕ ОРУЖИЕ ===
    {
      id: 'equip_weapon_courage',
      evaluate: (npc, item) => {
        if (!isWeapon(item) || !hasNoWeapon(npc)) return null;
        if (!npc.facets || npc.facets.courage < 30) return null;
        if (!hasRightArm(npc) && !hasLeftArm(npc)) return null;
        return {
          action: 'equip', actionKey: 'equip',
          weight: 150,
          successChance: 0.95,
          consequence: { emo: { joy: 10, stress: -5 } }
        };
      }
    },
    {
      id: 'equip_weapon_coward',
      evaluate: (npc, item) => {
        if (!isWeapon(item) || !hasNoWeapon(npc)) return null;
        if (!npc.facets || npc.facets.courage >= 30) return null;
        return {
          action: 'equip', actionKey: 'equip',
          weight: 30,
          successChance: 0.8,
          consequence: { emo: { joy: 5, fear: 10 } }
        };
      }
    },
    {
      id: 'equip_weapon_hardworking_refuse',
      evaluate: (npc, item) => {
        if (!isWeapon(item)) return null;
        if (!npc.trait || npc.trait.id !== 'hardworking') return null;
        if (isInCombat(npc)) return null;
        return {
          action: 'ignore', actionKey: 'ignore',
          weight: 80,
          successChance: 1.0,
          consequence: { emo: { stress: 5 } }
        };
      }
    },
    {
      id: 'equip_weapon_greedy_examine',
      evaluate: (npc, item) => {
        if (!isWeapon(item) || !isMagical(item)) return null;
        if (!npc.facets || npc.facets.greed < 60) return null;
        return {
          action: 'examine', actionKey: 'examine',
          weight: 80,
          successChance: 1.0,
          consequence: { emo: { joy: 10 } }
        };
      }
    },
    {
      id: 'equip_magic_weapon_curious',
      evaluate: (npc, item) => {
        if (!isWeapon(item) || !isMagical(item) || !hasNoWeapon(npc)) return null;
        if (!npc.facets || npc.facets.curiosity < 70) return null;
        return {
          action: 'equip', actionKey: 'equip',
          weight: 200,
          successChance: 0.9,
          consequence: { emo: { joy: 20, stress: -10 } }
        };
      }
    },

    // === НАДЕТЬ БРОНЮ ===
    {
      id: 'equip_armor_any',
      evaluate: (npc, item) => {
        if (!isArmor(item) || !hasNoArmor(npc)) return null;
        return {
          action: 'equip', actionKey: 'equip',
          weight: 100,
          successChance: 0.9,
          consequence: { emo: { joy: 5 } }
        };
      }
    },
    {
      id: 'equip_heavy_armor_lazy_refuse',
      evaluate: (npc, item) => {
        if (!isArmor(item) || !isHeavy(item)) return null;
        if (!npc.trait || npc.trait.id !== 'lazy') return null;
        return {
          action: 'ignore', actionKey: 'ignore',
          weight: 70,
          successChance: 1.0,
          consequence: { emo: { joy: 5 } }
        };
      }
    },
    {
      id: 'equip_heavy_armor_hardworking_refuse',
      evaluate: (npc, item) => {
        if (!isArmor(item) || !isHeavy(item)) return null;
        if (!npc.trait || npc.trait.id !== 'hardworking') return null;
        return {
          action: 'ignore', actionKey: 'ignore',
          weight: 50,
          successChance: 1.0,
          consequence: { emo: { stress: 5 } }
        };
      }
    },

    // === ИМПРОВИЗАЦИЯ В БОЮ (нет оружия) ===
    {
      id: 'improv_weapon_in_combat',
      evaluate: (npc, item) => {
        if (!isInCombat(npc) || !hasNoWeapon(npc)) return null;
        if (!isLong(item) && !isSharp(item) && !isHeavy(item)) return null;
        if (!hasRightArm(npc) && !hasLeftArm(npc)) return null;
        return {
          action: 'attack', actionKey: isSharp(item) ? 'attack_pierce' : 'attack_blunt',
          weight: 120,
          successChance: 0.75,
          consequence: { emo: { joy: 5 }, itemCondition: 'cracked' }
        };
      }
    },
    {
      id: 'improv_stone_throw',
      evaluate: (npc, item) => {
        if (!isInCombat(npc) || !hasNoWeapon(npc)) return null;
        if (item.material !== 'stone') return null;
        return {
          action: 'attack', actionKey: 'throw',
          weight: 80,
          successChance: 0.6,
          consequence: { emo: { joy: 5 }, destroyItem: true }
        };
      }
    },
    {
      id: 'improv_glass_throw',
      evaluate: (npc, item) => {
        if (!isInCombat(npc) || !hasNoWeapon(npc)) return null;
        if (item.material !== 'glass') return null;
        return {
          action: 'attack', actionKey: 'throw',
          weight: 100,
          successChance: 0.7,
          consequence: { emo: { joy: 8 }, destroyItem: true }
        };
      }
    },
    {
      id: 'improv_swing_corpse',
      evaluate: (npc, item) => {
        if (!isInCombat(npc) || !hasNoWeapon(npc)) return null;
        if (!item.tags || !item.tags.includes('corpse')) return null;
        if (!npc.facets || npc.facets.aggression < 60) return null;
        return {
          action: 'attack', actionKey: 'attack_blunt',
          weight: 40,
          successChance: 0.5,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { anger: -10 } }
        };
      }
    },
    {
      id: 'improv_shield_body',
      evaluate: (npc, item) => {
        if (!isInCombat(npc)) return null;
        if (!isArmor(item)) return null;
        if (!hasNoArmor(npc)) return null;
        return {
          action: 'equip', actionKey: 'equip',
          weight: 100,
          successChance: 0.9,
          consequence: { emo: { joy: 5 } }
        };
      }
    },

    // === ПОЛОМКА ОРУЖИЯ ===
    {
      id: 'break_fragile_weapon',
      evaluate: (npc, item) => {
        if (!isWeapon(item) || !isFragile(item)) return null;
        if (!isInCombat(npc)) return null;
        return {
          action: 'attack', actionKey: 'attack_slash',
          weight: 60,
          successChance: 0.4,
          consequence: { emo: { stress: 10 }, destroyItem: true }
        };
      }
    },

    // === ПРОКЛЯТОЕ ОРУЖИЕ ===
    {
      id: 'cursed_weapon_wear',
      evaluate: (npc, item) => {
        if (!isCursed(item)) return null;
        if (!isWeapon(item) && !isArmor(item)) return null;
        if (npc.hasCursedItem) return null;
        return {
          action: 'equip', actionKey: 'equip',
          weight: 70,
          successChance: 0.9,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { stress: 15, fear: 10 } }
        };
      }
    },
    {
      id: 'cursed_weapon_fear',
      evaluate: (npc, item) => {
        if (!isCursed(item)) return null;
        if (!npc.facets || npc.facets.courage >= 40) return null;
        return {
          action: 'ignore', actionKey: 'ignore',
          weight: 100,
          successChance: 1.0,
          consequence: { emo: { fear: 15 } }
        };
      }
    },
    {
      id: 'cursed_weapon_destroy_madness',
      evaluate: (npc, item) => {
        if (!isCursed(item)) return null;
        if (!npc.hasGoneInsane && npc.emo.stress < 80) return null;
        return {
          action: 'break', actionKey: 'break',
          weight: 150,
          successChance: 0.7,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { joy: 15, stress: -15 }, destroyItem: true }
        };
      }
    },

    // === ОГНЕННОЕ ОРУЖИЕ ===
    {
      id: 'fire_weapon_scare',
      evaluate: (npc, item) => {
        if (!isFire(item)) return null;
        if (!npc.facets || npc.facets.courage >= 50) return null;
        return {
          action: 'ignore', actionKey: 'ignore',
          weight: 80,
          successChance: 1.0,
          consequence: { emo: { fear: 15 } }
        };
      }
    },
    {
      id: 'fire_weapon_embrace',
      evaluate: (npc, item) => {
        if (!isFire(item)) return null;
        if (!npc.facets || npc.facets.courage < 70) return null;
        if (!hasNoWeapon(npc)) return null;
        return {
          action: 'equip', actionKey: 'equip',
          weight: 120,
          successChance: 0.85,
          consequence: { hp: -3, emo: { joy: 15, fear: 5 } }
        };
      }
    },

    // === ПОКАЗ ОРУЖИЯ (социалка) ===
    {
      id: 'show_weapon_bloodthirsty',
      evaluate: (npc, item) => {
        if (!isWeapon(item)) return null;
        if (!npc.trait || npc.trait.id !== 'bloodthirsty') return null;
        if (isInCombat(npc)) return null;
        return {
          action: 'equip', actionKey: 'show',
          weight: 60,
          successChance: 0.9,
          consequence: { emo: { joy: 10 } }
        };
      }
    },
    {
      id: 'show_rare_weapon_greedy',
      evaluate: (npc, item) => {
        if (!isWeapon(item) || !isMagical(item)) return null;
        if (!npc.facets || npc.facets.greed < 60) return null;
        return {
          action: 'equip', actionKey: 'show',
          weight: 80,
          successChance: 0.9,
          consequence: { emo: { joy: 15 } }
        };
      }
    },

    // === СПРЯТАТЬ ОРУЖИЕ (жадность) ===
    {
      id: 'hide_weapon_greedy',
      evaluate: (npc, item) => {
        if (!isWeapon(item) && !isMagical(item)) return null;
        if (!npc.facets || npc.facets.greed < 70) return null;
        return {
          action: 'hide', actionKey: 'hide',
          weight: 60,
          successChance: 0.9,
          consequence: { emo: { joy: 5 } }
        };
      }
    },

    // === ПРИКРЕПИТЬ К КУЛЬТЕ ===
    {
      id: 'attach_to_stump',
      evaluate: (npc, item) => {
        if (!isSharp(item) && !isWeapon(item)) return null;
        if (!lostRightArm(npc) && !lostLeftArm(npc)) return null;
        if (!npc.facets || npc.facets.curiosity < 40) return null;
        return {
          action: 'equip', actionKey: 'attach',
          weight: 80,
          successChance: 0.7,
          createsRumor: true, rumorType: 'fear',
          consequence: { hp: -2, emo: { joy: 10, stress: 10 } }
        };
      }
    },
    {
      id: 'attach_corpse_weapon',
      evaluate: (npc, item) => {
        if (!isInCombat(npc)) return null;
        if (!lostRightArm(npc) && !lostLeftArm(npc)) return null;
        if (!isSharp(item)) return null;
        return {
          action: 'equip', actionKey: 'attach',
          weight: 60,
          successChance: 0.6,
          consequence: { hp: -1, emo: { joy: 5 } }
        };
      }
    },

    // === ИСПОЛЬЗОВАТЬ ЩИТ ===
    {
      id: 'equip_shield_defensive',
      evaluate: (npc, item) => {
        if (!item.tags || !item.tags.includes('shield')) return null;
        if (npc.equipment && npc.equipment.offhand) return null;
        return {
          action: 'equip', actionKey: 'equip',
          weight: 90,
          successChance: 0.9,
          consequence: { emo: { joy: 5 } }
        };
      }
    },

    // === МЕТАТЬ ОРУЖИЕ (без оружия, есть кинжал) ===
    {
      id: 'throw_dagger',
      evaluate: (npc, item) => {
        if (!isInCombat(npc) || !hasNoWeapon(npc)) return null;
        if (!item.name || !item.name.toLowerCase().includes('dagger')) return null;
        return {
          action: 'attack', actionKey: 'throw',
          weight: 80,
          successChance: 0.75,
          consequence: { emo: { joy: 8 }, destroyItem: true }
        };
      }
    },

    // === ОРУЖИЕ КАК ИНСТРУМЕНТ ===
    {
      id: 'weapon_as_prybar',
      evaluate: (npc, item) => {
        if (!isWeapon(item)) return null;
        if (!isHeavy(item) && !isLong(item)) return null;
        if (!npc.task || npc.task.type !== 'dig') return null;
        if (npc.inventory && npc.inventory.pickaxe_durability > 0) return null;
        return {
          action: 'examine', actionKey: 'examine',
          weight: 50,
          successChance: 0.7,
          consequence: { emo: { neutral: 0 }, itemCondition: 'cracked' }
        };
      }
    },
    {
      id: 'weapon_as_tool',
      evaluate: (npc, item) => {
        if (!isSharp(item)) return null;
        if (!npc.task || npc.task.type !== 'dig') return null;
        return {
          action: 'examine', actionKey: 'examine',
          weight: 20,
          successChance: 0.6,
          consequence: { emo: { stress: 5 }, itemCondition: 'cracked' }
        };
      }
    },

    // === ОРУЖИЕ В РУКАХ (уже надето) — не менять ===
    {
      id: 'keep_favorite_weapon',
      evaluate: (npc, item) => {
        if (!isWeapon(item) || hasNoWeapon(npc)) return null;
        if (!npc.equipment.weapon) return null;
        if (npc.equipment.weapon === item) return null;
        // Не менять любимое
        if (!npc.facets || npc.facets.aesthetics < 60) return null;
        return {
          action: 'examine', actionKey: 'examine',
          weight: 40,
          successChance: 1.0,
          consequence: { emo: { joy: 5 } }
        };
      }
    },

    // === СНЯТЬ БРОНЮ (трусость) ===
    {
      id: 'remove_armor_panic',
      evaluate: (npc, item) => {
        if (!isArmor(item)) return null;
        if (!npc.emo || npc.emo.fear < 70) return null;
        return {
          action: 'ignore', actionKey: 'ignore',
          weight: 80,
          successChance: 1.0,
          consequence: { emo: { fear: -5 } }
        };
      }
    },

    // === ОДЕТЬ ТЯЖЕЛУЮ БРОНЮ В БОЮ ===
    {
      id: 'equip_heavy_armor_combat',
      evaluate: (npc, item) => {
        if (!isArmor(item) || !isHeavy(item)) return null;
        if (!isInCombat(npc)) return null;
        if (!hasNoArmor(npc)) return null;
        if (!npc.facets || npc.facets.courage < 50) return null;
        return {
          action: 'equip', actionKey: 'equip',
          weight: 120,
          successChance: 0.85,
          consequence: { emo: { joy: 5, fear: -10 } }
        };
      }
    },

    // === БРОНЯ С ОГНЕМ ===
    {
      id: 'fire_armor_wear',
      evaluate: (npc, item) => {
        if (!isArmor(item) || !isFire(item)) return null;
        if (!hasNoArmor(npc)) return null;
        if (!npc.facets || npc.facets.courage < 60) return null;
        return {
          action: 'equip', actionKey: 'equip',
          weight: 80,
          successChance: 0.85,
          consequence: { hp: -1, emo: { joy: 10, fear: 5 } }
        };
      }
    },

    // === СНЯТЬ ПРОКЛЯТУЮ БРОНЮ (отчаяние) ===
    {
      id: 'remove_cursed_armor_panic',
      evaluate: (npc, item) => {
        if (!isCursed(item) || !isArmor(item)) return null;
        if (!npc.emo || npc.emo.stress < 80) return null;
        return {
          action: 'break', actionKey: 'break',
          weight: 60,
          successChance: 0.3,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { stress: 10 } }
        };
      }
    },

    // === ВЫБРОСИТЬ РЖАВОЕ ОРУЖИЕ ===
    {
      id: 'throw_away_rusty',
      evaluate: (npc, item) => {
        if (!isWeapon(item)) return null;
        if (!item.name || !item.name.toLowerCase().includes('rusty')) return null;
        if (!npc.facets || npc.facets.aesthetics < 50) return null;
        return {
          action: 'ignore', actionKey: 'ignore',
          weight: 60,
          successChance: 1.0,
          consequence: { emo: { joy: 5 } }
        };
      }
    },

    // === ПРОДАТЬ ОРУЖИЕ ===
    {
      id: 'sell_weapon_caravan',
      evaluate: (npc, item) => {
        if (!isWeapon(item) && !isArmor(item)) return null;
        if (!npc.facets || npc.facets.greed < 70) return null;
        if (!window.state || !window.state.caravan) return null;
        return {
          action: 'examine', actionKey: 'examine',
          weight: 100,
          successChance: 1.0,
          consequence: { emo: { joy: 10 } }
        };
      }
    },

    // === ИСПОЛЬЗОВАТЬ СВИТОК КАК ОРУЖИЕ ===
    {
      id: 'scroll_as_weapon',
      evaluate: (npc, item) => {
        if (!isInCombat(npc)) return null;
        if (!isSharp(item)) return null;
        if (item.material !== 'cloth') return null;
        return {
          action: 'attack', actionKey: 'attack_slash',
          weight: 40,
          successChance: 0.4,
          consequence: { emo: { stress: 5 }, destroyItem: true }
        };
      }
    },

    // === ЗАЩИТИТЬ ДРУГА В БОЮ ===
    {
      id: 'equip_weapon_defend_friend',
      evaluate: (npc, item) => {
        if (!isWeapon(item) || !hasNoWeapon(npc)) return null;
        if (!npc.facets || npc.facets.altruism < 60) return null;
        if (!isInCombat(npc)) return null;
        return {
          action: 'equip', actionKey: 'equip',
          weight: 150,
          successChance: 0.95,
          consequence: { emo: { joy: 10, stress: -5 } }
        };
      }
    }
  );

  console.log(`[Usage Rules: Combat] Загружено ${Reg.usageRules.length - 30} правил боя.`);
})();
