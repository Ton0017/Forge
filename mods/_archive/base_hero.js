// Слоты героя: name / wound / want / fear / contradiction / voice
const _hs = (slot, arr)=> arr.forEach(x=> Reg.heroSlot(slot, x));

_hs('names', [
  {id:'arn',text:'Арн'},{id:'mera',text:'Мера'},{id:'kei',text:'Кей'},
  {id:'tess',text:'Тэсс'},{id:'vill',text:'Вилл'},{id:'ona',text:'Она'},
  {id:'dar',text:'Дар'},{id:'runa',text:'Руна'},{id:'hal',text:'Хал'},
  {id:'irma',text:'Ирма'},{id:'bren',text:'Брен'},{id:'sol',text:'Соль'}
]);

_hs('wounds', [
  {id:'lost_mother', text:'мать пропала в шахте три года назад'},
  {id:'traitor',     text:'предал брата и с тех пор не спит'},
  {id:'plague',      text:'единственный выживший из деревни'},
  {id:'exile',       text:'изгнан за то, чего не совершал'},
  {id:'saw_below',   text:'видел то, что не должен был'},
  {id:'debt',        text:'задолжал людям, которых не выбирал'}
]);

_hs('wants', [
  {id:'find_father', text:'найти отца'},
  {id:'prove',       text:'доказать, что не трус'},
  {id:'build',       text:'построить дом'},
  {id:'truth',       text:'узнать правду о шахте'},
  {id:'survive',     text:'дожить до весны'},
  {id:'voice',       text:'услышать голос из-под земли'}
]);

_hs('fears', [
  {id:'dark',         text:'темноты'},
  {id:'crowd',        text:'толпы'},
  {id:'seen',         text:'быть увиденным'},
  {id:'forget',       text:'забыть'},
  {id:'lose_control', text:'потерять контроль'},
  {id:'silence',      text:'тишины'}
]);

_hs('contradictions', [
  {id:'brave_mute',  text:'храбрый, но не может говорить'},
  {id:'kind_cruel',  text:'добрый, но жестокий пьяным'},
  {id:'honest_liar', text:'честный, но лжёт себе'},
  {id:'strong_weak', text:'сильный, но боится одиночества'},
  {id:'calm_storm',  text:'спокойный снаружи, буря внутри'}
]);

_hs('voices', [
  {id:'dry',         text:'сухой'},
  {id:'poetic',      text:'поэтичный'},
  {id:'black_humor', text:'с чёрным юмором'},
  {id:'melancholic', text:'меланхоличный'},
  {id:'obsessive',   text:'одержимый деталями'}
]);
