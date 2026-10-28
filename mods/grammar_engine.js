(function(){
  setTimeout(() => {
    if (!Reg.grammar) return;

    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    // ФУНКЦИЯ СБОРКИ ПРЕДЛОЖЕНИЯ
    window.generateInjurySentence = function(npc, injuryPart, injuryType) {
      const pick = arr => arr[Math.floor(Math.random() * arr.length)];
      
      let state = "";
      if (injuryType === 'severed') state = "оторвало " + injuryPart;
      else if (injuryType === 'fracture') state = "сломан " + injuryPart;
      else if (injuryType === 'cut') state = "кровоточит " + injuryPart;
      else state = pick(Reg.grammar.states); // Если не указано точно

      // Определяем действия и чувства на основе граней/стресса
      let actionPool = Reg.grammar.actions;
      let feelingPool = Reg.grammar.feelings;
      let motivePool = Reg.grammar.motives;

      // 1. БЕЗУМИЕ (высокий стресс)
      if (npc.emo && npc.emo.stress > 70) {
         actionPool = ["смеется", "бредит", "разговаривает с пустотой", "поет"];
         feelingPool = ["Ему кажется, что это сон.", "Он наслаждается каждым мгновением.", "Это сводит его с ума."];
      }
      // 2. ТРУДОГОЛИК
      else if (npc.trait && npc.trait.id === 'hardworking') {
         actionPool = ["пытается копать", "ползет к забою", "сжимает кирку", "отказывается умирать"];
         feelingPool = ["Он хочет копать дальше.", "Он проклинает тот день, когда остановился.", "Работа важнее."];
      }
      // 3. КРОВОЖАДНЫЙ (агрессия > 70)
      else if (npc.facets && npc.facets.aggression > 70) {
         actionPool = ["смеется", "улыбается", "танцует", "бьется головой о стену"];
         feelingPool = ["Ему нравится это.", "Он наслаждается каждым мгновением.", "Он гордится своим увечьем."];
      }
      // 4. ТРУС (храбрость < 30)
      else if (npc.facets && npc.facets.courage < 30) {
         actionPool = ["рыдает", "молится", "кричит", "отказывается умирать"];
         feelingPool = ["Он хочет умереть.", "Он просто хочет, чтобы это прекратилось.", "Он проклинает богов."];
      }

      // СБОРКА (Случайный шаблон структуры)
      const templates = [
         `${npc.name}: ${state}. Он ${pick(actionPool)} ${pick(motivePool)}. ${pick(feelingPool)}`,
         `${npc.name} ${pick(actionPool)}. У него ${state}. ${pick(feelingPool)}`,
         `У ${npc.name} ${state}. ${pick(feelingPool)} Он ${pick(actionPool)}.`,
         `${npc.name} ${pick(actionPool)}, ${pick(motivePool)}. У него ${state}.`
      ];

      return pick(templates);
    };

    console.log('[Grammar Engine] Движок сборки предложений готов.');
  }, 1000);
})();
