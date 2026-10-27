# 🎡 Roue des tâches

La roue de la semaine de la famille. Chacun tourne à son tour, et **c'est la roue qui choisit la tâche**.

## Comment ça marche

- **6 tâches par défaut** : 🍽️ Vaisselle · 🗑️ Poubelles · 🪑 Table · 🧺 Linge · 🧹 Aspirateur · 🛁 Salle de bain
- **4 tours** : Alexis, Marie-Anne, Sophie et Maxime tournent chacun une fois
- **Une tâche par personne**, et **une seule personne par tâche** : une tâche tirée quitte la roue
- **Roue honnête** : tirage uniforme parmi les parts encore affichées, sans remise
- **Ordre tournant** : le premier de la semaine passe dernier la semaine suivante
- **Tirage le dimanche soir** : un tirage fait le dimanche prépare la semaine qui commence le lendemain
- Les **tâches non tirées** (2 avec la liste par défaut) sont affichées dans le bilan
- **Les tâches s'éditent dans la page** : liste, emoji et noms se changent depuis le bouton ✏️

## Utilisation

Ouvrir `index.html` dans un navigateur. Aucune installation, aucun compte, aucune connexion.

| Bouton | Effet |
|---|---|
| **TOURNER** | Lance la roue pour la personne dont c'est le tour |
| **↶ Annuler le dernier tour** | Rend la tâche à la roue et revient au tour précédent |
| **🔊 / 🔇** | Coupe ou remet le son |
| **✨ / 💤** | Coupe ou remet les confettis |
| **✏️** | Ouvre l'éditeur des tâches |
| **↺** | Efface la semaine et repart de zéro (avec confirmation) |

La semaine en cours est conservée dans le navigateur (`localStorage`, clé `roue-taches:v1`).
Le lundi suivant, la roue repart automatiquement à zéro : la semaine terminée est archivée.

Les données sont versionnées : une semaine enregistrée par une ancienne version est
reprise telle quelle, sans perdre les tours déjà tirés.

## Éditer les tâches

Le bouton **✏️** ouvre la liste des tâches. On peut :

- changer l'**emoji** et le **nom** de chaque tâche ;
- **ajouter** une tâche (jusqu'à 8) ;
- **supprimer** une tâche, sauf si elle est déjà attribuée cette semaine
  (il faut d'abord annuler son tour).

La roue demande **au moins 5 tâches** : en dessous, les derniers tours seraient forcés
et la roue perdrait son intérêt. Les noms doivent être uniques (sans tenir compte des
majuscules) et faire 24 caractères au maximum.

Les tâches modifiées sont enregistrées immédiatement dans le navigateur et
restent valables les semaines suivantes. Un clic sur **Annuler** ou sur Échap
abandonne les modifications, après confirmation.

## Changer les membres

Les membres sont dans `js/donnees.js` :

```js
membres: [
  { id: 'alexis', nom: 'Alexis', avatar: '🦊', couleur: '#FF8FA3', couleurTexte: '#D94B69' }
]
```

`couleur` sert à la bande de gauche et aux cartes du bilan, `couleurTexte` au texte
(certaines teintes claires seraient illisibles sur fond blanc). Les `id` doivent
rester uniques et ne pas changer une fois la semaine commencée.

La liste de départ des tâches est aussi dans `js/donnees.js` (`tachesParDefaut`) :
elle sert la première fois et après une remise à zéro du stockage. Au-delà, ce sont
les tâches enregistrées dans le navigateur qui font foi.

## Détails techniques

- HTML / CSS / JavaScript vanilla, **aucune dépendance, aucun build**
- Roue dessinée en **SVG** : texte net, parts égales, rotation fluide
- Tirages avec `crypto.getRandomValues` (repli sur `Math.random`)
- Tics et jingle générés en **WebAudio**, confettis en **canvas** : zéro fichier média
- `prefers-reduced-motion` : rotation courte, pas de vibration ni de confettis
- Fonctionne en `file://` : les scripts ne sont pas des modules ES
- Stockage version 2 : la version 1 (sans liste de tâches) est migrée automatiquement

### Mode test

`index.html?debug=1` affiche un panneau pour forcer la prochaine tâche et vérifier
que l'aiguille s'arrête bien dans la part visée (test sur 2000 arrêts).

## Limites connues

- Pas de mode absence : si quelqu'un est absent, on annule son tour ou on échange à la main
- Pas de synchronisation entre appareils : la semaine vit dans le navigateur utilisé
- L'éditeur ne gère pas les membres (ils restent dans `js/donnees.js`)
