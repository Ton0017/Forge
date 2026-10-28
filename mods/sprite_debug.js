setTimeout(() => {
  // Перехватываем загрузку картинок, чтобы видеть ошибки
  const originalGetImg = window.getImg;
  window.getImg = function(src) {
    if (!src) return null;
    const img = new Image();
    img.onerror = () => console.error("[SPRITE ERROR] Не удалось загрузить:", src, "URL:", encodeURI(src));
    img.src = encodeURI(src);
    return img;
  };
}, 1000);
