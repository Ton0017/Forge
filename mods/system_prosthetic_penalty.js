(function(){
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || !npc.body) return false;
    if (state.tick % 10 !== 0) return false;
    
    // Проверяем, есть ли протез-оружие
    let hasWeaponProsthetic = false;
    for (let part in npc.body) {
        if (npc.body[part].status === 'prosthetic' && npc.body[part].prostheticType === 'weapon') {
            hasWeaponProsthetic = true; break;
        }
    }
    
    if (hasWeaponProsthetic && npc.task && npc.task.type === 'dig') {
        npc.task = { type: 'idle', path: [] };
        Reg.log(`[ПРОТЕЗ] ${npc.name} пытается копать, но лезвие в культе мешает.`, 'sys');
        return true;
    }
    return false;
  });
  console.log('[System Prosthetic Penalty] Дварфы с протезом-оружием не могут копать.');
})();
