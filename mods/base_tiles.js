function _mr(a) { return function() { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

Reg.tile('stone', (ctx, sx, sy, seed) => {
  const r = _mr(seed);
  ctx.fillStyle = '#1a1e28'; ctx.fillRect(sx, sy, 32, 32);
  ctx.fillStyle = '#252a36'; ctx.fillRect(sx + 2, sy + 2, 12, 12); ctx.fillRect(sx + 18, sy + 4, 12, 10); ctx.fillRect(sx + 4, sy + 18, 10, 12); ctx.fillRect(sx + 16, sy + 16, 14, 14);
  ctx.fillStyle = '#353c4a'; ctx.fillRect(sx + 2, sy + 2, 12, 2); ctx.fillRect(sx + 18, sy + 4, 12, 2);
  ctx.fillStyle = '#0f1116'; ctx.fillRect(sx + 14, sy, 2, 14); ctx.fillRect(sx + 16, sy + 14, 14, 2);
});

Reg.tile('floor', (ctx, sx, sy, seed) => {
  const r = _mr(seed);
  // Сделали пол заметно светлее и теплее
  ctx.fillStyle = '#2a303a'; ctx.fillRect(sx, sy, 32, 32);
  ctx.fillStyle = '#363e4a'; ctx.fillRect(sx + 1, sy + 1, 14, 14); ctx.fillRect(sx + 17, sy + 1, 14, 14); ctx.fillRect(sx + 1, sy + 17, 14, 14); ctx.fillRect(sx + 17, sy + 17, 14, 14);
  for (let i = 0; i < 3; i++) {
    const x = Math.floor(r() * 14) * 2, y = Math.floor(r() * 14) * 2;
    ctx.fillStyle = '#1d222d'; ctx.fillRect(sx + x, sy + y, 2, 2);
  }
});

Reg.tile('ore', (ctx, sx, sy, seed) => {
  Reg.tiles.stone(ctx, sx, sy, seed);
  const r = _mr(seed + 1);
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#c08040' : '#f0c060';
    const ox = Math.floor(r() * 13) * 2 + 2, oy = Math.floor(r() * 13) * 2 + 2;
    ctx.fillRect(sx + ox, sy + oy, 2, 2); ctx.fillStyle = '#fff'; ctx.fillRect(sx + ox, sy + oy, 1, 1);
  }
});
