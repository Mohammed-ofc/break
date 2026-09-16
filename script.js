/* ==========================================================================
   Cute & Girly 1-Hour Break Calculator Script
   Features: Real-time Timestamp Tracking (100% Background/Mobile Screen Lock Proof),
             Auto-Reset, Multi-day Table Log, Daily Affirmations & Hearts Burst
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
  let baseSecondsTaken = 0; // Accumulated seconds from previous segments
  let secondsTaken = 0;     // Current total seconds taken today
  let secondsRemaining = TOTAL_BREAK_SECONDS;
  let isRunning = false;
  let timerInterval = null;
  let sessionStartTimestamp = null; // Date.now() timestamp when current active break segment started
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

  // Recalculate exact seconds elapsed using real Date timestamps (Background & Lock Screen Safe!)
  function recalculateTimer() {
    if (isRunning && sessionStartTimestamp) {
      const now = Date.now();
      const elapsedSec = Math.floor((now - sessionStartTimestamp) / 1000);
      secondsTaken = Math.min(baseSecondsTaken + elapsedSec, TOTAL_BREAK_SECONDS);
      secondsRemaining = Math.max(TOTAL_BREAK_SECONDS - secondsTaken, 0);

      if (secondsRemaining <= 0) {
        handleAutoResetCompletedBreak();
        return;
      }
    } else {
      secondsTaken = Math.min(baseSecondsTaken, TOTAL_BREAK_SECONDS);
      secondsRemaining = Math.max(TOTAL_BREAK_SECONDS - secondsTaken, 0);
    }
    updateUI();
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
      const savedBaseTaken = parseInt(localStorage.getItem('break_base_seconds_taken'), 10);
      if (!isNaN(savedBaseTaken)) {
        baseSecondsTaken = Math.min(savedBaseTaken, TOTAL_BREAK_SECONDS);
      }

      const savedIsRunning = localStorage.getItem('break_is_running');
      const savedStartTimestamp = parseInt(localStorage.getItem('break_start_timestamp'), 10);

      if (savedIsRunning === 'true' && !isNaN(savedStartTimestamp)) {
        isRunning = true;
        sessionStartTimestamp = savedStartTimestamp;
        
        // Restore Green "Started" State UI
        toggleBtn.className = 'action-btn started-state';
        btnText.textContent = 'Started';
        btnIcon.textContent = '🌸';
        timerStatusLabel.textContent = 'Enjoying break time... ✨';

        recalculateTimer();
        startTimerInterval();
      } else {
        recalculateTimer();
      }
    } else {
      // Reset daily timer for new day
      localStorage.setItem('break_date', todayStr);
      localStorage.setItem('break_base_seconds_taken', '0');
      localStorage.setItem('break_is_running', 'false');
      localStorage.removeItem('break_start_timestamp');

      baseSecondsTaken = 0;
      secondsTaken = 0;
      secondsRemaining = TOTAL_BREAK_SECONDS;
      isRunning = false;
      updateUI();
    }
  }

  // Save Current State to LocalStorage
  function saveState() {
    const todayStr = new Date().toDateString();
    localStorage.setItem('break_date', todayStr);
    localStorage.setItem('break_base_seconds_taken', baseSecondsTaken.toString());
    localStorage.setItem('break_is_running', isRunning ? 'true' : 'false');
    if (isRunning && sessionStartTimestamp) {
      localStorage.setItem('break_start_timestamp', sessionStartTimestamp.toString());
    } else {
      localStorage.removeItem('break_start_timestamp');
    }
    localStorage.setItem('break_history_all', JSON.stringify(breakLogs));
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

  // Start Interval for real-time UI ticks
  function startTimerInterval() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      recalculateTimer();
      saveState();
    }, 1000);
  }

  // Toggle Timer Logic
  function toggleTimer() {
    if (!isRunning) {
      // START BREAK TIMER
      if (secondsRemaining <= 0) {
        alert("🎉 You've enjoyed your full 1 hour break for today!");
        return;
      }

      isRunning = true;
      sessionStartTimestamp = Date.now();

      toggleBtn.className = 'action-btn started-state';
      btnText.textContent = 'Started';
      btnIcon.textContent = '🌸';
      timerStatusLabel.textContent = 'Enjoying break time... ✨';

      triggerHeartsBurst();
      setRandomAffirmation();

      startTimerInterval();
      saveState();
      recalculateTimer();

    } else {
      // STOP / PAUSE BREAK TIMER
      stopTimer(false);
    }
  }

  // Handle Automatic Reset when 1 Hour completes
  function handleAutoResetCompletedBreak() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;

    const startDate = sessionStartTimestamp ? new Date(sessionStartTimestamp) : new Date();
    const dateStr = getFormattedDate(startDate);
    const timeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    breakLogs.push({
      date: dateStr,
      time: timeStr,
      duration: '60 mins',
      status: 'Completed'
    });

    // Reset timer back to 60 mins for next break
    baseSecondsTaken = 0;
    secondsTaken = 0;
    secondsRemaining = TOTAL_BREAK_SECONDS;
    sessionStartTimestamp = null;

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

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;

    const now = Date.now();
    const durationSeconds = sessionStartTimestamp ? Math.round((now - sessionStartTimestamp) / 1000) : 0;
    const startDate = sessionStartTimestamp ? new Date(sessionStartTimestamp) : new Date();

    baseSecondsTaken = Math.min(baseSecondsTaken + durationSeconds, TOTAL_BREAK_SECONDS);
    secondsTaken = baseSecondsTaken;
    secondsRemaining = Math.max(TOTAL_BREAK_SECONDS - secondsTaken, 0);
    isRunning = false;
    sessionStartTimestamp = null;

    if (durationSeconds >= 2) {
      const dateStr = getFormattedDate(startDate);
      const timeStr = startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

    saveState();
    updateUI();
  }

  // Reset Current Break
  function resetBreak() {
    if (confirm("Reset current break timer back to 60 minutes? 🌸")) {
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = null;
      isRunning = false;
      sessionStartTimestamp = null;
      baseSecondsTaken = 0;
      secondsTaken = 0;
      secondsRemaining = TOTAL_BREAK_SECONDS;

      toggleBtn.className = 'action-btn enjoy-state';
      btnText.textContent = 'Enjoy';
      btnIcon.textContent = '❤️';
      timerStatusLabel.textContent = 'Ready for your break?';

      saveState();
      updateUI();
    }
  }

  // Recalculate on Mobile Visibility Change / Tab Resume / App Focus
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      recalculateTimer();
    }
  });
  window.addEventListener('focus', recalculateTimer);
  window.addEventListener('pageshow', recalculateTimer);

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
