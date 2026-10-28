(function(){
  setTimeout(() => {
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    window.generateDwarfDescription = function(npc) {
      if (!Reg.dwarfLex) return "Он обычный дварф.";
      const L = Reg.dwarfLex;
      let parts = [];

      // 1. ФИЗИЧЕСКАЯ ЧЕРТА
      parts.push(pick(L.physical));

      // 2. АНАЛИЗ ГРАНЕЙ (Собираем комбинации)
      let facetList = [];
      for (let key in L.facets) {
        if (npc.facets && npc.facets[key] !== undefined) {
           facetList.push({ key: key, val: npc.facets[key] });
        }
      }
      
      // Сортируем по силе (чем дальше от 50, тем важнее)
      facetList.sort((a, b) => Math.abs(b.val - 50) - Math.abs(a.val - 50));

      // Берем ТОП-4 черты и строим для каждой предложение
      const numTraits = Math.min(4, facetList.length);
      for (let i = 0; i < numTraits; i++) {
        const f = facetList[i];
        if (Math.abs(f.val - 50) < 15) continue; // Слишком слабая черта
        
        const level = f.val > 50 ? 'high' : 'low';
        const data = L.facets[f.key];
        const adjList = level === 'high' ? data.adj_high : data.adj_low;
        const template = level === 'high' ? data.template_high : data.template_low;

        const verb = pick(L.verbs);
        const adj = pick(adjList);
        const context = pick(L.contexts);

        let sentence = template
           .replace(/{verb}/g, verb)
           .replace(/{adj}/g, adj);
           
        parts.push(sentence + " " + context.charAt(0).toUpperCase() + context.slice(1));
      }

      // 3. СПЕЦИАЛЬНЫЕ КОМБИНАЦИИ (Жадный + Трусливый = скряга и т.д.)
      const f = npc.facets || {};
      const combos = [];
      if (f.greed > 60 && f.courage < 40) combos.push("Он трусливый скряга, который прячет золото при любой опасности.");
      if (f.greed > 60 && f.courage > 60) combos.push("Он храбрый, но исключительно ради наживы.");
      if (f.diligence > 70 && f.altruism < 30) combos.push("Он работает как проклятый, но только ради себя.");
      if (f.altruism > 70 && f.greed < 30) combos.push("Он отдаст последнюю рубаху, если кто-то попросит.");
      if (f.aesthetics > 60 && f.diligence < 40) combos.push("Он любит красивые вещи, но ненавидит труд, необходимый для их создания.");
      if (f.curiosity > 70 && f.courage < 30) combos.push("Он хочет узнать всё, но боится даже собственной тени.");
      
      if (combos.length > 0) parts.push(pick(combos));

      // 4. СОЦИАЛЬНАЯ ЧЕРТА
      parts.push(pick(L.social));

      // 5. МОДИФИКАТОР СТРЕССА
      if (npc.emo && npc.emo.stress > 60) parts.push(pick(L.stress));

      // 6. ЦЕННОСТИ
      if (npc.values) {
         if (npc.values.stoicism > 30) parts.push("Он стоически переносит любые удары судьбы.");
         if (npc.values.traditions > 30) parts.push("Он уважает древние традиции и ненавидит новшества.");
         if (npc.values.fortitude > 30) parts.push("Его упорству можно только позавидовать.");
      }

      return parts.join('<br><br>');
    };

    console.log('[Dwarf Personality] Движок сборки личности готов.');
  }, 1200);
})();
