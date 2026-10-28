// Генератор безумия на основе черт личности
Reg.madness = {
  // Определяем тип безумия на основе граней и ценностей
  getType: function(npc) {
    const f = npc.facets || {};
    const v = npc.values || {};

    // Заменили несуществующие anger и depression на aggression и anxiety
    if (f.aggression > 60 && f.altruism < 40) return 'berserk';
    if (f.anxiety > 60 && (npc.emo.stress > 90)) return 'melancholy';
    if (f.anxiety > 60 && f.courage < 40) return 'catatonic';
    if (f.greed > 60 && f.curiosity > 50) return 'obsessive';
    
    return 'despair'; // Дефолт, если ничего не подошло
  },

  // Генерируем действие и текст
  getAction: function(npc, state) {
    const type = this.getType(npc);
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];
    
    // Ищем, что есть рядом (объект для взаимодействия)
    let nearbyObj = 'пустоту';
    let objType = 'none';
    for (const [dx, dy] of [[0,1],[0,-1],[1,0],[-1,0]]) {
      const c = getCell(npc.x + dx, npc.y + dy);
      if (!c) continue;
      if (c.type === 'stone') { nearbyObj = 'каменную стену'; objType = 'wall'; break; }
      if (c.type === 'bed') { nearbyObj = 'скрипучую кровать'; objType = 'bed'; break; }
      if (c.type === 'forge') { nearbyObj = 'раскаленную наковальню'; objType = 'forge'; break; }
      if (c.type === 'altar') { nearbyObj = 'древний алтарь'; objType = 'altar'; break; }
      if (c.type === 'storage') { nearbyObj = 'гору руды'; objType = 'storage'; break; }
    }

    let text = '';
    let emo = { type: 'sadness', power: 30 };

    // --- БЕШЕНСТВО ---
    if (type === 'berserk') {
      // Ищем, кого ударить рядом
      let victim = null;
      if (state && state.npcs) {
          victim = state.npcs.find(n => n.alive && n.id !== npc.id && Math.abs(n.x - npc.x) + Math.abs(n.y - npc.y) <= 1);
      }
      
      if (victim) {
          text = `${npc.name} впадает в кровавое бешенство! Он набрасывается на ${victim.name} с кулаками!`;
          // Используем систему травм (ломаем кости)
          if (window.applyBodyDamage) {
              window.applyBodyDamage(victim, 8, 'blunt', 'torso');
          } else {
              // Используем систему травм (ломаем кости)
          if (window.applyBodyDamage) {
              window.applyBodyDamage(victim, 8, 'blunt', 'torso');
          } else {
              victim.hp -= 5;
          }
          }
          emo = { type: 'anger', power: 50 };
          Reg.addMemory(victim, `${npc.name} сошел с ума и ударил меня!`, { type: 'fear', power: 30, category: 'combat' });
      } else {
          text = `${npc.name} впадает в кровавое бешенство! Он бьет ${nearbyObj} с такой силой, что брызжет кровь.`;
          emo = { type: 'anger', power: 50 };
          npc.hp -= 1; // Теперь он бьет стену и ломает себе костяшки, но не умирает
      }
    }
    // --- МЕЛАНХОЛИЯ ---
    else if (type === 'melancholy') {
      if (objType === 'altar') {
        text = `${npc.name} падает на колени перед алтарем. Он молит богов забрать его душу, но они молчат.`;
      } else {
        text = `${npc.name} рыдает, уткнувшись в ${nearbyObj}. Он шепчет, что лучше бы умер в детстве.`;
      }
      emo = { type: 'sadness', power: 40 };
      npc.hp -= 2;
    }
    // --- КАТАТОНИЯ ---
    else if (type === 'catatonic') {
      text = `${npc.name} застывает на месте. Его взгляд пуст, он не реагирует на ${nearbyObj}. Он медленно умирает изнутри.`;
      emo = { type: 'fear', power: 40 };
      npc.fatigue += 20; // Он не спит
    }
    // --- ОБСЕССИЯ ---
    else if (type === 'obsessive') {
      if (objType === 'storage') {
        text = `${npc.name} вцепляется в руду на складе. Он пересчитывает её снова и снова, бормоча числа. Он не остановится.`;
      } else {
        text = `${npc.name} одержим ${nearbyObj}. Он царапает его ногтями, пытаясь понять, из чего тот сделан.`;
      }
      emo = { type: 'curiosity', power: 30 };
    }
    // --- ОТЧАЯНИЕ ---
    else {
      if (objType === 'wall') {
        text = `${npc.name} бьется головой о ${nearbyObj}, пока не начинает течь кровь. Он хочет заглушить внутреннюю боль.`;
      } else {
        text = `${npc.name} швыряет свою кирку в ${nearbyObj} и кричит в темноту.`;
      }
      emo = { type: 'anger', power: 20 };
      npc.hp -= 3;
    }

    return { text, emo, type };
  }
};
