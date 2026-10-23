const LEVELS = [
  { level: 1, name: 'Découverte', mode: 'qcm', timer: 0, questions: 8 },
  { level: 2, name: 'Entraînement', mode: 'qcm', timer: 0, questions: 10 },
  { level: 3, name: 'Rapide', mode: 'mix', timer: 15, questions: 10 },
  { level: 4, name: 'Expert', mode: 'input', timer: 10, questions: 12 },
  { level: 5, name: 'Champion', mode: 'input', timer: 7, questions: 12 },
];

const Game = {
  state: null,

  newState(mode, table) {
    return {
      mode,           // 'training' | 'challenge'
      table: table || 'all',
      levelIndex: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      lives: 3,
      maxLives: 3,
      correct: 0,
      total: 0,
      errors: [],
      tableStats: {}, // tableNumber -> {correct,total}
      current: null,
      questionCount: 0,
      questionsTarget: 0,
      timerId: null,
      timeLeft: 0,
      timerMax: 0,
      busy: false,
      finished: false,
    };
  },

  startTraining(table) {
    this.state = this.newState('training', table);
    this.state.questionsTarget = 15;
    this.state.lives = Infinity;
    UI.showScreen('game');
    UI.updateHeader();
    this.nextQuestion();
  },

  startChallenge() {
    this.state = this.newState('challenge', 'all');
    const L = LEVELS[0];
    this.state.questionsTarget = L.questions;
    UI.showScreen('game');
    UI.updateHeader();
    this.nextQuestion();
  },

  currentLevel() {
    if (this.state.mode !== 'challenge') return null;
    return LEVELS[this.state.levelIndex];
  },

  modeForQuestion() {
    if (this.state.mode === 'training') return 'qcm';
    const L = this.currentLevel();
    if (L.mode === 'mix') return Math.random() < 0.5 ? 'qcm' : 'input';
    return L.mode;
  },

  timerForQuestion() {
    if (this.state.mode === 'training') return 0;
    return this.currentLevel().timer;
  },

  nextQuestion() {
    const s = this.state;
    if (s.finished) return;
    if (s.questionCount >= s.questionsTarget) {
      // challenge: next level or finish
      if (s.mode === 'challenge' && s.levelIndex < LEVELS.length - 1 && s.lives > 0) {
        this.levelUp();
        return;
      }
      this.finish();
      return;
    }
    if (s.lives <= 0) { this.finish(); return; }

    const q = Questions.pick(s.table);
    s.current = q;
    s.questionCount++;
    s.total++;
    const mode = this.modeForQuestion();
    const timer = this.timerForQuestion();
    UI.renderQuestion(q, mode, timer);
    this.startTimer(timer);
  },

  levelUp() {
    const s = this.state;
    s.levelIndex++;
    const L = this.currentLevel();
    s.questionsTarget += L.questions;
    UI.flashLevel(L.name);
    UI.updateHeader();
    setTimeout(() => this.nextQuestion(), 1200);
  },

  startTimer(seconds) {
    const s = this.state;
    this.clearTimer();
    s.timeLeft = seconds;
    s.timerMax = seconds;
    UI.updateTimer(seconds, seconds);
    if (seconds <= 0) return;
    s.timerId = setInterval(() => {
      s.timeLeft -= 0.1;
      if (s.timeLeft <= 0) {
        s.timeLeft = 0;
        UI.updateTimer(0, s.timerMax);
        this.clearTimer();
        this.answer(null, true); // timeout
      } else {
        UI.updateTimer(s.timeLeft, s.timerMax);
      }
    }, 100);
  },

  clearTimer() {
    if (this.state && this.state.timerId) {
      clearInterval(this.state.timerId);
      this.state.timerId = null;
    }
  },

  answer(given, timeout = false) {
    const s = this.state;
    if (s.busy || s.finished) return;
    s.busy = true;
    this.clearTimer();

    const q = s.current;
    const correctAnswer = q.answer;
    const isCorrect = (!timeout) && (Number(given) === correctAnswer);

    // stats par table
    const t = q.a <= 10 ? q.a : q.a; // use a as primary table
    // track both a and b? track a
    if (!s.tableStats[q.a]) s.tableStats[q.a] = { correct: 0, total: 0 };
    if (!s.tableStats[q.b]) s.tableStats[q.b] = { correct: 0, total: 0 };
    s.tableStats[q.a].total++;
    s.tableStats[q.b].total++;
    if (isCorrect) {
      s.tableStats[q.a].correct++;
      s.tableStats[q.b].correct++;
    }

    if (isCorrect) {
      s.correct++;
      s.combo++;
      if (s.combo > s.maxCombo) s.maxCombo = s.combo;
      const bonus = s.timerMax > 0 ? Math.round(s.timeLeft * 2) : 0;
      const points = 10 + s.combo * 2 + bonus;
      s.score += points;
      Questions.markRight(q.a, q.b);
      Mascot.setMood('happy');
      UI.showFeedback('Bravo ! +' + points, 'ok');
    } else {
      s.combo = 0;
      if (s.mode === 'challenge') s.lives = Math.max(0, s.lives - 1);
      Questions.markWrong(q.a, q.b);
      s.errors.push({ a: q.a, b: q.b, answer: q.answer, given: timeout ? '⏱' : given });
      Mascot.setMood('sad');
      const msg = timeout ? 'Temps écoulé ! ' + q.a + '×' + q.b + '=' + q.answer
                         : 'Oups ! ' + q.a + '×' + q.b + '=' + q.answer;
      UI.showFeedback(msg, 'ko');
      // astuce
      setTimeout(() => UI.showTip(Questions.tip(q.a, q.b)), 400);
    }

    UI.updateHeader();
    UI.markAnswer(isCorrect, correctAnswer);

    setTimeout(() => {
      s.busy = false;
      Mascot.setMood('idle');
      UI.clearFeedback();
      this.nextQuestion();
    }, isCorrect ? 900 : 1800);
  },

  finish() {
    const s = this.state;
    this.clearTimer();
    s.finished = true;
    Mascot.setMood(s.correct / Math.max(1, s.total) >= 0.7 ? 'happy' : 'sad');
    UI.showResult();
  },

  stars() {
    const s = this.state;
    const acc = s.correct / Math.max(1, s.total);
    if (s.mode === 'training') return acc >= 0.9 ? 3 : acc >= 0.7 ? 2 : 1;
    if (s.lives <= 0) return 1;
    if (acc >= 0.9 && s.maxCombo >= 5) return 3;
    if (acc >= 0.7) return 2;
    return 1;
  }
};

window.Game = Game;
window.LEVELS = LEVELS;
// init table select
document.addEventListener('DOMContentLoaded', () => {
  const sel = document.getElementById('table-select');
  if (sel) {
    for (let i = 1; i <= 10; i++) {
      const o = document.createElement('option');
      o.value = i; o.textContent = 'Table de ' + i;
      sel.appendChild(o);
    }
  }
});
