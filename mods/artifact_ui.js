(function(){
  setTimeout(() => {
    const chronicleBtn = document.querySelector('.tab-btn[data-tab="chronicle"]');
    if (!chronicleBtn) return;
    const nav = chronicleBtn.parentNode;

    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.dataset.tab = 'artifacts';
    btn.innerText = 'АРТЕФАКТЫ'; 
    nav.insertBefore(btn, chronicleBtn);

    const panel = document.createElement('div');
    panel.id = 'panel-artifacts';
    panel.className = 'panel'; // Используем класс, а НЕ инлайн display:none
    panel.style.cssText = 'position:absolute; bottom:60px; left:0; width:100%; height: 50%; background:#12100e; border-top:2px solid #c87b32; z-index:100; padding:10px; overflow-y:auto;';
    document.body.appendChild(panel);

    btn.onclick = (e) => {
      if (e) e.stopPropagation(); // Не даем клику уйти глубже
      
      // Вместо ручного скрытия всех панелей — вызываем штатную функцию игры
      if (window.closePanels) window.closePanels(); 
      
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Открываем панель через класс active (как это делает сама игра)
      panel.classList.add('active'); 
      renderArtifacts();
    };

    function renderArtifacts() {
      try {
        const s = (typeof window.state !== 'undefined') ? window.state : (typeof state !== 'undefined' ? state : null);
        if (!s || !s.cells) throw new Error("Нет доступа к данным игры (state).");

        let arts = [];
        for (let k in s.cells) {
          if (s.cells[k].items) {
              s.cells[k].items.forEach(i => { if (i.tags && i.tags.includes('artifact')) arts.push({ item: i, owner: 'На полу' }); });
          }
        }
        if (s.npcs) s.npcs.forEach(n => { if (n.inventory) n.inventory.forEach(i => { if (i.tags && i.tags.includes('artifact')) arts.push({ item: i, owner: n.name }); }); });

        let html = `<div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #3a3528; padding-bottom:5px; margin-bottom:10px;">
          <h3 style="color:#c87b32; margin:0;">Кодекс Артефактов</h3>
          <button id="close-artifacts-btn" style="background:#a83838; border:1px solid #ff8888; color:#fff; padding:2px 10px; border-radius:4px; cursor:pointer; font-family:inherit;">X</button>
        </div>`;

        if (arts.length === 0) {
          html += '<div style="color:#888;">Артефактов пока нет. Дварфы должны впасть в транс, чтобы создать их.</div>';
        } else {
          arts.forEach((a, idx) => {
            const it = a.item;
            const sprite = it.file || 'assets/icons/53 question trap.png';
            const tagsStr = Array.isArray(it.tags) ? it.tags.join(', ') : String(it.tags);
            
            html += `<div style="background:#1e1a16; border:1px solid #3a3528; padding:8px; margin-bottom:8px; display:flex; gap:10px;">
              <img src="${sprite}" style="width:32px; height:32px; image-rendering:pixelated; background:#0a0a0a; border:1px solid #333;" onerror="this.src='assets/icons/53 question trap.png'">
              <div>
                <div style="color:#ffcc00; font-weight:bold; font-size:14px;">${it.name}</div>
                <div style="color:#a09080; font-size:11px; margin-bottom:5px;">Владелец: ${a.owner}</div>
                <div style="font-size:12px; color:#c8c8b8; margin-bottom:5px;">${it.aura_desc || 'Обычный предмет.'}</div>
                ${it.legend ? `<div style="font-size:11px; color:#a09080; font-style:italic; margin-bottom:5px; border-left:2px solid #5a3a20; padding-left:5px;">${it.legend}</div>` : ''}
                <div style="font-size:11px; color:#7aba7a;">Теги: ${tagsStr}</div>
              </div>
            </div>`;
          });
        }
        panel.innerHTML = html;
      } catch (e) {
        console.error(e);
        panel.innerHTML = `<div style="padding:10px; color:#a83838; font-weight:bold;">Ошибка: ${e.message}</div>
          <button id="close-artifacts-btn" style="margin-top:10px; background:#a83838; border:1px solid #ff8888; color:#fff; padding:5px 15px; border-radius:4px; cursor:pointer; font-family:inherit;">Закрыть</button>`;
      }

      const closeBtn = document.getElementById('close-artifacts-btn');
      if (closeBtn) {
          closeBtn.onclick = (e) => {
              if(e) e.stopPropagation();
              panel.classList.remove('active'); // Закрываем через снятие класса
              btn.classList.remove('active');
          };
      }
    }
  }, 1000);
})();
