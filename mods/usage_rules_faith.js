(function(){
  Reg.usageRules = Reg.usageRules || [];

  const isMagical = item => item.tags && item.tags.includes('magic');
  const isHoly = item => item.tags && (item.tags.includes('holy') || item.tags.includes('sacred'));
  const isCursed = item => item.tags && item.tags.includes('cursed');
  const isCloth = item => item.material === 'cloth';
  const isBone = item => item.material === 'bone';
  const isCandle = item => item.name && (item.name.toLowerCase().includes('candle') || item.name.toLowerCase().includes('свеч'));
  const isAmulet = item => item.name && (item.name.toLowerCase().includes('amulet') || item.name.toLowerCase().includes('амулет') || item.name.toLowerCase().includes('pendant'));
  const isScroll = item => item.name && (item.name.toLowerCase().includes('scroll') || item.name.toLowerCase().includes('свиток') || item.name.toLowerCase().includes('parchment'));

  const nearAltar = (npc) => {
    for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) {
      const c = window.getCell ? window.getCell(npc.x + dx, npc.y + dy) : null;
      if (c && c.type === 'altar') return true;
    }
    return false;
  };
  const isPious = (npc) => npc.trait && npc.trait.id === 'pious';
  const isFaithful = (npc) => npc.faithNeed > 50;

  Reg.usageRules.push(
    // === ПОЛОЖИТЬ НА АЛТАРЬ ===
    {
      id: 'offer_to_altar',
      evaluate: (npc, item) => {
        if (!isPious(npc) || !nearAltar(npc)) return null;
        if (!isMagical(item) && !isHoly(item)) return null;
        return {
          action: 'pray', actionKey: 'pray',
          weight: 150,
          successChance: 0.95,
          consequence: { emo: { joy: 20, stress: -20 }, destroyItem: true }
        };
      }
    },
    {
      id: 'offer_food_to_altar',
      evaluate: (npc, item) => {
        if (!isPious(npc) || !nearAltar(npc)) return null;
        if (!item.tags || !item.tags.includes('edible')) return null;
        if (npc.hunger > 60) return null;
        return {
          action: 'pray', actionKey: 'pray',
          weight: 80,
          successChance: 0.9,
          consequence: { emo: { joy: 10, stress: -10 }, destroyItem: true }
        };
      }
    },
    {
      id: 'offer_bone_to_altar',
      evaluate: (npc, item) => {
        if (!isPious(npc) || !nearAltar(npc)) return null;
        if (!isBone(item)) return null;
        return {
          action: 'pray', actionKey: 'pray',
          weight: 70,
          successChance: 0.9,
          consequence: { emo: { joy: 10, stress: -15 }, destroyItem: true }
        };
      }
    },

    // === ЧИТАТЬ СВИТОК КАК МОЛИТВУ ===
    {
      id: 'read_scroll_as_prayer',
      evaluate: (npc, item) => {
        if (!isScroll(item) || !isMagical(item)) return null;
        if (!isFaithful(npc) && !isPious(npc)) return null;
        return {
          action: 'pray', actionKey: 'pray',
          weight: 100,
          successChance: 0.85,
          consequence: { emo: { joy: 15, stress: -20 } }
        };
      }
    },
    {
      id: 'read_holy_scroll',
      evaluate: (npc, item) => {
        if (!isScroll(item) || !isHoly(item)) return null;
        return {
          action: 'pray', actionKey: 'pray',
          weight: 120,
          successChance: 0.95,
          consequence: { emo: { joy: 20, stress: -25 } }
        };
      }
    },

    // === АМУЛЕТ КАК ФЕТИШ ===
    {
      id: 'clutch_amulet',
      evaluate: (npc, item) => {
        if (!isAmulet(item) || !isFaithful(npc)) return null;
        return {
          action: 'pray', actionKey: 'pray',
          weight: 80,
          successChance: 0.95,
          consequence: { emo: { joy: 10, stress: -15 } }
        };
      }
    },
    {
      id: 'worship_amulet_madness',
      evaluate: (npc, item) => {
        if (!isAmulet(item) || !npc.hasGoneInsane) return null;
        return {
          action: 'pray', actionKey: 'pray',
          weight: 150,
          successChance: 0.8,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { joy: 20, stress: -10 } }
        };
      }
    },

    // === СВЕЧИ ===
    {
      id: 'light_candle_ritual',
      evaluate: (npc, item) => {
        if (!isCandle(item)) return null;
        if (!nearAltar(npc) && !isFaithful(npc)) return null;
        return {
          action: 'pray', actionKey: 'pray',
          weight: 100,
          successChance: 0.9,
          consequence: { emo: { joy: 15, stress: -15 }, destroyItem: true }
        };
      }
    },

    // === ОСКОРБИТЬ РЕЛИГИЮ ===
    {
      id: 'desecrate_holy_madness',
      evaluate: (npc, item) => {
        if (!isHoly(item)) return null;
        if (!npc.hasGoneInsane) return null;
        return {
          action: 'break', actionKey: 'break',
          weight: 150,
          successChance: 0.7,
          createsRumor: true, rumorType: 'crime',
          consequence: { emo: { joy: 20, stress: -20 }, destroyItem: true }
        };
      }
    },
    {
      id: 'destroy_cursed_holy',
      evaluate: (npc, item) => {
        if (!isCursed(item) && !isHoly(item)) return null;
        if (!npc.facets || npc.facets.courage < 60) return null;
        if (!isPious(npc)) return null;
        return {
          action: 'break', actionKey: 'break',
          weight: 80,
          successChance: 0.6,
          createsRumor: true, rumorType: 'crime',
          consequence: { emo: { joy: 10, stress: -10 }, destroyItem: true }
        };
      }
    },

    // === МОЛИТВА НАД ПРЕДМЕТОМ ===
    {
      id: 'bless_item',
      evaluate: (npc, item) => {
        if (!isPious(npc) || !isFaithful(npc)) return null;
        if (!isMagical(item) && !isWeapon(item)) return null;
        return {
          action: 'pray', actionKey: 'pray',
          weight: 60,
          successChance: 0.9,
          consequence: { emo: { joy: 10, stress: -10 } }
        };
      }
    },

    // === ОТКАЗ ОТ МАГИИ (набожность) ===
    {
      id: 'refuse_magic_pious',
      evaluate: (npc, item) => {
        if (!isMagical(item) || isHoly(item)) return null;
        if (!isPious(npc)) return null;
        if (!npc.facets || npc.facets.courage > 50) return null;
        return {
          action: 'ignore', actionKey: 'ignore',
          weight: 80,
          successChance: 1.0,
          consequence: { emo: { fear: 10, stress: 10 } }
        };
      }
    },

    // === ПОКАЗАТЬ АМУЛЕТ В БОЮ ===
    {
      id: 'hold_amulet_combat',
      evaluate: (npc, item) => {
        if (!isAmulet(item) || !isFaithful(npc)) return null;
        if (!npc.task || npc.task.type !== 'fight') return null;
        return {
          action: 'pray', actionKey: 'pray',
          weight: 100,
          successChance: 0.85,
          consequence: { emo: { joy: 10, fear: -20, stress: -10 } }
        };
      }
    },

    // === БРОСИТЬ КОСТИ КАК ГАДАНИЕ ===
    {
      id: 'divination_bones',
      evaluate: (npc, item) => {
        if (!isBone(item)) return null;
        if (!npc.facets || npc.facets.curiosity < 50) return null;
        return {
          action: 'study', actionKey: 'study',
          weight: 40,
          successChance: 0.7,
          consequence: { emo: { joy: 5, stress: -5 } }
        };
      }
    },

    // === СНЯТЬ ПРОКЛЯТИЕ ===
    {
      id: 'remove_curse_prayer',
      evaluate: (npc, item) => {
        if (!isCursed(item) || !isPious(npc)) return null;
        if (!nearAltar(npc)) return null;
        return {
          action: 'pray', actionKey: 'pray',
          weight: 100,
          successChance: 0.3,
          consequence: { emo: { joy: 25, stress: -30 } }
        };
      }
    }
  );

  console.log(`[Usage Rules: Faith] Добавлено 15 правил веры.`);
})();
