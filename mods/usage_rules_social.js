(function(){
  Reg.usageRules = Reg.usageRules || [];

  const isMagical = item => item.tags && item.tags.includes('magic');
  const isCursed = item => item.tags && item.tags.includes('cursed');
  const isWeapon = item => item.tags && item.tags.includes('weapon');
  const isArmor = item => item.tags && item.tags.includes('armor');
  const isRare = item => isMagical(item) || isCursed(item) || (item.tags && item.tags.includes('rare'));
  const isFood = item => item.tags && item.tags.includes('edible') && !item.tags.includes('poisonous');
  const isValuable = item => (item.material === 'metal' && isRare(item)) || isRare(item);

  const nearbyDwarves = (npc, radius) => {
    if (!window.state || !window.state.npcs) return [];
    return window.state.npcs.filter(n => 
      n.alive && n.id !== npc.id &&
      Math.abs(n.x - npc.x) + Math.abs(n.y - npc.y) <= (radius || 3)
    );
  };

  const hasFriendNearby = (npc) => {
    if (!npc.relations) return false;
    return nearbyDwarves(npc, 3).some(n => (npc.relations[n.id] || 0) > 20);
  };

  const hasEnemyNearby = (npc) => {
    if (!npc.relations) return false;
    return nearbyDwarves(npc, 3).some(n => (npc.relations[n.id] || 0) < -20);
  };

  Reg.usageRules.push(
    // === ПОДАРИТЬ ДРУГУ ===
    {
      id: 'gift_to_friend',
      evaluate: (npc, item) => {
        if (!npc.facets || npc.facets.altruism < 60) return null;
        if (!isValuable(item) && !isFood(item)) return null;
        if (!hasFriendNearby(npc)) return null;
        return {
          action: 'show', actionKey: 'show',
          weight: 60,
          successChance: 0.95,
          createsRumor: true, rumorType: 'success',
          consequence: { emo: { joy: 15, stress: -10 }, destroyItem: true }
        };
      }
    },
    {
      id: 'gift_magic_to_friend',
      evaluate: (npc, item) => {
        if (!npc.facets || npc.facets.altruism < 70) return null;
        if (!isMagical(item)) return null;
        if (!hasFriendNearby(npc)) return null;
        return {
          action: 'show', actionKey: 'show',
          weight: 120,
          successChance: 0.9,
          createsRumor: true, rumorType: 'success',
          consequence: { emo: { joy: 25, stress: -15 }, destroyItem: true }
        };
      }
    },

    // === ПОКАЗАТЬ ВСЕМ ===
    {
      id: 'show_rare_any',
      evaluate: (npc, item) => {
        if (!isRare(item)) return null;
        if (!npc.facets || npc.facets.greed < 40) return null;
        if (nearbyDwarves(npc, 3).length === 0) return null;
        return {
          action: 'show', actionKey: 'show',
          weight: 80,
          successChance: 0.9,
          createsRumor: true, rumorType: 'success',
          consequence: { emo: { joy: 15 } }
        };
      }
    },
    {
      id: 'show_magic_to_enemy',
      evaluate: (npc, item) => {
        if (!isMagical(item)) return null;
        if (!hasEnemyNearby(npc)) return null;
        if (!npc.facets || npc.facets.aggression < 40) return null;
        return {
          action: 'show', actionKey: 'show',
          weight: 70,
          successChance: 0.85,
          createsRumor: true, rumorType: 'crime',
          consequence: { emo: { joy: 10, anger: -5 } }
        };
      }
    },

    // === УКРАСТЬ ===
    {
      id: 'steal_from_enemy',
      evaluate: (npc, item) => {
        if (!isValuable(item)) return null;
        if (!npc.facets || npc.facets.greed < 70) return null;
        if (!hasEnemyNearby(npc)) return null;
        return {
          action: 'hide', actionKey: 'hide',
          weight: 100,
          successChance: 0.6,
          createsRumor: true, rumorType: 'crime',
          consequence: { emo: { joy: 15, stress: 5 } }
        };
      }
    },
    {
      id: 'steal_from_anyone_greedy',
      evaluate: (npc, item) => {
        if (!npc.facets || npc.facets.greed < 80) return null;
        if (!isValuable(item)) return null;
        if (nearbyDwarves(npc, 3).length === 0) return null;
        return {
          action: 'hide', actionKey: 'hide',
          weight: 70,
          successChance: 0.4,
          createsRumor: true, rumorType: 'crime',
          consequence: { emo: { joy: 10, stress: 15 } }
        };
      }
    },

    // === ОБМЕН ===
    {
      id: 'trade_with_friend',
      evaluate: (npc, item) => {
        if (!isFood(item) && !isValuable(item)) return null;
        if (!hasFriendNearby(npc)) return null;
        return {
          action: 'show', actionKey: 'show',
          weight: 40,
          successChance: 0.9,
          consequence: { emo: { joy: 5 } }
        };
      }
    },

    // === СПРЯТАТЬ ОТ ВСЕХ ===
    {
      id: 'hide_precious_paranoid',
      evaluate: (npc, item) => {
        if (!isValuable(item)) return null;
        if (!npc.facets || npc.facets.greed < 50) return null;
        if (nearbyDwarves(npc, 3).length === 0) return null;
        return {
          action: 'hide', actionKey: 'hide',
          weight: 90,
          successChance: 0.95,
          consequence: { emo: { joy: 5 } }
        };
      }
    },

    // === ПОДАРИТЬ КАРАВАНУ (взятка) ===
    {
      id: 'gift_to_caravan',
      evaluate: (npc, item) => {
        if (!isValuable(item)) return null;
        if (!window.state || !window.state.caravan) return null;
        if (!npc.facets || npc.facets.greed < 50) return null;
        return {
          action: 'show', actionKey: 'show',
          weight: 50,
          successChance: 0.9,
          consequence: { emo: { joy: 10 } }
        };
      }
    },

    // === СПЛЕТНИ ===
    {
      id: 'spread_rumor_about_enemy',
      evaluate: (npc, item) => {
        if (!isRare(item)) return null;
        if (!hasEnemyNearby(npc)) return null;
        if (!npc.facets || npc.facets.aggression < 50) return null;
        return {
          action: 'show', actionKey: 'show',
          weight: 60,
          successChance: 0.9,
          createsRumor: true, rumorType: 'crime',
          consequence: { emo: { joy: 10, stress: -5 } }
        };
      }
    },

    // === ИГНОРИРОВАТЬ ПРИ ДРУГИХ (скромность) ===
    {
      id: 'ignore_precious_humble',
      evaluate: (npc, item) => {
        if (!isValuable(item)) return null;
        if (!npc.facets || npc.facets.altruism > 70) return null;
        if (nearbyDwarves(npc, 3).length === 0) return null;
        return {
          action: 'ignore', actionKey: 'ignore',
          weight: 40,
          successChance: 1.0,
          consequence: { emo: { joy: 5 } }
        };
      }
    },

    // === ПОДЕЛИТЬСЯ ЕДОЙ ===
    {
      id: 'share_food_generous',
      evaluate: (npc, item) => {
        if (!isFood(item)) return null;
        if (!npc.facets || npc.facets.altruism < 60) return null;
        const hungry = nearbyDwarves(npc, 3).find(n => n.hunger > 60);
        if (!hungry) return null;
        return {
          action: 'show', actionKey: 'show',
          weight: 100,
          successChance: 0.95,
          consequence: { emo: { joy: 20, stress: -15 }, destroyItem: true }
        };
      }
    },

    // === ПРИГЛАСИТЬ К СТОЛУ ===
    {
      id: 'invite_to_table',
      evaluate: (npc, item) => {
        if (!isFood(item)) return null;
        if (!npc.facets || npc.facets.sociality < 60) return null;
        if (nearbyDwarves(npc, 2).length === 0) return null;
        return {
          action: 'show', actionKey: 'show',
          weight: 50,
          successChance: 0.9,
          consequence: { emo: { joy: 15 }, destroyItem: true }
        };
      }
    },

    // === КРАЖА ДЛЯ ДРУГА ===
    {
      id: 'steal_for_friend',
      evaluate: (npc, item) => {
        if (!isFood(item) && !isValuable(item)) return null;
        if (!npc.facets || npc.facets.altruism < 50) return null;
        if (!hasFriendNearby(npc)) return null;
        if (nearbyDwarves(npc, 3).length < 2) return null;
        return {
          action: 'hide', actionKey: 'hide',
          weight: 40,
          successChance: 0.5,
          createsRumor: true, rumorType: 'crime',
          consequence: { emo: { joy: 10, stress: 10 } }
        };
      }
    },

    // === ПОХВАСТАТЬСЯ ПЕРЕД ТРУСОМ ===
    {
      id: 'flex_on_coward',
      evaluate: (npc, item) => {
        if (!isWeapon(item) && !isArmor(item)) return null;
        if (!npc.facets || npc.facets.courage < 70) return null;
        const cowardNearby = nearbyDwarves(npc, 3).find(n => 
          n.facets && n.facets.courage < 30
        );
        if (!cowardNearby) return null;
        return {
          action: 'show', actionKey: 'show',
          weight: 60,
          successChance: 0.9,
          consequence: { emo: { joy: 10 } }
        };
      }
    },

    // === РАЗДЕЛИТЬ НАХОДКУ ===
    {
      id: 'share_find_altruist',
      evaluate: (npc, item) => {
        if (!isRare(item)) return null;
        if (!npc.facets || npc.facets.altruism < 70) return null;
        if (nearbyDwarves(npc, 2).length === 0) return null;
        return {
          action: 'show', actionKey: 'show',
          weight: 70,
          successChance: 0.9,
          consequence: { emo: { joy: 15, stress: -10 } }
        };
      }
    },

    // === ПРЯТАТЬ ЗОЛОТО (жадность) ===
    {
      id: 'hoard_wealth',
      evaluate: (npc, item) => {
        if (item.name && (item.name.includes('gold') || item.name.includes('coin'))) {}
        else if (!isRare(item)) return null;
        if (!npc.facets || npc.facets.greed < 70) return null;
        return {
          action: 'hide', actionKey: 'hide',
          weight: 80,
          successChance: 0.9,
          consequence: { emo: { joy: 10 } }
        };
      }
    },

    // === ОТДАТЬ ДОЛГ ===
    {
      id: 'pay_debt',
      evaluate: (npc, item) => {
        if (!isValuable(item)) return null;
        if (!npc.hasDebt) return null;
        if (nearbyDwarves(npc, 3).length === 0) return null;
        return {
          action: 'show', actionKey: 'show',
          weight: 60,
          successChance: 0.9,
          consequence: { emo: { joy: 10, stress: -15 }, destroyItem: true }
        };
      }
    },

    // === ВЫБРОСИТЬ МУСОР ПРИ ДРУГИХ ===
    {
      id: 'discard_trash_public',
      evaluate: (npc, item) => {
        if (item.tags && item.tags.includes('trash')) {}
        else if (!item.condition || item.condition !== 'broken') return null;
        if (!npc.facets || npc.facets.aesthetics < 60) return null;
        return {
          action: 'break', actionKey: 'break',
          weight: 40,
          successChance: 0.9,
          consequence: { emo: { joy: 5 }, destroyItem: true }
        };
      }
    }
  );

  console.log(`[Usage Rules: Social] Добавлено 20 правил социалки.`);
})();
