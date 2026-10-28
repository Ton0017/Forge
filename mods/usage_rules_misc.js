(function(){
  Reg.usageRules = Reg.usageRules || [];

  const isRope = item => item.name && (item.name.toLowerCase().includes('rope') || item.name.toLowerCase().includes('верев'));
  const isThread = item => item.name && (item.name.toLowerCase().includes('thread') || item.name.toLowerCase().includes('нить'));
  const isStone = item => item.material === 'stone';
  const isWood = item => item.material === 'wood';
  const isMetal = item => item.material === 'metal';
  const isBone = item => item.material === 'bone';
  const isCloth = item => item.material === 'cloth';
  const isSharp = item => item.shape && item.shape.includes('sharp');
  const isHeavy = item => (item.weight === 'heavy') || (item.shape && item.shape.includes('heavy'));
  const isLight = item => item.weight === 'light';
  const isTorch = item => item.name && (item.name.toLowerCase().includes('torch') || item.name.toLowerCase().includes('факел'));
  const isBook = item => item.name && (item.name.toLowerCase().includes('book') || item.name.toLowerCase().includes('книг'));
  const isFlask = item => item.name && (item.name.toLowerCase().includes('flask') || item.name.toLowerCase().includes('фляг'));
  const isTrash = item => item.tags && item.tags.includes('trash');
  const isWeapon = item => item.tags && item.tags.includes('weapon');
  const isArmor = item => item.tags && item.tags.includes('armor');
  const isInCombat = npc => npc.task && npc.task.type === 'fight';

  Reg.usageRules.push(
    // === ВЕРЁВКА ===
    {
      id: 'rope_as_weapon',
      evaluate: (npc, item) => {
        if (!isRope(item) || !isInCombat(npc)) return null;
        return {
          action: 'attack', actionKey: 'attack_blunt',
          weight: 40,
          successChance: 0.5,
          consequence: { emo: { joy: 5 }, destroyItem: true }
        };
      }
    },
    {
      id: 'rope_as_binding',
      evaluate: (npc, item) => {
        if (!isRope(item)) return null;
        if (!npc.body) return null;
        const hasFracture = Object.values(npc.body).some(p => p.status === 'fracture');
        if (!hasFracture) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 60,
          successChance: 0.7,
          consequence: { hp: 3, emo: { joy: 5, stress: -5 }, destroyItem: true }
        };
      }
    },
    {
      id: 'rope_as_trap',
      evaluate: (npc, item) => {
        if (!isRope(item)) return null;
        if (npc.facets && npc.facets.curiosity < 50) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 30,
          successChance: 0.6,
          consequence: { emo: { joy: 10 }, destroyItem: true }
        };
      }
    },

    // === НИТЬ ===
    {
      id: 'thread_as_bandage',
      evaluate: (npc, item) => {
        if (!isThread(item)) return null;
        if (!npc.body) return null;
        const hasBleed = Object.values(npc.body).some(p => p.bleeding > 0);
        if (!hasBleed) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 50,
          successChance: 0.6,
          consequence: { hp: 3, emo: { joy: 5 }, destroyItem: true }
        };
      }
    },
    {
      id: 'thread_as_fishing_line',
      evaluate: (npc, item) => {
        if (!isThread(item)) return null;
        const c = window.getCell ? window.getCell(npc.x, npc.y) : null;
        if (!c || c.type !== 'water') return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 40,
          successChance: 0.5,
          consequence: { emo: { joy: 10 }, destroyItem: true }
        };
      }
    },

    // === КАМЕНЬ ===
    {
      id: 'stone_throw_combat',
      evaluate: (npc, item) => {
        if (!isStone(item) || !isInCombat(npc)) return null;
        return {
          action: 'attack', actionKey: 'throw',
          weight: 80,
          successChance: 0.6,
          consequence: { emo: { joy: 5 }, destroyItem: true }
        };
      }
    },
    {
      id: 'stone_as_hammer',
      evaluate: (npc, item) => {
        if (!isStone(item)) return null;
        if (!npc.inventory || npc.inventory.pickaxe_durability > 0) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 50,
          successChance: 0.5,
          consequence: { emo: { joy: 5 }, destroyItem: true }
        };
      }
    },
    {
      id: 'stone_as_projectile_hunt',
      evaluate: (npc, item) => {
        if (!isStone(item)) return null;
        if (!npc.task || npc.task.type !== 'go_to_hunt') return null;
        return {
          action: 'attack', actionKey: 'throw',
          weight: 60,
          successChance: 0.5,
          consequence: { emo: { joy: 10 }, destroyItem: true }
        };
      }
    },

    // === ДЕРЕВО ===
    {
      id: 'wood_as_club',
      evaluate: (npc, item) => {
        if (!isWood(item) || !isInCombat(npc)) return null;
        return {
          action: 'attack', actionKey: 'attack_blunt',
          weight: 60,
          successChance: 0.6,
          consequence: { emo: { joy: 5 }, destroyItem: false }
        };
      }
    },
    {
      id: 'wood_as_splint',
      evaluate: (npc, item) => {
        if (!isWood(item)) return null;
        if (!npc.body) return null;
        const hasFracture = Object.values(npc.body).some(p => p.status === 'fracture');
        if (!hasFracture) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 70,
          successChance: 0.6,
          consequence: { hp: 5, emo: { joy: 10, stress: -5 }, destroyItem: true }
        };
      }
    },
    {
      id: 'wood_as_fuel_fire',
      evaluate: (npc, item) => {
        if (!isWood(item)) return null;
        for (let dx = -2; dx <= 2; dx++) for (let dy = -2; dy <= 2; dy++) {
          const c = window.getCell ? window.getCell(npc.x + dx, npc.y + dy) : null;
          if (c && c.type === 'campfire') {
            return {
              action: 'craft', actionKey: 'craft',
              weight: 50,
              successChance: 0.9,
              consequence: { emo: { joy: 5 }, destroyItem: true }
            };
          }
        }
        return null;
      }
    },

    // === МЕТАЛЛ (не оружие) ===
    {
      id: 'metal_as_tool',
      evaluate: (npc, item) => {
        if (!isMetal(item)) return null;
        if (isWeapon(item) || isArmor(item)) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 30,
          successChance: 0.6,
          consequence: { emo: { joy: 5 }, destroyItem: true }
        };
      }
    },
    {
      id: 'metal_as_hammer',
      evaluate: (npc, item) => {
        if (!isMetal(item) || !isHeavy(item)) return null;
        if (!npc.inventory || npc.inventory.pickaxe_durability > 0) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 60,
          successChance: 0.5,
          consequence: { emo: { joy: 10 }, destroyItem: true }
        };
      }
    },

    // === КОСТЬ ===
    {
      id: 'bone_as_needle',
      evaluate: (npc, item) => {
        if (!isBone(item)) return null;
        if (!npc.facets || npc.facets.curiosity < 40) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 30,
          successChance: 0.6,
          consequence: { emo: { joy: 10 }, destroyItem: true }
        };
      }
    },
    {
      id: 'bone_as_weapon',
      evaluate: (npc, item) => {
        if (!isBone(item) || !isInCombat(npc)) return null;
        return {
          action: 'attack', actionKey: 'attack_blunt',
          weight: 50,
          successChance: 0.5,
          consequence: { emo: { joy: 5 }, itemCondition: 'cracked' }
        };
      }
    },

    // === ТКАНЬ (не свитки) ===
    {
      id: 'cloth_as_mask',
      evaluate: (npc, item) => {
        if (!isCloth(item)) return null;
        if (!npc.facets || npc.facets.aesthetics < 40) return null;
        return {
          action: 'equip', actionKey: 'equip',
          weight: 30,
          successChance: 0.9,
          consequence: { emo: { joy: 5, fear: -5 } }
        };
      }
    },

    // === ФАКЕЛ ===
    {
      id: 'torch_light',
      evaluate: (npc, item) => {
        if (!isTorch(item)) return null;
        if (item.condition === 'broken') return null;
        return {
          action: 'equip', actionKey: 'equip',
          weight: 80,
          successChance: 0.9,
          consequence: { emo: { joy: 10, fear: -10, stress: -5 } }
        };
      }
    },

    // === КНИГА ===
    {
      id: 'read_book',
      evaluate: (npc, item) => {
        if (!isBook(item)) return null;
        if (!npc.facets || npc.facets.curiosity < 50) return null;
        return {
          action: 'study', actionKey: 'study',
          weight: 70,
          successChance: 0.85,
          consequence: { emo: { joy: 15, stress: -10 } }
        };
      }
    },
    {
      id: 'read_book_smithing',
      evaluate: (npc, item) => {
        if (!isBook(item)) return null;
        if (!npc.skills || npc.skills.smithing > 2) return null;
        return {
          action: 'study', actionKey: 'study',
          weight: 90,
          successChance: 0.75,
          consequence: { emo: { joy: 20, stress: -10 }, skill: { smithing: 0.2 } }
        };
      }
    },
    {
      id: 'burn_book_madness',
      evaluate: (npc, item) => {
        if (!isBook(item)) return null;
        if (!npc.hasGoneInsane) return null;
        return {
          action: 'break', actionKey: 'break',
          weight: 100,
          successChance: 0.8,
          createsRumor: true, rumorType: 'fear',
          consequence: { emo: { joy: 20, stress: -15 }, destroyItem: true }
        };
      }
    },

    // === ФЛЯГА ===
    {
      id: 'drink_from_flask',
      evaluate: (npc, item) => {
        if (!isFlask(item)) return null;
        if (!npc.thirst || npc.thirst < 50) return null;
        return {
          action: 'drink', actionKey: 'drink',
          weight: 80,
          successChance: 0.9,
          consequence: { emo: { joy: 10, stress: -10 }, destroyItem: true }
        };
      }
    },
    {
      id: 'fill_flask_water',
      evaluate: (npc, item) => {
        if (!isFlask(item)) return null;
        const c = window.getCell ? window.getCell(npc.x, npc.y) : null;
        if (!c || c.type !== 'water') return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 50,
          successChance: 0.9,
          consequence: { emo: { joy: 10 } }
        };
      }
    },

    // === МУСОР ===
    {
      id: 'throw_trash',
      evaluate: (npc, item) => {
        if (!isTrash(item)) return null;
        if (!npc.facets || npc.facets.aesthetics < 50) return null;
        return {
          action: 'ignore', actionKey: 'ignore',
          weight: 40,
          successChance: 1.0,
          consequence: { emo: { joy: 5 } }
        };
      }
    },
    {
      id: 'repurpose_trash',
      evaluate: (npc, item) => {
        if (!isTrash(item)) return null;
        if (!npc.facets || npc.facets.curiosity < 60) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 50,
          successChance: 0.5,
          consequence: { emo: { joy: 10 }, destroyItem: true }
        };
      }
    },

    // === ЛЁГКИЙ ПРЕДМЕТ (метание) ===
    {
      id: 'throw_light_item',
      evaluate: (npc, item) => {
        if (!isLight(item) || !isInCombat(npc)) return null;
        if (isWeapon(item)) return null;
        return {
          action: 'attack', actionKey: 'throw',
          weight: 50,
          successChance: 0.5,
          consequence: { emo: { joy: 5 }, destroyItem: true }
        };
      }
    },

    // === ТЯЖЁЛЫЙ ПРЕДМЕТ (давление) ===
    {
      id: 'use_heavy_as_anvil',
      evaluate: (npc, item) => {
        if (!isHeavy(item) || !isMetal(item)) return null;
        if (isWeapon(item) || isArmor(item)) return null;
        if (!npc.facets || npc.facets.diligence < 60) return null;
        return {
          action: 'craft', actionKey: 'craft',
          weight: 30,
          successChance: 0.7,
          consequence: { emo: { joy: 5 } }
        };
      }
    }
  );

  console.log(`[Usage Rules: Misc] Добавлено 25 правил.`);
})();
