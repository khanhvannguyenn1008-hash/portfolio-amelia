// Get elements
const dateDisplay = document.getElementById('dateDisplay');
const moodBtns = document.querySelectorAll('.mood-btn');
const entryForm = document.getElementById('entryForm');
const entryText = document.getElementById('entryText');
const saveBtn = document.getElementById('saveBtn');
const entrySaved = document.getElementById('entrySaved');
const editBtn = document.getElementById('editBtn');
const entryHistory = document.getElementById('entryHistory');
const weeklyBtn = document.getElementById('weeklyBtn');
const monthlyBtn = document.getElementById('monthlyBtn');
const yearlyBtn = document.getElementById('yearlyBtn');
const wrappedModal = document.getElementById('wrappedModal');
const closeModal = document.getElementById('closeModal');
const wrappedContent = document.getElementById('wrappedContent');

// Data storage
let entries = JSON.parse(localStorage.getItem('moodEntries')) || [];
let selectedMood = null;

// Mood emoji mapping
const moodEmojis = {
    amazing: '• •\n‿',
    happy: '˘ ˘',
    okay: '• _ •',
    sad: '• ︵ •',
    anxious: '⊙﹏⊙'
};

// Initialize
function init() {
    displayCurrentDate();
    checkTodayEntry();
    renderHistory();
}

// Display current date
function displayCurrentDate() {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = today.toLocaleDateString('en-US', options);
}

// Get today's date string
function getTodayDateString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
}

// Check if today's entry exists
function checkTodayEntry() {
    const today = getTodayDateString();
    const todayEntry = entries.find(entry => entry.date === today);
    
    if (todayEntry) {
        showSavedEntry(todayEntry);
    }
}

// Show saved entry for today
function showSavedEntry(entry) {
    selectedMood = entry.mood;
    
    // Highlight the selected mood
    moodBtns.forEach(btn => {
        if (btn.dataset.mood === entry.mood) {
            btn.classList.add('selected');
        } else {
            btn.classList.remove('selected');
        }
    });
    
    entryForm.style.display = 'none';
    entrySaved.style.display = 'block';
}

// Mood button click
moodBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const today = getTodayDateString();
        const todayEntry = entries.find(entry => entry.date === today);
        
        // Only allow selection if no entry saved today
        if (!todayEntry) {
            selectedMood = btn.dataset.mood;
            
            // Update button states
            moodBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            
            // Show entry form
            entryForm.style.display = 'block';
            entrySaved.style.display = 'none';
        }
    });
});

// Save entry
saveBtn.addEventListener('click', () => {
    if (!selectedMood) {
        alert('Please select a mood first!');
        return;
    }
    
    if (!entryText.value.trim()) {
        alert('Please write something about your day!');
        return;
    }
    
    const today = getTodayDateString();
    const newEntry = {
        date: today,
        mood: selectedMood,
        text: entryText.value.trim(),
        timestamp: new Date().toISOString()
    };
    
    entries.unshift(newEntry);
    localStorage.setItem('moodEntries', JSON.stringify(entries));
    
    // Clear form
    entryText.value = '';
    
    // Show saved state
    entryForm.style.display = 'none';
    entrySaved.style.display = 'block';
    
    // Update history
    renderHistory();
});

// Edit entry
editBtn.addEventListener('click', () => {
    const today = getTodayDateString();
    const todayEntryIndex = entries.findIndex(entry => entry.date === today);
    
    if (todayEntryIndex !== -1) {
        // Load existing entry
        const entry = entries[todayEntryIndex];
        entryText.value = entry.text;
        
        // Remove entry temporarily
        entries.splice(todayEntryIndex, 1);
        localStorage.setItem('moodEntries', JSON.stringify(entries));
        
        // Show form
        entrySaved.style.display = 'none';
        entryForm.style.display = 'block';
        
        renderHistory();
    }
});

