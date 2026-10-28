(function(){
  setTimeout(() => {
    if (!window.getImg) {
      console.log('[Image Cache] getImg не найден.');
      return;
    }
    const originalGetImg = window.getImg;
    const cache = {};
    
    window.getImg = function(src) {
      if (!src) return null;
      if (cache[src]) return cache[src];
      const img = originalGetImg(src);
      cache[src] = img;
      return img;
    };
    
    console.log('[Image Cache] Кэш картинок активирован.');
  }, 500);
})();
