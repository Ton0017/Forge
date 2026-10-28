(function(){
  if (window.NPC) return;

  window.NPC = {
    getHunger: (npc) => npc.hunger,
    getThirst: (npc) => npc.thirst,

    getMood(npc) {
      return World.data.moods[npc.id]?.current ?? 50;
    },
    setMood(npc, v, modName) {
      if (!World.owns('moods', modName)) return;
      if (!World.data.moods[npc.id]) World.data.moods[npc.id] = { current: 50 };
      World.data.moods[npc.id].current = Math.max(0, Math.min(100, v));
    },
    
    getInventory(npc) {
        return npc.inventory || [];
    },
    addItem(npc, item, modName) {
        if (!npc.inventory) npc.inventory = [];
        npc.inventory.push(item);
        if (Reg.fire) Reg.fire('inv:changed', npc, { op: 'add', item });
    },
    countItem(npc, tag) {
        return this.getInventory(npc).filter(i => i.tags && i.tags.includes(tag)).length;
    }
  };
  console.log('[Architecture] NPC Адаптер активирован.');
})();
