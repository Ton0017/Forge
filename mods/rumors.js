// Глобальное хранилище слухов
window.dwarvenRumors = [];

// 1. СБОР СЛУХОВ (События, которые становятся сплетнями)
Reg.on('tick', (state) => {
  if (state.tick % 20 !== 0) return; 

  state.npcs.forEach(npc => {
    if (!npc.alive || !npc.memory) return;

    const recent = npc.memory.shortTerm.slice(0, 5);
    
    // А. КРИМИНАЛ (Кража, драка)
    const crime = recent.find(m => m.text.includes('украл') || m.text.includes('съел') || m.text.includes('наорал'));
    if (crime && !window.dwarvenRumors.find(r => r.culprit === npc.id && r.crime === crime.text)) {
      window.dwarvenRumors.push({ culprit: npc.id, culpritName: npc.name, crime: crime.text, type: 'crime', witnesses: [npc.id], time: state.tick });
    }

    // Б. УСПЕХ (Нашел золото, убил монстра)
    const success = recent.find(m => m.text.includes('золот') || m.text.includes('убил тролля') || m.text.includes('выковал'));
    if (success && !window.dwarvenRumors.find(r => r.culprit === npc.id && r.crime === success.text)) {
      window.dwarvenRumors.push({ culprit: npc.id, culpritName: npc.name, crime: success.text, type: 'success', witnesses: [npc.id], time: state.tick });
    }

    // В. СТРАХ (Видел монстра, труп)
    const fear = recent.find(m => m.text.includes('монстр') || m.text.includes('труп') || m.text.includes('кроват'));
    if (fear && !window.dwarvenRumors.find(r => r.culprit === npc.id && r.crime === fear.text)) {
      window.dwarvenRumors.push({ culprit: npc.id, culpritName: npc.name, crime: fear.text, type: 'fear', witnesses: [npc.id], time: state.tick });
    }
  });
});

// 2. РАСПРОСТРАНЕНИЕ (Передача слухов при встрече)
Reg.on('tick', (state) => {
  if (state.tick % 10 !== 0) return;

  state.npcs.forEach(npc => {
    if (!npc.alive) return;
    const partner = state.npcs.find(n => n.id !== npc.id && n.alive && Math.abs(n.x - npc.x) + Math.abs(n.y - npc.y) <= 2);
    if (!partner) return;

    window.dwarvenRumors.forEach(rumor => {
      if (rumor.witnesses.includes(npc.id) && !rumor.witnesses.includes(partner.id)) {
        if (Math.random() < 0.3) { // 30% шанс поделиться
          rumor.witnesses.push(partner.id);
          
          if (!partner.relations) partner.relations = {};
          
          let relChange = -5;
          let objId = 'monster';

          if (rumor.type === 'crime') {
            relChange = -15;
            objId = 'crime';
          } else if (rumor.type === 'success') {
            objId = 'gold';
            if (partner.facets.greed > 60) {
              relChange = -5; // Жадины все равно будут завидовать
            } else {
              relChange = 5;
            }
          } else if (rumor.type === 'fear') {
            relChange = -5;
            objId = 'monster';
          }

          // Вызываем наш умный генератор!
          const thought = Reg.composer.generate(partner, objId, 'rumor', { culprit: rumor.culpritName });
          let text = thought ? thought.text : `Он услышал сплетню о ${rumor.culpritName}.`;
          let emo = thought ? thought.emo : { type: 'neutral', power: 5, category: 'rumor' };

          partner.relations[rumor.culprit] = (partner.relations[rumor.culprit] || 0) + relChange;
          Reg.addMemory(partner, text, emo);
          Reg.log(`[Слух] ${npc.name} рассказал ${partner.name} о ${rumor.culpritName}.`, 'sys');
        }
      }
    });
  });
});

// 3. ОЧИСТКА (Раз в 15 дней)
Reg.on('tick', (state) => {
  if (state.tick % 300 !== 0) return;
  window.dwarvenRumors = window.dwarvenRumors.filter(r => state.tick - r.time < 300);
});
