// Module thème : Orthographe (CE2)
const ORTHO_WORDS = [
  { word: 'maison', trap: 's/z' },
  { word: 'école', trap: 'accent' },
  { word: 'bateau', trap: 'eau' },
  { word: 'pomme', trap: 'double' },
  { word: 'bottes', trap: 'double' },
  { word: 'téléphone', trap: 'accent' },
  { word: 'forêt', trap: 'accent' },
  { word: 'hôpital', trap: 'accent' },
  { word: 'côté', trap: 'accent' },
  { word: 'après', trap: 'accent' },
  { word: 'éléphant', trap: 'accent' },
  { word: 'étoile', trap: 'accent' },
  { word: 'gâteau', trap: 'accent' },
  { word: 'château', trap: 'eau' },
  { word: 'beau', trap: 'eau' },
  { word: 'nouveau', trap: 'eau' },
  { word: 'tableau', trap: 'eau' },
  { word: 'oiseau', trap: 'eau' },
  { word: 'cadeau', trap: 'eau' },
  { word: 'manteau', trap: 'eau' },
  { word: 'chapeau', trap: 'eau' },
  { word: 'appeler', trap: 'double' },
  { word: 'collège', trap: 'double' },
  { word: 'village', trap: 'ge' },
  { word: 'neige', trap: 'ge' },
  { word: 'fromage', trap: 'ge' },
  { word: 'voyage', trap: 'ge' },
  { word: 'image', trap: 'ge' },
  { word: 'manger', trap: 'ger' },
  { word: 'nager', trap: 'ger' },
  { word: 'changer', trap: 'ger' },
  { word: 'préférer', trap: 'accent' },
  { word: 'espérer', trap: 'accent' },
  { word: 'répéter', trap: 'accent' },
  { word: 'compléter', trap: 'accent' },
  { word: 'courir', trap: 'ir' },
  { word: 'partir', trap: 'ir' },
  { word: 'sortir', trap: 'ir' },
  { word: 'dormir', trap: 'ir' },
  { word: 'choisir', trap: 'ir' },
  { word: 'réussir', trap: 'accent' },
  { word: 'finir', trap: 'ir' },
  { word: 'payer', trap: 'yer' },
  { word: 'essayer', trap: 'yer' },
  { word: 'envoyer', trap: 'yer' },
  { word: 'nettoyer', trap: 'yer' },
  { word: 'appuyer', trap: 'yer' },
  { word: 'employer', trap: 'yer' },
  { word: 'noyer', trap: 'yer' },
  { word: 'aboyer', trap: 'yer' },
];

const TRAP_HINTS = {
  'accent': "Pense à l'accent : é (fermé), è (ouvert), ê (circonflexe).",
  'double': "Double la consonne : pomme, bottes, appeler.",
  'eau': "Le son [o] s'écrit souvent 'eau' (bateau, gâteau).",
  'ge': "Le son [ʒ] devant e/i s'écrit 'ge' (village, neige).",
  'ger': "À l'infinitif, on garde le 'e' : manger, nager.",
  'ir': "Les verbes en -ir : courir, partir, sortir.",
  'yer': "Les verbes en -yer : payer, essayer, envoyer.",
  's/z': "Le son [z] entre deux voyelles s'écrit 's' (maison).",
};

// poids adaptatif par mot
const orthoWeights = {};
ORTHO_WORDS.forEach(w => { orthoWeights[w.word] = 1; });

function deaccent(s) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }

function variants(word) {
  const set = new Set();
  const noAcc = deaccent(word);
  if (noAcc !== word) set.add(noAcc);
  set.add(word + 's');
  if (word.length > 3) set.add(word.slice(0, -1));
  if (word.includes('eau')) set.add(word.replace('eau', 'au'));
  if (word.includes('au') && !word.includes('eau')) set.add(word.replace('au', 'eau'));
  if (word.includes('s')) set.add(word.replace('s', 'z'));
  if (word.includes('z')) set.add(word.replace('z', 's'));
  const single = word.replace(/(.)\1/g, '$1');
  if (single !== word) set.add(single);
  // double a consonant for words without doubles
  if (!/(.)\1/.test(word) && word.length > 3) {
    const i = Math.floor(word.length / 2);
    set.add(word.slice(0, i) + word[i] + word.slice(i));
  }
  return Array.from(set).filter(w => w !== word && w.length > 2);
}

function pickWord() {
  let total = 0;
  const ws = ORTHO_WORDS.map(w => {
    const weight = orthoWeights[w.word] || 1;
    total += weight;
    return weight;
  });
  let r = Math.random() * total;
  for (let i = 0; i < ORTHO_WORDS.length; i++) {
    r -= ws[i];
    if (r <= 0) return ORTHO_WORDS[i];
  }
  return ORTHO_WORDS[ORTHO_WORDS.length - 1];
}

const ThemeOrthographe = {
  id: 'orthographe',
  name: 'Orthographe',
  icon: '✏️',
  color: '#e91e63',

  generateQuestion(state) {
    const w = pickWord();
    const vs = variants(w.word);
    // choix d'un distracteur déformé pour la saisie
    const deformed = vs.length ? vs[Math.floor(Math.random() * vs.length)] : w.word;
    const choices = [w.word].concat(vs.slice(0, 3));
    // dédup + shuffle
    const uniq = Array.from(new Set(choices));
    while (uniq.length < 4 && vs.length) {
      const v = vs[uniq.length % vs.length];
      if (!uniq.includes(v)) uniq.push(v);
    }
    for (let i = uniq.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [uniq[i], uniq[j]] = [uniq[j], uniq[i]];
    }
    return {
      word: w.word,
      trap: w.trap,
      display: 'Quel mot est correctement écrit ?',
      inputDisplay: 'Corrige le mot : ' + deformed,
      answer: w.word,
      key: 'ortho_' + w.trap,
      competence: w.trap,
      choices: uniq,
    };
  },

  validate(q, given) {
    return String(given).trim().toLowerCase() === String(q.answer).trim().toLowerCase();
  },

  choices(q) { return q.choices; },

  hint(q) { return TRAP_HINTS[q.trap] || 'Relis le mot attentivement.'; },

  markRight(q) {
    if (orthoWeights[q.word] > 1) orthoWeights[q.word] = Math.max(1, orthoWeights[q.word] - 1);
  },
  markWrong(q) {
    orthoWeights[q.word] = (orthoWeights[q.word] || 1) + 3;
  },
};

window.ThemeOrthographe = ThemeOrthographe;
if (window.ThemeManager) window.ThemeManager.register(ThemeOrthographe);
