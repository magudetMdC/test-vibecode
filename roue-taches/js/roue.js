// Rendu de la roue en SVG et animation de rotation.
// La roue se resserre à chaque tour : on ne dessine que les tâches libres,
// ce qui rend le tirage lisible — tout ce qui est affiché est jouable.

const Roue = {
  CX: 200,
  CY: 200,
  R: 172,
  RAYON_LABEL: 117,

  svg: null,
  groupe: null,
  parties: [],
  rotation: 0,
  enCours: false,
  derniereRotation: 0,

  init() {
    this.svg = document.getElementById('roue');
    this.groupe = document.getElementById('roue-groupe');
    this.rotation = 0;
  },

  // --- Géométrie ----------------------------------------------------------

  point(angle, rayon) {
    const radians = (angle - 90) * Math.PI / 180;
    return {
      x: this.CX + rayon * Math.cos(radians),
      y: this.CY + rayon * Math.sin(radians)
    };
  },

  chemin(a0, a1) {
    const debut = this.point(a0, this.R);
    const fin = this.point(a1, this.R);
    const grandArc = (a1 - a0) > 180 ? 1 : 0;

    return 'M ' + this.CX + ' ' + this.CY +
      ' L ' + debut.x.toFixed(2) + ' ' + debut.y.toFixed(2) +
      ' A ' + this.R + ' ' + this.R + ' 0 ' + grandArc + ' 1 ' +
      fin.x.toFixed(2) + ' ' + fin.y.toFixed(2) + ' Z';
  },

  creer(nom, attributs) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', nom);
    Object.keys(attributs || {}).forEach(function (cle) {
      element.setAttribute(cle, attributs[cle]);
    });
    return element;
  },

  decouperNom(nom) {
    if (nom.length <= 10) return [nom];

    const mots = nom.split(' ');
    if (mots.length === 1) return [nom];

    let meilleur = null;
    for (let i = 1; i < mots.length; i++) {
      const avant = mots.slice(0, i).join(' ');
      const apres = mots.slice(i).join(' ');
      const ecart = Math.abs(avant.length - apres.length);
      if (!meilleur || ecart < meilleur.ecart) {
        meilleur = { avant: avant, apres: apres, ecart: ecart };
      }
    }

    return [meilleur.avant, meilleur.apres];
  },

  // --- Dessin -------------------------------------------------------------

  // items : [{ id, nom, emoji, prise, parMembre }]
  dessiner(items) {
    const groupe = this.groupe;
    groupe.innerHTML = '';
    this.parties = [];

    // Fond blanc et liseré décoratif
    groupe.appendChild(this.creer('circle', {
      cx: this.CX, cy: this.CY, r: 190, fill: '#FFFFFF'
    }));
    groupe.appendChild(this.creer('circle', {
      cx: this.CX, cy: this.CY, r: 189, fill: 'none',
      stroke: '#F4E4D6', 'stroke-width': 2
    }));

    if (!items.length) {
      groupe.appendChild(this.creer('circle', {
        cx: this.CX, cy: this.CY, r: this.R,
        fill: '#F7EDE3', stroke: '#FFFFFF', 'stroke-width': 3
      }));
      const vide = this.creer('text', {
        x: this.CX, y: this.CY - 6,
        'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800,
        fill: '#B3A49B', 'dominant-baseline': 'middle'
      });
      vide.textContent = 'Aucune tâche';
      groupe.appendChild(vide);

      const vide2 = this.creer('text', {
        x: this.CX, y: this.CY + 22,
        'text-anchor': 'middle', 'font-size': 13,
        fill: '#B3A49B', 'dominant-baseline': 'middle'
      });
      vide2.textContent = 'La roue est vide';
      groupe.appendChild(vide2);

      this.majDescription([]);
      return;
    }

    const total = items.length;
    const part = 360 / total;

    items.forEach((item, index) => {
      const a0 = index * part;
      const a1 = a0 + part;
      const couleurPart = item.prise
        ? '#F6EFE8'
        : Etat.couleurDeTache(item.id);

      const couleurAccent = item.prise
        ? (item.couleurMembre || '#A4958C')
        : '#3A2E2A';

      const part3d = this.creer('path', {
        d: this.chemin(a0, a1),
        fill: couleurPart,
        stroke: '#FFFFFF',
        'stroke-width': 3,
        'stroke-linejoin': 'round',
        class: 'part'
      });

      if (item.prise) {
        part3d.setAttribute('opacity', '0.9');
      }

      groupe.appendChild(part3d);
      this.parties.push(part3d);

      this.dessinerEtiquette(item, (a0 + a1) / 2, couleurAccent);
    });

    // Rivets sur les séparations
    for (let i = 0; i < total; i++) {
      const p = this.point(i * part, this.R - 6);
      groupe.appendChild(this.creer('circle', {
        cx: p.x.toFixed(2), cy: p.y.toFixed(2), r: 3.4,
        fill: '#FFFFFF', opacity: 0.85
      }));
    }

    // Cache le point de convergence des parts
    groupe.appendChild(this.creer('circle', {
      cx: this.CX, cy: this.CY, r: 46, fill: '#FFFFFF'
    }));

    this.majDescription(items);
  },

  dessinerEtiquette(item, angle, couleurAccent) {
    const position = this.point(angle, this.RAYON_LABEL);
    const lignes = this.decouperNom(item.nom);
    const teinte = item.prise ? '#A4958C' : '#3A2E2A';
    const estPrise = Boolean(item.prise);

    const bloc = this.creer('g', {
      transform: 'translate(' + position.x.toFixed(2) + ' ' + position.y.toFixed(2) + ')',
      'text-anchor': 'middle',
      'dominant-baseline': 'middle'
    });

    const emoji = this.creer('text', {
      x: 0, y: -30,
      'font-size': estPrise ? 20 : 24,
      opacity: estPrise ? 0.5 : 1
    });
    emoji.textContent = item.emoji;
    bloc.appendChild(emoji);

    lignes.forEach(function (ligne, index) {
      const texte = this.creer('text', {
        x: 0,
        y: -2 + index * 17,
        'font-size': 14.5,
        'font-weight': 800,
        fill: teinte,
        'letter-spacing': '-0.2'
      });
      texte.textContent = ligne;
      bloc.appendChild(texte);
    }, this);

    const sousTitre = item.prise ? '✓ ' + item.parMembre : '';
    if (sousTitre) {
      const texte = this.creer('text', {
        x: 0,
        y: lignes.length === 1 ? 21 : 32,
        'font-size': 11.5,
        'font-weight': 700,
        fill: couleurAccent,
        opacity: 0.95
      });
      texte.textContent = sousTitre;
      bloc.appendChild(texte);
    }

    this.groupe.appendChild(bloc);
  },

  majDescription(items) {
    const titre = document.getElementById('roue-label');
    if (!titre) return;

    if (!items.length) {
      titre.textContent = 'Roue des tâches, vide';
      return;
    }

    titre.textContent = 'Roue des tâches : ' + items.map(function (item) {
      return item.nom + (item.prise ? ' (prise)' : '');
    }).join(', ');
  },

  // --- Animation ----------------------------------------------------------

  tourner(index, total, onFin) {
    if (this.enCours) return;
    this.enCours = true;

    const depart = this.rotation;
    const arrivee = Tirage.angleCible(index, total, depart);
    const duree = Effets.reduireMouvement() ? 420 : 3200;
    const aiguille = document.getElementById('aiguille');
    const debut = performance.now();
    const roue = this;

    function image(maintenant) {
      const progression = Math.min(1, (maintenant - debut) / duree);
      const adouci = 1 - Math.pow(1 - progression, 3.2);

      roue.rotation = depart + (arrivee - depart) * adouci;
      roue.groupe.setAttribute(
        'transform',
        'rotate(' + roue.rotation.toFixed(3) + ' ' + roue.CX + ' ' + roue.CY + ')'
      );

      if (progression < 1) {
        Effets.tic();
      }

      if (progression > 0.86 && aiguille && !aiguille.classList.contains('vibre')) {
        aiguille.classList.add('vibre');
      }

      if (progression < 1) {
        requestAnimationFrame(image);
      } else {
        roue.rotation = arrivee;
        roue.derniereRotation = arrivee;
        roue.enCours = false;

        if (aiguille) {
          setTimeout(function () { aiguille.classList.remove('vibre'); }, 400);
        }

        onFin();
      }
    }

    requestAnimationFrame(image);
  },

  mettreEnAvant(index) {
    const partie = this.parties[index];
    if (!partie) return;
    partie.classList.add('part-gagnante');
  },

  reinitialiser() {
    this.rotation = 0;
    this.derniereRotation = 0;
    if (this.groupe) {
      this.groupe.setAttribute('transform', 'rotate(0 ' + this.CX + ' ' + this.CY + ')');
    }
  }
};
