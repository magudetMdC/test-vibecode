// Module thème : Anglais (CE2, britannique)
const EN_WORDS = [
  // animaux
  { fr: 'chat', en: 'cat', cat: 'animaux' },
  { fr: 'chien', en: 'dog', cat: 'animaux' },
  { fr: 'oiseau', en: 'bird', cat: 'animaux' },
  { fr: 'poisson', en: 'fish', cat: 'animaux' },
  { fr: 'lapin', en: 'rabbit', cat: 'animaux' },
  { fr: 'cheval', en: 'horse', cat: 'animaux' },
  { fr: 'vache', en: 'cow', cat: 'animaux' },
  { fr: 'mouton', en: 'sheep', cat: 'animaux' },
  { fr: 'cochon', en: 'pig', cat: 'animaux' },
  { fr: 'souris', en: 'mouse', cat: 'animaux' },
  // couleurs
  { fr: 'rouge', en: 'red', cat: 'couleurs' },
  { fr: 'bleu', en: 'blue', cat: 'couleurs' },
  { fr: 'vert', en: 'green', cat: 'couleurs' },
  { fr: 'jaune', en: 'yellow', cat: 'couleurs' },
  { fr: 'noir', en: 'black', cat: 'couleurs' },
  { fr: 'blanc', en: 'white', cat: 'couleurs' },
  { fr: 'rose', en: 'pink', cat: 'couleurs' },
  { fr: 'orange', en: 'orange', cat: 'couleurs' },
  { fr: 'violet', en: 'purple', cat: 'couleurs' },
  { fr: 'gris', en: 'grey', cat: 'couleurs' },
  // famille
  { fr: 'mère', en: 'mother', cat: 'famille' },
  { fr: 'père', en: 'father', cat: 'famille' },
  { fr: 'frère', en: 'brother', cat: 'famille' },
  { fr: 'sœur', en: 'sister', cat: 'famille' },
  { fr: 'grand-mère', en: 'grandmother', cat: 'famille' },
  { fr: 'grand-père', en: 'grandfather', cat: 'famille' },
  { fr: 'bébé', en: 'baby', cat: 'famille' },
  { fr: 'ami', en: 'friend', cat: 'famille' },
  // école
  { fr: 'école', en: 'school', cat: 'école' },
  { fr: 'livre', en: 'book', cat: 'école' },
  { fr: 'stylo', en: 'pen', cat: 'école' },
  { fr: 'crayon', en: 'pencil', cat: 'école' },
  { fr: 'table', en: 'table', cat: 'école' },
  { fr: 'chaise', en: 'chair', cat: 'école' },
  { fr: 'sac', en: 'bag', cat: 'école' },
  { fr: 'cahier', en: 'notebook', cat: 'école' },
  { fr: 'maître', en: 'teacher', cat: 'école' },
  { fr: 'élève', en: 'pupil', cat: 'école' },
  // nombres
  { fr: 'un', en: 'one', cat: 'nombres' },
  { fr: 'deux', en: 'two', cat: 'nombres' },
  { fr: 'trois', en: 'three', cat: 'nombres' },
  { fr: 'quatre', en: 'four', cat: 'nombres' },
  { fr: 'cinq', en: 'five', cat: 'nombres' },
  { fr: 'six', en: 'six', cat: 'nombres' },
  { fr: 'sept', en: 'seven', cat: 'nombres' },
  { fr: 'huit', en: 'eight', cat: 'nombres' },
  { fr: 'neuf', en: 'nine', cat: 'nombres' },
  { fr: 'dix', en: 'ten', cat: 'nombres' },
  // divers
  { fr: 'maison', en: 'house', cat: 'maison' },
  { fr: 'porte', en: 'door', cat: 'maison' },
  { fr: 'fenêtre', en: 'window', cat: 'maison' },
  { fr: 'lit', en: 'bed', cat: 'maison' },
  { fr: 'chambre', en: 'bedroom', cat: 'maison' },
  { fr: 'cuisine', en: 'kitchen', cat: 'maison' },
  { fr: 'jardin', en: 'garden', cat: 'maison' },
  { fr: 'voiture', en: 'car', cat: 'transport' },
  { fr: 'vélo', en: 'bike', cat: 'transport' },
  { fr: 'train', en: 'train', cat: 'transport' },
  { fr: 'avion', en: 'plane', cat: 'transport' },
  { fr: 'bateau', en: 'boat', cat: 'transport' },
];

