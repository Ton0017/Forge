(function(){
  Reg.usageRules = Reg.usageRules || [];

  const isMad = (npc) => npc.hasGoneInsane;
  const isStressCritical = (npc) => npc.emo && npc.emo.stress > 85;
  const isSharp = item => item.shape && item.shape.includes('sharp');
  const isFood = item => item.tags && item.tags.includes('edible');
  const isMagical = item => item.tags && item.tags.includes('magic');
  const isCursed = item => item.tags && item.tags.includes('cursed');

  const nearFire = (npc) => {
    for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) {
      const c = window.getCell ? window.getCell(npc.x + dx, npc.y + dy) : null;
      if (c && (c.type === 'campfire' || c.type === 'pot' || c.type === 'lava')) return true;
    }
    return false;
  };
  const nearWater = (npc) => {
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      const c = window.getCell ? window.getCell(npc.x + dx, npc.y + dy) : null;
      if (c && c.type === 'water') return true;
    }
    return false;
  };

  Reg.usageRules.push(
    // === УНИЧТОЖИТЬ ВСЁ В БЕЗУМИИ ===
    {
      id: 'destroy_item_madness',
      evaluate: (npc, item) => {
        if (!isMad(npc)) return null;
        if (Math.random() > 0.3) return null;
        return {
          action: 'break', actionKey: 'break',
          weight: 100,
          successChance: 0.8,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { joy: 10, stress: -15 }, destroyItem: true }
        };
      }
    },
    {
      id: 'destroy_magical_madness',
      evaluate: (npc, item) => {
        if (!isMad(npc)) return null;
        if (!isMagical(item) && !isCursed(item)) return null;
        return {
          action: 'break', actionKey: 'break',
          weight: 200,
          successChance: 0.7,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { joy: 20, stress: -20 }, destroyItem: true }
        };
      }
    },

    // === СЖЕЧЬ ===
    {
      id: 'burn_item_madness',
      evaluate: (npc, item) => {
        if (!isMad(npc) && !isStressCritical(npc)) return null;
        if (!nearFire(npc)) return null;
        return {
          action: 'throw', actionKey: 'throw',
          weight: 100,
          successChance: 0.85,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { joy: 15, stress: -10 }, destroyItem: true }
        };
      }
    },
    {
      id: 'burn_scroll_madness',
      evaluate: (npc, item) => {
        if (!isMad(npc)) return null;
        if (!isMagical(item)) return null;
        if (!nearFire(npc)) return null;
        return {
          action: 'throw', actionKey: 'throw',
          weight: 180,
          successChance: 0.9,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { joy: 25, stress: -30 }, destroyItem: true }
        };
      }
    },

    // === БРОСИТЬ В ВОДУ ===
    {
      id: 'drown_item_madness',
      evaluate: (npc, item) => {
        if (!isMad(npc)) return null;
        if (!nearWater(npc)) return null;
        return {
          action: 'throw', actionKey: 'throw',
          weight: 80,
          successChance: 0.9,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { joy: 10, stress: -5 }, destroyItem: true }
        };
      }
    },

    // === СЪЕСТЬ ЧТО УГОДНО ===
    {
      id: 'eat_anything_madness',
      evaluate: (npc, item) => {
        if (!isMad(npc)) return null;
        if (isFood(item)) return null;
        return {
          action: 'eat', actionKey: 'eat_wood',
          weight: 80,
          successChance: 0.4,
          createsRumor: true, rumorType: 'fear',
          consequence: { hp: -3, emo: { joy: 5, stress: 10 }, destroyItem: true }
        };
      }
    },
    {
      id: 'eat_self_harm_madness',
      evaluate: (npc, item) => {
        if (!isMad(npc)) return null;
        if (!isSharp(item)) return null;
        return {
          action: 'attack', actionKey: 'self_eat',
          weight: 150,
          successChance: 0.6,
          createsRumor: true, rumorType: 'fear',
          consequence: { hp: -15, emo: { joy: 15, stress: 20 } }
        };
      }
    },

    // === ПОКРЫТЬ СЕБЯ ПРЕДМЕТОМ ===
    {
      id: 'wear_everything_madness',
      evaluate: (npc, item) => {
        if (!isMad(npc)) return null;
        if (!item.tags || (!item.tags.includes('armor') && !item.tags.includes('weapon'))) return null;
        if (npc.equipment && npc.equipment.armor) return null;
        return {
          action: 'equip', actionKey: 'equip',
          weight: 120,
          successChance: 0.9,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { joy: 15, stress: -5 } }
        };
      }
    },

    // === РАЗГОВАРИВАТЬ С ПРЕДМЕТОМ ===
    {
      id: 'talk_to_object_madness',
      evaluate: (npc, item) => {
        if (!isMad(npc)) return null;
        if (Math.random() > 0.5) return null;
        return {
          action: 'examine', actionKey: 'examine',
          weight: 70,
          successChance: 1.0,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { joy: 5, stress: -3 } }
        };
      }
    },

    // === ЗАКОПАТЬ ПРЕДМЕТ ===
    {
      id: 'bury_item_madness',
      evaluate: (npc, item) => {
        if (!isMad(npc)) return null;
        if (!item.tags || (!item.tags.includes('corpse') && !isMagical(item))) return null;
        return {
          action: 'hide', actionKey: 'hide',
          weight: 90,
          successChance: 0.85,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { joy: 10, stress: -10 }, destroyItem: true }
        };
      }
    },

    // === ОДЕТЬ ПРОКЛЯТУЮ ВЕЩЬ ===
    {
      id: 'wear_cursed_insanity',
      evaluate: (npc, item) => {
        if (!isCursed(item)) return null;
        if (!isMad(npc)) return null;
        return {
          action: 'equip', actionKey: 'equip',
          weight: 200,
          successChance: 0.95,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { joy: 20, stress: 15, fear: 10 } }
        };
      }
    },

    // === ПОКЛОНЯТЬСЯ ПРЕДМЕТУ ===
    {
      id: 'worship_object_madness',
      evaluate: (npc, item) => {
        if (!isMad(npc)) return null;
        if (!isMagical(item)) return null;
        return {
          action: 'pray', actionKey: 'pray',
          weight: 150,
          successChance: 0.9,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { joy: 15, stress: -10 } }
        };
      }
    },

    // === ИЗБИТЬ ПРЕДМЕТ ===
    {
      id: 'beat_object_madness',
      evaluate: (npc, item) => {
        if (!isMad(npc)) return null;
        if (!npc.emo || npc.emo.anger < 60) return null;
        return {
          action: 'break', actionKey: 'break',
          weight: 100,
          successChance: 0.7,
          consequence: { emo: { joy: 10, stress: -20 }, destroyItem: true }
        };
      }
    },

    // === СНЯТЬ С СЕБЯ ВСЁ ===
    {
      id: 'strip_self_madness',
      evaluate: (npc, item) => {
        if (!isMad(npc)) return null;
        if (!npc.equipment || (!npc.equipment.weapon && !npc.equipment.armor)) return null;
        if (!isSharp(item)) return null;
        return {
          action: 'break', actionKey: 'break',
          weight: 60,
          successChance: 0.5,
          consequence: { hp: -2, emo: { joy: 5, stress: -10 }, destroyItem: true }
        };
      }
    },

    // === ПРЯТАТЬСЯ ЗА ПРЕДМЕТОМ ===
    {
      id: 'hide_behind_item_madness',
      evaluate: (npc, item) => {
        if (!isMad(npc)) return null;
        if (!npc.emo || npc.emo.fear < 70) return null;
        if (!item.tags || (!item.tags.includes('armor') && !item.tags.includes('shield'))) return null;
        return {
          action: 'equip', actionKey: 'equip',
          weight: 80,
          successChance: 0.85,
          consequence: { emo: { fear: -15, joy: 5 } }
        };
      }
    },

    // === ИСКАТЬ СМЫСЛ В ХЛАМЕ ===
    {
      id: 'philosophize_madness',
      evaluate: (npc, item) => {
        if (!isMad(npc)) return null;
        if (Math.random() > 0.4) return null;
        return {
          action: 'study', actionKey: 'study',
          weight: 50,
          successChance: 0.8,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { joy: 10, stress: -5 } }
        };
      }
    },

    // === ОТДАТЬ ВРАГУ ===
    {
      id: 'give_to_enemy_madness',
      evaluate: (npc, item) => {
        if (!isMad(npc)) return null;
        if (!isMagical(item) && !isCursed(item)) return null;
        if (!window.state || !window.state.npcs) return null;
        const enemy = window.state.npcs.find(n => 
          n.alive && n.id !== npc.id &&
          npc.relations && (npc.relations[n.id] || 0) < -20 &&
          Math.abs(n.x - npc.x) + Math.abs(n.y - npc.y) <= 3
        );
        if (!enemy) return null;
        return {
          action: 'show', actionKey: 'show',
          weight: 150,
          successChance: 0.9,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { joy: 20, stress: -10 }, destroyItem: true }
        };
      }
    },

    // === ПОКРЫТЬСЯ ГРЯЗЬЮ ===
    {
      id: 'smear_dirt_madness',
      evaluate: (npc, item) => {
        if (!isMad(npc)) return null;
        if (item.material !== 'stone' && item.material !== 'wood') return null;
        return {
          action: 'equip', actionKey: 'equip',
          weight: 40,
          successChance: 0.9,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { joy: 10, stress: -10 } }
        };
      }
    },

    // === СЛОМАТЬ СВОЮ КИРКУ ===
    {
      id: 'destroy_own_pickaxe',
      evaluate: (npc, item) => {
        if (!isMad(npc)) return null;
        if (!npc.inventory || npc.inventory.pickaxe_durability === undefined) return null;
        if (item.name && !item.name.toLowerCase().includes('pickaxe') && !item.name.toLowerCase().includes('кирк')) return null;
        return {
          action: 'break', actionKey: 'break',
          weight: 100,
          successChance: 0.8,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { joy: 15, stress: -15 }, destroyItem: true }
        };
      }
    },

    // === СПРЯТАТЬ ВСЁ ===
    {
      id: 'hide_all_madness',
      evaluate: (npc, item) => {
        if (!isMad(npc)) return null;
        if (Math.random() > 0.3) return null;
        return {
          action: 'hide', actionKey: 'hide',
          weight: 60,
          successChance: 0.85,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { joy: 5, stress: -5 } }
        };
      }
    }
  );

  console.log(`[Usage Rules: Madness] Добавлено 20 правил безумия.`);
})();
