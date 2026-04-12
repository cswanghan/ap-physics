/**
 * AP Physics Practice - Client-side API Layer
 * Mimics Cloudflare Workers API structure using localStorage
 */

const API = {
  // Auth
  async login(username, password) {
    const userStr = localStorage.getItem('physics_user');
    if (!userStr) {
      throw new Error('用户不存在');
    }

    const user = JSON.parse(userStr);
    // For demo: plain text password comparison
    if (user.password !== password) {
      throw new Error('用户名或密码错误');
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token: user.token };
  },

  async register(username, password) {
    const userStr = localStorage.getItem('physics_user');
    if (userStr) {
      const existing = JSON.parse(userStr);
      if (existing.username === username) {
        throw new Error('用户名已存在');
      }
    }

    // Generate simple random token
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);

    const user = {
      id: Date.now(),
      username,
      password, // Plain text for demo
      role: 'user',
      token
    };

    localStorage.setItem('physics_user', JSON.stringify(user));
    localStorage.setItem('physics_token', token);

    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  },

  async logout() {
    localStorage.removeItem('physics_user');
    localStorage.removeItem('physics_token');
    localStorage.removeItem('physics_progress');
    window.user = null;
    return { success: true };
  },

  async getCurrentUser() {
    const userStr = localStorage.getItem('physics_user');
    if (!userStr) {
      return null;
    }

    const user = JSON.parse(userStr);
    const { password: _, ...userWithoutPassword } = user;
    window.user = userWithoutPassword;
    return userWithoutPassword;
  },

  // Quiz
  async submitQuiz(answers, duration, score) {
    const userStr = localStorage.getItem('physics_user');
    if (!userStr) {
      throw new Error('请先登录');
    }

    // answers format: [{q: questionNumber, a: 'C', correct: bool}]
    const historyEntry = {
      id: Date.now(),
      date: new Date().toISOString(),
      score,
      total: 75,
      duration,
      answers
    };

    // Get existing history
    const historyStr = localStorage.getItem('physics_history');
    const history = historyStr ? JSON.parse(historyStr) : [];
    history.unshift(historyEntry); // Add to beginning
    localStorage.setItem('physics_history', JSON.stringify(history));

    // Update wrong answers
    const wrongStr = localStorage.getItem('physics_wrong');
    const wrongAnswers = wrongStr ? JSON.parse(wrongStr) : [];

    // Get correct answers from exam data (loaded separately)
    const examData = window.examData;
    if (examData) {
      answers.forEach(answer => {
        if (!answer.correct) {
          const question = examData.questions.find(q => q.number === answer.q);
          if (question) {
            const wrongEntry = {
              questionId: answer.q,
              userAnswer: answer.a,
              correctAnswer: question.answer,
              year: examData.year,
              timesWrong: 1,
              mastered: false
            };

            // Check if already exists
            const existingIndex = wrongAnswers.findIndex(w => w.questionId === answer.q);
            if (existingIndex >= 0) {
              wrongAnswers[existingIndex].timesWrong += 1;
              wrongAnswers[existingIndex].userAnswer = answer.a;
            } else {
              wrongAnswers.push(wrongEntry);
            }
          }
        }
      });
      localStorage.setItem('physics_wrong', JSON.stringify(wrongAnswers));
    }

    // Clear progress after quiz submission
    localStorage.removeItem('physics_progress');

    return {
      sessionId: historyEntry.id,
      correct: answers.filter(a => a.correct).length,
      total: answers.length,
      score
    };
  },

  async getHistory() {
    const historyStr = localStorage.getItem('physics_history');
    return historyStr ? JSON.parse(historyStr) : [];
  },

  async getWrongAnswers() {
    const wrongStr = localStorage.getItem('physics_wrong');
    return wrongStr ? JSON.parse(wrongStr) : [];
  },

  async markMastered(questionId, mastered) {
    const wrongStr = localStorage.getItem('physics_wrong');
    if (!wrongStr) return;

    const wrongAnswers = JSON.parse(wrongStr);
    const index = wrongAnswers.findIndex(w => w.questionId === questionId);
    if (index >= 0) {
      wrongAnswers[index].mastered = mastered;
      localStorage.setItem('physics_wrong', JSON.stringify(wrongAnswers));
    }
    return { success: true };
  },

  // Progress (save current question index and selected answers as user navigates)
  async saveProgress(year, currentQuestion, answers, duration) {
    const progressStr = localStorage.getItem('physics_progress');
    const progress = progressStr ? JSON.parse(progressStr) : {};
    progress[year] = { currentQuestion, answers, duration };
    localStorage.setItem('physics_progress', JSON.stringify(progress));
    return { success: true };
  },

  async getProgress(year) {
    const progressStr = localStorage.getItem('physics_progress');
    if (!progressStr) return null;
    const progress = JSON.parse(progressStr);
    return progress[year] || null;
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = API;
}
