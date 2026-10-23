// Module thème : Conjugaison (CE2)
const CONJ_PERSONS = ['je', 'tu', 'il/elle', 'nous', 'vous', 'ils/elles'];
const CONJ_TENSES = ['présent', 'futur', 'imparfait', 'passé composé'];

const CONJ_VERBS = [
  { inf: 'parler', group: 'er' },
  { inf: 'jouer', group: 'er' },
  { inf: 'manger', group: 'er' },
  { inf: 'chanter', group: 'er' },
  { inf: 'finir', group: 'ir' },
  { inf: 'choisir', group: 'ir' },
  { inf: 'réussir', group: 'ir' },
  { inf: 'être', group: 'irr' },
  { inf: 'avoir', group: 'irr' },
  { inf: 'aller', group: 'irr' },
  { inf: 'faire', group: 'irr' },
  { inf: 'voir', group: 'irr' },
  { inf: 'venir', group: 'irr' },
  { inf: 'prendre', group: 'irr' },
  { inf: 'dire', group: 'irr' },
];

// Conjugaisons irrégulières (temps -> tableau par personne)
const IRREG = {
  'être': {
    'présent': ['suis', 'es', 'est', 'sommes', 'êtes', 'sont'],
    'futur': ['serai', 'seras', 'sera', 'serons', 'serez', 'seront'],
    'imparfait': ['étais', 'étais', 'était', 'étions', 'étiez', 'étaient'],
    'passé composé': ['ai été', 'as été', 'a été', 'avons été', 'avez été', 'ont été'],
  },
  'avoir': {
    'présent': ['ai', 'as', 'a', 'avons', 'avez', 'ont'],
    'futur': ['aurai', 'auras', 'aura', 'aurons', 'aurez', 'auront'],
    'imparfait': ['avais', 'avais', 'avait', 'avions', 'aviez', 'avaient'],
    'passé composé': ['ai eu', 'as eu', 'a eu', 'avons eu', 'avez eu', 'ont eu'],
  },
  'aller': {
    'présent': ['vais', 'vas', 'va', 'allons', 'allez', 'vont'],
    'futur': ['irai', 'iras', 'ira', 'irons', 'irez', 'iront'],
    'imparfait': ['allais', 'allais', 'allait', 'allions', 'alliez', 'allaient'],
    'passé composé': ['suis allé', 'es allé', 'est allé', 'sommes allés', 'êtes allés', 'sont allés'],
  },
  'faire': {
    'présent': ['fais', 'fais', 'fait', 'faisons', 'faites', 'font'],
    'futur': ['ferai', 'feras', 'fera', 'ferons', 'ferez', 'feront'],
    'imparfait': ['faisais', 'faisais', 'faisait', 'faisions', 'faisiez', 'faisaient'],
    'passé composé': ['ai fait', 'as fait', 'a fait', 'avons fait', 'avez fait', 'ont fait'],
  },
  'voir': {
    'présent': ['vois', 'vois', 'voit', 'voyons', 'voyez', 'voient'],
    'futur': ['verrai', 'verras', 'verra', 'verrons', 'verrez', 'verront'],
    'imparfait': ['voyais', 'voyais', 'voyait', 'voyions', 'voyiez', 'voyaient'],
    'passé composé': ['ai vu', 'as vu', 'a vu', 'avons vu', 'avez vu', 'ont vu'],
  },
  'venir': {
    'présent': ['viens', 'viens', 'vient', 'venons', 'venez', 'viennent'],
    'futur': ['viendrai', 'viendras', 'viendra', 'viendrons', 'viendrez', 'viendront'],
    'imparfait': ['venais', 'venais', 'venait', 'venions', 'veniez', 'venaient'],
    'passé composé': ['suis venu', 'es venu', 'est venu', 'sommes venus', 'êtes venus', 'sont venus'],
  },
  'prendre': {
    'présent': ['prends', 'prends', 'prend', 'prenons', 'prenez', 'prennent'],
    'futur': ['prendrai', 'prendras', 'prendra', 'prendrons', 'prendrez', 'prendront'],
    'imparfait': ['prenais', 'prenais', 'prenait', 'prenions', 'preniez', 'prenaient'],
    'passé composé': ['ai pris', 'as pris', 'a pris', 'avons pris', 'avez pris', 'ont pris'],
  },
  'dire': {
    'présent': ['dis', 'dis', 'dit', 'disons', 'dites', 'disent'],
    'futur': ['dirai', 'diras', 'dira', 'dirons', 'direz', 'diront'],
    'imparfait': ['disais', 'disais', 'disait', 'disions', 'disiez', 'disaient'],
    'passé composé': ['ai dit', 'as dit', 'a dit', 'avons dit', 'avez dit', 'ont dit'],
  },
};

