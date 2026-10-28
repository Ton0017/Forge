(function(){
  setTimeout(() => {
    if (!Reg.mobPers) return;
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    window.generateMobProfile = function(mob, cellType) {
      const name = (mob.name || mob.id || '').toLowerCase();
      const p = window.Reg.mobPers;

      // 1. БАЗОВАЯ ФИЗИЧЕСКАЯ ЧЕРТА
      let descParts = [];
      descParts.push(`Он ${pick(p.physical)}.`);

      // 2. АНАЛИЗ ГРАНЕЙ (Если у моба есть npc.facets)
      if (mob.facets) {
         for (let key in p.facets) {
            const val = mob.facets[key] || 50;
            if (val > 70) {
               descParts.push(`Он ${pick(p.facets[key].high)}.`);
            } else if (val < 30) {
               descParts.push(`Он ${pick(p.facets[key].low)}.`);
            }
         }
      } else {
         // Если граней нет, добавляем пару случайных
         descParts.push(`Он ${pick(p.facets.courage.high)}.`);
         descParts.push(`Он ${pick(p.facets.sociality.low)}.`);
      }

      // 3. СОЦИАЛЬНАЯ ПРИВЫЧКА
      descParts.push(`Он ${pick(p.social)}.`);

      // 4. ДОБАВЛЯЕМ СТРОКУ ПРО СРЕДУ (Руины/Вода)
      if (cellType === 'ruins') descParts.push("Это место кажется ему знакомым.");
      if (cellType === 'water') descParts.push("Он чувствует себя здесь в безопасности.");

      // 5. ОСОБАЯ СТРОКА ДЛЯ АБСУРДА (Для каждого 3-го моба)
      if (Math.random() < 0.3) {
         descParts.push("У него есть странная привычка: он бормочет что-то на неизвестном языке.");
      }

      // 6. МЫСЛИ (По состоянию)
      let thought = "Он просто живет своей жизнью.";
      if (mob.hp < mob.maxHp * 0.3) thought = "Он тяжело ранен и ищет укрытия.";
      else if (mob.facets && mob.facets.aggression > 70) thought = "Он ищет добычу.";
      else if (cellType === 'ruins') thought = "Он охраняет эти древние камни.";

      // Собираем всё в один текст с переносами строк
      let finalDescription = descParts.join('<br><br>');

      return { description: finalDescription, thought: thought };
    };
  }, 1200);
})();
