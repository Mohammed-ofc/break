/* ==========================================================================
   Cute & Girly 1-Hour Break Calculator Script
   Features: Bulletproof Absolute Target End Timestamp Architecture
             (100% Mobile Background, Screen Lock & App Swap Proof)
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
  let targetEndTimestamp = null; // Absolute timestamp (ms) when 1 hour completes
  let sessionStartTimestamp = null; // Timestamp (ms) when current break segment started
  let timerInterval = null;
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

  // Bulletproof Timer Calculation based on Absolute Target Timestamp
  function recalculateTimer() {
    if (isRunning && targetEndTimestamp) {
      const now = Date.now();
      const remainingMs = targetEndTimestamp - now;
      const remainingSec = Math.max(Math.ceil(remainingMs / 1000), 0);

      secondsRemaining = remainingSec;
      secondsTaken = TOTAL_BREAK_SECONDS - secondsRemaining;

      if (secondsRemaining <= 0) {
        handleAutoResetCompletedBreak();
        return;
      }
    }
    updateUI();
  }

  // Save Current State to LocalStorage
  function saveState() {
    const todayStr = new Date().toDateString();
    localStorage.setItem('break_date', todayStr);
    localStorage.setItem('break_is_running', isRunning ? 'true' : 'false');
    localStorage.setItem('break_seconds_remaining', secondsRemaining.toString());
    
    if (isRunning && targetEndTimestamp) {
      localStorage.setItem('break_target_end_timestamp', targetEndTimestamp.toString());
    } else {
      localStorage.removeItem('break_target_end_timestamp');
    }

    if (isRunning && sessionStartTimestamp) {
      localStorage.setItem('break_session_start_timestamp', sessionStartTimestamp.toString());
    } else {
      localStorage.removeItem('break_session_start_timestamp');
    }

    localStorage.setItem('break_history_all', JSON.stringify(breakLogs));
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
      const savedIsRunning = localStorage.getItem('break_is_running');
      const savedTargetTimestamp = parseInt(localStorage.getItem('break_target_end_timestamp'), 10);
      const savedStartTimestamp = parseInt(localStorage.getItem('break_session_start_timestamp'), 10);
      const savedRemaining = parseInt(localStorage.getItem('break_seconds_remaining'), 10);

      if (savedIsRunning === 'true' && !isNaN(savedTargetTimestamp)) {
        isRunning = true;
        targetEndTimestamp = savedTargetTimestamp;
        sessionStartTimestamp = savedStartTimestamp || (savedTargetTimestamp - TOTAL_BREAK_SECONDS * 1000);

        // Update UI to Green Started state
        toggleBtn.className = 'action-btn started-state';
        btnText.textContent = 'Started';
        btnIcon.textContent = '🌸';
        timerStatusLabel.textContent = 'Enjoying break time... ✨';

        recalculateTimer();
        startTimerLoop();
      } else {
        isRunning = false;
        if (!isNaN(savedRemaining)) {
          secondsRemaining = Math.max(Math.min(savedRemaining, TOTAL_BREAK_SECONDS), 0);
        } else {
          secondsRemaining = TOTAL_BREAK_SECONDS;
        }
        secondsTaken = TOTAL_BREAK_SECONDS - secondsRemaining;
        updateUI();
      }
    } else {
      // New day reset
      localStorage.setItem('break_date', todayStr);
      localStorage.setItem('break_is_running', 'false');
      localStorage.setItem('break_seconds_remaining', TOTAL_BREAK_SECONDS.toString());
      localStorage.removeItem('break_target_end_timestamp');
      localStorage.removeItem('break_session_start_timestamp');

      secondsRemaining = TOTAL_BREAK_SECONDS;
      secondsTaken = 0;
      isRunning = false;
      targetEndTimestamp = null;
      sessionStartTimestamp = null;
      updateUI();
    }
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

  // Start fast high-frequency timer loop for fluid UI tick
  function startTimerLoop() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      recalculateTimer();
    }, 500);
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
      const now = Date.now();
      sessionStartTimestamp = now;
      targetEndTimestamp = now + (secondsRemaining * 1000);

      toggleBtn.className = 'action-btn started-state';
      btnText.textContent = 'Started';
      btnIcon.textContent = '🌸';
      timerStatusLabel.textContent = 'Enjoying break time... ✨';

      triggerHeartsBurst();
      setRandomAffirmation();

      saveState();
      recalculateTimer();
      startTimerLoop();

    } else {
      // PAUSE BREAK TIMER
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
    secondsRemaining = TOTAL_BREAK_SECONDS;
    secondsTaken = 0;
    targetEndTimestamp = null;
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

    recalculateTimer(); // Instant sync before pausing

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = null;
    isRunning = false;

    const startDate = sessionStartTimestamp ? new Date(sessionStartTimestamp) : new Date();
    const durationSeconds = sessionStartTimestamp ? Math.round((Date.now() - sessionStartTimestamp) / 1000) : 0;

    targetEndTimestamp = null;
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
      targetEndTimestamp = null;
      sessionStartTimestamp = null;
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

  // Real-time synchronization events (Mobile unlock, tab switch, app resume, touch start)
  ['visibilitychange', 'focus', 'pageshow', 'touchstart', 'click'].forEach(evt => {
    window.addEventListener(evt, () => {
      if (isRunning) {
        recalculateTimer();
        saveState();
      }
    }, { passive: true });
  });

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
