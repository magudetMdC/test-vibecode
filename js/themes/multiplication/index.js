// Module thème : Tables de multiplication
// Réutilise Questions (défini dans js/questions.js)

const ThemeMultiplication = {
  id: 'multiplication',
  name: 'Tables de multiplication',
  icon: '✖️',
  color: '#4a90d9',

  // options d'entraînement : tables
  trainingOptions: 'tables', // signal pour UI

  generateQuestion(state) {
    const q = Questions.pick(state.table || 'all');
    return {
      a: q.a, b: q.b,
      display: q.a + ' × ' + q.b + ' = ?',
      answer: q.answer,
      key: 'table_' + q.a + 'x' + q.b,
      competence: 'Table de ' + q.a,
    };
  },

  validate(q, given) {
    return Number(given) === q.answer;
  },

  choices(q) {
    return Questions.distractors(q.answer);
  },

  hint(q) {
    return Questions.tip(q.a, q.b);
  },

  markRight(q) { Questions.markRight(q.a, q.b); },
  markWrong(q) { Questions.markWrong(q.a, q.b); },

  // pour compatibilité avec l'ancien code (stats par table)
  onAnswer() {}
};

window.ThemeMultiplication = ThemeMultiplication;
// auto-register if ThemeManager existe
if (window.ThemeManager) window.ThemeManager.register(ThemeMultiplication);
