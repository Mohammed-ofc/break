/* ==========================================================================
   Cute & Girly 1-Hour Break Calculator Script
   Features: Auto-Reset, Multi-day Table Log, Daily Affirmations & Hearts Burst
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Constants
  const TOTAL_BREAK_SECONDS = 3600; // 1 hour = 60 minutes = 3600 seconds
  const SVG_CIRCUMFERENCE = 596.9; // 2 * PI * 95

  // Empowering & Uplifting Affirmations List
  const AFFIRMATIONS = [
    "You're doing amazing today! Enjoy your well-deserved break ✨",
    "Rest is productive! Take a cozy moment for yourself ☕💖",
    "Take a deep breath and give yourself some love 🌸",
    "You deserve this peaceful break, beautiful! 🎀",
    "Recharge your mind and glow bright 💫",
    "Shine bright, queen! Your break starts now 💖",
    "Pause, relax, and smile! You are doing great 🌷",
    "Self-care is a priority. Enjoy every single minute 💕"
  ];

  // State Variables
  let secondsRemaining = TOTAL_BREAK_SECONDS;
  let secondsTaken = 0;
  let isRunning = false;
  let timerInterval = null;
  let sessionStartTime = null;
  let breakLogs = [];

  // DOM Elements
  const toggleBtn = document.getElementById('toggleBtn');
  const btnText = document.getElementById('btnText');
  const btnIcon = document.getElementById('btnIcon');
  const timerDisplay = document.getElementById('timerDisplay');
  const timerStatusLabel = document.getElementById('timerStatusLabel');
  const progressCircle = document.getElementById('progressCircle');
  const usedTimeDisplay = document.getElementById('usedTimeDisplay');
  const remainingTimeDisplay = document.getElementById('remainingTimeDisplay');
  const resetBtn = document.getElementById('resetBtn');
  const newQuoteBtn = document.getElementById('newQuoteBtn');
  const affirmationText = document.getElementById('affirmationText');
  const historyTableBody = document.getElementById('historyTableBody');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');
  const canvas = document.getElementById('confettiCanvas');

  // Canvas setup for Hearts & Confetti Burst
  const ctx = canvas ? canvas.getContext('2d') : null;
  let particles = [];
  let animationId = null;

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  // Particle Class for Hearts & Sparkles Burst
  class Particle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 16 + 12;
      this.speedX = (Math.random() - 0.5) * 8;
      this.speedY = (Math.random() - 0.7) * 9 - 2;
      this.gravity = 0.2;
      this.opacity = 1;
      this.rotation = Math.random() * 360;
      this.spin = (Math.random() - 0.5) * 6;
      
      const items = ['💖', '🌸', '✨', '🎀', '💕', '⭐'];
      this.char = items[Math.floor(Math.random() * items.length)];
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.speedY += this.gravity;
      this.rotation += this.spin;
      this.opacity -= 0.015;
    }

    draw() {
      if (!ctx || this.opacity <= 0) return;
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate((this.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(this.opacity, 0);
      ctx.font = `${this.size}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.char, 0, 0);
      ctx.restore();
    }
  }

  // Trigger Hearts & Sparkles Burst
  function triggerHeartsBurst() {
    if (!ctx) return;
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight / 2;

    for (let i = 0; i < 40; i++) {
      particles.push(new Particle(startX, startY));
    }

    if (!animationId) {
      animateParticles();
    }
  }

  function animateParticles() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, idx) => {
      p.update();
      p.draw();
      if (p.opacity <= 0) {
        particles.splice(idx, 1);
      }
    });

    if (particles.length > 0) {
      animationId = requestAnimationFrame(animateParticles);
    } else {
      animationId = null;
    }
  }

  // Pick a random new affirmation
  function setRandomAffirmation() {
    const current = affirmationText.textContent;
    let nextQuote = current;
    while (nextQuote === current && AFFIRMATIONS.length > 1) {
      const idx = Math.floor(Math.random() * AFFIRMATIONS.length);
      nextQuote = `"${AFFIRMATIONS[idx]}"`;
    }
    affirmationText.style.opacity = '0';
    setTimeout(() => {
      affirmationText.textContent = nextQuote;
      affirmationText.style.opacity = '1';
    }, 200);
  }

  // Load Saved Data from LocalStorage
  function loadState() {
    const todayStr = new Date().toDateString();
    const savedDate = localStorage.getItem('break_date');
    const savedLogs = localStorage.getItem('break_history_all');

    if (savedLogs) {
      try {
        breakLogs = JSON.parse(savedLogs);
      } catch (e) {
        breakLogs = [];
      }
    }

    if (savedDate === todayStr) {
      const savedSecondsTaken = parseInt(localStorage.getItem('break_seconds_taken'), 10);
      if (!isNaN(savedSecondsTaken)) {
        secondsTaken = Math.min(savedSecondsTaken, TOTAL_BREAK_SECONDS);
        secondsRemaining = Math.max(TOTAL_BREAK_SECONDS - secondsTaken, 0);
      }
    } else {
      localStorage.setItem('break_date', todayStr);
      localStorage.setItem('break_seconds_taken', '0');
      secondsTaken = 0;
      secondsRemaining = TOTAL_BREAK_SECONDS;
    }
    updateUI();
  }

  // Save Current State
  function saveState() {
    const todayStr = new Date().toDateString();
    localStorage.setItem('break_date', todayStr);
    localStorage.setItem('break_seconds_taken', secondsTaken.toString());
    localStorage.setItem('break_history_all', JSON.stringify(breakLogs));
  }

  // Format seconds into MM:SS
  function formatTime(sec) {
    const minutes = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSec.toString().padStart(2, '0')}`;
  }

  // Format seconds into readable text
  function formatMinutesText(sec) {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    if (mins === 0 && secs > 0) return `${secs}s`;
    if (secs === 0) return `${mins} mins`;
    return `${mins}m ${secs}s`;
  }

  function getFormattedDate(d = new Date()) {
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // Update UI Elements
  function updateUI() {
    timerDisplay.textContent = formatTime(secondsRemaining);
    usedTimeDisplay.textContent = formatMinutesText(secondsTaken);
    remainingTimeDisplay.textContent = formatMinutesText(secondsRemaining);

    const fractionRemaining = secondsRemaining / TOTAL_BREAK_SECONDS;
    const strokeDashoffset = SVG_CIRCUMFERENCE * (1 - fractionRemaining);
    progressCircle.style.strokeDashoffset = strokeDashoffset;

    renderHistoryTable();
  }

  // Render Table Logs
  function renderHistoryTable() {
    if (breakLogs.length === 0) {
      historyTableBody.innerHTML = `
        <tr>
          <td colspan="4" class="empty-history">No break recorded yet. Click <strong>"Enjoy"</strong> to start! 🎀</td>
        </tr>
      `;
      return;
    }

    historyTableBody.innerHTML = breakLogs.map((log) => `
      <tr>
        <td><strong>${log.date}</strong></td>
        <td>${log.time}</td>
        <td><strong>${log.duration}</strong></td>
        <td>
          <span class="badge-status ${log.status === 'Completed' ? 'badge-completed' : 'badge-paused'}">
            ${log.status === 'Completed' ? '✅ 1hr Done' : '⏱️ ' + log.status}
          </span>
        </td>
      </tr>
    `).reverse().join('');
  }

  // Toggle Timer Logic
  function toggleTimer() {
    if (!isRunning) {
      // START BREAK TIMER
      isRunning = true;
      sessionStartTime = new Date();

      toggleBtn.className = 'action-btn started-state';
      btnText.textContent = 'Started';
      btnIcon.textContent = '🌸';
      timerStatusLabel.textContent = 'Enjoying break time... ✨';

      // Trigger Hearts Burst Animation & Fresh Affirmation!
      triggerHeartsBurst();
      setRandomAffirmation();

      timerInterval = setInterval(() => {
        if (secondsRemaining > 0) {
          secondsRemaining--;
          secondsTaken++;
          updateUI();
          saveState();
        } else {
          handleAutoResetCompletedBreak();
        }
      }, 1000);

    } else {
      // STOP / PAUSE BREAK TIMER
      stopTimer(false);
    }
  }

  // Handle Automatic Reset when 1 Hour completes
  function handleAutoResetCompletedBreak() {
    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;

    const now = new Date();
    const dateStr = getFormattedDate(now);
    const timeStr = sessionStartTime ? sessionStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    breakLogs.push({
      date: dateStr,
      time: timeStr,
      duration: '60 mins',
      status: 'Completed'
    });

    // Reset timer automatically back to 60:00 for the next break
    secondsRemaining = TOTAL_BREAK_SECONDS;
    secondsTaken = 0;

    toggleBtn.className = 'action-btn enjoy-state';
    btnText.textContent = 'Enjoy';
    btnIcon.textContent = '❤️';
    timerStatusLabel.textContent = '🎉 1 Hour Break Completed! Ready for next break? 💖';

    triggerHeartsBurst();

    saveState();
    updateUI();

    alert("🎉 Yay! Your 1-hour break is complete! The log has been saved and the timer has auto-reset for you. 🌸");
  }

  // Stop / Pause Timer
  function stopTimer(isComplete = false) {
    if (!isRunning) return;

    clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;

    const sessionEndTime = new Date();
    const durationSeconds = sessionStartTime ? Math.round((sessionEndTime - sessionStartTime) / 1000) : 0;

    if (durationSeconds >= 2) {
      const dateStr = getFormattedDate(sessionStartTime || sessionEndTime);
      const timeStr = (sessionStartTime || sessionEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const durationStr = formatMinutesText(durationSeconds);

      breakLogs.push({
        date: dateStr,
        time: timeStr,
        duration: durationStr,
        status: isComplete ? 'Completed' : 'Paused'
      });
    }

    toggleBtn.className = 'action-btn enjoy-state';
    btnText.textContent = 'Enjoy';
    btnIcon.textContent = '❤️';

    if (isComplete) {
      timerStatusLabel.textContent = '✨ 1 Hour Break Completed! 💖';
      triggerHeartsBurst();
    } else {
      timerStatusLabel.textContent = `Paused • ${formatMinutesText(secondsRemaining)} remaining`;
    }

    updateUI();
    saveState();
  }

  // Reset Current Break
  function resetBreak() {
    if (confirm("Reset current break timer back to 60 minutes? 🌸")) {
      if (isRunning) {
        clearInterval(timerInterval);
        isRunning = false;
      }
      secondsRemaining = TOTAL_BREAK_SECONDS;
      secondsTaken = 0;

      toggleBtn.className = 'action-btn enjoy-state';
      btnText.textContent = 'Enjoy';
      btnIcon.textContent = '❤️';
      timerStatusLabel.textContent = 'Ready for your break?';

      saveState();
      updateUI();
    }
  }

  // Clear History Logs
  clearHistoryBtn.addEventListener('click', () => {
    if (breakLogs.length === 0) return;
    if (confirm("Clear all multi-day history logs? 🎀")) {
      breakLogs = [];
      saveState();
      updateUI();
    }
  });

  // Event Listeners
  toggleBtn.addEventListener('click', toggleTimer);
  resetBtn.addEventListener('click', resetBreak);
  newQuoteBtn.addEventListener('click', () => {
    setRandomAffirmation();
    triggerHeartsBurst();
  });

  // Initial Initialization
  loadState();
});
