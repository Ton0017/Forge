setTimeout(() => {
  const menuOverlay = document.getElementById('menu-overlay');
  if (!menuOverlay) return;

  // 1. Добавляем кнопку Архива, если её нет
  if (!document.getElementById('btn-history')) {
    const btn = document.createElement('button');
    btn.id = 'btn-history';
    btn.className = 'btn';
    btn.innerText = 'Archive of Worlds';
    // Вставляем перед кнопкой "Стереть" или в конец
    const continueBtn = document.getElementById('btn-continue');
    if (continueBtn) {
      continueBtn.parentNode.insertBefore(btn, continueBtn.nextSibling);
    } else {
      menuOverlay.appendChild(btn);
    }
  }

  // 2. Сохраняем снапшот текущей игры каждые 2 секунды
  setInterval(() => {
    if (typeof state !== 'undefined' && state && state.npcs && state.npcs.length > 0) {
      const alive = state.npcs.filter(n => n.alive).length;
      localStorage.setItem('current_game_snapshot', JSON.stringify({
        day: state.day || 1,
        gold: state.gold || 0,
        depth: Object.keys(state.cells || {}).length,
        dwarves: alive,
        date: new Date().toLocaleDateString()
      }));
    }
  }, 2000);

  // 3. При нажатии "New Game" сохраняем текущую игру в историю
  const startBtn = document.getElementById('btn-start');
  if (startBtn) {
    const originalStart = startBtn.onclick;
    startBtn.onclick = () => {
      const snap = localStorage.getItem('current_game_snapshot');
      if (snap) {
        const history = JSON.parse(localStorage.getItem('past_games') || '[]');
        history.push(JSON.parse(snap));
        if (history.length > 20) history.shift();
        localStorage.setItem('past_games', JSON.stringify(history));
        localStorage.removeItem('current_game_snapshot');
      }
      if (originalStart) originalStart();
    };
  }

  // 4. Логика кнопки Архива
  const historyBtn = document.getElementById('btn-history');
  if (historyBtn) {
    historyBtn.onclick = () => {
      const history = JSON.parse(localStorage.getItem('past_games') || '[]');
      
      if (history.length === 0) {
        alert('Archive is empty. Play a game first.');
        return;
      }

      let html = `
        <h1 style="font-size:20px; color:#a83838; font-family:'Pixelify Sans';">ARCHIVE OF WORLDS</h1>
        <div style="max-height: 50vh; overflow-y: auto; width: 100%; max-width: 400px; margin-bottom:20px; text-align:left;">
      `;

      history.slice().reverse().forEach((game, i) => {
        html += `
          <div style="background:#1e1a16; border:1px solid #5a4d32; padding:10px; margin-bottom:8px; border-radius:4px;">
            <div style="color:#c87b32; font-weight:bold; font-size:14px; margin-bottom:5px;">World #${history.length - i} (${game.date})</div>
            <div style="font-size:12px; color:#c9c4b4;">Days: <b>${game.day}</b> | Gold: <b>${game.gold}</b> | Dwarves: <b>${game.dwarves}</b></div>
            <div style="font-size:11px; color:#7a6b4a; margin-top:4px;">Size: ${game.depth} cells</div>
          </div>
        `;
      });

      html += `</div><button id="btn-back-menu" class="btn" style="width:100%; max-width:300px;">Back to Menu</button>`;
      
      menuOverlay.innerHTML = html;

      document.getElementById('btn-back-menu').onclick = () => {
        window.location.reload(); // Самый надежный способ вернуть меню
      };
    };
  }
}, 1500);
