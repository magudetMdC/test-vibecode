const UI = {
  showScreen(name) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + name).classList.add('active');
  },

  updateHeader() {
    const s = Game.state;
    if (!s) return;
    document.getElementById('score').textContent = s.score;
    document.getElementById('combo').textContent = s.combo;
    const livesStr = s.mode === 'training' ? '∞' : '❤️'.repeat(Math.max(0, s.lives)) + (s.lives === 0 ? '' : '');
    document.getElementById('lives').textContent = s.mode === 'training' ? '∞' : '❤️'.repeat(s.lives) || '—';
    document.getElementById('level').textContent = s.mode === 'challenge' ? (s.levelIndex + 1) : '—';
  },

  updateTimer(left, max) {
    const fill = document.getElementById('timer-fill');
    if (max <= 0) { fill.style.width = '100%'; fill.style.background = '#4caf50'; return; }
    const pct = Math.max(0, (left / max) * 100);
    fill.style.width = pct + '%';
    fill.style.background = pct < 30 ? '#e53935' : pct < 60 ? '#ffa726' : 'linear-gradient(90deg,#4caf50,#ffa726)';
  },

  renderQuestion(q, mode, timer) {
    document.getElementById('question').textContent = q.a + ' × ' + q.b + ' = ?';
    const area = document.getElementById('answer-area');
    area.innerHTML = '';
    if (mode === 'qcm') {
      const opts = Questions.distractors(q.answer);
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
      input.type = 'number';
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
    document.getElementById('feedback').classList.remove('tip');
    // remove any tip
    const tip = document.querySelector('.tip-inline');
    if (tip) tip.remove();
    Mascot.setMood('idle');
  },

  showFeedback(msg, type) {
    const el = document.getElementById('feedback');
    el.textContent = msg;
    el.className = 'feedback ' + (type || '');
  },

  clearFeedback() {
    this.showFeedback('', '');
  },

  markAnswer(isCorrect, correctAnswer) {
    // highlight qcm buttons
    const area = document.getElementById('answer-area');
    area.querySelectorAll('.answer-btn').forEach(btn => {
      btn.disabled = true;
      const v = Number(btn.dataset.value);
      if (v === correctAnswer) btn.classList.add('correct');
      else if (!isCorrect && btn.classList.contains('chosen')) btn.classList.add('wrong');
    });
    // for input mode, color the input
    const input = document.getElementById('answer-input');
    if (input) {
      input.disabled = true;
      input.style.borderColor = isCorrect ? '#4caf50' : '#e53935';
    }
  },

  showTip(text) {
    const fb = document.getElementById('feedback');
    // append tip below feedback
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
    document.getElementById('mascot-result').innerHTML = document.querySelector('#mascot-game').innerHTML;
    // sync mood class
    const mood = s.correct / Math.max(1, s.total) >= 0.7 ? 'mascot-happy' : 'mascot-sad';
    const mr = document.getElementById('mascot-result');
    mr.classList.remove('mascot-idle','mascot-happy','mascot-sad');
    mr.classList.add(mood);

    document.getElementById('result-title').textContent =
      s.mode === 'challenge' ? (s.lives <= 0 ? 'Partie terminée' : 'Bravo, défi réussi !') : 'Session terminée !';

    const acc = Math.round((s.correct / Math.max(1, s.total)) * 100);
    document.getElementById('result-score').textContent = 'Score : ' + s.score;
    document.getElementById('result-accuracy').textContent = 'Précision : ' + acc + '% (' + s.correct + '/' + s.total + ')';

    // stars
    const stars = Game.stars();
    document.getElementById('stars').textContent = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);

    // session stats table
    const statsEl = document.getElementById('session-stats');
    let html = '<h3>Stats par table</h3><table><tr><th>Table</th><th>Réussite</th></tr>';
    const tables = Object.keys(s.tableStats).map(Number).sort((a,b)=>a-b);
    tables.forEach(t => {
      const st = s.tableStats[t];
      const pct = st.total ? Math.round((st.correct/st.total)*100) : 0;
      html += '<tr><td>Table de ' + t + '</td><td>' + pct + '% (' + st.correct + '/' + st.total + ')</td></tr>';
    });
    html += '</table>';
    statsEl.innerHTML = html;

    // errors list
    const errEl = document.getElementById('errors-list');
    if (s.errors.length) {
      let e = '<h3>À revoir</h3><ul>';
      s.errors.forEach(er => {
        e += '<li>' + er.a + ' × ' + er.b + ' = ' + er.answer + (er.given !== er.answer ? ' (toi : ' + er.given + ')' : '') + '</li>';
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
// mascot init after DOM
document.addEventListener('DOMContentLoaded', () => {
  Mascot.init();
  // populate table select already in game.js
});

// wire buttons
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const a = btn.dataset.action;
      if (a === 'start-training') {
        document.getElementById('training-options').classList.remove('hidden');
      } else if (a === 'launch-training') {
        const t = document.getElementById('table-select').value;
        Game.startTraining(t);
      } else if (a === 'start-challenge') {
        Game.startChallenge();
      } else if (a === 'replay') {
        if (Game.state.mode === 'training') Game.startTraining(Game.state.table);
        else Game.startChallenge();
      } else if (a === 'go-home') {
        UI.showScreen('home');
        Mascot.setMood('idle');
      }
    });
  });
});
// initial header
document.addEventListener('DOMContentLoaded', () => {
  if (Game.state) UI.updateHeader();
});
Mascot.init();
// ensure mascot injected even if DOMContentLoaded fired
setTimeout(() => { if (!document.querySelector('.mascot svg')) Mascot.init(); }, 0);
UI.showScreen('home');
// inject mascot into home container now
Mascot.init();
UI.updateHeader();
