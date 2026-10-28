(function(){
  let errorCount = 0;

  function showError(msg) {
    errorCount++;
    let div = document.getElementById('js-error-overlay');
    if (!div) {
      div = document.createElement('div');
      div.id = 'js-error-overlay';
      div.style.cssText = 'position:fixed; top:10px; left:10px; right:10px; background:#a83838; color:#fff; padding:10px; font-family:monospace; font-size:12px; z-index:9999999; border:2px solid #fff; border-radius:4px; word-wrap:break-word; display:flex; justify-content:space-between; align-items:center;';
      document.body.appendChild(div);
    }
    
    // Добавляем текст ошибки и кнопку закрытия
    div.innerHTML = `
      <div style="flex:1;">ОШИБКА: ${msg}</div>
      <button onclick="this.parentElement.style.display='none'" style="background:#fff; color:#a83838; border:none; padding:5px 10px; font-weight:bold; cursor:pointer; margin-left:10px;">X</button>
    `;
    div.style.display = 'flex';
  }

  window.onerror = function(message, source, lineno, colno, error) {
    const file = source ? source.split('/').pop().split('?')[0] : '?';
    showError(`${message} в ${file}:${lineno}`);
    return false;
  };

  window.addEventListener('unhandledrejection', function(event) {
    showError('Promise: ' + event.reason);
  });
  
  // Сохраняем функцию в глобальную область для теста
  window.triggerDebugError = function() {
     showError("Тестовая ошибка! Перехват работает.");
  };
  
  console.log('[Error Handler] Готов (с кнопкой закрытия).');
})();
