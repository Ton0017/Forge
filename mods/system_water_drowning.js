(function(){
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || state.tick % 20 !== 0) return false;
    
    const cell = getCell(npc.x, npc.y);
    if (!cell || cell.type !== 'water') return false;
    
    const w = cell.water;
    if (!w) return false;

    // ТОЛЬКО ГЛУБОКАЯ ВОДА
    if (w.depth < 3) return false;

    // Логика утопления: тяжелая броня тянет на дно
    let drownChance = 0.3;
    if (npc.equipment && npc.equipment.armor) {
        if (npc.equipment.armor.isHeavy) drownChance = 0.8;
        if (npc.equipment.armor.tags && npc.equipment.armor.tags.includes('metal')) drownChance = 0.9;
    }

    if (Math.random() < drownChance) {
        npc.hp -= 5;
        npc.emo.stress = Math.min(100, npc.emo.stress + 20);
        Reg.log(`[УТОПЛЕНИЕ] ${npc.name} захлебывается в глубокой воде!`, 'combat');
        if (npc.hp <= 0) {
            if (window.killNpc) window.killNpc(npc, 'утонул в глубокой воде');
            return true;
        }
    }
    return false;
  });

  console.log('[System Water] Глубокая вода теперь опасна.');
})();
