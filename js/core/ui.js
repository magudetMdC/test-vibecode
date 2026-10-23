const UI = {
  showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + name).classList.add('active');
  },

  applyTheme(theme) {
    if (!theme) return;
    document.documentElement.style.setProperty('--theme-color', theme.color || '#6ec6ff');
    document.body.dataset.theme = theme.id;
    const title = document.getElementById('game-theme-title');
    if (title) title.textContent = theme.icon + ' ' + theme.name;
  },

  updateHeader() {
    const s = Game.state;
    if (!s) return;
    document.getElementById('score').textContent = s.score;
    document.getElementById('combo').textContent = s.combo;
    document.getElementById('lives').textContent = s.mode === 'training' ? '∞' : ('❤️'.repeat(s.lives) || '—');
    document.getElementById('level').textContent = s.mode === 'challenge' ? (s.levelIndex + 1) : '—';
  },

  updateTimer(left, max) {
    const fill = document.getElementById('timer-fill');
    if (max <= 0) { fill.style.width = '100%'; fill.style.background = '#4caf50'; return; }
    const pct = Math.max(0, (left / max) * 100);
    fill.style.width = pct + '%';
    fill.style.background = pct < 30 ? '#e53935' : pct < 60 ? '#ffa726' : 'linear-gradient(90deg,#4caf50,#ffa726)';
  },

  renderQuestion(q, mode, timer, theme) {
    const text = (mode === 'input' && q.inputDisplay) ? q.inputDisplay : q.display;
    document.getElementById('question').textContent = text;
    const area = document.getElementById('answer-area');
    area.innerHTML = '';
    if (mode === 'qcm') {
      const opts = (theme.choices ? theme.choices(q) : q.choices) || [];
      opts.forEach(o => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = o;
        btn.dataset.value = o;
        btn.addEventListener('click', () => {
          if (Game.state.busy) return;
          btn.classList.add('chosen');
          Game.answer(o);
        });
        area.appendChild(btn);
      });
    } else {
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'input-answer';
      input.id = 'answer-input';
      input.autofocus = true;
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary submit-btn';
      btn.textContent = 'Valider';
      const submit = () => {
        if (Game.state.busy) return;
        const v = input.value.trim();
        if (v === '') return;
        Game.answer(v);
      };
      btn.addEventListener('click', submit);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') submit(); });
      area.appendChild(input);
      area.appendChild(btn);
      setTimeout(() => input.focus(), 50);
    }
    this.showFeedback('', '');
    const tip = document.querySelector('.tip-inline');
    if (tip) tip.remove();
    Mascot.setMood('idle');
  },

  showFeedback(msg, type) {
    const el = document.getElementById('feedback');
    el.textContent = msg;
    el.className = 'feedback ' + (type || '');
  },

  clearFeedback() { this.showFeedback('', ''); },

  markAnswer(isCorrect, correctAnswer) {
    const area = document.getElementById('answer-area');
    area.querySelectorAll('.answer-btn').forEach(btn => {
      btn.disabled = true;
      const v = btn.dataset.value;
      if (String(v) === String(correctAnswer)) btn.classList.add('correct');
      else if (!isCorrect && btn.classList.contains('chosen')) btn.classList.add('wrong');
    });
    const input = document.getElementById('answer-input');
    if (input) {
      input.disabled = true;
      input.style.borderColor = isCorrect ? '#4caf50' : '#e53935';
    }
  },

  showTip(text) {
    const fb = document.getElementById('feedback');
    let tip = document.querySelector('.tip-inline');
    if (!tip) {
      tip = document.createElement('div');
      tip.className = 'tip tip-inline';
      fb.parentNode.appendChild(tip);
    }
    tip.textContent = '💡 ' + text;
  },

  flashLevel(name) {
    this.showFeedback('Niveau supérieur : ' + name + ' !', 'ok');
  },

  showResult() {
    const s = Game.state;
    Mascot.setMood(s.correct / Math.max(1, s.total) >= 0.7 ? 'happy' : 'sad');
    const mr = document.getElementById('mascot-result');
    mr.innerHTML = document.querySelector('#mascot-game').innerHTML;
    const mood = s.correct / Math.max(1, s.total) >= 0.7 ? 'mascot-happy' : 'mascot-sad';
    mr.classList.remove('mascot-idle','mascot-happy','mascot-sad');
    mr.classList.add(mood);

    document.getElementById('result-title').textContent =
      s.mode === 'challenge' ? (s.lives <= 0 ? 'Partie terminée' : 'Bravo, défi réussi !') : 'Session terminée !';

    const acc = Math.round((s.correct / Math.max(1, s.total)) * 100);
    document.getElementById('result-score').textContent = 'Score : ' + s.score;
    document.getElementById('result-accuracy').textContent = 'Précision : ' + acc + '% (' + s.correct + '/' + s.total + ')';

    const stars = Game.stars();
    document.getElementById('stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

    // stats par compétence
    const statsEl = document.getElementById('session-stats');
    let html = '<h3>Stats par compétence</h3><table><tr><th>Compétence</th><th>Réussite</th></tr>';
    Object.keys(s.stats).sort().forEach(k => {
      const st = s.stats[k];
      const pct = st.total ? Math.round((st.correct/st.total)*100) : 0;
      html += '<tr><td>' + k + '</td><td>' + pct + '% (' + st.correct + '/' + st.total + ')</td></tr>';
    });
    html += '</table>';
    statsEl.innerHTML = html;

    const errEl = document.getElementById('errors-list');
    if (s.errors.length) {
      let e = '<h3>À revoir</h3><ul>';
      s.errors.forEach(er => {
        e += '<li>' + er.display + ' = ' + er.answer + (er.given !== er.answer ? ' (toi : ' + er.given + ')' : '') + '</li>';
      });
      e += '</ul>';
      errEl.innerHTML = e;
    } else {
      errEl.innerHTML = '<p>Aucune erreur, parfait ! 🎉</p>';
    }

    this.showScreen('result');
  }
};

window.UI = UI;
UI.showScreen('home');
Mascot.init();

// raccourcis clavier
document.addEventListener('keydown', (e) => {
  const gameScreen = document.getElementById('screen-game');
  if (!gameScreen || !gameScreen.classList.contains('active')) return;
  if (Game.state && Game.state.busy) return;
  const area = document.getElementById('answer-area');
  if (!area) return;
  // chiffres 1-4 pour QCM
  if (e.key >= '1' && e.key <= '4') {
    const btns = area.querySelectorAll('.answer-btn:not(:disabled)');
    const idx = Number(e.key) - 1;
    if (btns[idx]) {
      btns[idx].classList.add('chosen');
      Game.answer(btns[idx].dataset.value);
    }
  }
});
setTimeout(() => { if (!document.querySelector('.mascot svg')) Mascot.init(); }, 0);
document.addEventListener('DOMContentLoaded', () => { Mascot.init(); });
