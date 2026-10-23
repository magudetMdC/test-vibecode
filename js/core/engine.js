// Moteur de jeu générique (multi-thèmes)
const LEVELS = [
  { level: 1, name: 'Découverte', mode: 'qcm', timer: 0, questions: 8 },
  { level: 2, name: 'Entraînement', mode: 'qcm', timer: 0, questions: 10 },
  { level: 3, name: 'Rapide', mode: 'mix', timer: 15, questions: 10 },
  { level: 4, name: 'Expert', mode: 'input', timer: 10, questions: 12 },
  { level: 5, name: 'Champion', mode: 'input', timer: 7, questions: 12 },
];

let currentTheme = null; // module thème actif

const Game = {
  state: null,

  setTheme(theme) { currentTheme = theme; },

  newState(mode) {
    return {
      mode,
      theme: currentTheme,
      levelIndex: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      lives: 3,
      maxLives: 3,
      correct: 0,
      total: 0,
      errors: [],
      stats: {}, // clé compétence -> {correct,total}
      current: null,
      questionCount: 0,
      questionsTarget: 0,
      timerId: null,
      timeLeft: 0,
      timerMax: 0,
      busy: false,
      finished: false,
      table: 'all', // pour multiplication
    };
  },

  startTraining(options) {
    this.state = this.newState('training');
    if (options && options.table) this.state.table = options.table;
    this.state.questionsTarget = 15;
    this.state.lives = Infinity;
    UI.showScreen('game');
    UI.applyTheme(currentTheme);
    UI.updateHeader();
    this.nextQuestion();
  },

  startChallenge() {
    this.state = this.newState('challenge');
    const L = LEVELS[0];
    this.state.questionsTarget = L.questions;
    UI.showScreen('game');
    UI.applyTheme(currentTheme);
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
    // timer seulement en défi
    return this.currentLevel().timer;
  },

  nextQuestion() {
    const s = this.state;
    if (!s || s.finished) return;
    if (s.questionCount >= s.questionsTarget) {
      if (s.mode === 'challenge' && s.levelIndex < LEVELS.length - 1 && s.lives > 0) {
        this.levelUp();
        return;
      }
      this.finish();
      return;
    }
    if (s.lives <= 0) { this.finish(); return; }

    const q = currentTheme.generateQuestion(s);
    s.current = q;
    s.questionCount++;
    s.total++;

    // stats par compétence
    if (!s.stats[q.key]) s.stats[q.key] = { correct: 0, total: 0 };
    s.stats[q.key].total++;

    const mode = this.modeForQuestion();
    const timer = this.timerForQuestion();
    UI.renderQuestion(q, mode, timer, currentTheme);
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
        this.answer(null, true);
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
    if (!s || s.busy || s.finished) return;
    s.busy = true;
    this.clearTimer();

    const q = s.current;
    const isCorrect = (!timeout) && currentTheme.validate(q, given);

    if (!s.stats[q.key]) s.stats[q.key] = { correct: 0, total: 0 };
    if (isCorrect) s.stats[q.key].correct++;

    if (isCorrect) {
      s.correct++;
      s.combo++;
      if (s.combo > s.maxCombo) s.maxCombo = s.combo;
      const bonus = s.timerMax > 0 ? Math.round(s.timeLeft * 2) : 0;
      const points = 10 + s.combo * 2 + bonus;
      s.score += points;
      currentTheme.markRight && currentTheme.markRight(q);
      Mascot.setMood('happy');
      UI.showFeedback('Bravo ! +' + points, 'ok');
    } else {
      s.combo = 0;
      if (s.mode === 'challenge') s.lives = Math.max(0, s.lives - 1);
      currentTheme.markWrong && currentTheme.markWrong(q);
      s.errors.push({ display: q.display, answer: q.answer, given: timeout ? '⏱' : given, hint: currentTheme.hint(q) });
      Mascot.setMood('sad');
      const msg = timeout ? 'Temps écoulé ! La réponse était : ' + q.answer
                         : 'Oups ! La réponse était : ' + q.answer;
      UI.showFeedback(msg, 'ko');
      setTimeout(() => UI.showTip(currentTheme.hint(q)), 400);
    }

    UI.updateHeader();
    UI.markAnswer(isCorrect, q.answer);

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
window.currentTheme = () => currentTheme;
window.setCurrentTheme = (t) => { currentTheme = t; };
