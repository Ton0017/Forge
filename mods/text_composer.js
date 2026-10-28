Reg.composer = {
  objects: {},
  register: function(id, data) { this.objects[id] = data; },

  generate: function(npc, objId, actionType, extraCtx) {
    const obj = this.objects[objId];
    if (!obj && objId !== 'equipment') return null; // Экипировка не регистрируется как объект

    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    let emotionType = 'neutral';

    // 1. ВЫЧИСЛЯЕМ ЭМОЦИЮ НА ОСНОВЕ ГРАНЕЙ (Для обычных объектов)
    if (npc.facets && obj && obj.traits) {
      let maxVal = 40;
      for (let traitKey in obj.traits) {
        const val = npc.facets[traitKey] || 0;
        if (val > maxVal) {
          maxVal = val;
          emotionType = obj.traits[traitKey].emoType || 'joy';
        }
      }
    }

    if (emotionType === 'neutral') {
      if (npc.emo && npc.emo.stress > 60) emotionType = 'fear';
      else if (npc.hunger > 60) emotionType = 'sadness';
      else if (npc.emo && npc.emo.drunk > 40) emotionType = 'joy';
    }

    // =========================================================
    // СПЕЦ-ЛОГИКА ДЛЯ ЭКИПИРОВКИ (Атомарный движок)
    if (objId === 'equipment' && extraCtx && extraCtx.item) {
       if (window.generateItemThought) {
           const thought = window.generateItemThought(npc, extraCtx.item);
           if (thought) return thought;
       }
    }

    // =========================================================
    // СПЕЦ-ЛОГИКА ДЛЯ ФИЗИОЛОГИИ (Боль, шок, тошнота)
    // =========================================================
    if (objId === 'physiology' && extraCtx) {
       const type = extraCtx.type || 'pain';
       
       const template = pick(Reg.dict.physio_templates || ["{{name}} {{verb}}. {{context}}"]);
       const verb = pick(Reg.dict.physio_verbs || ["корчится"]);
       
       let ctxPool = Reg.dict.physio_ctx_pain;
       let emoType = 'fear';
       
       if (type === 'shock') { ctxPool = Reg.dict.physio_ctx_shock; emoType = 'fear'; }
       else if (type === 'nausea') { ctxPool = Reg.dict.physio_ctx_nausea; emoType = 'sadness'; }
       else if (type === 'heat') { ctxPool = Reg.dict.physio_ctx_heat; emoType = 'fear'; }
       else if (type === 'cold') { ctxPool = Reg.dict.physio_ctx_cold; emoType = 'sadness'; }
       else if (type === 'halluc') { ctxPool = Reg.dict.physio_ctx_halluc; emoType = 'joy'; }
       
       const context = pick(ctxPool);

       let finalText = template
         .replace(/{{name}}/g, npc.name)
         .replace(/{{verb}}/g, verb)
         .replace(/{{context}}/g, context);
         
       finalText = finalText.replace(/\s+/g, ' ').trim();

       return { text: finalText, emo: { type: emoType, power: 15, category: 'physiology' } };
    }

    // =========================================================
    // СПЕЦ-ЛОГИКА ДЛЯ ТРАВМ И БОЛЕЗНЕЙ (Генерация через движок)
    if (objId === 'injury' && extraCtx) {
       const part = extraCtx.part || 'тело';
       const type = extraCtx.type || 'cut';
       
       // Вызываем наш новый движок сборки предложений
       if (window.generateInjurySentence) {
          let finalText = window.generateInjurySentence(npc, part, type);
          
          // Определяем эмоцию для памяти
          let emo = 'sadness';
          if (npc.emo && npc.emo.stress > 70) emo = 'fear';
          else if (npc.facets && npc.facets.aggression > 70) emo = 'joy';
          else if (npc.trait && npc.trait.id === 'hardworking') emo = 'neutral';

          return { text: finalText, emo: { type: emo, power: 15, category: 'injury' } };
       }
    }

    // =========================================================
    // ОБЫЧНАЯ ЛОГИКА ДЛЯ ОСТАЛЬНЫХ ОБЪЕКТОВ
    // =========================================================
    if (!obj) return null;

    let verb = (obj.verbs && obj.verbs.length) ? pick(obj.verbs) : 'смотрит на';
    if (actionType === 'rumor') verb = 'слышит о';
    else if (actionType === 'drink') verb = 'пьет из';
    else if (actionType === 'wakeup') verb = 'смотрит на';

    let adj = '';
    if (obj.adjectives && obj.adjectives.length > 0) {
      adj = pick(obj.adjectives) + ' ';
    } else if (Reg.dict.adjs) {
      adj = pick(Reg.dict.adjs) + ' ';
    }

    let subject = obj.name;
    if (extraCtx && extraCtx.culprit) subject = `${obj.name} от ${extraCtx.culprit}`;

    let contextPool = Reg.dict.contexts || [];
    
    if (emotionType === 'fear') contextPool = Reg.dict.contexts_stress || Reg.dict.contexts;
    else if (emotionType === 'anger') contextPool = Reg.dict.contexts_anger || Reg.dict.contexts_stress || Reg.dict.contexts;
    else if (emotionType === 'sadness') contextPool = Reg.dict.contexts_hunger || Reg.dict.contexts;
    else if (emotionType === 'joy') contextPool = Reg.dict.contexts_calm || Reg.dict.contexts;
    
    if (objId === 'gold' && Reg.dict.contexts_gold) contextPool = Reg.dict.contexts_gold;
    if (actionType === 'rumor' && Reg.dict.contexts_rumor) contextPool = Reg.dict.contexts_rumor;

    const context = pick(contextPool);

    const templates = [
      `${npc.name} ${verb} ${adj}${subject}. ${context}`,
      `${npc.name} ${verb} ${adj}${subject}. Именно так он думает. ${context}`,
      `Взгляд ${npc.name} падает на ${adj}${subject}. ${context}`
    ];

    let finalText = pick(templates).replace(/\s+/g, ' ').trim();

    return { 
      text: finalText, 
      emo: { type: emotionType, power: 10, category: objId } 
    };
  }
};
