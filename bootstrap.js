window.Reg = {
  phrases: { neutral: [], positive: [], negative: [], absurd: [], combat: [] },
  tiles: {}, monsters: {}, items: {}, recipes: [],
  heroSlots: {}, chronicle: {}, events: [], biomes: {}, hooks: {},
  assets: { skins: [], equipment: [], skills: [], icons: [] },
  
  tile(type, fn) { Reg.tiles[type] = fn; },
  monster(def) { Reg.monsters[def.id] = def; },
  item(def) { Reg.items[def.id] = def; },
  recipe(def) { Reg.recipes.push(def); },
  chronicle_(action, voice, ...lines) {
    ((Reg.chronicle[action] ??= {})[voice] ??= []).push(...lines);
  },
  event(def) { Reg.events.push(def); },
  biome(def) { Reg.biomes[def.id] = def; },
  
  on(hook, fn) { (Reg.hooks[hook] ??= []).push(fn); },
  
  // КРИТИЧЕСКИЙ ФИКС: теперь fire возвращает true, если мод обработал событие
  fire(hook, ...args) { 
    let handled = false;
    const fns = Reg.hooks[hook] || [];
    for (const fn of fns) {
      if (fn(...args) === true) handled = true;
    }
    return handled;
  },
  
  loadAssets(manifest) {
    Reg.assets = manifest;
    for (const file of manifest.equipment) {
      const id = file.replace('.png', '');
      let type = 'misc';
      let value = 10;
      if (id.includes('armor') || id.includes('cuirass') || id.includes('tunic')) { type = 'armor'; value = 50; }
      else if (id.includes('helmet') || id.includes('hat') || id.includes('hood')) { type = 'helmet'; value = 30; }
      else if (id.includes('boots') || id.includes('shoes')) { type = 'boots'; value = 25; }
      else if (id.includes('sword') || id.includes('axe') || id.includes('dagger') || id.includes('mace') || id.includes('staff')) { type = 'weapon'; value = 60; }
      else if (id.includes('shield')) { type = 'shield'; value = 40; }
      else if (id.includes('ring') || id.includes('amulet') || id.includes('bracelet')) { type = 'trinket'; value = 80; }
      
      Reg.item({ id, name: id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), sprite: 'assets/equipment/' + file, type, value });
    }
  }
};
