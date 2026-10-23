// Module thème : Logique (CE2)
const LOGIC_HINTS = {
  'suite': "Trouve la règle : addition, soustraction, multiplication.",
  'intrus': "Cherche l'intrus : lequel n'est pas comme les autres ?",
  'verbal': "Lis bien l'énoncé et déduis la réponse.",
};

// Questions statiques : intrus et logique verbale
const STATIC_LOGIC = [
  // intrus
  { type: 'intrus', display: "Quel mot est l'intrus ? chien, chat, oiseau, voiture", answer: 'voiture', choices: ['chien','chat','oiseau','voiture'], hint: "3 animaux et 1 véhicule." },
  { type: 'intrus', display: "Quel mot est l'intrus ? rouge, bleu, vert, chien", answer: 'chien', choices: ['rouge','bleu','vert','chien'], hint: "3 couleurs et 1 animal." },
  { type: 'intrus', display: "Quel mot est l'intrus ? pomme, poire, banane, chaise", answer: 'chaise', choices: ['pomme','poire','banane','chaise'], hint: "3 fruits et 1 meuble." },
  { type: 'intrus', display: "Quel mot est l'intrus ? été, hiver, lundi, automne", answer: 'lundi', choices: ['été','hiver','lundi','automne'], hint: "3 saisons et 1 jour." },
  { type: 'intrus', display: "Quel mot est l'intrus ? Paris, Lyon, chien, Marseille", answer: 'chien', choices: ['Paris','Lyon','chien','Marseille'], hint: "3 villes et 1 animal." },
  { type: 'intrus', display: "Quel mot est l'intrus ? 2, 4, 6, 9", answer: '9', choices: ['2','4','6','9'], hint: "3 nombres pairs et 1 impair." },
  // verbal
  { type: 'verbal', display: "Si Marie est plus grande que Paul, et Paul plus grand que Léo, qui est le plus grand ?", answer: 'Marie', choices: ['Marie','Paul','Léo','on ne sait pas'], hint: "Marie > Paul > Léo." },
  { type: 'verbal', display: "Tom a 3 billes de plus que Léa. Léa a 5 billes. Combien a Tom ?", answer: '8', choices: ['8','5','3','2'], hint: "5 + 3 = 8." },
  { type: 'verbal', display: "Dans une course, Alice arrive avant Bob, et Bob avant Clara. Qui arrive en dernier ?", answer: 'Clara', choices: ['Alice','Bob','Clara','personne'], hint: "Alice, puis Bob, puis Clara." },
  { type: 'verbal', display: "J'ai 10 bonbons, j'en mange 3. Combien il m'en reste ?", answer: '7', choices: ['7','10','3','13'], hint: "10 - 3 = 7." },
  { type: 'verbal', display: "Un carré a 4 côtés. Combien de côtés ont 2 carrés ?", answer: '8', choices: ['8','4','6','2'], hint: "4 × 2 = 8." },
  { type: 'verbal', display: "Si aujourd'hui est mardi, quel jour sera demain ?", answer: 'mercredi', choices: ['lundi','mercredi','jeudi','mardi'], hint: "Après mardi vient mercredi." },
];

const logicWeights = {};
// suites generated dynamically; track by type
['suite','intrus','verbal'].forEach(t => { logicWeights[t] = 1; });

function genSuite() {
  const start = Math.floor(Math.random() * 9) + 1;
  const step = Math.floor(Math.random() * 4) + 1; // 1..4
  const len = 4;
  const seq = [];
  for (let i = 0; i < len; i++) seq.push(start + i * step);
  const hideLast = Math.random() < 0.7;
  let display, answer;
  if (hideLast) {
    answer = seq[len - 1];
    display = 'Complète la suite : ' + seq.slice(0, len - 1).join(', ') + ', ?';
  } else {
    const idx = Math.floor(Math.random() * (len - 2)) + 1;
    answer = seq[idx];
    const shown = seq.map((v, i) => (i === idx ? '?' : v));
    display = 'Complète la suite : ' + shown.join(', ');
  }
  // choices
  const choices = [answer];
  for (let d = 1; d <= 3; d++) {
    choices.push(answer + d * step);
    choices.push(answer - d * step);
  }
  const uniq = Array.from(new Set(choices.filter(x => x > 0))).slice(0, 4);
  while (uniq.length < 4) uniq.push(answer + uniq.length);
  for (let i = uniq.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [uniq[i], uniq[j]] = [uniq[j], uniq[i]];
  }
  return { type: 'suite', display, answer: String(answer), choices: uniq.map(String), hint: "Ajoute " + step + " à chaque fois.", key: 'logic_suite' };
}

function pickStatic() {
  const item = STATIC_LOGIC[Math.floor(Math.random() * STATIC_LOGIC.length)];
  return {
    type: item.type,
    display: item.display,
    answer: item.answer,
    choices: item.choices.slice(),
    hint: item.hint,
    key: 'logic_' + item.type,
  };
}

const ThemeLogique = {
  id: 'logique',
  name: 'Logique',
  icon: '🧩',
  color: '#9c27b0',

  generateQuestion(state) {
    const useSuite = Math.random() < 0.4;
    const q = useSuite ? genSuite() : pickStatic();
    // shuffle choices already done in genSuite; for static, shuffle
    if (!useSuite) {
      const arr = q.choices.slice();
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      q.choices = arr;
    }
    return {
      type: q.type,
      display: q.display,
      inputDisplay: q.display,
      answer: q.answer,
      key: q.key,
      competence: q.type,
      choices: q.choices,
      hint: q.hint,
    };
  },

  validate(q, given) {
    return String(given).trim().toLowerCase() === String(q.answer).trim().toLowerCase();
  },

  choices(q) { return q.choices; },

  hint(q) { return q.hint || LOGIC_HINTS[q.type] || 'Réfléchis étape par étape.'; },

  markRight(q) {
    logicWeights[q.type] = Math.max(1, (logicWeights[q.type] || 1) - 1);
  },
  markWrong(q) {
    logicWeights[q.type] = (logicWeights[q.type] || 1) + 3;
  },
};

window.ThemeLogique = ThemeLogique;
if (window.ThemeManager) window.ThemeManager.register(ThemeLogique);
