(function(){
  setInterval(() => {
    // Проверяем, открыта ли какая-то панель или модалка
    const isPanelOpen = document.querySelector('.panel.active') || 
                        (document.getElementById('df-character-modal') && document.getElementById('df-character-modal').style.display === 'flex') ||
                        (document.getElementById('debug-modal') && document.getElementById('debug-modal').style.display === 'block');

    // Ищем все плавающие кнопки (по стилю position: fixed)
    const floatingElements = document.querySelectorAll('div[style*="position:fixed"], div[style*="position: fixed"]');
    
    floatingElements.forEach(el => {
        // Исключаем сами модалки и панели
        if (el.classList.contains('panel') || el.id === 'df-character-modal' || el.id === 'debug-modal' || el.id === 'error-box') return;
        
        // Если это кнопка с высоким z-index (наши боковые кнопки)
        if (el.style.zIndex > 90000) {
            if (isPanelOpen) {
                el.style.opacity = '0';
                el.style.pointerEvents = 'none';
            } else {
                el.style.opacity = '1';
                el.style.pointerEvents = 'auto';
            }
        }
    });
  }, 200);
})();
