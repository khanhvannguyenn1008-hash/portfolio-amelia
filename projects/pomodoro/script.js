let timeDisplay = document.getElementById('timeDisplay');
let modeIndicator = document.getElementById('modeIndicator');
let startBtn = document.getElementById('startBtn');
let pauseBtn = document.getElementById('pauseBtn');
let resetBtn = document.getElementById('resetBtn');
let statusText = document.getElementById('statusText');
let bunny = document.getElementById('bunny');
let focusSessionsEl = document.getElementById('focusSessions');
let totalMinutesEl = document.getElementById('totalMinutes');

let currentMode = 'focus';
let timeLeft = 25 * 60; // seconds
let totalTime = 25 * 60;
let timerInterval = null;
let isRunning = false;

// Stats
let focusSessions = 0;
let totalMinutes = 0;

// Load stats from localStorage
if (localStorage.getItem('focusSessions')) {
    focusSessions = parseInt(localStorage.getItem('focusSessions'));
    focusSessionsEl.textContent = focusSessions;
}
if (localStorage.getItem('totalMinutes')) {
    totalMinutes = parseInt(localStorage.getItem('totalMinutes'));
    totalMinutesEl.textContent = totalMinutes;
}

const modeConfig = {
    focus: {
        time: 25 * 60,
        text: 'Focus Time',
        status: 'Focus mode activated',
        bunnyClass: 'studying'
    },
    short: {
        time: 5 * 60,
        text: 'Short Break',
        status: 'Take a quick break',
        bunnyClass: 'resting'
    },
    long: {
        time: 15 * 60,
        text: 'Long Break',
        status: 'Relax and recharge',
        bunnyClass: 'resting'
    }
};

// Mode buttons
document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        if (isRunning) {
            if (!confirm('Timer is running! Switch mode?')) return;
            stopTimer();
        }
        
        document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentMode = btn.dataset.mode;
        const minutes = parseInt(btn.dataset.time);
        timeLeft = minutes * 60;
        totalTime = minutes * 60;
        
        updateDisplay();
        updateBunnyState();
        statusText.textContent = modeConfig[currentMode].status;
        modeIndicator.textContent = modeConfig[currentMode].text;
    });
});

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateBunnyState() {
    bunny.className = 'bunny';
    if (isRunning) {
        bunny.classList.add(modeConfig[currentMode].bunnyClass);
    }
}

function startTimer() {
    isRunning = true;
    startBtn.style.display = 'none';
    pauseBtn.style.display = 'inline-flex';
    updateBunnyState();
    
    timerInterval = setInterval(() => {
        timeLeft--;
        updateDisplay();
        
        if (timeLeft <= 0) {
            completeTimer();
        }
    }, 1000);
}

function stopTimer() {
    isRunning = false;
    clearInterval(timerInterval);
    startBtn.style.display = 'inline-flex';
    pauseBtn.style.display = 'none';
    updateBunnyState();
}

function resetTimer() {
    stopTimer();
    timeLeft = totalTime;
    updateDisplay();
    statusText.textContent = 'Ready to focus?';
}

function completeTimer() {
    stopTimer();
    playCompletionSound();
    
    // Update stats
    if (currentMode === 'focus') {
        focusSessions++;
        focusSessionsEl.textContent = focusSessions;
        localStorage.setItem('focusSessions', focusSessions);
        statusText.textContent = 'Great work! Time for a break';
    } else {
        statusText.textContent = 'Break complete! Ready to focus?';
    }
    
    const minutesCompleted = Math.floor(totalTime / 60);
    totalMinutes += minutesCompleted;
    totalMinutesEl.textContent = totalMinutes;
    localStorage.setItem('totalMinutes', totalMinutes);
    
    // Celebration animation
    bunny.style.animation = 'float 0.5s ease-in-out 3';
    
    // Auto-switch suggestion
    setTimeout(() => {
        const suggestion = currentMode === 'focus' 
            ? 'Switch to break mode?' 
            : 'Ready for another focus session?';
        
        if (confirm(suggestion)) {
            const nextMode = currentMode === 'focus' ? 'short' : 'focus';
            document.querySelector(`[data-mode="${nextMode}"]`).click();
        }
    }, 1000);
}

function playCompletionSound() {
    // Create a simple pleasant bell sound using Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
}

// Event listeners
startBtn.addEventListener('click', startTimer);
pauseBtn.addEventListener('click', stopTimer);
resetBtn.addEventListener('click', resetTimer);

// Initialize
updateDisplay();
modeIndicator.textContent = modeConfig[currentMode].text;

// Prevent accidental page close when timer is running
window.addEventListener('beforeunload', (e) => {
    if (isRunning) {
        e.preventDefault();
        e.returnValue = '';
    }
});
