// Сны: отражение последнего яркого впечатления. Без имён объектов.
(function(){
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];
  const THRESHOLD = 15;

  const DISTORT = {
    joy:     ['Но всё рассыпается в пальцах.', 'Но это не то, чем кажется.', 'Но оно ускользает.', 'Но радость гаснет, стоит открыть глаза.'],
    fear:    ['Но оно ближе, чем было.', 'Но оно не отпускает.', 'Но оно смотрит обратно.', 'Но выхода нет.'],
    sadness: ['Но он не узнаёт его.', 'Но всё пусто.', 'Но он не может подойти.', 'Но это длится дольше, чем должно.'],
    anger:   ['Но удар проходит сквозь.', 'Но он промахивается.', 'Но злость не находит выхода.', 'Но кулак сжимается в пустоте.'],
    neutral: ['Но всё повторяется.', 'Но это не кончается.', 'Но что-то сдвинулось.', 'Но он не помнит, как начал.'],
    awe:     ['Но оно больше, чем он думал.', 'Но оно глубже.', 'Но оно зовёт его.', 'Но он не должен был это видеть.']
  };

  const DARK = {
    drunk:       ['Но он не пьянеет.', 'Но кружка не кончается.', 'Но он не чувствует вкуса.'],
    greedSad:    ['И он проверяет его карманы.', 'И он думает, сколько это стоит.', 'И он забирает то, что осталось.'],
    cowardAnger: ['И он делает вид, что так и надо.', 'И он отступает на шаг.', 'И он говорит, что не хотел.'],
    neutralDark: ['Он не остановился.', 'Он сделал вид, что не заметил.', 'Он решил, что так и должно быть.']
  };

  const WAKE = {
    joy:     ['Он проснулся с сожалением.', 'Он проснулся и потрогал пальцы.'],
    fear:    ['Он проснулся и не стал оборачиваться.', 'Он проснулся и долго не открывал глаза.'],
    sadness: ['Он проснулся и долго лежал.', 'Он проснулся и не стал вставать сразу.'],
    anger:   ['Он проснулся с желанием ударить.', 'Он проснулся и сжал кулаки.'],
    neutral: ['Он проснулся и не понял, где он.', 'Он проснулся и прислушался.'],
    awe:     ['Он проснулся и не смог вспомнить, что видел.', 'Он проснулся с чувством, что что-то упустил.']
  };

  function pickMemory(npc) {
    if (!npc.memory) return null;
    const skip = new Set(['dream', 'backstory']);
    const valid = arr => (arr || []).filter(m => m && m.emotion && !skip.has(m.emotion.category) && Math.abs(m.emotion.power || 0) >= THRESHOLD);
    const short = valid(npc.memory.shortTerm).slice(0, 4);
    const pool = short.length ? short : valid(npc.memory.longTerm);
    if (!pool.length) return null;
    return pool.reduce((best, m) => Math.abs(m.emotion.power) > Math.abs(best.emotion.power) ? m : best);
  }

  function soften(text) {
    let t = String(text).replace(/\.+\s*$/, '').trim();
    if (t.startsWith('Он ')) t = 'он ' + t.slice(3);
    else if (t.startsWith('Она ')) t = 'она ' + t.slice(4);
    else if (t.startsWith('Ему ')) t = 'ему ' + t.slice(4);
    else if (t.startsWith('Его ')) t = 'его ' + t.slice(4);
    else t = t.charAt(0).toLowerCase() + t.slice(1);
    return t;
  }

  function buildDream(npc) {
    const mem = pickMemory(npc);
    if (!mem) return null;
    const emo = mem.emotion;
    const type = emo.type || 'neutral';
    let distort = pick(DISTORT[type] || DISTORT.neutral);
    if ((npc.emo?.drunk || 0) > 40) distort = pick(DARK.drunk);
    else if (type === 'sadness' && (npc.facets?.greed || 0) > 60) distort = pick(DARK.greedSad);
    else if (type === 'anger' && npc.trait?.id === 'coward') distort = pick(DARK.cowardAnger);
    else if (type === 'neutral' && Math.random() < 0.3) distort = pick(DARK.neutralDark);
    const wake = pick(WAKE[type] || WAKE.neutral);
    return {
      text: `Ему снилось, что ${soften(mem.text)}. ${distort} ${wake}`,
      type, power: Math.abs(emo.power || 15), category: 'dream'
    };
  }

  Reg.on('npc_tick', (npc, state) => {
    if (!npc.alive) return false;
    if (!(npc.task && npc.task.type === 'rest')) { npc.dreamChecked = false; return false; }
    if (npc.dreamChecked) return false;
    npc.dreamChecked = true;
    const dream = buildDream(npc);
    if (!dream) return false;
    Reg.addMemory(npc, dream.text, { type: dream.type, power: dream.power, category: 'dream' });
    return false;
  });
})();
