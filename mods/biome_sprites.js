(function(){
  // Детерминированный генератор для каждого тайла (чтобы не мерцало)
  function _mr(a) { return function() { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  // ==========================================
  // 1. МЕРТВАЯ ЗЕМЛЯ (Пепел, кости, трещины)
  // ==========================================
  Reg.tile('dead_land', (ctx, sx, sy, seed) => {
    const r = _mr(seed);
    // Основа
    ctx.fillStyle = '#1c1a19'; ctx.fillRect(sx, sy, 32, 32);
    
    // Крупные комья пепла
    ctx.fillStyle = '#2a2725';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(sx + Math.floor(r() * 12) * 2, sy + Math.floor(r() * 12) * 2, 6, 6);
    }
    
    // Трещины (зигзаги)
    ctx.fillStyle = '#0d0c0b';
    ctx.fillRect(sx + 8, sy + 2, 2, 10); ctx.fillRect(sx + 10, sy + 12, 2, 6);
    ctx.fillRect(sx + 22, sy + 18, 2, 12); ctx.fillRect(sx + 20, sy + 14, 2, 4);
    
    // Мелкие кости/обломки
    ctx.fillStyle = '#7a7570';
    ctx.fillRect(sx + 4, sy + 22, 6, 2); ctx.fillRect(sx + 6, sy + 20, 2, 6); // Крестик
    ctx.fillRect(sx + 24, sy + 4, 4, 2); // Обломок
    
    // Точки пепла
    ctx.fillStyle = '#3a3532';
    for (let i = 0; i < 8; i++) {
      ctx.fillRect(sx + Math.floor(r() * 16) * 2, sy + Math.floor(r() * 16) * 2, 2, 2);
    }
  });

  // ==========================================
  // 2. ПУСТЫНЯ (Дюны, рябь, камни)
  // ==========================================
  Reg.tile('desert', (ctx, sx, sy, seed) => {
    const r = _mr(seed);
    // Основа
    ctx.fillStyle = '#d4b06c'; ctx.fillRect(sx, sy, 32, 32);
    
    // Тени дюн (волнистые линии)
    ctx.fillStyle = '#c29b58';
    ctx.fillRect(sx, sy + 6, 32, 4);
    ctx.fillRect(sx, sy + 18, 32, 6);
    ctx.fillRect(sx, sy + 28, 32, 2);
    
    // Светлые гребни дюн
    ctx.fillStyle = '#e6c78a';
    ctx.fillRect(sx, sy + 4, 32, 2);
    ctx.fillRect(sx, sy + 16, 32, 2);
    
    // Рябь на песке (мелкие штрихи)
    ctx.fillStyle = '#b8945a';
    for (let i = 0; i < 6; i++) {
      const px = Math.floor(r() * 12) * 2; 
      const py = Math.floor(r() * 12) * 2;
      ctx.fillRect(sx + px, sy + py, 4, 1);
    }
    
    // Камни
    ctx.fillStyle = '#8a6e3d';
    ctx.fillRect(sx + 22, sy + 8, 4, 4); 
    ctx.fillRect(sx + 6, sy + 24, 2, 2);
  });

  // ==========================================
  // 3. ЛЕД (Глыбы, трещины, блики, снег)
  // ==========================================
  Reg.tile('ice', (ctx, sx, sy, seed) => {
    const r = _mr(seed);
    // Основа
    ctx.fillStyle = '#8eb3c9'; ctx.fillRect(sx, sy, 32, 32);
    
    // Ледяные блоки (плиты)
    ctx.fillStyle = '#a4c8dd';
    ctx.fillRect(sx + 2, sy + 2, 12, 12); 
    ctx.fillRect(sx + 16, sy + 4, 10, 10);
    ctx.fillRect(sx + 4, sy + 18, 14, 10);
    
    // Тени под блоками
    ctx.fillStyle = '#6b93ab';
    ctx.fillRect(sx + 14, sy + 2, 2, 12); 
    ctx.fillRect(sx + 2, sy + 14, 12, 2);
    ctx.fillRect(sx + 18, sy + 18, 12, 2);
    
    // Трещины (острые зигзаги)
    ctx.fillStyle = '#4e748c';
    ctx.fillRect(sx + 16, sy, 2, 6); ctx.fillRect(sx + 18, sy + 6, 2, 8);
    ctx.fillRect(sx + 2, sy + 16, 6, 2);
    
    // Снег и блики
    ctx.fillStyle = '#c9e2f0';
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(sx + Math.floor(r() * 14) * 2, sy + Math.floor(r() * 14) * 2, 2, 2);
    }
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(sx + 6, sy + 4, 2, 2); 
    ctx.fillRect(sx + 22, sy + 20, 2, 2);
  });

  // ==========================================
  // 4. ВУЛКАНИЧЕСКИЙ (Базальт, магма, пузыри)
  // ==========================================
  Reg.tile('volcanic', (ctx, sx, sy, seed) => {
    const r = _mr(seed + 10);
    
    // Базовая порода (темный базальт)
    ctx.fillStyle = '#171416'; ctx.fillRect(sx, sy, 32, 32);
    ctx.fillStyle = '#241f22';
    ctx.fillRect(sx + 2, sy + 2, 8, 8); 
    ctx.fillRect(sx + 20, sy + 4, 10, 10); 
    ctx.fillRect(sx + 6, sy + 22, 12, 8);
    
    // Трещины с магмой
    ctx.fillStyle = '#ff4500'; // Ярко-красная магма
    ctx.fillRect(sx + 12, sy + 6, 2, 14);
    ctx.fillRect(sx + 14, sy + 18, 6, 2);
    ctx.fillRect(sx + 24, sy + 16, 2, 10);
    
    // Раскаленные точки (желтый центр)
    ctx.fillStyle = '#ffcc00';
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(sx + 12 + Math.floor(r() * 4) * 2, sy + 6 + Math.floor(r() * 8) * 2, 2, 2);
    }
    ctx.fillRect(sx + 24, sy + 20, 2, 2);
    
    // Пузыри / поры
    ctx.fillStyle = '#0d0a0b';
    ctx.fillRect(sx + 26, sy + 26, 2, 2);
    ctx.fillRect(sx + 4, sy + 14, 2, 2);
  });

  // ==========================================
  // 5. АДОВЫЙ (Обсидиан, кровь, угли, огонь)
  // ==========================================
  // 6. ЛАВА (Жидкая, яркая)
  Reg.tile('lava', (ctx, sx, sy, seed) => {
    const r = _mr(seed + 30);
    ctx.fillStyle = '#cc3300'; ctx.fillRect(sx, sy, 32, 32);
    ctx.fillStyle = '#ff6600';
    for (let i = 0; i < 6; i++) {
      ctx.fillRect(sx + Math.floor(r()*14)*2, sy + Math.floor(r()*14)*2, 4, 2);
    }
    ctx.fillStyle = '#ffcc00';
    for (let i = 0; i < 3; i++) {
      ctx.fillRect(sx + Math.floor(r()*14)*2, sy + Math.floor(r()*14)*2, 2, 2);
    }
  });

  Reg.tile('infernal', (ctx, sx, sy, seed) => {
    const r = _mr(seed + 20);
    
    // Основа (очень темная)
    ctx.fillStyle = '#140505'; ctx.fillRect(sx, sy, 32, 32);
    
    // Обсидиановые глыбы
    ctx.fillStyle = '#2a0e0e';
    ctx.fillRect(sx + 2, sy + 2, 10, 10); 
    ctx.fillRect(sx + 18, sy + 4, 8, 8); 
    ctx.fillRect(sx + 4, sy + 18, 8, 10);
    
    // Кровавые реки (вены)
    ctx.fillStyle = '#8a0c0c';
    ctx.fillRect(sx + 14, sy, 2, 32); 
    ctx.fillRect(sx, sy + 14, 32, 2);
    
    // Яркие капли / угли
    ctx.fillStyle = '#d42020';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(sx + Math.floor(r() * 14) * 2, sy + Math.floor(r() * 14) * 2, 2, 2);
    }
    
    // Огонь (язычки)
    ctx.fillStyle = '#ff5500';
    ctx.fillRect(sx + 12, sy + 4, 2, 4);
    ctx.fillRect(sx + 20, sy + 22, 2, 4);
    ctx.fillStyle = '#ffcc00';
    ctx.fillRect(sx + 12, sy + 4, 1, 2); // Сердцевина огня
    
    // Черепа / кости
    ctx.fillStyle = '#5a4a4a';
    ctx.fillRect(sx + 24, sy + 26, 4, 2); 
    ctx.fillRect(sx + 26, sy + 24, 2, 6);
  });
})();
