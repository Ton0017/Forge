setTimeout(() => {
  const topbar = document.getElementById('topbar');
  if (!topbar) return;

  // Удаляем старые кнопки камеры, если они остались
  ['btn-free-cam', 'btn-cam-mode', 'btn-cam-next'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.remove();
  });

  // Создаем одну кнопку переключения
  const btnNext = document.createElement('button');
  btnNext.id = 'btn-cam-next';
  btnNext.innerText = 'СЛЕДУЮЩИЙ';
  btnNext.style.cssText = 'background:#2a221c; border:1px solid #5a4d32; color:#c9c4b4; margin-left:10px; padding:4px 8px; border-radius:4px; font-size:12px; cursor:pointer;';
  
  topbar.appendChild(btnNext);

  btnNext.onclick = () => {
    const s = (typeof state !== 'undefined') ? state : window.state;
    if (!s || !s.npcs) return;

    const alive = s.npcs.filter(n => n.alive);
    if (alive.length === 0) return;

    // Читаем текущий ID (используем eval, так как ядро держит его в локальной области)
    let currentId = null;
    try { currentId = eval('selectedNpcId'); } catch(e) {}

    let idx = alive.findIndex(n => n.id === currentId);
    idx = (idx + 1) % alive.length; // Берем следующего по кругу
    let nextId = alive[idx].id;

    // Применяем новый ID обратно в ядро
    try { eval('selectedNpcId = "' + nextId + '"'); } catch(e) { window.selectedNpcId = nextId; }

    // Перерисовываем карту, чтобы камера прыгнула к новому дварфу
    if (window.renderMap) window.renderMap();
  };
}, 1000);
