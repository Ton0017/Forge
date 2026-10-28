(function(){
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || state.tick % 50 !== 0) return false;
    if (!npc.equipment) npc.equipment = { weapon: null, armor: null, accessory: null };
    if (!npc.inventory || npc.inventory.length === 0) return false;

    // 1. Ищем ОРУЖИЕ в рюкзаке, если руки пусты
    if (!npc.equipment.weapon) {
      const wIdx = npc.inventory.findIndex(i => i.tags && i.tags.includes('weapon'));
      if (wIdx !== -1) {
        const weapon = npc.inventory.splice(wIdx, 1)[0];
        npc.equipment.weapon = weapon;
        npc.weapon = { id: 'equipped', name: weapon.name, damage: weapon.dmgMod };
        Reg.log(`${npc.name} берет в руки ${weapon.name}.`, 'sys');
        return true;
      }
    }

    // 2. БРОНЯ — сравнение по формуле из боя: hardness * 2 * состояние
    if (npc.inventory && npc.inventory.length > 0) {
      function _def(a) {
        if (!a) return 0;
        if (a.integrity !== undefined && a.integrity <= 0) return 0;
        let dm = 1;
        if (a.condition === 'dented') dm = 0.5;
        if (a.condition === 'cracked') dm = 0.2;
        return (a.hardness || 1) * 2 * dm;
      }
      function _heavy(a) {
        if (!a) return false;
        return !!(a.isHeavy || (a.mass && a.mass >= 6) || (a.tags && a.tags.includes('heavy')));
      }
      let bestIdx = -1, bestDef = -1;
      for (let _i = 0; _i < npc.inventory.length; _i++) {
        const _it = npc.inventory[_i];
        if (!_it || !_it.tags || !_it.tags.includes('armor')) continue;
        const _d = _def(_it);
        if (_d > bestDef) { bestDef = _d; bestIdx = _i; }
      }
      if (bestIdx !== -1) {
        const curArmor = npc.equipment.armor;
        const curDef = _def(curArmor);
        if (bestDef > curDef) {
          const newArmor = npc.inventory.splice(bestIdx, 1)[0];
          if (curArmor) npc.inventory.push(curArmor);
          npc.equipment.armor = newArmor;
          npc.speed = _heavy(newArmor) ? 0.5 : 1.0;
          if (curArmor) Reg.log(`${npc.name} снимает ${curArmor.name} и надевает ${newArmor.name}.`, 'good');
          else Reg.log(`${npc.name} надевает ${newArmor.name}.`, 'sys');
          return true;
        }
      }
    }

    // 3. Ищем АКСЕССУАРЫ
    if (!npc.equipment.accessory) {
      const accIdx = npc.inventory.findIndex(i => i.tags && i.tags.includes('accessory'));
      if (accIdx !== -1) {
        const acc = npc.inventory.splice(accIdx, 1)[0];
        npc.equipment.accessory = acc;
        Reg.log(`${npc.name} надевает ${acc.name}.`, 'sys');
        return true;
      }
    }

    return false;
  });
  console.log('[System Equip] Дварфы теперь умеют брать оружие и броню из рюкзака.');
})();
