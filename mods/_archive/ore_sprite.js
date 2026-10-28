Reg.tile('ore', (ctx, sx, sy, seed) => {
  if (Reg.tiles['stone']) Reg.tiles['stone'](ctx, sx, sy, seed);
  
  const oreFile = Reg.assets.icons.find(f => f.includes('117 blue and red diamond ore'));
  
  if (oreFile) {
    // ПЕРЕДАЕМ СЫРОЙ ПУТЬ, core.js сам закодирует пробелы
    const img = getImg('assets/icons/' + oreFile);
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.drawImage(img, sx + 4, sy + 4, 24, 24);
      return;
    }
  }
  
  ctx.fillStyle = '#e0c060';
  for(let i=0; i<3; i++) ctx.fillRect(sx + 10 + i*4, sy + 14 + i*2, 3, 3);
});