const EN_HINTS = {
  'animaux': "Les noms d'animaux s'apprennent par cœur.",
  'couleurs': "Les couleurs : red, blue, green, yellow...",
  'famille': "La famille : mother, father, brother, sister.",
  'école': "À l'école : school, book, pen, pencil.",
  'nombres': "Les nombres de 1 à 10 : one, two, three...",
  'maison': "La maison : house, door, window, bed.",
  'transport': "Les transports : car, bike, train, plane, boat.",
};

const enWeights = {};
EN_WORDS.forEach(w => { enWeights[w.fr + '|' + w.en] = 1; });

function pickEn() {
  let total = 0;
  const ws = EN_WORDS.map(w => {
    const weight = enWeights[w.fr + '|' + w.en] || 1;
    total += weight;
    return weight;
  });
  let r = Math.random() * total;
  for (let i = 0; i < EN_WORDS.length; i++) {
    r -= ws[i];
    if (r <= 0) return EN_WORDS[i];
  }
  return EN_WORDS[EN_WORDS.length - 1];
}

function enDistractors(correct, allWords, getVal) {
  const set = new Set();
  const others = allWords.filter(w => getVal(w) !== correct);
  while (set.size < 3 && others.length) {
    const w = others[Math.floor(Math.random() * others.length)];
    set.add(getVal(w));
  }
  return Array.from(set);
}

const ThemeAnglais = {
  id: 'anglais',
  name: 'Anglais',
  icon: '🇬🇧',
  color: '#4caf50',

  generateQuestion(state) {
    const w = pickEn();
    const dir = Math.random() < 0.5 ? 'fr-en' : 'en-fr';
    let display, answer, choices;
    if (dir === 'fr-en') {
      display = 'Traduis en anglais : ' + w.fr;
      answer = w.en;
      const distractors = enDistractors(w.en, EN_WORDS, x => x.en);
      choices = [w.en].concat(distractors);
    } else {
      display = 'Traduis en français : ' + w.en;
      answer = w.fr;
      const distractors = enDistractors(w.fr, EN_WORDS, x => x.fr);
      choices = [w.fr].concat(distractors);
    }
    const uniq = Array.from(new Set(choices));
    while (uniq.length < 4) {
      const extra = dir === 'fr-en' ? 'word' : 'mot';
      if (!uniq.includes(extra)) uniq.push(extra);
      else break;
    }
    for (let i = uniq.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [uniq[i], uniq[j]] = [uniq[j], uniq[i]];
    }
    return {
      word: w,
      dir: dir,
      display: display,
      inputDisplay: display,
      answer: answer,
      key: 'en_' + w.cat,
      competence: w.cat,
      choices: uniq,
    };
  },

  validate(q, given) {
    return String(given).trim().toLowerCase() === String(q.answer).trim().toLowerCase();
  },

  choices(q) { return q.choices; },

  hint(q) {
    return EN_HINTS[q.competence] || 'Pense au mot anglais correspondant.';
  },

  markRight(q) {
    const key = q.word.fr + '|' + q.word.en;
    if (enWeights[key] > 1) enWeights[key] = Math.max(1, enWeights[key] - 1);
  },
  markWrong(q) {
    const key = q.word.fr + '|' + q.word.en;
    enWeights[key] = (enWeights[key] || 1) + 3;
  },
};

window.ThemeAnglais = ThemeAnglais;
if (window.ThemeManager) window.ThemeManager.register(ThemeAnglais);
