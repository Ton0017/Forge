(function(){
  setTimeout(() => {
    const checkUI = setInterval(() => {
      if (document.getElementById('df-character-modal')) {
         clearInterval(checkUI);
         injectEquipmentTab();
      }
    }, 500);

    function injectEquipmentTab() {
      const subTabs = document.querySelector('.df-sub-tab')?.parentNode;
      if (!subTabs || document.getElementById('tab-equipment')) return;

      const btn = document.createElement('button');
      btn.id = 'tab-equipment';
      btn.className = 'df-sub-tab';
      btn.innerText = 'Снаряжение';
      btn.style.cssText = 'flex:1; background:#12100e; border:1px solid #3a3528; color:#7a6b4a; padding:4px; font-size:11px;';
      
      btn.onclick = () => {
        document.querySelectorAll('.df-sub-tab').forEach(b => {
           b.style.background = '#12100e'; b.style.color = '#7a6b4a';
        });
        btn.style.background = '#2a2520'; btn.style.color = '#c87b32';
        showEquipment();
      };
      subTabs.appendChild(btn);
    }

    function showEquipment() {
      const content = document.getElementById('df-modal-content') || document.querySelector('.df-modal-body');
      if (!content) return;

      let npc = null;
      try { if (typeof selectedNpcId !== 'undefined') npc = state.npcs.find(n => n.id === selectedNpcId); } catch(e) {}
      if (!npc) return;

      content.style.overflowY = 'auto';
      content.style.maxHeight = 'calc(80vh - 100px)';

      const e = npc.equipment || { weapon: null, armor: null, accessory: null };
      const inv = npc.inventory || [];

      // Принудительный скролл для этой вкладки
      content.style.overflowY = 'auto';
      content.style.maxHeight = 'calc(85vh - 120px)';

      let html = '<h3 style="color:#c87b32; margin-bottom:10px;">Экипировка:</h3>';

      const renderItem = (item, slotName) => {
        if (!item) return `<div style="color:#555; margin-bottom:8px;">${slotName}: Пусто</div>`;
        
        // Получаем картинку предмета
        let imgSrc = item.file ? 'assets/equipment/' + item.file : 'assets/equipment/' + item.name + '.png';
        
        let color = '#e0d8c8';
        if (item.tags.includes('magic')) color = '#a030a0';
        if (item.tags.includes('fire')) color = '#e05030';

        return `<div style="display:flex; align-items:center; gap:10px; margin-bottom:8px;">
           <img src="${imgSrc}" style="width:32px; height:32px; image-rendering:pixelated; background:rgba(0,0,0,0.3); border:1px solid #3a3528;" onerror="this.style.display='none'">
           <div>
             <div style="color:${color}; font-weight:bold;">${slotName}: ${item.name}</div>
             <div style="font-size:10px; color:#888;">Прочность: ${item.integrity !== undefined ? item.integrity : '—'}</div>
           </div>
        </div>`;
      };

      html += renderItem(e.weapon, 'Оружие');
      html += renderItem(e.armor, 'Броня');
      html += renderItem(e.accessory, 'Аксессуар');

      html += '<h3 style="color:#c87b32; margin-top:15px; margin-bottom:10px;">Рюкзак:</h3>';
      if (inv.length === 0) {
        html += '<div style="color:#555; font-style:italic;">Пусто</div>';
      } else {
        inv.forEach(item => {
          // Если это эмодзи — рисуем текст
          if (item.isEmoji) {
              html += `<div style="display:flex; align-items:center; gap:8px; margin-bottom:5px; color:#a0a0a0;">
                 <span style="font-size:20px; width:24px; text-align:center;">${item.file}</span>
                 ${item.name}
              </div>`;
          } else {
              let imgSrc = item.file ? 'assets/equipment/' + item.file : 'assets/equipment/' + item.name + '.png';
              html += `<div style="display:flex; align-items:center; gap:8px; margin-bottom:5px; color:#a0a0a0;">
                 <img src="${imgSrc}" style="width:24px; height:24px; image-rendering:pixelated;" onerror="this.style.display='none'">
                 ${item.name}
              </div>`;
          }
        });
      }
      
      html += `<div style="text-align:center; margin-top:20px;">
        <button onclick="document.getElementById('df-character-modal').style.display='none'" style="padding:8px 20px; background:#a83838; border:1px solid #ff8888; color:#fff; cursor:pointer; border-radius:4px; font-family:inherit;">ЗАКРЫТЬ</button>
      </div>`;
      content.innerHTML = html;
    }
  }, 1000);
})();
