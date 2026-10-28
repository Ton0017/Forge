(function(){
  const btn = document.createElement('div');
  btn.innerHTML = '<img src="assets/icons/bear icon.png" style="width:32px; height:32px; image-rendering:pixelated;" onerror="this.outerHTML=\'<span style=\\\'color:#c87b32; font-weight:bold; font-size:20px;\\\'>Б</span>\'">'; 
  btn.style.cssText = 'position:fixed; bottom:120px; right:15px; width:48px; height:48px; background:#1e1a16; border:2px solid #c87b32; border-radius:4px; display:flex; justify-content:center; align-items:center; z-index:999999; cursor:pointer; box-shadow:0 4px 10px rgba(0,0,0,0.8); user-select:none;';
  document.body.appendChild(btn);

  const modal = document.createElement('div');
  modal.id = 'bestiary-modal';
  modal.style.cssText = 'display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); width:380px; max-height:80vh; background:#12100e; border:2px solid #c87b32; border-radius:6px; padding:12px; z-index:1000000; color:#e0d8c8; font-family:"Courier New", monospace; font-size:13px; box-shadow:0 0 30px rgba(0,0,0,0.9); overflow-y:auto;';
  document.body.appendChild(modal);

  btn.addEventListener('click', () => {
    let s = null;
    try { s = state; } catch(e) {}
    if (!s && window.state) s = window.state;
    
    if (!s || !s.cells) return;

    let creatures = [];
    for (let k in s.cells) {
      const c = s.cells[k];
      if (c.animal) creatures.push({ data: c.animal, isAnimal: true, pos: k, cellType: c.type });
      else if (c.monster) creatures.push({ data: c.monster, isAnimal: false, pos: k, cellType: c.type });
    }

    let html = '<h3 style="color:#c87b32; margin-bottom:10px; border-bottom:1px solid #3a3528; padding-bottom:5px;">Бестиарий (Фауна шахты)</h3>';
    
    if (creatures.length === 0) {
      html += '<div style="color:#888; font-style:italic;">В шахте пока нет живности. Подожди или копай глубже.</div>';
    } else {
      creatures.forEach((c, index) => {
        const name = c.data.name || c.data.id || 'Неизвестный';
        const typeText = c.isAnimal ? 'Животное' : 'Монстр';
        const typeColor = c.isAnimal ? '#7aba7a' : '#a83838';
        
        let stateText = 'Цел';
        if (c.data.body) {
           const severed = Object.values(c.data.body).filter(p => p.status === 'severed').length;
           const fractures = Object.values(c.data.body).filter(p => p.status === 'fracture').length;
           if (severed > 0) stateText = `<span style="color:#a83838;">Изувечен (${severed} отрублено)</span>`;
           else if (fractures > 0) stateText = `<span style="color:#e0a040;">Переломы (${fractures})</span>`;
           else if (c.data.blood < 50) stateText = `<span style="color:#a83838;">Истекает кровью</span>`;
        } else {
           stateText = `HP: ${Math.floor(c.data.hp)}`;
        }

        html += `
          <div class="bestiary-item" data-index="${index}" style="padding:8px; border-bottom:1px solid #2a2520; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <span style="color:#e0d8c8; font-weight:bold;">${name}</span><br>
              <span style="color:${typeColor}; font-size:11px;">${typeText}</span>
            </div>
            <div style="color:#888; font-size:11px; text-align:right;">
              ${stateText}<br>Поз: ${c.pos}
            </div>
          </div>`;
      });
    }

    html += `<button id="close-bestiary" style="width:100%; margin-top:10px; background:#a83838; border:1px solid #ff8888; color:#fff; padding:6px; border-radius:4px; font-family:inherit; cursor:pointer;">Закрыть</button>`;

    modal.innerHTML = html;
    modal.style.display = 'block';

    document.getElementById('close-bestiary').onclick = () => modal.style.display = 'none';

    document.querySelectorAll('.bestiary-item').forEach(item => {
      item.onclick = () => {
        const idx = item.getAttribute('data-index');
        const c = creatures[idx];
        modal.style.display = 'none';
        showDetails(c.data, c.isAnimal, c.cellType);
      };
    });
  });

  function showDetails(a, isAnimal, cellType) {
    const card = document.createElement('div');
    card.style.cssText = 'display:block; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); width:380px; max-height:80vh; overflow-y:auto; background:#12100e; border:2px solid #c87b32; border-radius:6px; padding:12px; z-index:1000001; color:#e0d8c8; font-family:"Courier New", monospace; font-size:13px; box-shadow:0 0 30px rgba(0,0,0,0.9);';
    
    // ЧИТАЕМ СОХРАНЕННЫЙ ПРОФИЛЬ (если нет — генерируем ОДИН раз и сохраняем)
    if (!a.profile) {
        if (window.initAtomicProfile) {
            window.initAtomicProfile(a);
        } else {
            a.profile = { text: 'Обычное существо.', thought: 'Оно просто живет.' };
        }
    }
    let genProfile = { description: a.profile.text, thought: a.profile.thought };

    const getStatusText = (b) => {
        if (!b) return 'Н/Д';
        if (b.status === 'severed') return '<span style="color:#a83838; font-weight:bold;">ОТРУБЛЕНО</span>';
        if (b.status === 'fracture') return '<span style="color:#e0a040;">ПЕРЕЛОМ</span>';
        if (b.status === 'cut') return '<span style="color:#e05030;">РАНА</span>';
        if (b.bleeding > 0) return `<span style="color:#a83838;">КРОВОТЕЧЕНИЕ (${b.bleeding})</span>`;
        return '<span style="color:#7aba7a;">В НОРМЕ</span>';
    };

    let spriteSrc = 'assets/animals/' + (a.id || 'goblin') + '.png';
    if (a.file) spriteSrc = 'assets/equipment/' + a.file;

    let bodyHtml = '';
    if (a.body) {
        bodyHtml = `
        <div style="margin-top:10px; border-top:1px solid #3a3528; padding-top:10px;">
            <div style="margin-bottom:5px;">Кровь: <span style="color:#a83838;">${Math.floor(a.blood)}/100</span></div>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px; font-size:11px;">
                <div>Голова: ${getStatusText(a.body.head)}</div>
                <div>Торс: ${getStatusText(a.body.torso)}</div>
                <div>Л. Рука: ${getStatusText(a.body.left_arm)}</div>
                <div>П. Рука: ${getStatusText(a.body.right_arm)}</div>
                <div>Л. Нога: ${getStatusText(a.body.left_leg)}</div>
                <div>П. Нога: ${getStatusText(a.body.right_leg)}</div>
            </div>
        </div>`;
    }

    // Блок с характеристиками (Масса, Голод, Грани)
    let statsHtml = `
      <div style="background:#1e1a16; padding:10px; border:1px solid #3a3528; border-radius:4px; margin-top:10px; font-size:12px; line-height:1.6; color:#c8c8b8;">
          <div style="color:#ffcc00; margin-bottom:5px;">Характер:</div>
          Агрессия: ${a.facets?.aggression || 50}/100 | Страх: ${a.facets ? 100 - a.facets.bravery : 50}/100<br>
          Масса: ${a.mass || 10} | Голод: ${Math.floor(a.hunger || 0)}/100
          ${a.emo && a.emo.drunk > 0 ? `<br><span style="color:#ffaa00; font-weight:bold;">🍻 Опьянение: ${Math.floor(a.emo.drunk)}/100</span>` : ''}
          ${a.infections && a.infections.length > 0 ? `<br><span style="color:#ff0000; font-weight:bold;">☠️ Заражение / Отравление</span>` : ''}
          ${a.task && a.task.type && a.task.type !== 'idle' ? `<br><span style="color:#7aba7a;">Действие: ${a.task.type}</span>` : ''}
      </div>`;

    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:1px solid #3a3528; padding-bottom:8px; margin-bottom:8px;">
        <div style="display:flex; gap:10px;">
          <img src="${spriteSrc}" style="width:48px; height:48px; image-rendering:pixelated; background:#1a1713; border:1px solid #3a3528;" onerror="this.style.display='none'">
          <div>
            <div style="color:#c87b32; font-weight:bold; font-size:16px; text-transform:capitalize;">${a.name || a.id || 'Существо'}</div>
            <div style="color:#888; font-size:11px;">${isAnimal ? 'Животное' : 'Монстр'}</div>
          </div>
        </div>
        <button id="close-card" style="background:#a83838; border:1px solid #ff8888; color:#fff; padding:2px 8px; border-radius:4px; cursor:pointer; font-family:inherit;">X</button>
      </div>
      
      ${bodyHtml}
      ${statsHtml}

      <div style="background:#1e1a16; padding:10px; border:1px solid #3a3528; border-radius:4px; margin-top:10px; font-size:12px; line-height:1.6; color:#c8c8b8;">
        ${genProfile.description}
      </div>
      
      <!-- ДЕЙСТВИЯ МОБА (Что он сделал) -->
      <div style="background:#2a1a10; padding:10px; border:1px solid #5a3a20; border-radius:4px; margin-top:10px; font-size:12px; line-height:1.6; color:#e0a040; font-style:italic;">
        ${window.generateMobActionText ? window.generateMobActionText(a) : ''}
      </div>
      <div style="font-style:italic; color:#a09080; margin-top:10px; font-size:12px;">"${genProfile.thought}"</div>
    `;
    
    document.body.appendChild(card);
    document.getElementById('close-card').onclick = () => card.remove();
  }
})();
