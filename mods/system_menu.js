(function(){
  setTimeout(() => {
    if (document.getElementById('system-menu-bar')) return;

    const menuBar = document.createElement('div');
    menuBar.id = 'system-menu-bar';
    // ПЕРЕНОСИМ В ЛЕВЫЙ НИЖНИЙ УГОЛ, ВЕРТИКАЛЬНО
    menuBar.style.cssText = 'position:fixed; bottom: 120px; left: 15px; display:flex; flex-direction:column; gap:5px; z-index:99999;';
    
    const btnSave = document.createElement('button');
    btnSave.innerText = '💾';
    btnSave.title = 'Сохранить игру';
    btnSave.style.cssText = 'background:#1e1a16; border:1px solid #c87b32; color:#c87b32; width:32px; height:32px; cursor:pointer; border-radius:4px; font-size:16px;';
    btnSave.onclick = () => {
        if (window.saveGame) { window.saveGame(); alert('Игра сохранена!'); } 
        else {
            try { localStorage.setItem('forge_save', JSON.stringify({ state: window.state || state, tick: (window.state || state).tick })); alert('Игра сохранена!'); } 
            catch(e) { alert('Ошибка сохранения: ' + e.message); }
        }
    };
    
    const btnMenu = document.createElement('button');
    btnMenu.innerText = '🏠';
    btnMenu.title = 'В главное меню';
    btnMenu.style.cssText = 'background:#1e1a16; border:1px solid #a83838; color:#a83838; width:32px; height:32px; cursor:pointer; border-radius:4px; font-size:16px;';
    btnMenu.onclick = () => {
        if (confirm('Выйти в главное меню? Несохраненный прогресс будет потерян.')) location.reload();
    };

    const btnStats = document.createElement('button');
    btnStats.innerText = '📊';
    btnStats.title = 'Статистика';
    btnStats.style.cssText = 'background:#1e1a16; border:1px solid #7aba7a; color:#7aba7a; width:32px; height:32px; cursor:pointer; border-radius:4px; font-size:16px;';
    btnStats.onclick = () => {
        // ИСПРАВЛЕНИЕ: Безопасный поиск state
        let s = null;
        try { s = state; } catch(e) {}
        if (!s && window.state) s = window.state;
        
        if (!s) { alert('Игра еще не загружена!'); return; }
        
        let alive = s.npcs.filter(n => n.alive).length;
        let dead = s.npcs.length - alive;
        alert(`СТАТИСТИКА ШАХТЫ:\n\nДварфов живо: ${alive}\nПогибло: ${dead}\nЗолото: ${Math.floor(s.gold)}\nРуда: ${Math.floor(s.ore || 0)}\nЕда: ${Math.floor(s.food || 0)}\nЭль: ${s.booze || 0}\nТик: ${s.tick}`);
    };

    menuBar.appendChild(btnSave);
    menuBar.appendChild(btnMenu);
    menuBar.appendChild(btnStats);
    document.body.appendChild(menuBar);
  }, 1500);
})();
