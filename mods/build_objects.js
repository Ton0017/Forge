(function(){
  setTimeout(() => {
    // Добавляем вкладку "Стройка" в меню Артели
    const crewPanel = document.getElementById('panel-crew');
    if (!crewPanel) return;

    if (!document.getElementById('build-section')) {
       const buildDiv = document.createElement('div');
       buildDiv.id = 'build-section';
       buildDiv.style.cssText = 'margin-top:15px; border-top:1px solid #3a3528; padding-top:10px;';
       
       buildDiv.innerHTML = `
         <h3 style="color:#c87b32; font-size:14px; margin-bottom:8px;">Строительство (за руду):</h3>
         <div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px;">
            <button class="build-btn" data-type="bed" style="padding:5px; background:#1e1a16; border:1px solid #3a3528; color:#e0d8c8; cursor:pointer;">Кровать (10р)</button>
            <button class="build-btn" data-type="beer_tap" style="padding:5px; background:#1e1a16; border:1px solid #3a3528; color:#e0d8c8; cursor:pointer;">Бочка (15р)</button>
            <button class="build-btn" data-type="forge" style="padding:5px; background:#1e1a16; border:1px solid #3a3528; color:#e0d8c8; cursor:pointer;">Наковальня (20р)</button>
            <button class="build-btn" data-type="campfire" style="padding:5px; background:#1e1a16; border:1px solid #3a3528; color:#e0d8c8; cursor:pointer;">Костер (5р)</button>
         </div>
       `;
       crewPanel.appendChild(buildDiv);

       // Обработчик кнопок
       buildDiv.querySelectorAll('.build-btn').forEach(btn => {
          btn.onclick = () => {
             const type = btn.getAttribute('data-type');
             let cost = 10;
             if (type === 'beer_tap') cost = 15;
             if (type === 'forge') cost = 20;
             if (type === 'campfire') cost = 5;

             if (state.ore < cost) { alert('Не хватает руды!'); return; }
             
             // Ищем свободное место рядом с кузней
             let placed = false;
             const fpos = state.forgePos;
             for (let dx = -3; dx <= 3; dx++) {
                for (let dy = -3; dy <= 3; dy++) {
                   if (placed) break;
                   const cell = getCell(fpos.x + dx, fpos.y + dy);
                   if (cell && cell.type === 'floor') {
                      cell.type = type;
                      state.ore -= cost;
                      placed = true;
                      
                      Reg.log(`[Стройка] Вы построили ${type} за ${cost} руды.`, 'good');
                      
                      // Эмерджентность: дварфы видят новую вещь и радуются
                      state.npcs.forEach(n => {
                         if (n.alive) {
                            Reg.addMemory(n, `В шахте появилась новая ${type === 'bed' ? 'кровать' : 'вещь'}. Кто-то строит тут уют.`, { type: 'joy', power: 5, category: 'base' });
                         }
                      });
                   }
                }
             }
             if (!placed) alert('Нет свободного места рядом с центром!');
          };
       });
    }
  }, 1500);
})();
