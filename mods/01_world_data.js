(function(){
  if (window.World) return;

  window.World = {
    data: {
      moods: {},
      artifacts: {},
      reactions: {},
      boozeDeltas: {},
    },
    _owners: new Map(),
    claim(key, modName) {
      const cur = this._owners.get(key);
      if (cur && cur !== modName) {
        console.error(`[claim] ${key} уже занято ${cur}, ${modName} отказ`);
        return false;
      }
      this._owners.set(key, modName);
      return true;
    },
    owns(key, modName) { return this._owners.get(key) === modName; }
  };
  console.log('[Architecture] World Data (ECS) активирована.');
})();
