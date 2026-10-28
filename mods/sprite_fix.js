(function(){
  setTimeout(() => {
    if (window._spriteFixApplied) return;
    window._spriteFixApplied = true;

    const origGetImg = window.getImg;
    if (!origGetImg) return;

    const imgCache = {};

    window.getImg = function(src) {
      if (!src) return null;
      if (imgCache[src]) return imgCache[src];

      // Пропускаем тайлы пола, стены и UI (им нельзя трогать фон)
      if (src.includes('floor') || src.includes('wall') || src.includes('water') || src.includes('grass') || src.includes('icons') || src.includes('UI')) {
        const img = new Image();
        img.src = encodeURI(src);
        imgCache[src] = img;
        return img;
      }

      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = function() {
        const c = document.createElement('canvas');
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0);

        try {
          const imgData = ctx.getImageData(0, 0, c.width, c.height);
          const data = imgData.data;
          const w = c.width, h = c.height;

          // АЛГОРИТМ ЗАЛИВКИ (Flood Fill)
          // Начинаем с 4 углов и стираем только черный цвет фона
          const queue = [[0,0], [w-1,0], [0,h-1], [w-1,h-1]];
          const visited = new Set();

          while (queue.length > 0) {
            const [x, y] = queue.shift();
            const key = x + ',' + y;
            if (visited.has(key)) continue;
            visited.add(key);

            const i = (y * w + x) * 4;
            // Если пиксель темный (фон)
            if (data[i] < 40 && data[i+1] < 40 && data[i+2] < 40) {
              data[i+3] = 0; // Делаем прозрачным

              // Добавляем соседей в очередь
              if (x > 0) queue.push([x-1, y]);
              if (x < w-1) queue.push([x+1, y]);
              if (y > 0) queue.push([x, y-1]);
              if (y < h-1) queue.push([x, y+1]);
            }
          }

          ctx.putImageData(imgData, 0, 0);

          const newImg = new Image();
          newImg.onload = function() {
            imgCache[src] = newImg;
          };
          newImg.src = c.toDataURL("image/png");
          imgCache[src] = newImg; // Кэшируем
        } catch(e) {
          imgCache[src] = img;
        }
      };

      img.src = encodeURI(src);
      const dummy = new Image();
      imgCache[src] = dummy;
      return dummy;
    };
    console.log('[Sprite Fix] Умный алгоритм заливки (Flood Fill) загружен.');
  }, 500);
})();
