// État de la semaine, liste des tâches et mémoire locale.
// Une seule clé de stockage ; le numéro de version vit dans les données
// pour pouvoir migrer sans effacer la semaine de la famille.

const Etat = {
  CLE: 'roue-taches:v1',
  REFERENCE: new Date(2024, 0, 1), // un lundi : sert à faire tourner l'ordre de passage
  donnees: null,
  memoireOk: true,

  // --- Chargement ---------------------------------------------------------

  charger() {
    let brut = null;
    let migre = false;

    try {
      const texte = localStorage.getItem(this.CLE);
      brut = texte ? JSON.parse(texte) : null;
    } catch (erreur) {
      brut = null;
      this.memoireOk = false;
    }

    if (!brut || !brut.semaine) {
      this.donnees = this.etatVierge();
      this.sauver();
      return this.donnees;
    }

    // Migration depuis la version 1 : la liste des tâches n'était pas encore
    // enregistrée, on repart de la liste par défaut (ses identifiants sont
    // les mêmes, la semaine en cours reste donc valide).
    if (brut.version === 1) {
      brut.version = 2;
      brut.taches = Donnees.tachesParDefautCopie();
      migre = true;
    }

    if (brut.version !== Donnees.version) {
      this.donnees = this.etatVierge();
      this.sauver();
      return this.donnees;
    }

    this.donnees = brut;
    this.donnees.historique = Array.isArray(brut.historique) ? brut.historique : [];
    this.donnees.reglages = Object.assign(
      { son: true, confettis: true },
      brut.reglages || {}
    );
    this.donnees.taches = this.nettoyerTaches(brut.taches);

    const propre = JSON.stringify(this.donnees.taches) !== JSON.stringify(brut.taches);
    if (migre || propre) {
      this.sauver();
    }

    // Nouvelle semaine : on archive celle qui est terminée.
    const cible = this.dateISO(this.lundiCible());
    if (this.donnees.semaine.debut !== cible) {
      this.archiverSemaine();
      this.donnees.semaine = this.semaineVierge(this.lundiCible());
      this.sauver();
    }

    return this.donnees;
  },

  sauver() {
    try {
      localStorage.setItem(this.CLE, JSON.stringify(this.donnees));
      this.memoireOk = true;
    } catch (erreur) {
      // Mode navigation privée ou fichier ouvert en local : on continue en mémoire.
      this.memoireOk = false;
    }
    return this.memoireOk;
  },

  // --- Dates --------------------------------------------------------------

  // Un tirage le dimanche prépare la semaine qui commence le lendemain.
  lundiCible(date) {
    const jour = date ? new Date(date.getTime()) : new Date();
    const d = new Date(jour.getFullYear(), jour.getMonth(), jour.getDate());
    const numeroJour = d.getDay(); // 0 = dimanche

    if (numeroJour === 0) {
      d.setDate(d.getDate() + 1);
    } else {
      d.setDate(d.getDate() - (numeroJour - 1));
    }

    return d;
  },

  dateISO(date) {
    const deuxChiffres = function (n) {
      return String(n).padStart(2, '0');
    };
    return date.getFullYear() + '-' +
      deuxChiffres(date.getMonth() + 1) + '-' +
      deuxChiffres(date.getDate());
  },

  depuisISO(texte) {
    const morceaux = String(texte).split('-').map(Number);
    return new Date(morceaux[0], morceaux[1] - 1, morceaux[2]);
  },

  // --- Tâches -------------------------------------------------------------

  nettoyerTaches(liste) {
    const propre = (Array.isArray(liste) ? liste : [])
      .filter(function (tache) {
        return tache && typeof tache.nom === 'string' && tache.nom.trim();
      })
      .slice(0, Donnees.tachesMaximum)
      .map(function (tache, index) {
        return {
          id: String(tache.id || 'tache-' + (index + 1)),
          nom: tache.nom.trim().slice(0, Donnees.longueurNomMaximum),
          emoji: String(tache.emoji || '🧽').trim().slice(0, 8) || '🧽'
        };
      });

    if (propre.length < Donnees.tachesMinimum) {
      return Donnees.tachesParDefautCopie();
    }

    return propre;
  },

  taches() {
    return this.donnees.taches;
  },

  tacheParId(id) {
    return this.taches().find(function (tache) { return tache.id === id; }) || null;
  },

  couleurDeTache(id) {
    const index = this.taches().findIndex(function (tache) { return tache.id === id; });
    const palette = Donnees.couleursParts;
    return palette[index < 0 ? 0 : index % palette.length];
  },

  // Enregistre une nouvelle liste de tâches (déjà validée par l'éditeur).
  definirTaches(liste) {
    this.donnees.taches = liste.map(function (tache) {
      return {
        id: tache.id,
        nom: tache.nom.trim().slice(0, Donnees.longueurNomMaximum),
        emoji: String(tache.emoji || '🧽').trim().slice(0, 8) || '🧽'
      };
    });
    this.sauver();
  },

  // Identifiant stable, lisible et unique, dérivé du nom.
  idTacheLibre(nom, idsPris) {
    const base = String(nom)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 24) || 'tache';

    let id = base;
    let numero = 2;

    while (idsPris.indexOf(id) !== -1) {
      id = base + '-' + numero;
      numero++;
    }

    return id;
  },

  // --- Semaine ------------------------------------------------------------

  etatVierge() {
    return {
      version: Donnees.version,
      taches: Donnees.tachesParDefautCopie(),
      semaine: this.semaineVierge(this.lundiCible()),
      historique: [],
      reglages: { son: true, confettis: true }
    };
  },

  semaineVierge(lundi) {
    return {
      debut: this.dateISO(lundi),
      ordrePassage: this.ordrePassage(lundi),
      tours: []
    };
  },

  // L'ordre tourne d'un cran par semaine : le premier devient dernier.
  ordrePassage(lundi) {
    const ids = Donnees.membres.map(function (membre) { return membre.id; });
    const nombre = ids.length;
    if (!nombre) return ids;

    const jours = Math.round((lundi.getTime() - this.REFERENCE.getTime()) / 86400000);
    const semaines = Math.round(jours / 7);
    const decalage = ((semaines % nombre) + nombre) % nombre;

    return ids.slice(decalage).concat(ids.slice(0, decalage));
  },

  semaine() {
    return this.donnees.semaine;
  },

  debut() {
    return this.depuisISO(this.donnees.semaine.debut);
  },

  fin() {
    const fin = this.debut();
    fin.setDate(fin.getDate() + 6);
    return fin;
  },

  tours() {
    return this.donnees.semaine.tours;
  },

  nombreTours() {
    return Donnees.membres.length;
  },

  membreCourant() {
    const ids = this.donnees.semaine.ordrePassage;
    const id = ids[this.tours().length];
    return id ? Donnees.membreParId(id) : null;
  },

  tachesRestantes() {
    const prises = this.tours().map(function (tour) { return tour.tacheId; });
    return this.taches().filter(function (tache) {
      return prises.indexOf(tache.id) === -1;
    });
  },

  tachesAttribuees() {
    return this.tours().map(function (tour) { return tour.tacheId; });
  },

  tacheDeMembre(membreId) {
    const tour = this.tours().find(function (t) { return t.membreId === membreId; });
    return tour ? this.tacheParId(tour.tacheId) : null;
  },

  semaineComplete() {
    return this.tours().length >= this.nombreTours();
  },

  enregistrerTour(membreId, tacheId) {
    if (this.semaineComplete()) return null;

    const tour = {
      membreId: membreId,
      tacheId: tacheId,
      date: new Date().toISOString()
    };

    this.donnees.semaine.tours.push(tour);
    this.sauver();
    return tour;
  },

  annulerDernierTour() {
    if (!this.tours().length) return null;
    const tour = this.donnees.semaine.tours.pop();
    this.sauver();
    return tour;
  },

  archiverSemaine() {
    const semaine = this.donnees.semaine;
    if (!semaine || !semaine.tours.length) return;

    this.donnees.historique.unshift({
      debut: semaine.debut,
      ordrePassage: semaine.ordrePassage.slice(),
      tours: semaine.tours.slice()
    });

    // On garde les douze dernières semaines, pas plus.
    this.donnees.historique = this.donnees.historique.slice(0, 12);
  },

  reinitialiserSemaine() {
    this.archiverSemaine();
    this.donnees.semaine = this.semaineVierge(this.lundiCible());
    this.sauver();
  }
};
