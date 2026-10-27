// Petits effets : tics de roue, jingle de victoire, confettis.
// Tout est généré (WebAudio + canvas) : aucune image ni aucun son à télécharger.

const Effets = {
  ctxAudio: null,
  muet: false,
  confettisActifs: true,
  dernierTic: 0,
  animationConfettis: null,

  init() {
    const reglages = Etat.donnees.reglages;
    this.muet = !reglages.son;
    this.confettisActifs = Boolean(reglages.confettis);
  },

  reduireMouvement() {
    return Boolean(
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  },

  basculerSon() {
    this.muet = !this.muet;
    Etat.donnees.reglages.son = !this.muet;
    Etat.sauver();

    if (!this.muet) {
      this.dernierTic = 0;
      this.tic(true);
    }

    return !this.muet;
  },

  basculerConfettis() {
    this.confettisActifs = !this.confettisActifs;
    Etat.donnees.reglages.confettis = this.confettisActifs;
    Etat.sauver();
    return this.confettisActifs;
  },

  contexte() {
    if (this.muet) return null;

    const Constructeur = window.AudioContext || window.webkitAudioContext;
    if (!Constructeur) return null;

    if (!this.ctxAudio) {
      try {
        this.ctxAudio = new Constructeur();
      } catch (erreur) {
        return null;
      }
    }

    if (this.ctxAudio.state === 'suspended') {
      this.ctxAudio.resume();
    }

    return this.ctxAudio;
  },

  // Tic régulier pendant la rotation, limité à ~18 par seconde.
  tic(forcer) {
    if (this.muet && !forcer) return;

    const maintenant = performance.now();
    if (maintenant - this.dernierTic < 55) return;
    this.dernierTic = maintenant;

    const ctx = this.contexte();
    if (!ctx) return;

    const oscillateur = ctx.createOscillator();
    const gain = ctx.createGain();
    const t = ctx.currentTime;

    oscillateur.type = 'triangle';
    oscillateur.frequency.setValueAtTime(1150 + Math.random() * 260, t);

    gain.gain.setValueAtTime(0.035, t);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

    oscillateur.connect(gain);
    gain.connect(ctx.destination);
    oscillateur.start(t);
    oscillateur.stop(t + 0.06);
  },

  // Petit arpège quand la roue s'arrête.
  victoire() {
    if (this.muet) return;

    const ctx = this.contexte();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5];

    notes.forEach((frequence, index) => {
      const oscillateur = ctx.createOscillator();
      const gain = ctx.createGain();
      const depart = ctx.currentTime + index * 0.09;

      oscillateur.type = 'sine';
      oscillateur.frequency.setValueAtTime(frequence, depart);

      gain.gain.setValueAtTime(0.0001, depart);
      gain.gain.exponentialRampToValueAtTime(0.065, depart + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, depart + 0.32);

      oscillateur.connect(gain);
      gain.connect(ctx.destination);
      oscillateur.start(depart);
      oscillateur.stop(depart + 0.34);
    });
  },

  lancerConfettis() {
    if (!this.confettisActifs || this.reduireMouvement()) return;

    const canvas = document.getElementById('confettis');
    if (!canvas || !canvas.getContext) return;

    const ctx = canvas.getContext('2d');
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const largeur = window.innerWidth;
    const hauteur = window.innerHeight;

    canvas.width = Math.round(largeur * ratio);
    canvas.height = Math.round(hauteur * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

    const couleurs = ['#FF8FA3', '#A78BFA', '#5EC8C0', '#F5C26B', '#7BC47F', '#FFFFFF'];
    const origineX = largeur / 2;
    const origineY = hauteur * 0.32;
    const particules = [];

    for (let i = 0; i < 130; i++) {
      const angle = Math.random() * Math.PI * 2;
      const vitesse = 3 + Math.random() * 10;

      particules.push({
        x: origineX,
        y: origineY,
        vx: Math.cos(angle) * vitesse,
        vy: Math.sin(angle) * vitesse - 5,
        taille: 5 + Math.random() * 7,
        couleur: couleurs[Math.floor(Math.random() * couleurs.length)],
        rotation: Math.random() * Math.PI,
        vitesseRotation: (Math.random() - 0.5) * 0.32
      });
    }

    if (this.animationConfettis) {
      cancelAnimationFrame(this.animationConfettis);
    }

    const depart = performance.now();
    const duree = 2400;

    const animer = (maintenant) => {
      const ecoule = maintenant - depart;
      const vie = Math.max(0, 1 - ecoule / duree);

      ctx.clearRect(0, 0, largeur, hauteur);

      particules.forEach(function (p) {
        p.vy += 0.24;
        p.vx *= 0.992;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vitesseRotation;

        ctx.save();
        ctx.globalAlpha = vie;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.couleur;
        ctx.fillRect(-p.taille / 2, -p.taille / 2, p.taille, p.taille * 0.62);
        ctx.restore();
      });

      if (ecoule < duree) {
        this.animationConfettis = requestAnimationFrame(animer);
      } else {
        ctx.clearRect(0, 0, largeur, hauteur);
        this.animationConfettis = null;
      }
    };

    this.animationConfettis = requestAnimationFrame(animer);
  }
};
