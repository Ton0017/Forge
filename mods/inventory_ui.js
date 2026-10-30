setTimeout(() => {

  // РИСУЕМ КРУГЛОЕ ЛИЦО (КАК ЭМОДЗИ)
  function drawNpcFace(canvas, npc) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 40, 40);

    const isDead = !npc.alive || npc.hp <= 0;
    const cx = 20, cy = 20, r = 13; // круглое лицо, 26px диаметр

    // 1. ЦВЕТ КОЖИ
    let skin = '#f0c890'; // Тёплый персиковый
    if (isDead) skin = '#d8d8d8';
    else if (npc.hasGoneInsane) skin = '#e0d8a0';
    else if (npc.emo && npc.emo.drunk > 60) skin = '#e8a0a0';
    else if (npc.hunger > 80) skin = '#c8c890';
    else if (npc.hp < npc.maxHp * 0.4) skin = '#d8c0a0';
    else if (npc.emo && npc.emo.stress > 80) skin = '#e8a8a8';

    // 2. ГОЛОВА (круг)
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = skin;
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 3. ГЛАЗА
    ctx.fillStyle = '#1a1a1a';
    ctx.strokeStyle = '#1a1a1a';

    if (isDead) {
        // Крестики
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(13, 16); ctx.lineTo(17, 20);
        ctx.moveTo(17, 16); ctx.lineTo(13, 20);
        ctx.moveTo(23, 16); ctx.lineTo(27, 20);
        ctx.moveTo(27, 16); ctx.lineTo(23, 20);
        ctx.stroke();
    } else if (npc.hasGoneInsane) {
        // Белые глаза с красными зрачками
        ctx.beginPath();
        ctx.arc(15, 17, 3.5, 0, Math.PI * 2);
        ctx.arc(25, 17, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.fillStyle = '#ff2020';
        ctx.beginPath();
        ctx.arc(15, 17, 1.5, 0, Math.PI * 2);
        ctx.arc(25, 17, 1.5, 0, Math.PI * 2);
        ctx.fill();
    } else if (npc.task && npc.task.type === 'rest') {
        // Закрытые глаза (дуги)
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(15, 18, 2.5, Math.PI, Math.PI * 2);
        ctx.arc(25, 18, 2.5, Math.PI, Math.PI * 2);
        ctx.stroke();
    } else if (npc.task && npc.task.type === 'fight') {
        // Злые глаза (точки + брови)
        ctx.beginPath();
        ctx.arc(15, 18, 1.8, 0, Math.PI * 2);
        ctx.arc(25, 18, 1.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(11, 12); ctx.lineTo(17, 14);
        ctx.moveTo(29, 12); ctx.lineTo(23, 14);
        ctx.stroke();
    } else if (npc.emo && npc.emo.drunk > 60) {
        // Пьяные крестики
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(13, 15); ctx.lineTo(17, 19);
        ctx.moveTo(17, 15); ctx.lineTo(13, 19);
        ctx.moveTo(23, 15); ctx.lineTo(27, 19);
        ctx.moveTo(27, 15); ctx.lineTo(23, 19);
        ctx.stroke();
    } else if (npc.hp < npc.maxHp * 0.4) {
        // Прищуренные от боли
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(11, 18); ctx.lineTo(17, 17);
        ctx.moveTo(23, 17); ctx.lineTo(29, 18);
        ctx.stroke();
    } else {
        // Обычные овальные глаза
        ctx.beginPath();
        ctx.ellipse(15, 18, 1.8, 2.5, 0, 0, Math.PI * 2);
        ctx.ellipse(25, 18, 1.8, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // 4. РОТ
    if (!isDead) {
        ctx.strokeStyle = '#1a1a1a';
        ctx.lineWidth = 2;
        ctx.beginPath();

        if (npc.hp < npc.maxHp * 0.4 || (npc.task && npc.task.type === 'fight')) {
            // Крик (открытый рот)
            ctx.fillStyle = '#8a2020';
            ctx.beginPath();
            ctx.ellipse(20, 26, 3, 2.5, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (npc.hunger > 60) {
            // Грусть (дуга вверх)
            ctx.arc(20, 28, 3, 1.15 * Math.PI, 1.85 * Math.PI);
            ctx.stroke();
        } else if (npc.emo && npc.emo.drunk > 60) {
            // Пьяная волна
            ctx.beginPath();
            ctx.moveTo(16, 26);
            ctx.quadraticCurveTo(18, 24, 20, 26);
            ctx.quadraticCurveTo(22, 28, 24, 26);
            ctx.stroke();
        } else {
            // Улыбка (дуга вниз)
            ctx.arc(20, 24, 3.5, 0.2 * Math.PI, 0.8 * Math.PI);
            ctx.stroke();
        }
    }

    // 5. НАЛОЖЕНИЯ
    if (npc.dirt > 40 && !isDead) {
        ctx.fillStyle = 'rgba(74, 59, 42, 0.6)';
        ctx.beginPath();
        ctx.arc(12, 22, 2, 0, Math.PI * 2);
        ctx.arc(28, 13, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    if (npc.emo && npc.emo.stress > 70 && !isDead) {
        // Капли пота
        ctx.fillStyle = '#60a0e0';
        ctx.beginPath();
        ctx.arc(29, 12, 1.5, 0, Math.PI * 2);
        ctx.arc(31, 16, 1, 0, Math.PI * 2);
        ctx.fill();
    }
    if (npc.hp < npc.maxHp * 0.6 && !isDead) {
        // Кровь
        ctx.fillStyle = '#a02020';
        ctx.beginPath();
        ctx.arc(10, 20, 1.5, 0, Math.PI * 2);
        ctx.arc(13, 23, 1, 0, Math.PI * 2);
        ctx.fill();
    }
  }

  window.renderCrew = function() {
    const list = document.getElementById('crew-list');
    if (!list) return;
    list.innerHTML = '';

    for (const npc of state.npcs) {
      const isDead = !npc.alive;
      
      const card = document.createElement('div');
      card.className = 'npc-card';
      card.setAttribute('data-id', npc.id);
      if (isDead) card.style.opacity = '0.6';
      if (npc.id === window.selectedNpcId) card.style.borderColor = '#fff';

      let imgHtml = npc.skinFile ? `<img src="assets/skins/${encodeURI(npc.skinFile)}" alt="skin">` : `<div style="width:48px;height:48px;background:${npc.profession ? npc.profession.color : '#555'};"></div>`;

      let taskText = isDead ? 'МЕРТВ' : 'Бездельничает';
      if (!isDead) {
          const taskMap = {
              'dig': 'Копает',
              'chop': 'Рубит дерево',
              'fight': 'Драка!',
              'eat': 'Ест',
              'drink': 'Пьет',
              'go_to_eat': 'Идет к еде',
              'go_to_drink': 'Идет пить',
              'go_to_water': 'Идет к воде',
              'go_to_deposit': 'Несет руду на склад',
              'go_to_rest': 'Идет спать',
              'rest': 'Спит',
              'crafting': 'Кует',
              'craft_pickaxe': 'Кует кирку',
              'go_to_heal': 'Идет лечиться',
              'go_to_heal_friend': 'Идет лечить друга',
              'madness': 'БЕЗУМИЕ',
              'flee': 'Убегает',
              'wander': 'Бродит',
              'idle': 'Отдыхает',
              'go_to_snack': 'Идет к столу',
              'socialize': 'Общается',
              'pray': 'Молится'
          };
          if (npc.task && taskMap[npc.task.type]) {
              taskText = taskMap[npc.task.type];
          } else if (npc.thirst > 60) {
              taskText = 'Хочет пить';
          } else if (npc.hunger > 60) {
              taskText = 'Хочет есть';
          }
      }

      card.innerHTML = `
        ${imgHtml}
        <div class="npc-info">
          <div class="name" style="${isDead ? 'color:#a83838;' : ''}">
            ${npc.name} 
            ${npc.equipment && npc.equipment.weapon ? '<span style="font-size:12px;" title="' + npc.equipment.weapon.name + '">⚔️</span>' : ''}
            ${npc.equipment && npc.equipment.armor ? '<span style="font-size:12px;" title="' + npc.equipment.armor.name + '">🛡️</span>' : ''}
        </div>
          <div class="task">${npc.profession ? npc.profession.name : 'Странник'} | ${npc.trait ? npc.trait.name : 'Обычный'} | ${npc.gender === 'female' ? '♀' : (npc.gender === 'male' ? '♂' : '')}${npc.isChild ? ' Ребёнок, ' + Math.floor(npc.age || 0) + ' лет' : (npc.age !== undefined ? ' ' + Math.floor(npc.age) + ' лет' : '')}</div>
          <div class="task" style="color:${isDead ? '#a83838' : '#c87b32'}; font-weight:bold; margin-top:2px;">Задача: ${taskText}</div>

          <div style="display:flex; align-items:center; gap:10px; margin-top:6px;">
            <canvas class="npc-face" width="40" height="40" style="background:#1a1814; border:1px solid ${isDead ? '#a83838' : '#3a3528'}; border-radius:50%;"></canvas>
            <div style="font-size:11px; color:#a09080; line-height:1.4;">
                <div>Здоровье: <span style="color:${npc.hp < npc.maxHp * 0.4 ? '#a83838' : '#7aba7a'}">${Math.floor(npc.hp)}</span></div>
                <div>Стресс: <span style="color:${npc.emo && npc.emo.stress > 70 ? '#e05030' : '#c8c8b8'}">${Math.floor(npc.emo ? npc.emo.stress : 0)}</span></div>
                <div>Голод: <span style="color:${npc.hunger > 70 ? '#e05030' : '#c8c8b8'}">${Math.floor(npc.hunger)}</span></div>
            </div>
          </div>
        </div>
      `;

      const canvas = card.querySelector('.npc-face');
      if (canvas) drawNpcFace(canvas, npc);

      card.onclick = (e) => {
        if (e) e.stopPropagation();
        const npcId = card.getAttribute('data-id');
        const npc = state.npcs.find(n => n.id === npcId);
        if (npc) {
          window.selectedNpcId = npc.id;
          if (window.closePanels) window.closePanels();
          if (window.renderMap) window.renderMap();
          if (window.openCharacterSheet) window.openCharacterSheet(npc);
        }
      };
      list.appendChild(card);
    }
  };
}, 1500);
