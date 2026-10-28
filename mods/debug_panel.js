(function(){
  setTimeout(() => {
    // Кнопка теперь СЛЕВА ВНИЗУ
    const btn = document.createElement('div');
    btn.innerText = '[!]';
    btn.style.cssText = 'position:fixed; bottom:80px; left:15px; width:30px; height:30px; background:#a83838; color:#fff; font-family:monospace; font-weight:bold; display:flex; justify-content:center; align-items:center; border-radius:4px; z-index:999998; cursor:pointer; border:1px solid #ff8888; font-size:14px; opacity:0.5;';
    btn.onmouseover = () => btn.style.opacity = '1';
    btn.onmouseout = () => btn.style.opacity = '0.5';
    document.body.appendChild(btn);

    const modal = document.createElement('div');
    modal.id = 'debug-modal';
    modal.style.cssText = 'display:none; position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); width:360px; max-height:80vh; overflow-y:auto; background:#12100e; border:2px solid #a83838; border-radius:6px; padding:12px; z-index:1000000; color:#e0d8c8; font-size:13px; box-shadow:0 0 30px rgba(0,0,0,0.9);';
    document.body.appendChild(modal);

    btn.onclick = () => {
      if (modal.style.display === 'block') { modal.style.display = 'none'; return; }
      
      let s = null;
      try { s = state; } catch(e) {}
      let html = '<h3 style="color:#a83838;">Панель разработчика</h3>';
      
      if (s && s.npcs) {
        html += `<div style="margin-bottom:10px;">Тик: ${s.tick} | Дварфов: ${s.npcs.length} | Золото: ${s.gold}</div>`;
        let stuck = s.npcs.filter(n => n.alive && n.task && n.task.type === 'idle');
        if (stuck.length > 0) {
            html += `<div style="color:#e0a040;">Бездельничают:</div>`;
            stuck.forEach(n => { html += `<div style="font-size:11px; margin-left:10px;">- ${n.name} (Еда: ${Math.floor(n.hunger)}, Жажда: ${Math.floor(n.thirst)})</div>`; });
        }
      }
      html += `<div style="display:flex; gap:5px; margin-top:15px;">
            <button id="dbg-err" style="flex:1; color:#a83838;">Тест</button>
            <button id="dbg-reset" style="flex:1; color:#c87b32;">Сброс</button>
            <button id="dbg-close" style="flex:1;">Закрыть</button>
        </div>`;
      modal.innerHTML = html;
      modal.style.display = 'block';

      document.getElementById('dbg-close').onclick = () => modal.style.display = 'none';
      document.getElementById('dbg-err').onclick = () => { if (window.triggerDebugError) window.triggerDebugError(); };
      document.getElementById('dbg-reset').onclick = () => { localStorage.removeItem('forge_save'); location.reload(); };
    };
  }, 1500);
})();
