// База для генератора боя
Reg.combatParts = ['голову', 'торс', 'левую руку', 'правую руку', 'левую ногу', 'правую ногу', 'шею', 'живот'];
Reg.combatVerbs = ['бьет', 'рубит', 'наносит удар', 'пробивает защиту и попадает в', 'рассекает', 'вонзает кирку в'];
Reg.combatResults = ['пробивая кожу', 'ломая кость', 'разрывая мышцы', 'оставляя глубокую рану', 'с хрустом'];

// Функция генерации боевого лога
Reg.generateCombatLog = function(npc, monster, part, verb, result, damage) {
  return `${npc.name} ${verb} ${part} ${monster.name}, ${result}. (${damage} урона)`;
};

// Основная функция боя
Reg.doCombat_OLD = function(npc, monster, state) {
  // 1. Выбор оружия (Кирка по умолчанию, нож если есть)
  let weaponName = 'киркой';
  let weaponType = 'pierce'; // pierce (колющее), slash (режущее)
  if (npc.inventory && npc.inventory.knife) {
    weaponName = 'ножом';
    weaponType = 'slash';
  }

  // 2. Выбор части тела (с шансом на голову)
  let part = Reg.combatParts[Math.floor(Math.random() * Reg.combatParts.length)];
  if (Math.random() < 0.15) part = 'голову'; // 15% шанс нацелиться в голову

  // 3. Расчет урона
  let baseDmg = 5 + Math.floor(npc.skills.combat || 0);
  if (part === 'голову') baseDmg *= 2; // Критический урон
  if (weaponType === 'slash' && Math.random() < 0.2) baseDmg += 3; // Нож иногда режет глубже

  // 4. Проверка на отрубание (только для ножа)
  let dismembered = false;
  if (weaponType === 'slash' && (part.includes('руку') || part.includes('ногу')) && Math.random() < 0.1) {
    dismembered = true;
    baseDmg += 10;
  }

  monster.hp -= baseDmg;

  // 5. Генерация лога
  const verb = Reg.combatVerbs[Math.floor(Math.random() * Reg.combatVerbs.length)];
  let result = Reg.combatResults[Math.floor(Math.random() * Reg.combatResults.length)];
  if (dismembered) result = `отрубая ${part}`;

  Reg.log(Reg.generateCombatLog(npc, monster, part, verb, result, baseDmg), 'combat');

  // 6. Смерть монстра
  if (monster.hp <= 0) {
    Reg.log(`${monster.name} падает замертво!`, 'good');
    for (let k in state.cells) {
      if (state.cells[k].monster === monster) {
        state.cells[k].monster = null;
        break;
      }
    }
    npc.skills.combat = (npc.skills.combat || 0) + 0.2;
    npc.task = { type: 'idle', path: [] };
    Reg.fire('monsterDeath', monster, npc, state);
    return;
  }

  // 7. Ответный удар монстра
  if (monster.atk > 0) {
    let incomingDmg = monster.atk;
    if (dismembered) incomingDmg = Math.floor(incomingDmg / 2); // Искалеченный бьет слабее
    
    npc.hp -= incomingDmg;
    Reg.log(`${monster.name} наносит ответный удар! ${npc.name} получает ${incomingDmg} урона.`, 'death');

    if (npc.hp <= 0) {
      killNpc(npc, `убит ${monster.name}`);
    }
  }
};
