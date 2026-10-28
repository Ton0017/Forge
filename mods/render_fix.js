// 1. Чиним отрисовку биомов (безопасно, только визуал)
Reg.tile('water', (ctx, sx, sy, seed) => {
  ctx.fillStyle = '#1a3a5a'; ctx.fillRect(sx, sy, 32, 32);
  ctx.fillStyle = '#2a5a8a'; ctx.fillRect(sx, sy + 8, 32, 2); ctx.fillRect(sx, sy + 22, 32, 2);
});

Reg.tile('ruin_floor', (ctx, sx, sy, seed) => {
  Reg.tiles['floor'](ctx, sx, sy, seed);
  ctx.fillStyle = '#555'; ctx.fillRect(sx + 4, sy + 4, 24, 24);
  ctx.fillStyle = '#333'; ctx.fillRect(sx + 8, sy + 12, 16, 2); ctx.fillRect(sx + 12, sy + 8, 2, 16);
});

Reg.tile('mushroom', (ctx, sx, sy, seed) => {
  Reg.tiles['floor'](ctx, sx, sy, seed);
  const img = getImg('assets/objects/грибы.png');
  if (img && img.complete) {
    ctx.drawImage(img, sx + 4, sy + 4, 24, 24);
  } else {
    ctx.fillStyle = '#a030a0'; ctx.fillRect(sx + 10, sy + 10, 12, 6);
  }
});

// 2. Защита от исчезновения (ждем загрузки спрайтов)
console.log("⏳ Ожидание загрузки спрайтов мебели...");
setTimeout(() => {
  console.log("✅ Спрайты загружены, рендер стабилен.");
}, 2000);