// Render history
function renderHistory() {
    if (entries.length === 0) {
        entryHistory.innerHTML = '<div class="history-empty">No entries yet. Start tracking your moods!</div>';
        return;
    }
    
    entryHistory.innerHTML = entries.map(entry => {
        const date = new Date(entry.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
        
        return `
            <div class="history-item">
                <div class="history-header">
                    <span class="history-date">${formattedDate}</span>
                    <span class="history-mood">${moodEmojis[entry.mood]}</span>
                </div>
                <div class="history-text">${entry.text}</div>
            </div>
        `;
    }).join('');
}

// Get date range
function getDateRange(period) {
    const today = new Date();
    let startDate = new Date();
    
    if (period === 'week') {
        startDate.setDate(today.getDate() - 7);
    } else if (period === 'month') {
        startDate.setMonth(today.getMonth() - 1);
    } else if (period === 'year') {
        startDate.setFullYear(today.getFullYear() - 1);
    }
    
    return { startDate, endDate: today };
}

// Filter entries by date range
function filterEntriesByRange(startDate, endDate) {
    return entries.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
    });
}

// Generate wrapped
function generateWrapped(period) {
    const { startDate, endDate } = getDateRange(period);
    const periodEntries = filterEntriesByRange(startDate, endDate);
    
    if (periodEntries.length === 0) {
        wrappedContent.innerHTML = `
            <h2 class="wrapped-title">Something to remember</h2>
            <p style="color: #888; padding: 40px;">No entries found for this period. Keep tracking your moods!</p>
        `;
        wrappedModal.classList.add('active');
        return;
    }
    
    // Calculate statistics
    const moodCounts = {
        amazing: 0,
        happy: 0,
        okay: 0,
        sad: 0,
        anxious: 0
    };
    
    periodEntries.forEach(entry => {
        moodCounts[entry.mood]++;
    });
    
    // Find dominant mood
    const dominantMood = Object.keys(moodCounts).reduce((a, b) => 
        moodCounts[a] > moodCounts[b] ? a : b
    );
    
    // Calculate percentages
    const totalEntries = periodEntries.length;
    const moodPercentages = {};
    Object.keys(moodCounts).forEach(mood => {
        moodPercentages[mood] = ((moodCounts[mood] / totalEntries) * 100).toFixed(1);
    });
    
    // Get top moments (amazing or happy days)
    const topMoments = periodEntries
        .filter(entry => entry.mood === 'amazing' || entry.mood === 'happy')
        .slice(0, 5);
    
    // Period label
    const periodLabel = period === 'week' ? 'This Week' : 
                       period === 'month' ? 'This Month' : 'This Year';
    
    // Generate HTML
    wrappedContent.innerHTML = `
        <h2 class="wrapped-title">${periodLabel} Wrapped</h2>
        
        <div class="wrapped-stats">
            <div class="stat-card">
                <div class="stat-value">${totalEntries}</div>
                <div class="stat-label">Entries</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${moodEmojis[dominantMood]}</div>
                <div class="stat-label">Dominant Mood</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${moodCounts.amazing + moodCounts.happy}</div>
                <div class="stat-label">Good Days</div>
            </div>
        </div>
        
        <div class="mood-breakdown">
            <h3>Your Emotional Palette</h3>
            ${Object.keys(moodCounts).map(mood => `
                <div class="mood-bar-container">
                    <div class="mood-bar-header">
                        <span>${moodEmojis[mood]} ${mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
                        <span>${moodPercentages[mood]}%</span>
                    </div>
                    <div class="mood-bar">
                        <div class="mood-bar-fill" style="width: ${moodPercentages[mood]}%"></div>
                    </div>
                </div>
            `).join('')}
        </div>
        
        ${topMoments.length > 0 ? `
            <div class="top-moments">
                <h3>✨ Moments to Cherish</h3>
                ${topMoments.map(moment => {
                    const date = new Date(moment.date);
                    const formattedDate = date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                    });
                    return `
                        <div class="moment-card">
                            <div class="moment-date">${formattedDate} - ${moodEmojis[moment.mood]}</div>
                            <div class="moment-text">${moment.text}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        ` : ''}
        
        <div class="wrapped-footer">
            Keep tracking your emotions - every feeling matters 💭
        </div>
    `;
    
    wrappedModal.classList.add('active');
}

// Wrapped button listeners
weeklyBtn.addEventListener('click', () => generateWrapped('week'));
monthlyBtn.addEventListener('click', () => generateWrapped('month'));
yearlyBtn.addEventListener('click', () => generateWrapped('year'));

// Close modal
closeModal.addEventListener('click', () => {
    wrappedModal.classList.remove('active');
});

wrappedModal.addEventListener('click', (e) => {
    if (e.target === wrappedModal) {
        wrappedModal.classList.remove('active');
    }
});

// Initialize app
init();
