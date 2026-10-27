// Interface : en-tête, pupitre, liste des attributions et bilan de fin de semaine.

const UI = {
  el: {},
  forcer: null,
  verrou: false,
  minuterieToast: null,
  abonnes: [],
  brouillon: [],
  attribuees: [],
  declencheurEditeur: null,

  init() {
    this.el = {
      semaine: document.getElementById('entete-semaine'),
      badge: document.getElementById('badge-tour'),
      annonce: document.getElementById('annonce'),
      tourner: document.getElementById('btn-tourner'),
      annuler: document.getElementById('btn-annuler'),
      recommencer: document.getElementById('btn-recommencer'),
      son: document.getElementById('btn-son'),
      iconeSon: document.getElementById('icone-son'),
      confettis: document.getElementById('btn-confettis'),
      iconeConfettis: document.getElementById('icone-confettis'),
      liste: document.getElementById('liste-tours'),
      restantes: document.getElementById('restantes'),
      editer: document.getElementById('btn-editer'),
      editeur: document.getElementById('editeur'),
      editeurCarte: document.querySelector('#editeur .editeur'),
      editeurListe: document.getElementById('editeur-liste'),
      editeurMessage: document.getElementById('editeur-message'),
      editeurAjouter: document.getElementById('btn-ajouter-tache'),
      editeurAnnuler: document.getElementById('btn-editeur-annuler'),
      editeurEnregistrer: document.getElementById('btn-editeur-enregistrer'),
      entete: document.querySelector('.entete'),
      plateau: document.querySelector('.plateau'),
      lienEvitement: document.querySelector('.lien-evitement'),
      bilan: document.getElementById('bilan'),
      bilanCarte: document.querySelector('#bilan .bilan'),
      bilanSousTitre: document.getElementById('bilan-sous-titre'),
      bilanGrille: document.getElementById('bilan-grille'),
      bilanNonAttribuees: document.getElementById('bilan-non-attribuees'),
      bilanFermer: document.getElementById('btn-bilan-fermer'),
      bilanNouvelle: document.getElementById('btn-bilan-nouvelle'),
      toast: document.getElementById('toast')
    };

    this.brancher();
    this.majBoutonsEffets();
  },

  brancher() {
    const ui = this;

    this.el.tourner.addEventListener('click', function () { ui.lancerTour(); });
    this.el.annuler.addEventListener('click', function () { ui.annuler(); });
    this.el.recommencer.addEventListener('click', function () { ui.recommencer(); });

    this.el.son.addEventListener('click', function () {
      const actif = Effets.basculerSon();
      ui.majBoutonsEffets();
      ui.toast(actif ? 'Son activé' : 'Son coupé');
    });

    this.el.confettis.addEventListener('click', function () {
      const actif = Effets.basculerConfettis();
      ui.majBoutonsEffets();
      ui.toast(actif ? 'Confettis activés' : 'Confettis coupés');
    });

    this.el.bilanFermer.addEventListener('click', function () { ui.fermerBilan(); });
    this.el.bilanNouvelle.addEventListener('click', function () { ui.recommencer(); });

    this.el.bilan.addEventListener('click', function (evenement) {
      if (evenement.target === ui.el.bilan) ui.fermerBilan();
    });

    this.el.editer.addEventListener('click', function () { ui.ouvrirEditeur(); });
    this.el.editeurAjouter.addEventListener('click', function () { ui.ajouterTache(); });
    this.el.editeurAnnuler.addEventListener('click', function () { ui.fermerEditeur(); });
    this.el.editeurEnregistrer.addEventListener('click', function () { ui.enregistrerEditeur(); });

    this.el.editeur.addEventListener('click', function (evenement) {
      if (evenement.target === ui.el.editeur) ui.fermerEditeur();
    });

    document.addEventListener('keydown', function (evenement) {
      if (evenement.key !== 'Escape') return;

      if (!ui.el.editeur.hidden) {
        ui.fermerEditeur();
      } else if (!ui.el.bilan.hidden) {
        ui.fermerBilan();
      }
    });
  },

  // --- Rendu --------------------------------------------------------------

  majEntete() {
    this.el.semaine.textContent = this.libelleSemaine();

    const total = Etat.nombreTours();
    const faits = Etat.tours().length;
    this.el.badge.textContent = Etat.semaineComplete()
      ? 'Semaine complète'
      : 'Tour ' + (faits + 1) + ' / ' + total;
  },

  libelleSemaine() {
    const debut = Etat.debut();
    const fin = Etat.fin();
    const mois = new Intl.DateTimeFormat('fr-FR', { month: 'long' });

    const jour = function (date) {
      return date.getDate() === 1 ? '1er' : String(date.getDate());
    };

    if (debut.getMonth() === fin.getMonth()) {
      return 'Semaine du ' + jour(debut) + ' au ' + jour(fin) + ' ' +
        mois.format(fin) + ' ' + fin.getFullYear();
    }

    return 'Semaine du ' + jour(debut) + ' ' + mois.format(debut) +
      ' au ' + jour(fin) + ' ' + mois.format(fin) + ' ' + fin.getFullYear();
  },

  majRoue() {
    let items;

    if (Etat.semaineComplete()) {
      // Semaine terminée : on montre les six tâches, les prises marquées.
      items = Etat.taches().map(function (tache) {
        const tour = Etat.tours().find(function (t) { return t.tacheId === tache.id; });
        const membre = tour ? Donnees.membreParId(tour.membreId) : null;

        return {
          id: tache.id,
          nom: tache.nom,
          emoji: tache.emoji,
          prise: Boolean(tour),
          parMembre: membre ? membre.nom : '',
          couleurMembre: membre ? membre.couleurTexte : ''
        };
      });
    } else {
      items = Etat.tachesRestantes().map(function (tache) {
        return {
          id: tache.id,
          nom: tache.nom,
          emoji: tache.emoji,
          prise: false
        };
      });
    }

    Roue.dessiner(items);
    Roue.reinitialiser();

    const svg = document.getElementById('roue');
    if (svg) {
      svg.classList.remove('roue-rendu');
      void svg.offsetWidth; // force le navigateur à rejouer l'animation
      svg.classList.add('roue-rendu');
    }
  },

  majPupitre() {
    const complete = Etat.semaineComplete();
    const membre = Etat.membreCourant();

    this.el.annonce.className = 'annonce';

    if (complete) {
      this.el.annonce.textContent = 'La semaine est répartie ✅';
    } else if (membre) {
      this.el.annonce.innerHTML = 'Au tour de <span class="nom" style="color:' +
        membre.couleurTexte + '">' + this.echapper(membre.avatar + ' ' + membre.nom) + '</span>';
    } else {
      this.el.annonce.textContent = 'Prêt à tourner ?';
    }

    this.el.tourner.disabled = complete || this.verrou || Roue.enCours;
    this.el.annuler.disabled = this.verrou || Roue.enCours || !Etat.tours().length;

    this.rendreListe();
    this.majRestantes();
    this.notifier();
  },

  rendreListe() {
    const ui = this;
    this.el.liste.innerHTML = '';

    Etat.tours().forEach(function (tour) {
      const membre = Donnees.membreParId(tour.membreId);
      const tache = Etat.tacheParId(tour.tacheId);
      if (!membre || !tache) return;

      const ligne = document.createElement('li');
      ligne.className = 'tour';
      ligne.style.setProperty('--couleur-membre', membre.couleur);
      ligne.setAttribute('aria-label', membre.nom + ' : ' + tache.nom);

      ligne.innerHTML =
        '<span class="tour-avatar" aria-hidden="true">' + membre.avatar + '</span>' +
        '<span class="tour-nom">' + ui.echapper(membre.nom) + '</span>' +
        '<span class="tour-fleche" aria-hidden="true">→</span>' +
        '<span class="tour-tache"><span aria-hidden="true">' + tache.emoji + '</span> ' +
        ui.echapper(tache.nom) + '</span>';

      ui.el.liste.appendChild(ligne);
    });
  },

  majRestantes() {
    const restantes = Etat.tachesRestantes();

    if (!restantes.length) {
      this.el.restantes.textContent = 'Toutes les tâches ont trouvé preneur 🎉';
      return;
    }

    const liste = restantes.map(function (tache) {
      return tache.emoji + ' ' + tache.nom;
    }).join(' · ');

    this.el.restantes.textContent = 'Tâches encore libres : ' + liste;
  },

  // --- Déroulement d'un tour ---------------------------------------------

  lancerTour() {
    if (this.verrou || Roue.enCours || Etat.semaineComplete()) return;

    const restantes = Etat.tachesRestantes();
    if (!restantes.length) {
      this.toast('Plus aucune tâche à tirer.');
      return;
    }

    let tache = null;

    if (this.forcer) {
      tache = restantes.find(function (element) { return element.id === this.forcer; }, this) || null;
      this.forcer = null;
    }

    if (!tache) {
      tache = Tirage.choisir(restantes);
    }

    const index = restantes.findIndex(function (element) { return element.id === tache.id; });
    const membre = Etat.membreCourant();

    this.verrou = true;
    this.el.tourner.disabled = true;
    this.el.annuler.disabled = true;
    this.el.annonce.className = 'annonce';
    this.el.annonce.textContent = 'La roue tourne…';

    const ui = this;
    Roue.tourner(index, restantes.length, function () {
      ui.terminerTour(tache, index, membre);
    });
  },

  terminerTour(tache, index, membre) {
    Roue.mettreEnAvant(index);
    Etat.enregistrerTour(membre.id, tache.id);

    Effets.victoire();
    Effets.lancerConfettis();

    this.el.annonce.className = 'annonce annonce-resultat';
    this.el.annonce.innerHTML = membre.avatar + ' <span class="nom" style="color:' +
      membre.couleurTexte + '">' + this.echapper(membre.nom) + '</span> → ' +
      tache.emoji + ' ' + this.echapper(tache.nom);

    this.rendreListe();
    this.majEntete();
    this.el.annuler.disabled = false;

    const ui = this;
    const patiente = Effets.reduireMouvement() ? 800 : 2000;

    setTimeout(function () {
      ui.verrou = false;
      ui.majRoue();

      if (Etat.semaineComplete()) {
        ui.majPupitre();
        ui.afficherBilan();
      } else {
        ui.majPupitre();
      }
    }, patiente);
  },

  annuler() {
    if (Roue.enCours || this.verrou || !Etat.tours().length) return;

    Etat.annulerDernierTour();
    this.fermerBilan();
    this.majEntete();
    this.majRoue();
    this.majPupitre();
    this.toast('Dernier tour annulé.');
  },

  recommencer() {
    if (Etat.tours().length &&
      !window.confirm('Effacer les attributions de cette semaine et recommencer la roue ?')) {
      return;
    }

    Etat.reinitialiserSemaine();
    this.fermerBilan();
    this.majEntete();
    this.majRoue();
    this.majPupitre();
    this.toast('Nouvelle semaine, la roue est prête.');
  },

  // --- Bilan --------------------------------------------------------------

  afficherBilan() {
    const ui = this;

    this.el.bilanSousTitre.textContent = this.libelleSemaine();
    this.el.bilanGrille.innerHTML = '';

    Donnees.membres.forEach(function (membre) {
      const tache = Etat.tacheDeMembre(membre.id);

      const carte = document.createElement('div');
      carte.className = 'bilan-membre';
      carte.style.setProperty('--couleur-membre', membre.couleur);

      carte.innerHTML =
        '<span class="bilan-avatar" aria-hidden="true">' + membre.avatar + '</span>' +
        '<span class="bilan-nom">' + ui.echapper(membre.nom) + '</span>' +
        (tache
          ? '<span class="bilan-tache"><span aria-hidden="true">' + tache.emoji +
            '</span> ' + ui.echapper(tache.nom) + '</span>'
          : '<span class="bilan-tache vide">—</span>');

      ui.el.bilanGrille.appendChild(carte);
    });

    const restantes = Etat.tachesRestantes();
    this.el.bilanNonAttribuees.innerHTML = '';

    if (!restantes.length) {
      const phrase = document.createElement('p');
      phrase.textContent = 'Toutes les tâches ont trouvé preneur 🎉';
      this.el.bilanNonAttribuees.appendChild(phrase);
    } else {
      const intro = document.createElement('span');
      intro.textContent = 'Non attribuées cette semaine :';
      this.el.bilanNonAttribuees.appendChild(intro);

      restantes.forEach(function (tache) {
        const puce = document.createElement('span');
        puce.className = 'puce';
        puce.textContent = tache.emoji + ' ' + tache.nom;
        ui.el.bilanNonAttribuees.appendChild(puce);
      });
    }

    this.el.bilan.hidden = false;
    this.verrouillerPage(true);
    if (this.el.bilanCarte) {
      this.el.bilanCarte.scrollTop = 0;
    }

    try {
      this.el.bilanFermer.focus({ preventScroll: true });
    } catch (erreur) {
      this.el.bilanFermer.focus();
    }
  },

  fermerBilan() {
    if (this.el.bilan.hidden) return;
    this.el.bilan.hidden = true;
    this.verrouillerPage(false);

    if (!this.el.tourner.disabled) {
      this.el.tourner.focus();
    } else {
      this.el.annuler.focus();
    }
  },

  // --- Éditeur de tâches --------------------------------------------------

  ouvrirEditeur() {
    if (Roue.enCours || this.verrou) {
      this.toast('Attends la fin du tour avant de modifier les tâches.');
      return;
    }

    this.brouillon = Etat.taches().map(function (tache) {
      return { id: tache.id, nom: tache.nom, emoji: tache.emoji, nouvelle: false };
    });
    this.attribuees = Etat.tachesAttribuees();
    this.declencheurEditeur = document.activeElement;

    this.afficherMessage('');
    this.rendreEditeur();

    this.el.editeur.hidden = false;
    if (this.el.editeurCarte) {
      this.el.editeurCarte.scrollTop = 0;
    }

    // Le reste de la page ne doit ni se lire ni se cliquer pendant l'édition.
    this.verrouillerPage(true);

    const premier = this.el.editeurListe.querySelector('.champ-nom');
    this.focus(premier || this.el.editeurAnnuler);
  },

  rendreEditeur() {
    const ui = this;
    this.el.editeurListe.innerHTML = '';

    this.brouillon.forEach(function (tache, index) {
      const ligne = document.createElement('li');
      ligne.className = 'ligne-tache';

      const emoji = document.createElement('input');
      emoji.type = 'text';
      emoji.className = 'champ-emoji';
      emoji.value = tache.emoji;
      emoji.maxLength = 4;
      emoji.autocomplete = 'off';
      emoji.setAttribute('aria-label', 'Émoji de la tâche ' + (index + 1));
      emoji.addEventListener('input', function () {
        ui.brouillon[index].emoji = emoji.value;
        ui.effacerErreur();
      });

      const nom = document.createElement('input');
      nom.type = 'text';
      nom.className = 'champ-nom';
      nom.value = tache.nom;
      nom.maxLength = Donnees.longueurNomMaximum;
      nom.autocomplete = 'off';
      nom.placeholder = 'Nom de la tâche';
      nom.setAttribute('aria-label', 'Nom de la tâche ' + (index + 1));
      nom.addEventListener('input', function () {
        ui.brouillon[index].nom = nom.value;
        ui.effacerErreur();
      });
      nom.addEventListener('keydown', function (evenement) {
        if (evenement.key === 'Enter') {
          evenement.preventDefault();
          ui.enregistrerEditeur();
        }
      });

      const prise = ui.attribuees.indexOf(tache.id) !== -1;
      const supprimer = document.createElement('button');
      supprimer.type = 'button';
      supprimer.className = 'btn-supprimer';
      supprimer.innerHTML = '<span aria-hidden="true">✕</span>';
      supprimer.setAttribute('aria-label', 'Supprimer ' + (tache.nom || 'cette tâche'));
      supprimer.disabled = prise || ui.brouillon.length <= Donnees.tachesMinimum;

      if (prise) {
        supprimer.title = 'Tâche déjà attribuée cette semaine';
      } else if (ui.brouillon.length <= Donnees.tachesMinimum) {
        supprimer.title = 'Il faut au moins ' + Donnees.tachesMinimum + ' tâches';
      }

      supprimer.addEventListener('click', function () { ui.supprimerTache(index); });

      ligne.appendChild(emoji);
      ligne.appendChild(nom);
      ligne.appendChild(supprimer);
      ui.el.editeurListe.appendChild(ligne);
    });

    this.majBoutonsEditeur();
  },

  majBoutonsEditeur() {
    const minimum = Donnees.tachesMinimum;
    const maximum = Donnees.tachesMaximum;
    const plein = this.brouillon.length >= maximum;

    this.el.editeurAjouter.disabled = plein;
    this.el.editeurAjouter.textContent = plein
      ? 'Maximum ' + maximum + ' tâches'
      : '+ Ajouter une tâche';

    if (plein) {
      this.afficherMessage('La roue accepte au maximum ' + maximum + ' tâches.');
    } else if (this.brouillon.length <= minimum) {
      this.afficherMessage(
        'Le minimum est de ' + minimum + ' tâches : ajoute-en une pour pouvoir en retirer.'
      );
    } else {
      this.afficherMessage('');
    }
  },

  afficherMessage(texte, erreur) {
    this.el.editeurMessage.textContent = texte || '';
    this.el.editeurMessage.classList.toggle('erreur', Boolean(erreur));
  },

  effacerErreur() {
    if (this.el.editeurMessage.classList.contains('erreur')) {
      this.afficherMessage('');
    }
  },

  ajouterTache() {
    if (this.brouillon.length >= Donnees.tachesMaximum) return;

    this.brouillon.push({ id: '', nom: '', emoji: '🧽', nouvelle: true });
    this.afficherMessage('');
    this.rendreEditeur();

    const champs = this.el.editeurListe.querySelectorAll('.champ-nom');
    this.focus(champs[champs.length - 1]);
  },

  supprimerTache(index) {
    const tache = this.brouillon[index];
    if (!tache) return;

    if (this.attribuees.indexOf(tache.id) !== -1) {
      this.afficherMessage(
        'Cette tâche est déjà attribuée cette semaine : annule son tour avant de la supprimer.',
        true
      );
      return;
    }

    if (this.brouillon.length <= Donnees.tachesMinimum) {
      this.afficherMessage(
        'Il faut au moins ' + Donnees.tachesMinimum + ' tâches pour que la roue reste une roue.',
        true
      );
      return;
    }

    this.brouillon.splice(index, 1);
    this.rendreEditeur();
    this.focus(this.el.editeurListe.querySelector('.champ-nom'));
  },

  // Vérifie le brouillon sans rien enregistrer.
  validerEditeur() {
    const minimum = Donnees.tachesMinimum;
    const maximum = Donnees.tachesMaximum;

    if (this.brouillon.length < minimum) {
      return { ok: false, message: 'Il faut au moins ' + minimum + ' tâches.' };
    }

    if (this.brouillon.length > maximum) {
      return { ok: false, message: 'Le maximum est de ' + maximum + ' tâches.' };
    }

    const noms = this.brouillon.map(function (tache) { return tache.nom.trim(); });

    if (noms.some(function (nom) { return !nom; })) {
      return { ok: false, message: 'Chaque tâche a besoin d\'un nom.' };
    }

    const doublon = noms.find(function (nom, index) {
      return noms.findIndex(function (autre) {
        return autre.toLowerCase() === nom.toLowerCase();
      }) !== index;
    });

    if (doublon) {
      return { ok: false, message: 'Deux tâches portent déjà le nom « ' + doublon + ' ».' };
    }

    return { ok: true, message: '' };
  },

  enregistrerEditeur() {
    const validation = this.validerEditeur();

    if (!validation.ok) {
      this.afficherMessage(validation.message, true);
      this.el.editeurListe.querySelector('.champ-nom').focus();
      return;
    }

    // Les identifiants existants restent stables : les tours de la semaine
    // les référencent. Seules les nouvelles tâches en reçoivent un.
    const idsPris = this.brouillon
      .filter(function (tache) { return !tache.nouvelle && tache.id; })
      .map(function (tache) { return tache.id; });

    const liste = this.brouillon.map(function (tache) {
      let id = tache.id;

      if (tache.nouvelle || !id) {
        id = Etat.idTacheLibre(tache.nom, idsPris);
        idsPris.push(id);
      }

      return { id: id, nom: tache.nom, emoji: tache.emoji };
    });

    Etat.definirTaches(liste);
    this.fermerEditeur(true);

    this.majEntete();
    this.majRoue();
    this.majPupitre();
    this.toast('Les tâches de la roue sont enregistrées.');
  },

  fermerEditeur(sansConfirmation) {
    if (this.el.editeur.hidden) return;

    if (!sansConfirmation && this.estModifie() &&
      !window.confirm('Abandonner les modifications des tâches ?')) {
      return;
    }

    this.el.editeur.hidden = true;
    this.afficherMessage('');
    this.brouillon = [];

    this.verrouillerPage(false);

    const cible = this.declencheurEditeur &&
      this.declencheurEditeur !== document.body &&
      document.contains(this.declencheurEditeur)
      ? this.declencheurEditeur
      : this.el.editer;

    if (cible) this.focus(cible);
  },

  estModifie() {
    const actuel = Etat.taches().map(function (tache) {
      return tache.nom + '\u0001' + tache.emoji;
    });

    const brouillon = this.brouillon.map(function (tache) {
      return tache.nom.trim() + '\u0001' + tache.emoji;
    });

    return actuel.length !== brouillon.length ||
      actuel.some(function (valeur, index) { return valeur !== brouillon[index]; });
  },

  focus(element) {
    if (!element) return;

    try {
      element.focus({ preventScroll: true });
    } catch (erreur) {
      element.focus();
    }
  },

  // --- Divers -------------------------------------------------------------

  majBoutonsEffets() {
    this.el.son.setAttribute('aria-pressed', String(!Effets.muet));
    this.el.iconeSon.textContent = Effets.muet ? '🔇' : '🔊';
    this.el.son.title = Effets.muet ? 'Activer le son' : 'Couper le son';

    this.el.confettis.setAttribute('aria-pressed', String(Effets.confettisActifs));
    this.el.iconeConfettis.textContent = Effets.confettisActifs ? '✨' : '💤';
    this.el.confettis.title = Effets.confettisActifs
      ? 'Couper les confettis'
      : 'Activer les confettis';
  },

  forcerProchain(tacheId) {
    this.forcer = tacheId;
  },

  // Rend la page derrière un dialogue inerte (lecture et clavier).
  verrouillerPage(actif) {
    const elements = [this.el.entete, this.el.plateau, this.el.lienEvitement];

    elements.forEach(function (element) {
      if (!element) return;

      if (actif) {
        element.setAttribute('inert', '');
      } else {
        element.removeAttribute('inert');
      }
    });
  },

  abonner(fonction) {
    if (typeof fonction === 'function') {
      this.abonnes.push(fonction);
    }
  },

  notifier() {
    this.abonnes.forEach(function (fonction) {
      fonction();
    });
  },

  toast(message) {
    const ui = this;
    this.el.toast.textContent = message;
    this.el.toast.classList.add('visible');

    clearTimeout(this.minuterieToast);
    this.minuterieToast = setTimeout(function () {
      ui.el.toast.classList.remove('visible');
    }, 2200);
  },

  echapper(texte) {
    return String(texte).replace(/[&<>"']/g, function (caractere) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[caractere];
    });
  }
};
