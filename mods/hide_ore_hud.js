(function(){
  // Ждем загрузки интерфейса
  setTimeout(() => {
    const oreText = document.getElementById('ui-ore');
    if (oreText && oreText.parentNode) {
      // Находим родительский div (res-item) и скрываем его
      oreText.parentNode.style.display = 'none';
      console.log('[UI] Иконка глобальной руды скрыта (перешли на физическую руду).');
    }
  }, 1000);
})();
