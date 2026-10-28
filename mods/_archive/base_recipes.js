// Базовые рецепты
Reg.recipe({
  id: 'smelt_iron', name: 'Выплавить железо', time: 5, cost: { ore: 2 }, result: { metal: 1 }, desc: 'Превращает руду в слитки.'
});
Reg.recipe({
  id: 'cook_meal', name: 'Приготовить похлебку', time: 3, cost: { food: 2 }, result: { meal: 1 }, desc: 'Горячая еда восстанавливает силы.'
});
Reg.recipe({
  id: 'craft_pickaxe', name: 'Сделать кирку', time: 8, cost: { metal: 1 }, result: { pickaxe: 1 }, desc: 'Инструмент для копания.'
});
