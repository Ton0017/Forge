(function(){
  if (Reg.fishLex) return;

  Reg.fishLex = {
    // === ОБЪЕКТЫ (зависят от типа воды — 'small'/'medium'/'big') ===
    objects_small:  ["мелкую рыбёшку", "плотвичку", "малька", "маленького окунька", "пескаря"],
    objects_medium: ["окуня", "карася", "щуку", "леща", "карпа", "судака"],
    objects_big:    ["огромную рыбину", "крупного сома", "массивную щуку", "толстого карпа"],

    // === ГЛАГОЛЫ ЗАБРОСА ===
    verbs_throw: ["забрасывает", "закидывает", "опускает", "швыряет", "отпускает"],

    // === ГЛАГОЛЫ УЛОВА ===
    verbs_catch: ["вытаскивает", "выдёргивает", "тащит", "подсекает", "выхватывает"],

    // === ГЛАГОЛЫ ПРОМАХА ===
    verbs_miss: ["ждёт", "молчит", "не двигается", "терпит", "всматривается"],
    verbs_reel: ["вытягивает", "вытаскивает", "поднимает"],
    verbs_toss: ["выбрасывает", "отбрасывает", "швыряет"],

    // === ЧТО ПОПАЛОСЬ ВМЕСТО РЫБЫ ===
    junk_objects: ["старый сапог", "кусок водоросли", "гнилую палку", "черепок глиняной кружки", "ржавый гвоздь", "мокрый мох", "обломок кости"],

    // === ЭФФЕКТЫ ===
    effects_throw: [
      "Поплавок ложится на воду.",
      "Леска уходит под воду.",
      "Вода расходится кругами.",
      "Крючок исчезает в тёмной воде.",
      "Раздаётся тихий всплеск."
    ],
    effects_catch: [
      "Рыба бьётся в руках.",
      "Раздаётся громкий всплеск.",
      "С крючка капает вода.",
      "Леска натягивается до предела.",
      "В воздух взлетают брызги."
    ],
    effects_miss: [
      "Поплавок не двигается.",
      "Тишина. Только капли с потолка.",
      "Вода черна и неподвижна.",
      "Проходит время. Ничего.",
      "Ветер гонит рябь по воде."
    ],
    effects_junk: [
      "С крючка свисает что-то тяжёлое.",
      "Леска натянулась, но это не рыба.",
      "Вместо рыбы — мусор."
    ],

    // === КОНТЕКСТЫ ===
    contexts: [
      "в темноте шахты",
      "у подземного озера",
      "под каплями с потолка",
      "в полной тишине",
      "при свете факела",
      "на краю глубокой воды",
      "у самого берега",
      "среди подземных камней"
    ],

    // === ФИНАЛЫ ===
    finals_catch: [
      "Он довольно кивает.",
      "Он облизывается.",
      "Он убирает рыбу в рюкзак.",
      "Он думает о жарком ужине.",
      "Он довольно хмыкает."
    ],
    finals_miss: [
      "Он вытягивает пустой крючок.",
      "Он вздыхает.",
      "Он вытирает руки.",
      "Он сматывает леску.",
      "Он смотрит в воду и молчит."
    ],
    finals_junk: [
      "Он брезгливо отбрасывает это.",
      "Он хмурится.",
      "Он пинает мусор в сторону.",
      "Он швыряет это обратно в воду."
    ]
  };

  // === ГЕНЕРАТОР ТЕКСТА ===
  Reg.generateFishingText = function(npc, result, fishType) {
    const lex = Reg.fishLex;
    if (!lex) return npc.name + ' возится с удочкой.';
    const pick = arr => arr[Math.floor(Math.random() * arr.length)];

    const ctx = Math.random() < 0.4 ? pick(lex.contexts) : '';
    const ctxPart = ctx ? ' ' + ctx[0].toUpperCase() + ctx.slice(1) + '.' : '';

    if (result === 'catch') {
      let objects = lex.objects_medium; // по умолчанию средняя
      if (fishType === 'small') objects = lex.objects_small;
      if (fishType === 'big') objects = lex.objects_big;
      const obj = pick(objects);

      return `${npc.name} ${pick(lex.verbs_throw)} леску. ${pick(lex.effects_throw)}${ctxPart} Через мгновение он ${pick(lex.verbs_catch)} ${obj}. ${pick(lex.effects_catch)} ${pick(lex.finals_catch)}`;
    }

    if (result === 'junk') {
      const junk = pick(lex.junk_objects);
      return `${npc.name} ${pick(lex.verbs_throw)} леску. ${pick(lex.effects_throw)}${ctxPart} Через мгновение он ${pick(lex.verbs_reel)} крючок — на нём ${junk}. ${pick(lex.effects_junk)} ${pick(lex.finals_junk)}`;
    }

    // miss
    return `${npc.name} ${pick(lex.verbs_throw)} леску. ${pick(lex.effects_throw)}${ctxPart} Проходит время. ${pick(lex.effects_miss)} ${pick(lex.verbs_miss)}. ${pick(lex.finals_miss)}`;
  };

  console.log('[Fishing Lexicon] Атомарный генератор рыбалки загружен.');
})();
