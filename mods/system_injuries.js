(function(){
  // Множители скорости от травм ног (переломы уже дают npc.speed = 0.3 в body_system.js)
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || !npc.body) return false;
    if (state.tick % 20 !== 0) return false; // Раз в 20 тиков для лёгкости

    const lLeg = npc.body.left_leg;
    const rLeg = npc.body.right_leg;
    const head = npc.body.head;

    const lSev = lLeg && lLeg.status === 'severed';
    const rSev = rLeg && rLeg.status === 'severed';
    
    // Хромота от отрубаний (не переломов — их уже обрабатывает body_system)
    let penalty = 1.0;
    if (lSev && rSev) penalty = 0.3;            // обе ноги отрублены — ползёт
    else if (lSev || rSev) penalty = 0.7;       // одна — хромает (плюс возможный перелом другой)

    npc.bodySpeedPenalty = penalty;

    // Травмы рук — штраф к работе (копание, рубка, крафт)
    const rArm = npc.body.right_arm;
    const lArm = npc.body.left_arm;
    const rArmBad = rArm && (rArm.status === 'fracture' || rArm.status === 'severed');
    const lArmBad = lArm && (lArm.status === 'fracture' || lArm.status === 'severed');
    npc.armPenalty = (rArmBad && lArmBad) ? 0.2 : ((rArmBad || lArmBad) ? 0.6 : 1.0);

    // СЛЕПОТА при повреждении головы (hp < 30% от максимума)
    if (head && head.hp > 0 && head.hp < head.max * 0.3 && !npc.isBlind) {
      if (Math.random() < 0.05) {
        npc.isBlind = true;
        if (Reg.log) Reg.log(`${npc.name} теряет зрение из-за раны головы.`, 'combat');
        if (Reg.addMemory) Reg.addMemory(npc, 'Мир померк. Я больше не вижу.', { type: 'fear', power: 50, category: 'injury' });
      }
    }

    // ВОССТАНОВЛЕНИЕ ЗРЕНИЯ — если голова зажила
    if (npc.isBlind && head && head.hp > head.max * 0.6) {
      if (Math.random() < 0.01) {
        npc.isBlind = false;
        if (Reg.log) Reg.log(`${npc.name} снова начинает видеть.`, 'good');
        if (Reg.addMemory) Reg.addMemory(npc, 'Я вижу свет. Мир вернулся.', { type: 'joy', power: 40, category: 'injury' });
      }
    }
  });

  // ШРАМЫ — раз в 100 тиков, шанс оставить шрам на зажившей ране
  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive || !npc.body) return false;
    if (state.tick % 100 !== 0) return false;

    if (!npc.scars) npc.scars = [];

    for (const partName in npc.body) {
      const part = npc.body[partName];
      if (!part || part.status === 'severed' || part.status === 'scarred') continue;
      if (part.hp <= 0) continue;
      
      // Зажившая рана (hp < max) и не кровоточит — шанс шрама
      const hpRatio = part.hp / part.max;
      if (hpRatio < 0.95 && hpRatio > 0.3 && part.bleeding === 0 && Math.random() < 0.03) {
        part.status = 'scarred';
        npc.scars.push({ part: partName, time: state.tick });
        if (Reg.log) Reg.log(`${npc.name} остаётся со шрамом.`, 'sys');
      }
    }
    return false;
  });

  console.log('[System Injuries] Травмы, шрамы и слепота активны.');
})();
