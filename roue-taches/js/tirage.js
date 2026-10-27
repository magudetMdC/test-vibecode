// Tirages aléatoires et géométrie de l'arrêt de la roue.
// La roue est honnête : on tire uniformément parmi les parts encore libres,
// puis on calcule l'angle qui amène cette part sous l'aiguille.

const Tirage = {
  // Entier dans [0, max) sans biais de modulo.
  entier(max) {
    if (!max || max < 1) return 0;

    if (window.crypto && window.crypto.getRandomValues) {
      const limite = Math.floor(4294967296 / max) * max;
      const tampon = new Uint32Array(1);
      let valeur = 0;
      do {
        window.crypto.getRandomValues(tampon);
        valeur = tampon[0];
      } while (valeur >= limite);
      return valeur % max;
    }

    return Math.floor(Math.random() * max);
  },

  choisir(liste) {
    return liste[this.entier(liste.length)];
  },

  melanger(liste) {
    const copie = liste.slice();
    for (let i = copie.length - 1; i > 0; i--) {
      const j = this.entier(i + 1);
      const tampon = copie[i];
      copie[i] = copie[j];
      copie[j] = tampon;
    }
    return copie;
  },

  // Angle (en degrés, sens horaire) à atteindre pour que la part `index`
  // s'arrête sous l'aiguille, en ajoutant plusieurs tours complets.
  angleCible(index, total, rotationActuelle) {
    const part = 360 / total;
    const centre = (index + 0.5) * part;
    // On reste dans la part : ±22 % de sa largeur, jamais sur une frontière.
    const ecart = (Math.random() * 2 - 1) * part * 0.22;

    const cible = this.normaliser(-(centre + ecart));
    const depart = this.normaliser(rotationActuelle);

    let delta = cible - depart;
    if (delta < 0) delta += 360;

    return rotationActuelle + 5 * 360 + delta;
  },

  // Quelle part se trouve sous l'aiguille pour une rotation donnée ?
  // Sert au mode debug pour vérifier l'arrêt sur 2000 tirages.
  partSousAiguille(rotation, total) {
    const part = 360 / total;
    const local = this.normaliser(-rotation);
    return Math.floor(local / part) % total;
  },

  normaliser(angle) {
    return ((angle % 360) + 360) % 360;
  }
};
