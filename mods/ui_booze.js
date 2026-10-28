setTimeout(() => {
  const topbar = document.getElementById('topbar');
  if (topbar && !document.getElementById('ui-booze-container')) {
    const resGroup = topbar.querySelector('.res-group');
    if (resGroup) {
      const boozeDiv = document.createElement('div');
      boozeDiv.className = 'res-item';
      boozeDiv.id = 'ui-booze-container';
      // Ищем иконку эля (или используем бочку)
      // Ищем иконку пива/фляги
      let boozeIconPath = 'assets/icons/boiler.png'; // fallback
      
      // 1. Ищем в equipment что-то про пиво (beer amulet)
      const beerEq = Reg.assets.equipment.find(f => f.toLowerCase().includes('beer'));
      if (beerEq) {
        boozeIconPath = 'assets/equipment/' + encodeURI(beerEq);
      } else {
        // 2. Ищем в icons флягу или бутылку
        const flaskIcon = Reg.assets.icons.find(f => f.toLowerCase().includes('flask') || f.toLowerCase().includes('bottle'));
        if (flaskIcon) boozeIconPath = 'assets/icons/' + encodeURI(flaskIcon);
      }
      
      boozeDiv.innerHTML = `<img src="${boozeIconPath}" style="width:20px;height:20px;image-rendering:pixelated;"><span id="ui-booze">0</span>`;
      resGroup.appendChild(boozeDiv);
    }
  }

  // Обновляем цифру каждый тик
  Reg.on('tick', (state) => {
    if (state && state.booze === undefined) state.booze = 20; // Фикс бага 0 эля
    const el = document.getElementById('ui-booze');
    if (el && state) el.textContent = state.booze;
  });
}, 1500);
