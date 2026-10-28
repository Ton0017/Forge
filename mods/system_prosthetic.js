(function(){
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || !npc.body) return false;
    if (state.tick % 50 !== 0) return false; // Раз в 50 тиков

    let hasProsthetic = false;
    
    for (let part in npc.body) {
        const b = npc.body[part];
        if (b.status === 'prosthetic') {
            hasProsthetic = true;
            
            // 1. ФИЗИЧЕСКАЯ БОЛЬ (постоянный урон)
            npc.hp -= 1;
            npc.emo.stress = Math.min(100, (npc.emo.stress || 0) + 2);
            
            // 2. ИНФЕКЦИЯ (грязный металл в ране)
            if (Math.random() < 0.1) {
                b.infection = Math.max(1, (b.infection || 0));
            }
            
            // 3. СЛУЧАЙНЫЕ МЫСЛИ О БОЛИ
            if (Math.random() < 0.2) {
                if (Reg.log) Reg.log(`[БОЛЬ] ${npc.name} морщится. ${b.attached.name} в культе причиняет страдания.`, 'death');
                if (Reg.addMemory) Reg.addMemory(npc, `Я чувствую, как ${b.attached.name} трется о кость.`, { type: 'fear', power: 10, category: 'medical' });
            }
        }
    }

    if (hasProsthetic && npc.hp <= 0) {
        if (window.killNpc) window.killNpc(npc, 'умер от заражения крови из-за протеза');
        return true;
    }
    return false;
  });
  
  console.log('[System Prosthetic] Протезы теперь вызывают боль и инфекцию.');
})();
