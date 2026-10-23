// Point d'entrée + hub de thèmes
const ThemeManager = {
  themes: [],
  current: null,
  register(theme) { this.themes.push(theme); },
  get(id) { return this.themes.find(t => t.id === id); },
  setCurrent(theme) { this.current = theme; setCurrentTheme(theme); }
};
window.ThemeManager = ThemeManager;

// enregistrement différé : les modules appellent register() au chargement
// mais ThemeManager doit exister avant. On re-enregistre manuellement ci-dessous après chargement.
// Multiplication est chargée avant app.js, donc déjà register() appelé ? Le module vérifie window.ThemeManager. 
// app.js charge après, donc au moment du module, ThemeManager n'existait pas encore -> pas enregistré.
// On enregistre ici explicitement :
document.addEventListener('DOMContentLoaded', () => {
  if (window.ThemeMultiplication && !ThemeManager.themes.includes(window.ThemeMultiplication)) {
    ThemeManager.register(window.ThemeMultiplication);
  }
  if (window.ThemeOrthographe && !ThemeManager.themes.includes(window.ThemeOrthographe)) {
    ThemeManager.register(window.ThemeOrthographe);
  }
  if (window.ThemeConjugaison && !ThemeManager.themes.includes(window.ThemeConjugaison)) {
    ThemeManager.register(window.ThemeConjugaison);
  }
  if (window.ThemeAnglais && !ThemeManager.themes.includes(window.ThemeAnglais)) {
    ThemeManager.register(window.ThemeAnglais);
  }
  if (window.ThemeLogique && !ThemeManager.themes.includes(window.ThemeLogique)) {
    ThemeManager.register(window.ThemeLogique);
  }
  renderThemeGrid();
});

function renderThemeGrid() {
  const grid = document.getElementById('theme-grid');
  if (!grid) return;
  grid.innerHTML = '';
  ThemeManager.themes.forEach(t => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary theme-card';
    btn.dataset.theme = t.id;
    btn.innerHTML = '<span class="theme-icon">' + t.icon + '</span><br>' + t.name;
    btn.style.background = t.color;
    btn.addEventListener('click', () => selectTheme(t.id));
    grid.appendChild(btn);
  });
  // placeholders pour futurs thèmes
  const placeholders = [];
  placeholders.forEach(p => {
    const btn = document.createElement('button');
    btn.className = 'btn btn-secondary theme-card disabled';
    btn.innerHTML = '<span class="theme-icon">' + p.icon + '</span><br>' + p.name + '<br><small>(bientôt)</small>';
    btn.disabled = true;
    grid.appendChild(btn);
  });
}

function selectTheme(id) {
  const theme = ThemeManager.get(id);
  if (!theme) return;
  ThemeManager.setCurrent(theme);
  document.getElementById('selected-theme-title').textContent = theme.icon + ' ' + theme.name;
  document.getElementById('mode-options').classList.remove('hidden');

  // options d'entraînement spécifiques au thème
  const to = document.getElementById('training-options');
  to.innerHTML = '';
  to.classList.add('hidden');
  if (theme.id === 'multiplication') {
    const label = document.createElement('label');
    label.textContent = 'Table à travailler :';
    label.htmlFor = 'table-select';
    const sel = document.createElement('select');
    sel.id = 'table-select';
    const optAll = document.createElement('option');
    optAll.value = 'all'; optAll.textContent = 'Toutes les tables (1 à 10)';
    sel.appendChild(optAll);
    for (let i = 1; i <= 10; i++) {
      const o = document.createElement('option');
      o.value = i; o.textContent = 'Table de ' + i;
      sel.appendChild(o);
    }
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.dataset.action = 'launch-training';
    btn.textContent = 'Commencer';
    btn.addEventListener('click', () => {
      const sel = document.getElementById('table-select');
      const t = sel ? sel.value : 'all';
      Game.startTraining({ table: t });
    });
    to.appendChild(label);
    to.appendChild(sel);
    to.appendChild(btn);
    // show training options only when start-training clicked; handled below
  }
}

// wire buttons
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = btn.dataset.action;
      if (a === 'start-training') {
        const to = document.getElementById('training-options');
        if (!to.querySelector('button')) {
          // pas d'options spécifiques : démarrage direct
          const theme = ThemeManager.current;
          Game.startTraining({});
          return;
        }
        to.classList.remove('hidden');
      } else if (a === 'launch-training') {
        const sel = document.getElementById('table-select');
        const t = sel ? sel.value : 'all';
        Game.startTraining({ table: t });
      } else if (a === 'start-challenge') {
        Game.startChallenge();
      } else if (a === 'replay') {
        if (Game.state && Game.state.mode === 'training') {
          const t = (Game.state.table !== undefined) ? Game.state.table : 'all';
          Game.startTraining({ table: t });
        } else {
          Game.startChallenge();
        }
      } else if (a === 'go-home') {
        if (Game.state) { Game.clearTimer(); Game.state.finished = true; Game.state = null; }
        UI.showScreen('home');
        Mascot.setMood('idle');
        document.getElementById('mode-options').classList.add('hidden');
        document.getElementById('training-options').classList.add('hidden');
      }
    });
  });
});

// init
document.addEventListener('DOMContentLoaded', () => {
  Mascot.init();
  UI.showScreen('home');
});
console.log('App multi-thèmes prête 🐶');
window.App = { ThemeManager, Game, UI, Mascot };
