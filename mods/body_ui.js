(function(){
  setTimeout(() => {
    const checkUI = setInterval(() => {
      if (document.getElementById('df-character-modal')) {
         clearInterval(checkUI);
         injectBodyTab();
      }
    }, 500);

    function injectBodyTab() {
      // Находим вкладки "Просмотр", "Здоровье", "Умения", "Работа"
      const mainTabs = document.querySelector('.df-main-tab')?.parentNode;
      if (!mainTabs) return;

      // Перехватываем существующую кнопку "Здоровье" (если она есть)
      const healthBtn = Array.from(mainTabs.children).find(b => b.innerText.includes('Здоровье'));
      
      if (healthBtn) {
        const origClick = healthBtn.onclick;
        healthBtn.onclick = (e) => {
           // Вызываем нашу отрисовку вместо старой
           showHealthUI();
        };
      }
    }

    function showHealthUI() {
      // Скрываем все контенты, показываем наш
      const content = document.getElementById('df-modal-content') || document.querySelector('.df-modal-body');
      if (!content) return;

      let npc = null;
      try { if (typeof selectedNpcId !== 'undefined') npc = state.npcs.find(n => n.id === selectedNpcId); } catch(e) {}
      if (!npc) return;

      // Инициализируем тело для старых сохранений
      if (!npc.body) {
         npc.body = {
            head: { hp: 50, status: 'ok', bleeding: 0 },
            torso: { hp: 100, status: 'ok', bleeding: 0 },
            left_arm: { hp: 40, status: 'ok', bleeding: 0 },
            right_arm: { hp: 40, status: 'ok', bleeding: 0 },
            left_leg: { hp: 40, status: 'ok', bleeding: 0 },
            right_leg: { hp: 40, status: 'ok', bleeding: 0 }
         };
         npc.blood = 100;
      }

      const getStatusText = (b) => {
        if (b.status === 'prosthetic' && b.attached) return `<span style="color:#c87b32; font-weight:bold;">ПРОТЕЗ: ${b.attached.name}</span>`;
        if (b.status === 'severed') return '<span style="color:#a83838; font-weight:bold;">ОТРУБЛЕНО</span>';
        if (b.status === 'fracture') return '<span style="color:#e0a040;">ПЕРЕЛОМ</span>';
        if (b.status === 'cut') return '<span style="color:#e05030;">РАНА</span>';
        if (b.bleeding > 0) return `<span style="color:#a83838;">КРОВОТЕЧЕНИЕ (${b.bleeding})</span>`;
        return '<span style="color:#7aba7a;">В НОРМЕ</span>';
      };

      let html = `<h3 style="color:#c87b32; margin-bottom:10px;">Состояние тела:</h3>`;
      
      // Кровь
      const bloodColor = npc.blood > 50 ? '#a83838' : '#e05030';
      html += `<div style="margin-bottom:8px;">
         <div>Кровь: ${Math.floor(npc.blood)}/100</div>
         <div style="width:100%; height:8px; background:#333; border:1px solid #000; margin-top:2px;">
            <div style="width:${Math.max(0, npc.blood)}%; height:100%; background:${bloodColor};"></div>
         </div>
      </div>`;

      // Боль
      if (npc.pain !== undefined) {
         const painColor = npc.pain > 50 ? '#e05030' : '#c87b32';
         html += `<div style="margin-bottom:8px;">
            <div>Боль: ${Math.floor(npc.pain)}/100</div>
            <div style="width:100%; height:6px; background:#333; border:1px solid #000; margin-top:2px;">
               <div style="width:${Math.max(0, npc.pain)}%; height:100%; background:${painColor};"></div>
            </div>
         </div>`;
      }

      // Температура
      if (npc.temp !== undefined) {
         const tempColor = (npc.temp > 42 || npc.temp < 32) ? '#a83838' : '#327ac8';
         html += `<div style="margin-bottom:8px; color:${tempColor}; font-size:11px;">Температура тела: ${npc.temp.toFixed(1)}°C</div>`;
      }

      // Части тела
      html += `<div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px; font-size:12px;">`;
      
      const partsMap = {
         head: 'Голова',
         torso: 'Торс',
         left_arm: 'Левая рука',
         right_arm: 'Правая рука',
         left_leg: 'Левая нога',
         right_leg: 'Правая нога'
      };

      const getProstheticDesc = (b) => {
        if (b.status === 'prosthetic' && b.prostheticDesc) {
            return `<div style="font-size:10px; color:#a09080; font-style:italic; margin-top:3px;">${b.prostheticDesc}</div>`;
        }
        return '';
      };

      for (let part in partsMap) {
         const b = npc.body[part];
         html += `<div style="background:#1e1a16; padding:6px; border:1px solid #3a3528;">
            <div style="color:#e0d8c8; margin-bottom:4px;">${partsMap[part]}</div>
            <div>${getStatusText(b)}</div>
            ${getProstheticDesc(b)}
         </div>`;
      }
      html += `</div>`;

      // Инфекции
      if (npc.infections && npc.infections.length > 0) {
         html += `<div style="margin-top:15px; color:#a83838; font-weight:bold; border:1px solid #a83838; padding:8px;">
            ⚠️ ИНФЕКЦИЯ: ${npc.infections.map(p => partsMap[p]).join(', ')}
         </div>`;
      }

      // Возраст
      if (npc.age) {
         html += `<div style="margin-top:15px; color:#888; font-size:11px;">Возраст: ${npc.age} лет</div>`;
      }

      content.innerHTML = html;
    }
  }, 1000);
})();
