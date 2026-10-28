(function(){
  Reg.usageRules = Reg.usageRules || [];

  const isContainer = item => (item.tags && item.tags.includes('container')) || (item.shape && item.shape.includes('hollow'));
  const isGlass = item => item.material === 'glass';
  const isHerb = item => item.tags && item.tags.includes('herb');
  const isWood = item => item.material === 'wood';
  const isMetal = item => item.material === 'metal';
  const isStone = item => item.material === 'stone';
  const isBone = item => item.material === 'bone';
  const isCloth = item => item.material === 'cloth';
  const isMagical = item => item.tags && item.tags.includes('magic');
  const isInCombat = npc => npc.task && npc.task.type === 'fight';
  const cellType = (npc) => {
    const c = window.getCell ? window.getCell(npc.x, npc.y) : null;
    return c ? c.type : null;
  };
  const nearFire = (npc) => {
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      const c = window.getCell ? window.getCell(npc.x + dx, npc.y + dy) : null;
      if (c && (c.type === 'campfire' || c.type === 'pot')) return true;
    }
    return false;
  };
  const nearAlchemy = (npc) => {
    for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) {
      const c = window.getCell ? window.getCell(npc.x + dx, npc.y + dy) : null;
      if (c && c.type === 'alchemy') return true;
    }
    return false;
  };
  const nearAnvil = (npc) => {
    for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) {
      const c = window.getCell ? window.getCell(npc.x + dx, npc.y + dy) : null;
      if (c && (c.type === 'forge' || c.type === 'anvil')) return true;
    }
    return false;
  };

  Reg.usageRules.push(
    // === СОЗДАТЬ ЗЕЛЬЕ ===
    {
      id: 'craft_potion_healing',
      evaluate: (npc, item) => {
        if (!isContainer(item) || !isGlass(item)) return null;
        if (!nearAlchemy(npc) && !nearFire(npc)) return null;
        if (npc.hp > npc.maxHp * 0.5) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 200,
          successChance: 0.6,
          consequence: { hp: 15, emo: { joy: 15, stress: -10 }, destroyItem: true }
        };
      }
    },
    {
      id: 'craft_potion_curious',
      evaluate: (npc, item) => {
        if (!isContainer(item)) return null;
        if (!nearAlchemy(npc)) return null;
        if (!npc.facets || npc.facets.curiosity < 60) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 100,
          successChance: 0.5,
          consequence: { emo: { joy: 5, stress: 5 }, destroyItem: true }
        };
      }
    },
    {
      id: 'craft_potion_poison',
      evaluate: (npc, item) => {
        if (!isContainer(item)) return null;
        if (!nearAlchemy(npc)) return null;
        if (!npc.facets || npc.facets.aggression < 60) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 60,
          successChance: 0.5,
          consequence: { emo: { joy: 10 }, destroyItem: true }
        };
      }
    },

    // === ПРОСТО ИЗУЧИТЬ КОЛБУ ===
    {
      id: 'examine_glass',
      evaluate: (npc, item) => {
        if (!isGlass(item)) return null;
        if (!npc.facets || npc.facets.curiosity < 40) return null;
        return {
          action: 'study', actionKey: 'study',
          weight: 40,
          successChance: 1.0,
          consequence: { emo: { joy: 5 } }
        };
      }
    },
    {
      id: 'break_glass_rage',
      evaluate: (npc, item) => {
        if (!isGlass(item)) return null;
        if (!npc.emo || npc.emo.stress < 70) return null;
        return {
          action: 'break', actionKey: 'break',
          weight: 70,
          successChance: 0.9,
          createsRumor: true, rumorType: 'fear',
          consequence: { hp: -2, emo: { stress: -15, joy: 5 }, destroyItem: true }
        };
      }
    },

    // === ОБРАБОТАТЬ ДЕРЕВО ===
    {
      id: 'craft_wood_item',
      evaluate: (npc, item) => {
        if (!isWood(item)) return null;
        if (!npc.facets || npc.facets.diligence < 40) return null;
        if (!nearFire(npc) && !nearAnvil(npc)) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 30,
          successChance: 0.7,
          consequence: { emo: { joy: 5 }, destroyItem: true }
        };
      }
    },
    {
      id: 'wood_as_fuel',
      evaluate: (npc, item) => {
        if (!isWood(item)) return null;
        if (!nearFire(npc)) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 80,
          successChance: 0.9,
          consequence: { emo: { joy: 5 }, destroyItem: true }
        };
      }
    },
    {
      id: 'wood_as_weapon_improvised',
      evaluate: (npc, item) => {
        if (!isWood(item)) return null;
        if (!isInCombat(npc)) return null;
        return {
          action: 'attack', actionKey: 'attack_blunt',
          weight: 60,
          successChance: 0.6,
          consequence: { emo: { joy: 5 }, itemCondition: 'cracked' }
        };
      }
    },

    // === ОБРАБОТАТЬ МЕТАЛЛ ===
    {
      id: 'craft_metal_improve',
      evaluate: (npc, item) => {
        if (!isMetal(item)) return null;
        if (!nearAnvil(npc)) return null;
        if (!npc.skills || npc.skills.smithing < 0.5) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 60,
          successChance: 0.7,
          consequence: { emo: { joy: 10 } }
        };
      }
    },
    {
      id: 'metal_to_ingot',
      evaluate: (npc, item) => {
        if (!isMetal(item)) return null;
        if (!nearFire(npc)) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 40,
          successChance: 0.8,
          consequence: { emo: { joy: 5 }, destroyItem: true }
        };
      }
    },

    // === ОБРАБОТАТЬ КОСТЬ ===
    {
      id: 'craft_bone_weapon',
      evaluate: (npc, item) => {
        if (!isBone(item)) return null;
        if (!npc.facets || npc.facets.curiosity < 50) return null;
        if (!nearAnvil(npc)) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 50,
          successChance: 0.6,
          consequence: { emo: { joy: 5 }, destroyItem: true }
        };
      }
    },
    {
      id: 'bone_as_weapon_improv',
      evaluate: (npc, item) => {
        if (!isBone(item)) return null;
        if (!isInCombat(npc)) return null;
        return {
          action: 'attack', actionKey: 'attack_blunt',
          weight: 50,
          successChance: 0.5,
          consequence: { emo: { joy: 5 }, itemCondition: 'cracked' }
        };
      }
    },

    // === ОБРАБОТАТЬ ТКАНЬ ===
    {
      id: 'cloth_as_bandage',
      evaluate: (npc, item) => {
        if (!isCloth(item)) return null;
        if (!npc.body) return null;
        let hasBleeding = false;
        for (const p in npc.body) {
          if (npc.body[p].bleeding > 0) hasBleeding = true;
        }
        if (!hasBleeding) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 120,
          successChance: 0.8,
          consequence: { hp: 5, emo: { joy: 10, stress: -5 }, destroyItem: true }
        };
      }
    },
    {
      id: 'cloth_as_torch',
      evaluate: (npc, item) => {
        if (!isCloth(item)) return null;
        if (!nearFire(npc)) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 40,
          successChance: 0.8,
          consequence: { emo: { joy: 5 }, destroyItem: true }
        };
      }
    },

    // === СОЗДАТЬ КИРКУ ИЗ ХЛАМА ===
    {
      id: 'craft_pickaxe_desperate',
      evaluate: (npc, item) => {
        if (!isMetal(item) && !isStone(item)) return null;
        if (!npc.inventory) return null;
        if (npc.inventory.pickaxe_durability > 0) return null;
        if (!nearAnvil(npc)) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 100,
          successChance: 0.5,
          consequence: { emo: { joy: 20, stress: -10 }, destroyItem: true }
        };
      }
    },

    // === ОБРАБОТАТЬ СВИТОК ===
    {
      id: 'study_scroll',
      evaluate: (npc, item) => {
        if (!isCloth(item) || !isMagical(item)) return null;
        if (!npc.facets || npc.facets.curiosity < 50) return null;
        return {
          action: 'study', actionKey: 'study',
          weight: 80,
          successChance: 0.7,
          consequence: { emo: { joy: 10 } }
        };
      }
    },
    {
      id: 'scroll_as_weapon_improv',
      evaluate: (npc, item) => {
        if (!isCloth(item) || !isMagical(item)) return null;
        if (!isInCombat(npc)) return null;
        return {
          action: 'attack', actionKey: 'attack_slash',
          weight: 40,
          successChance: 0.4,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { stress: 10 }, destroyItem: true }
        };
      }
    },

    // === ПОСТРОИТЬ ИЗ КАМНЯ ===
    {
      id: 'stone_to_block',
      evaluate: (npc, item) => {
        if (!isStone(item)) return null;
        if (!npc.facets || npc.facets.diligence < 50) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 30,
          successChance: 0.8,
          consequence: { emo: { joy: 5 }, destroyItem: true }
        };
      }
    }
  );

  console.log(`[Usage Rules: Craft] Добавлено 20 правил крафта.`);
})();
