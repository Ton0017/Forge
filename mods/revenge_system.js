(function(){
  // 1. Перехватываем функцию смерти
  const origKillNpc = window.killNpc;
  if (!origKillNpc) return;

  window.killNpc = function(victim, reason) {
    if (!victim.alive) return;

    // Запоминаем, кто его убил (если это был дварф)
    let killer = null;
    if (victim.lastAttackerId && window.state && window.state.npcs) {
       killer = window.state.npcs.find(n => n.id === victim.lastAttackerId);
    }

    // Если убийца — другой дварф, начинается социальная реакция
    if (killer && killer.alive && killer.id !== victim.id) {
       Reg.log(`[УБИЙСТВО] ${killer.name} убивает ${victim.name}!`, 'death');
       
       // Проходимся по всем дварфам в шахте
       window.state.npcs.forEach(witness => {
          if (!witness.alive || witness.id === killer.id || witness.id === victim.id) return;

          // Инициализируем отношения, если их нет
          if (!witness.relations) witness.relations = {};
          
          const relationToVictim = witness.relations[victim.id] || 0;

          // Если это был ДРУГ жертвы
          if (relationToVictim > 30) {
             witness.relations[killer.id] = (witness.relations[killer.id] || 0) - 100; // Лютый враг
             Reg.addMemory(witness, `${killer.name} убил моего друга ${victim.name}. Я отомщу.`, { type: 'anger', power: 50, category: 'murder' });
             
             // Если у него высокая агрессия, он сразу нападает на убийцу
             if (witness.facets && witness.facets.aggression > 60) {
                 witness.task = { type: 'fight', path: [] };
                 if (window.applyBodyDamage) window.applyBodyDamage(killer, 10, 'blunt', 'head');
                 Reg.log(`[МЕСТЬ] ${witness.name} набрасывается на ${killer.name}, чтобы отомстить!`, 'combat');
             }
          }
          // Если это был ВРАГ жертвы
          else if (relationToVictim < -30) {
             witness.relations[killer.id] = (witness.relations[killer.id] || 0) + 20; // Благодарность
             Reg.addMemory(witness, `${killer.name} убил ${victim.name}. Наконец-то.`, { type: 'joy', power: 20, category: 'murder' });
          }
          // Если это был нейтрал
          else {
             witness.relations[killer.id] = (witness.relations[killer.id] || 0) - 20; // Осуждение
             Reg.addMemory(witness, `${killer.name} убил ${victim.name}. Это чудовищно.`, { type: 'fear', power: 30, category: 'murder' });
          }
       });
    }

    // Вызываем оригинальную смерть
    return origKillNpc(victim, reason);
  };

  console.log('[Revenge System] Система кровной мести активирована.');
})();
