// Словари для действий с деньгами
const moneyActions = ['пересчитывает', 'прячет в карман', 'звенит', 'взвешивает в руке', 'прячет в сапог', 'смотрит на'];
const moneyObjects = ['монеты', 'зарплату', 'звонкие монеты', 'горсть золота'];

// Слушаем событие получения зарплаты
Reg.on('salary_paid', (npc, amount) => {
  const pick = arr => arr[Math.floor(Math.random() * arr.length)];

  // 1. Выбираем действие с деньгами
  const action = `${npc.name} ${pick(moneyActions)} ${pick(moneyObjects)}.`;

  // 2. Вычисляем СОСТОЯНИЕ (что он чувствует сейчас?)
  let stateText = '';
  let emoType = 'neutral';
  let emoPower = 5;

  // Проверяем жажду (может, он хочет пропить?)
  if (npc.thirst > 60) {
    stateText = pick(['В горле пересохло. Он думает, хватит ли этого на эль.', 'Он хочет пить, и монеты в кармане так и жгут.']);
    emoType = 'joy';
    emoPower = 10;
  } 
  // Проверяем жадность (может, он хочет копить?)
  else if (npc.facets && npc.facets.greed > 60) {
    stateText = pick(['Он довольно ухмыляется. Теперь эти деньги никто не заберет.', 'Он думает, что мог бы скопить на что-то большое.']);
    emoType = 'joy';
    emoPower = 15;
  }
  // Проверяем усталость (может, он хочет отдохнуть?)
  else if (npc.fatigue > 60) {
    stateText = pick(['Он хочет просто лечь и ни о чем не думать.', 'Спина ноет. Деньги не помогут от усталости.']);
    emoType = 'sadness';
    emoPower = 10;
  }
  // Если всё в порядке
  else {
    stateText = pick(['Он чувствует себя неплохо.', 'Это был хороший день.', 'Он думает о том, как потратить их с умом.']);
    emoType = 'joy';
    emoPower = 5;
  }

  // 3. Добавляем случайный контекст из нашего огромного словаря
  const context = Reg.dict && Reg.dict.contexts ? pick(Reg.dict.contexts) : '';

  // 4. Собираем всё вместе
  const fullText = `${action} ${stateText} ${context}`;
  
  // Записываем в память
  Reg.addMemory(npc, fullText, { type: emoType, power: emoPower, category: 'salary' });

  // 5. Меняем поведение (но не пишем об этом в лог, а просто даем стимул)
  if (npc.thirst > 60) {
    npc.wantsToSave = false; // Сразу пойдет пить
  } else if (npc.facets && npc.facets.greed > 60) {
    npc.wantsToSave = true; // Будет копить
  }
});
