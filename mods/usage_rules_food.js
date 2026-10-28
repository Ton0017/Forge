(function(){
  Reg.usageRules = Reg.usageRules || [];

  // Хелперы
  const isFood = item => item.tags && item.tags.includes('edible') && !item.tags.includes('poisonous');
  const isPoisonous = item => item.tags && item.tags.includes('poisonous');
  const isWood = item => item.material === 'wood' || (item.tags && item.tags.includes('wood'));
  const isMetal = item => item.material === 'metal' || (item.tags && item.tags.includes('metal'));
  const isStone = item => item.material === 'stone';
  const isGlass = item => item.material === 'glass';
  const isDrink = item => item.tags && item.tags.includes('drink');
  const isMeat = item => item.tags && item.tags.includes('meat');
  const isMushroom = item => item.tags && (item.tags.includes('mushroom') || (item.name && item.name.includes('гриб')));

  Reg.usageRules.push(
    // === ЕДА (обычная) ===
    {
      id: 'eat_food_critical',
      evaluate: (npc, item) => {
        if (!isFood(item) || npc.hunger < 80) return null;
        return {
          action: 'eat', actionKey: 'eat_food',
          weight: 500,
          successChance: 0.98,
          consequence: { emo: { joy: 15, stress: -15 }, destroyItem: true }
        };
      }
    },
    {
      id: 'eat_food_mild',
      evaluate: (npc, item) => {
        if (!isFood(item) || npc.hunger < 30) return null;
        return {
          action: 'eat', actionKey: 'eat_food',
          weight: Math.floor(npc.hunger * 2),
          successChance: 0.95,
          consequence: { emo: { joy: 5, stress: -5 }, destroyItem: true }
        };
      }
    },
    {
      id: 'eat_meat_raw',
      evaluate: (npc, item) => {
        if (!isMeat(item) || npc.hunger < 50) return null;
        return {
          action: 'eat', actionKey: 'eat_food',
          weight: 60,
          successChance: 0.9,
          consequence: { emo: { joy: 8, stress: -5 }, destroyItem: true }
        };
      }
    },
    {
      id: 'eat_mushroom_risky',
      evaluate: (npc, item) => {
        if (!isMushroom(item) || npc.hunger < 40) return null;
        return {
          action: 'eat', actionKey: 'eat_food',
          weight: 40,
          successChance: npc.facets.curiosity > 50 ? 0.7 : 0.5,
          consequence: { hp: npc.facets.curiosity > 50 ? 0 : -5, emo: { joy: 5, stress: 10 }, destroyItem: true }
        };
      }
    },

    // === ЕДА (не пища — отчаяние или безумие) ===
    {
      id: 'eat_wood_desperate',
      evaluate: (npc, item) => {
        if (!isWood(item) || npc.hunger < 85) return null;
        return {
          action: 'eat', actionKey: 'eat_wood',
          weight: Math.floor(npc.hunger - 60),
          successChance: 0.3,
          createsRumor: true, rumorType: 'crime',
          consequence: { hp: -2, emo: { joy: -10, stress: 15 }, destroyItem: true }
        };
      }
    },
    {
      id: 'eat_metal_desperate',
      evaluate: (npc, item) => {
        if (!isMetal(item) || npc.hunger < 90) return null;
        return {
          action: 'eat', actionKey: 'eat_metal',
          weight: 10,
          successChance: 0.1,
          createsRumor: true, rumorType: 'fear',
          consequence: { hp: -5, emo: { stress: 20 }, destroyItem: false }
        };
      }
    },
    {
      id: 'eat_stone_desperate',
      evaluate: (npc, item) => {
        if (!isStone(item) || npc.hunger < 95) return null;
        return {
          action: 'eat', actionKey: 'eat_stone',
          weight: 5,
          successChance: 0.2,
          createsRumor: true, rumorType: 'fear',
          consequence: { hp: -3, emo: { stress: 25 }, destroyItem: true }
        };
      }
    },
    {
      id: 'eat_glass_suicide',
      evaluate: (npc, item) => {
        if (!isGlass(item) || npc.emo.stress < 90) return null;
        return {
          action: 'eat', actionKey: 'eat_metal',
          weight: 30,
          successChance: 0.1,
          createsRumor: true, rumorType: 'fear',
          consequence: { hp: -15, emo: { stress: 30 }, destroyItem: true }
        };
      }
    },
    {
      id: 'eat_poisonous',
      evaluate: (npc, item) => {
        if (!isPoisonous(item) || npc.hunger < 30) return null;
        const smart = npc.facets.curiosity < 30;
        if (smart) return null;
        return {
          action: 'eat', actionKey: 'eat_food',
          weight: 20,
          successChance: 0.4,
          consequence: { hp: -10, emo: { stress: 15 }, destroyItem: true }
        };
      }
    },
    {
      id: 'eat_corpse',
      evaluate: (npc, item) => {
        if (!item.tags || !item.tags.includes('corpse') || npc.hunger < 90) return null;
        if (npc.facets.aesthetics > 60) return null;
        return {
          action: 'eat', actionKey: 'eat_meat',
          weight: 50,
          successChance: 0.7,
          createsRumor: true, rumorType: 'crime',
          consequence: { hp: 5, emo: { joy: 5, stress: 20 }, destroyItem: true }
        };
      }
    },
    {
      id: 'eat_dwarf_corpse',
      evaluate: (npc, item) => {
        if (!item.tags || !item.tags.includes('dwarf_corpse')) return null;
        if (npc.hunger < 95 && !npc.hasGoneInsane) return null;
        return {
          action: 'eat', actionKey: 'eat_meat',
          weight: 100,
          successChance: 0.9,
          createsRumor: true, rumorType: 'crime',
          consequence: { hp: 10, emo: { joy: 10, stress: 50 }, destroyItem: true }
        };
      }
    },

    // === ПИТЬЁ ===
    {
      id: 'drink_water_critical',
      evaluate: (npc, item) => {
        if (!isDrink(item) && !(item.material === 'water')) return null;
        if (npc.thirst < 80) return null;
        return {
          action: 'drink', actionKey: 'drink',
          weight: 500,
          successChance: 0.98,
          consequence: { emo: { joy: 10, stress: -10 }, destroyItem: true }
        };
      }
    },
    {
      id: 'drink_water_mild',
      evaluate: (npc, item) => {
        if (!isDrink(item) && !(item.material === 'water')) return null;
        if (npc.thirst < 40) return null;
        return {
          action: 'drink', actionKey: 'drink',
          weight: Math.floor(npc.thirst),
          successChance: 0.95,
          consequence: { emo: { joy: 5 }, destroyItem: true }
        };
      }
    },
    {
      id: 'drink_booze_alcoholic',
      evaluate: (npc, item) => {
        if (!item.tags || !item.tags.includes('booze')) return null;
        if (npc.thirst < 30 && npc.emo.drunk < 50) return null;
        return {
          action: 'drink', actionKey: 'drink',
          weight: 80,
          successChance: 0.95,
          consequence: { emo: { joy: 15, drunk: 20, stress: -10 }, destroyItem: true }
        };
      }
    },
    {
      id: 'drink_booze_reckless',
      evaluate: (npc, item) => {
        if (!item.tags || !item.tags.includes('booze')) return null;
        if (!npc.longTerm || npc.longTerm.alcoholism < 50) return null;
        return {
          action: 'drink', actionKey: 'drink',
          weight: 200,
          successChance: 0.99,
          consequence: { emo: { joy: 20, drunk: 30, stress: -20 }, destroyItem: true }
        };
      }
    },
    {
      id: 'drink_unknown_poison',
      evaluate: (npc, item) => {
        if (!isPoisonous(item) || npc.thirst < 60) return null;
        if (npc.facets.curiosity < 60) return null;
        return {
          action: 'drink', actionKey: 'drink',
          weight: 20,
          successChance: 0.3,
          consequence: { hp: -15, emo: { stress: 20 }, destroyItem: true }
        };
      }
    },

    // === ДЕЙСТВИЯ С ЕДОЙ (не есть) ===
    {
      id: 'share_food_friend',
      evaluate: (npc, item) => {
        if (!isFood(item)) return null;
        if (!npc.facets || npc.facets.altruism < 60) return null;
        if (!window.state || !window.state.npcs) return null;
        const hungryFriend = window.state.npcs.find(n => 
          n.alive && n.id !== npc.id && n.hunger > 70 &&
          Math.abs(n.x - npc.x) + Math.abs(n.y - npc.y) <= 2
        );
        if (!hungryFriend) return null;
        return {
          action: 'equip', actionKey: 'show',
          weight: 50,
          successChance: 0.95,
          consequence: { emo: { joy: 10 }, destroyItem: true }
        };
      }
    },
    {
      id: 'hide_food_greedy',
      evaluate: (npc, item) => {
        if (!isFood(item)) return null;
        if (!npc.facets || npc.facets.greed < 70) return null;
        return {
          action: 'hide', actionKey: 'hide',
          weight: 40,
          successChance: 0.9,
          consequence: { emo: { joy: 5 }, destroyItem: false }
        };
      }
    },
    {
      id: 'burn_food_rage',
      evaluate: (npc, item) => {
        if (!isFood(item)) return null;
        if (!npc.emo || npc.emo.stress < 75) return null;
        return {
          action: 'break', actionKey: 'break',
          weight: 30,
          successChance: 0.8,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { joy: 10, stress: -20 }, destroyItem: true }
        };
      }
    },
    {
      id: 'throw_food_combat',
      evaluate: (npc, item) => {
        if (!isFood(item)) return null;
        if (!npc.task || npc.task.type !== 'fight') return null;
        return {
          action: 'attack', actionKey: 'throw',
          weight: 40,
          successChance: 0.6,
          consequence: { hp: 3, emo: { joy: 5 }, destroyItem: true }
        };
      }
    },
    {
      id: 'offer_food_altar',
      evaluate: (npc, item) => {
        if (!isFood(item)) return null;
        if (!npc.trait || npc.trait.id !== 'pious') return null;
        const cell = window.getCell ? window.getCell(npc.x, npc.y) : null;
        if (!cell || cell.type !== 'altar') return null;
        return {
          action: 'pray', actionKey: 'pray',
          weight: 60,
          successChance: 0.95,
          consequence: { emo: { joy: 15, stress: -20 }, destroyItem: true }
        };
      }
    },
    {
      id: 'give_food_to_animal',
      evaluate: (npc, item) => {
        if (!isFood(item)) return null;
        if (!npc.facets || npc.facets.altruism < 50) return null;
        if (!window.state || !window.state.cells) return null;
        const animalNearby = Object.values(window.state.cells).some(c => 
          c.animal && Math.abs(c.animal.x - npc.x) + Math.abs(c.animal.y - npc.y) <= 3
        );
        if (!animalNearby) return null;
        return {
          action: 'equip', actionKey: 'show',
          weight: 25,
          successChance: 0.9,
          consequence: { emo: { joy: 10 }, destroyItem: true }
        };
      }
    },
    {
      id: 'eat_grass_low_hunger',
      evaluate: (npc, item) => {
        if (!isMushroom(item) && !(item.material === 'grass')) return null;
        if (npc.hunger < 60) return null;
        return {
          action: 'eat', actionKey: 'eat_food',
          weight: 15,
          successChance: 0.7,
          consequence: { emo: { joy: -5, stress: 5 }, destroyItem: true }
        };
      }
    },
    {
      id: 'taste_test_curious',
      evaluate: (npc, item) => {
        if (!isFood(item) && !isPoisonous(item)) return null;
        if (!npc.facets || npc.facets.curiosity < 70) return null;
        if (npc.hunger > 40) return null;
        return {
          action: 'study', actionKey: 'study',
          weight: 30,
          successChance: 0.8,
          consequence: { emo: { joy: 5 }, destroyItem: true }
        };
      }
    },
    {
      id: 'drink_unknown_water',
      evaluate: (npc, item) => {
        if (!item.tags || !item.tags.includes('water')) return null;
        if (npc.thirst < 50) return null;
        if (npc.facets && npc.facets.curiosity > 60) return null;
        return {
          action: 'drink', actionKey: 'drink',
          weight: 30,
          successChance: 0.9,
          consequence: { emo: { joy: 5 }, destroyItem: true }
        };
      }
    },
    {
      id: 'cook_meat_fire',
      evaluate: (npc, item) => {
        if (!isMeat(item)) return null;
        const cell = window.getCell ? window.getCell(npc.x, npc.y) : null;
        if (!cell) return null;
        if (cell.type !== 'campfire' && cell.type !== 'pot') return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 100,
          successChance: 0.9,
          consequence: { hp: 5, emo: { joy: 10 }, destroyItem: false }
        };
      }
    },
    {
      id: 'starve_refuse_poison',
      evaluate: (npc, item) => {
        if (!isPoisonous(item)) return null;
        if (!npc.facets || npc.facets.curiosity >= 30) return null;
        return {
          action: 'ignore', actionKey: 'ignore',
          weight: 50,
          successChance: 1.0,
          consequence: { emo: { stress: 5 }, destroyItem: false }
        };
      }
    }
    ,
    // === ОТЧАЯННАЯ ЕДА (КАМНИ, ДЕРЕВО, МЕТАЛЛ) ===
    {
      id: 'eat_desperation',
      evaluate: (npc, item) => {
        // Срабатывает только при сильном голоде и если это не обычная еда/питье
        if (npc.hunger < 80 || isFood(item) || isDrink(item)) return null;
        
        // Определяем текстовый глагол на основе свойств предмета
        let actionKey = 'eat_food';
        if (isWood(item)) actionKey = 'eat_wood';
        else if (isStone(item) || (item.name && item.name.includes('руда'))) actionKey = 'eat_stone';
        else if (isMetal(item)) actionKey = 'eat_stone'; // Используем камень для металла, если нет отдельного
        
        // ФИЗИКА: Урон зависит от твердости предмета
        let h = item.hardness || 3; // Если твердость не задана, берем среднюю
        let hpLoss = Math.floor(h * 1.5); 
        let stressGain = Math.floor(h * 3);
        
        return {
          action: 'eat',
          actionKey: actionKey,
          weight: 100, // Высокий приоритет при голоде 80+
          successChance: 0.8, // Шанс проглотить (иначе подавится)
          consequence: { 
            hunger: -50, // Немного утоляет голод, чтобы не жевал вечно
            emo: { stress: stressGain, joy: -10 }, 
            hp: -hpLoss, // Ломает зубы/желудок
            destroyItem: true // Он это съел (или проглотил)
          },
          failConsequence: {
            emo: { stress: stressGain * 2 },
            hp: -hpLoss * 2,
            destroyItem: false // Подавился, выплюнул
          }
        };
      }
    }
  );

  console.log(`[Usage Rules: Food] Загружено ${Reg.usageRules.length} правил.`);
})();
