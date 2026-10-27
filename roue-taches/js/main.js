// Démarrage de la roue et petit mode test (?debug=1).

function demarrerRoueDesTaches() {
  Etat.charger();
  Effets.init();
  Roue.init();
  UI.init();

  UI.majEntete();
  UI.majRoue();
  UI.majPupitre();

  if (!Etat.memoireOk) {
    UI.toast('Mémoire indisponible : la semaine ne sera pas conservée.');
  }

  const parametres = new URLSearchParams(window.location.search);
  if (parametres.get('debug') === '1') {
    activerModeDebug();
  }
}

function activerModeDebug() {
  const panneau = document.createElement('div');
  panneau.className = 'debug';

  const titre = document.createElement('p');
  titre.className = 'debug-titre';
  titre.textContent = 'Mode test';
  panneau.appendChild(titre);

  const boutons = document.createElement('div');
  boutons.className = 'debug-boutons';
  panneau.appendChild(boutons);

  const test = document.createElement('button');
  test.type = 'button';
  test.className = 'debug-test';
  test.textContent = 'Vérifier 2000 arrêts';
  panneau.appendChild(test);

  function rafraichir() {
    boutons.innerHTML = '';
    const restantes = Etat.tachesRestantes();

    if (!restantes.length) {
      const vide = document.createElement('span');
      vide.textContent = 'Aucune tâche libre';
      boutons.appendChild(vide);
      return;
    }

    restantes.forEach(function (tache) {
      const bouton = document.createElement('button');
      bouton.type = 'button';
      bouton.textContent = tache.emoji + ' ' + tache.nom;
      bouton.addEventListener('click', function () {
        UI.forcerProchain(tache.id);
        UI.toast('Prochain tirage forcé : ' + tache.nom);
      });
      boutons.appendChild(bouton);
    });
  }

  function testerArrets() {
    let echecs = 0;
    const total = 6;

    for (let i = 0; i < 2000; i++) {
      const index = Tirage.entier(total);
      const arrivee = Tirage.angleCible(index, total, 0);
      if (Tirage.partSousAiguille(arrivee, total) !== index) {
        echecs++;
      }
    }

    return echecs;
  }

  test.addEventListener('click', function () {
    const echecs = testerArrets();
    UI.toast(echecs === 0
      ? '2000 arrêts vérifiés : aucun décalage.'
      : echecs + ' arrêts hors de la part visée.');
  });

  document.body.appendChild(panneau);

  window.RoueDebug = {
    Etat: Etat,
    Roue: Roue,
    UI: UI,
    Tirage: Tirage,
    rafraichir: rafraichir,
    testerArrets: testerArrets,
    forcer: function (tacheId) { UI.forcerProchain(tacheId); }
  };

  UI.abonner(rafraichir);
  rafraichir();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', demarrerRoueDesTaches);
} else {
  demarrerRoueDesTaches();
}
