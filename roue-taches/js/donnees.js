// Données de la roue : les 4 membres et les tâches par défaut.
// Les tâches sont modifiables depuis l'interface (bouton ✏️) et conservées
// dans le navigateur ; cette liste sert de valeur de départ.

const Donnees = {
  version: 2,

  membres: [
    { id: 'alexis', nom: 'Alexis', avatar: '🦊', couleur: '#FF8FA3', couleurTexte: '#D94B69' },
    { id: 'marie-anne', nom: 'Marie-Anne', avatar: '🦋', couleur: '#A78BFA', couleurTexte: '#7A57D1' },
    { id: 'sophie', nom: 'Sophie', avatar: '🐰', couleur: '#5EC8C0', couleurTexte: '#1F8F87' },
    { id: 'maxime', nom: 'Maxime', avatar: '🐻', couleur: '#F5C26B', couleurTexte: '#A96B00' }
  ],

  tachesParDefaut: [
    { id: 'vaisselle', nom: 'Vaisselle', emoji: '🍽️' },
    { id: 'poubelles', nom: 'Poubelles', emoji: '🗑️' },
    { id: 'table', nom: 'Table', emoji: '🪑' },
    { id: 'linge', nom: 'Linge', emoji: '🧺' },
    { id: 'aspirateur', nom: 'Aspirateur', emoji: '🧹' },
    { id: 'salle-de-bain', nom: 'Salle de bain', emoji: '🛁' }
  ],

  // La roue reste lisible entre 5 et 8 parts.
  tachesMinimum: 5,
  tachesMaximum: 8,
  longueurNomMaximum: 24,

  // Une couleur stable par position dans la liste.
  couleursParts: [
    '#FFD8A8',
    '#B9EFE7',
    '#FFC9D6',
    '#CBD8FF',
    '#E3D2FF',
    '#FFF0AE',
    '#D5F0C0',
    '#CFE9F7'
  ],

  membreParId(id) {
    return this.membres.find(function (membre) { return membre.id === id; }) || null;
  },

  tachesParDefautCopie() {
    return this.tachesParDefaut.map(function (tache) {
      return { id: tache.id, nom: tache.nom, emoji: tache.emoji };
    });
  }
};