function conjugate(v, tense, pIdx) {
  if (IRREG[v.inf] && IRREG[v.inf][tense]) {
    return IRREG[v.inf][tense][pIdx];
  }
  const stem = v.inf.replace(/er$|ir$|re$/, '');
  if (v.group === 'er') {
    if (tense === 'présent') {
      const endings = ['e', 'es', 'e', 'ons', 'ez', 'ent'];
      return stem + endings[pIdx];
    }
    if (tense === 'futur') {
      const endings = ['ai', 'as', 'a', 'ons', 'ez', 'ont'];
      return v.inf + endings[pIdx];
    }
    if (tense === 'imparfait') {
      const endings = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'];
      return stem + endings[pIdx];
    }
    if (tense === 'passé composé') {
      const endings = ["ai", "as", "a", "avons", "avez", "ont"];
      return endings[pIdx] + ' ' + (v.inf.replace(/er$/, 'é'));
    }
  }
  if (v.group === 'ir') {
    if (tense === 'présent') {
      const endings = ['is', 'is', 'it', 'issons', 'issez', 'issent'];
      return stem + endings[pIdx];
    }
    if (tense === 'futur') {
      const endings = ['irai', 'iras', 'ira', 'irons', 'irez', 'iront'];
      return stem + endings[pIdx];
    }
    if (tense === 'imparfait') {
      const endings = ['issais', 'issais', 'issait', 'issions', 'issiez', 'issaient'];
      return stem + endings[pIdx];
    }
    if (tense === 'passé composé') {
      const endings = ["ai", "as", "a", "avons", "avez", "ont"];
      return endings[pIdx] + ' ' + (v.inf.replace(/ir$/, 'i'));
    }
  }
  return v.inf;
}

const CONJ_HINTS = {
  'er': "Verbes en -er : je parle, tu parles, il parle, nous parlons, vous parlez, ils parlent.",
  'ir': "Verbes en -ir : je finis, tu finis, il finit, nous finissons, vous finissez, ils finissent.",
  'irr': "Verbe irrégulier : à mémoriser.",
};

const conjWeights = {};
CONJ_VERBS.forEach(v => {
  CONJ_TENSES.forEach(t => {
    conjWeights[v.inf + '|' + t] = 1;
  });
});

function pickConj() {
  const items = [];
  CONJ_VERBS.forEach(v => {
    CONJ_TENSES.forEach(t => {
      items.push({ v, t, weight: conjWeights[v.inf + '|' + t] || 1 });
    });
  });
  let total = items.reduce((a, b) => a + b.weight, 0);
  let r = Math.random() * total;
  for (const it of items) {
    r -= it.weight;
    if (r <= 0) return it;
  }
  return items[items.length - 1];
}

function distractorForms(v, tense, correct, correctPIdx) {
  const set = new Set();
  // autres personnes du même verbe/temps
  for (let i = 0; i < CONJ_PERSONS.length; i++) {
    if (i !== correctPIdx) {
      const f = conjugate(v, tense, i);
      if (f !== correct) set.add(f);
    }
  }
  // même personne, autre temps
  CONJ_TENSES.forEach(t => {
    if (t !== tense) {
      const f = conjugate(v, t, correctPIdx);
      if (f !== correct) set.add(f);
    }
  });
  // forme d'un autre verbe
  const other = CONJ_VERBS.find(x => x.inf !== v.inf);
  if (other) {
    const f = conjugate(other, tense, correctPIdx);
    if (f !== correct) set.add(f);
  }
  return Array.from(set).slice(0, 6);
}

const ThemeConjugaison = {
  id: 'conjugaison',
  name: 'Conjugaison',
  icon: '📝',
  color: '#ff9800',

  generateQuestion(state) {
    const { v, t } = pickConj();
    const pIdx = Math.floor(Math.random() * CONJ_PERSONS.length);
    const person = CONJ_PERSONS[pIdx];
    const correct = conjugate(v, t, pIdx);
    const vs = distractorForms(v, t, correct, pIdx);
    const choices = [correct].concat(vs.slice(0, 3));
    const uniq = Array.from(new Set(choices));
    while (uniq.length < 4 && vs.length) {
      const cand = vs[uniq.length % vs.length];
      if (!uniq.includes(cand)) uniq.push(cand);
    }
    for (let i = uniq.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [uniq[i], uniq[j]] = [uniq[j], uniq[i]];
    }
    const deformed = vs.length ? vs[0] : correct;
    return {
      verb: v.inf,
      tense: t,
      person: person,
      display: 'Conjugue : ' + v.inf + ' (' + person + ', ' + t + ')',
      inputDisplay: 'Conjugue : ' + v.inf + ' (' + person + ', ' + t + ')',
      answer: correct,
      key: 'conj_' + v.group + '_' + t,
      competence: t + ' - verbes en ' + v.group,
      choices: uniq,
      group: v.group,
    };
  },

  validate(q, given) {
    return String(given).trim().toLowerCase() === String(q.answer).trim().toLowerCase();
  },

  choices(q) { return q.choices; },

  hint(q) {
    return CONJ_HINTS[q.group] || 'Pense à la terminaison du temps.';
  },

  markRight(q) {
    const key = q.verb + '|' + q.tense;
    if (conjWeights[key] > 1) conjWeights[key] = Math.max(1, conjWeights[key] - 1);
  },
  markWrong(q) {
    const key = q.verb + '|' + q.tense;
    conjWeights[key] = (conjWeights[key] || 1) + 3;
  },
};

window.ThemeConjugaison = ThemeConjugaison;
if (window.ThemeManager) window.ThemeManager.register(ThemeConjugaison);
