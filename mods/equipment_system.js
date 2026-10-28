(function(){
  setTimeout(() => {
    // 1. ПАРСЕР (Читает имена файлов)
    function parseEquipment(file) {
      const nameLower = file.toLowerCase().replace('.png', '');
      let item = { file: file, name: file.replace('.png', ''), tags: [], type: 'misc', weight: 1, hardness: 1, dmgMod: 0, defense: 0, isHeavy: false };

      if (nameLower.match(/sword|axe|dagger|bow|staff|hammer|spear|mace|saber|halberd|pitchfork/)) { item.type = 'weapon'; item.tags.push('weapon'); }
      if (nameLower.match(/helmet|armor|cuirass|boots|shield|gauntlet/)) { item.type = 'armor'; item.tags.push('armor'); }
      if (nameLower.match(/ring|amulet|earring|belt|cloak/)) { item.type = 'accessory'; item.tags.push('accessory'); }

      if (nameLower.match(/iron|steel|bronze|metal|dragon|gold/)) { item.weight = 5; item.hardness = 8; item.tags.push('metal', 'heavy'); }
      else if (nameLower.match(/leather|cloth|silk|wood|stick/)) { item.weight = 2; item.hardness = 3; item.tags.push('light'); }
      
      if (nameLower.match(/fire|flame|lava|burning/)) item.tags.push('fire');
      if (nameLower.match(/ice|frozen|snow/)) item.tags.push('ice');
      if (nameLower.match(/poison|toxic/)) item.tags.push('poison');
      if (nameLower.match(/dark|cursed|hellish/)) item.tags.push('cursed');
      if (nameLower.match(/dragon|magic|unicorn|angel/)) item.tags.push('magic');

      // ВМЕСТО СТАТОВ ДАЕМ ПРОЧНОСТЬ И ЧАСТИ
      item.integrity = item.type === 'armor' ? 150 : 100;
      if (item.type === 'weapon') item.parts = [{name:'лезвие', hp: 60}, {name:'рукоять', hp: 40}];
      if (item.type === 'armor') item.parts = [{name:'нагрудник', hp: 80}, {name:'завязки', hp: 30}];

      return item;
    }

    // 2. ЗАГРУЗКА
    window.GAME_ITEMS = [];
    if (Reg.assets && Reg.assets.equipment) {
      Reg.assets.equipment.forEach(file => window.GAME_ITEMS.push(parseEquipment(file)));
    }

    // 3. ВЫДАЧА ПРИ НАЙМЕ
    Reg.on('npc_hired_disabled', (npc) => {
      if (!npc.equipment) npc.equipment = { weapon: null, armor: null };
      const weapons = window.GAME_ITEMS.filter(i => i.type === 'weapon');
      const armors = window.GAME_ITEMS.filter(i => i.type === 'armor');
      
      if (weapons.length > 0 && Math.random() < 0.5) {
        npc.equipment.weapon = weapons[Math.floor(Math.random() * weapons.length)];
        npc.weapon = { id: 'equipped', name: npc.equipment.weapon.name, damage: npc.equipment.weapon.dmgMod };
      }
      if (armors.length > 0 && Math.random() < 0.3) {
        npc.equipment.armor = armors[Math.floor(Math.random() * armors.length)];
        if (npc.equipment.armor.isHeavy) npc.speed = 0.5;
      }
    });

    // 4. ОТПРАВКА В ГЕНЕРАТОР (Без текстов)
    Reg.on('npc_tick', (npc, state) => {
      if (!npc.alive || !npc.equipment || state.tick % 200 !== 0) return false;
      let itemToThinkAbout = npc.equipment.armor || npc.equipment.weapon;
      if (!itemToThinkAbout) return false;

      const thought = Reg.composer.generate(npc, 'equipment', 'wear', { item: itemToThinkAbout });
      if (thought) Reg.addMemory(npc, thought.text, thought.emo);
      return false;
    });

    console.log(`[Equipment System] Загружено ${window.GAME_ITEMS.length} предметов.`);
  }, 1500);
})();
