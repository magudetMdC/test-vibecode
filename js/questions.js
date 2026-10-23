// Génération des questions + pondération adaptative
const Questions = {
  allProducts: [],
  weights: {}, // key "axb" -> weight number

  init() {
    this.allProducts = [];
    for (let a = 1; a <= 10; a++) {
      for (let b = 1; b <= 10; b++) {
        this.allProducts.push({ a, b, answer: a * b });
      }
    }
    this.allProducts.forEach(p => { this.weights[this.key(p.a, p.b)] = 1; });
  },

  key(a, b) { return a + 'x' + b; },

  // filtre par table si besoin (a ou b == table)
  pool(table) {
    if (!table || table === 'all') return this.allProducts;
    const t = Number(table);
    return this.allProducts.filter(p => p.a === t || p.b === t);
  },

  // sélection pondérée
  pick(table) {
    const pool = this.pool(table);
    let total = 0;
    const w = pool.map(p => {
      const weight = this.weights[this.key(p.a, p.b)] || 1;
      total += weight;
      return weight;
    });
    let r = Math.random() * total;
    for (let i = 0; i < pool.length; i++) {
      r -= w[i];
      if (r <= 0) return pool[i];
    }
    return pool[pool.length - 1];
  },

  // augmente le poids d'un produit raté
  markWrong(a, b) {
    const k = this.key(a, b);
    this.weights[k] = (this.weights[k] || 1) + 3;
    // commutativité : renforcer aussi bxa
    const k2 = this.key(b, a);
    this.weights[k2] = (this.weights[k2] || 1) + 2;
  },
  markRight(a, b) {
    const k = this.key(a, b);
    if (this.weights[k] > 1) this.weights[k] = Math.max(1, this.weights[k] - 1);
  },

  // distracteurs pour QCM
  distractors(answer) {
    const set = new Set();
    const candidates = [];
    for (let d = 1; d <= 4; d++) {
      candidates.push(answer + d);
      candidates.push(answer - d);
    }
    // aussi produits proches
    candidates.push(answer + 10, answer - 10);
    for (const c of candidates) {
      if (c > 0 && c !== answer && !set.has(c)) set.add(c);
      if (set.size >= 6) break;
    }
    // compléter si besoin
    while (set.size < 3) {
      const r = answer + Math.floor(Math.random() * 20) - 10;
      if (r > 0 && r !== answer) set.add(r);
    }
    const arr = Array.from(set).slice(0, 3);
    const options = arr.concat([answer]);
    // shuffle
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    return options;
  },

  // astuce pédagogique
  tip(a, b) {
    const ans = a * b;
    if (a === 1 || b === 1) return "×1 ne change pas le nombre.";
    if (a === 10 || b === 10) return "×10 : on ajoute un zéro à la fin.";
    if (a === 2 || b === 2) return "×2 : c'est doubler (additionner le nombre à lui-même).";
    if (a === 5 || b === 5) return "×5 : le résultat se termine toujours par 0 ou 5.";
    if (a === 9 || b === 9) return "×9 : la somme des chiffres du résultat vaut 9 (ex. 9×4=36 → 3+6=9).";
    if (a === b) return "C'est un carré : " + a + "×" + a + "=" + ans + ".";
    // commutativité
    return "Astuce : " + a + "×" + b + " = " + b + "×" + a + " (on peut inverser).";
  }
};
window.Questions = Questions;
Questions.init();
