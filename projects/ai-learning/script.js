// Sample data storage
let studyContent = '';
let currentInputType = 'url';
let gameData = null;

// Input type switcher
document.querySelectorAll('.input-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.input-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        currentInputType = btn.dataset.type;
        
        document.getElementById('textInput').style.display = 'none';
        document.getElementById('urlInput').style.display = 'none';
        document.getElementById('topicInput').style.display = 'none';
        
        document.getElementById(currentInputType + 'Input').style.display = 'block';
    });
});

// Generate button
document.getElementById('generateBtn').addEventListener('click', () => {
    let content = '';
    
    if (currentInputType === 'url') {
        content = document.getElementById('contentUrl').value;
    } else if (currentInputType === 'text') {
        content = document.getElementById('contentText').value;
    } else if (currentInputType === 'topic') {
        content = document.getElementById('contentTopic').value;
    }
    
    if (!content.trim()) {
        alert('Please provide some content!');
        return;
    }
    
    studyContent = content;
    generateGameData(content);
    
    document.getElementById('uploadSection').style.display = 'none';
    document.getElementById('gameSelection').style.display = 'block';
});

// Generate game data from content
function generateGameData(content) {
    // This is a simplified version. In a real app, you'd use AI/API to generate questions
    // For demo purposes, we'll create sample questions based on the content
    
    gameData = {
        quiz: generateQuizQuestions(content),
        flashcards: generateFlashcards(content),
        matching: generateMatchingPairs(content),
        fill: generateFillInBlank(content)
    };
}

function generateQuizQuestions(content) {
    // Sample quiz generation logic
    const words = content.split(/\s+/).filter(w => w.length > 4);
    const questions = [];
    
    for (let i = 0; i < Math.min(5, words.length); i++) {
        const word = words[Math.floor(Math.random() * words.length)];
        questions.push({
            question: `What is the meaning or context of "${word}" in the study material?`,
            options: [
                `Option A about ${word}`,
                `Option B about ${word}`,
                `Option C about ${word}`,
                `Option D about ${word}`
            ],
            correct: 0,
            explanation: `The correct context relates to how "${word}" is used in your material.`
        });
    }
    
    return questions;
}

function generateFlashcards(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
    const cards = [];
    
    for (let i = 0; i < Math.min(5, sentences.length); i++) {
        const sentence = sentences[i].trim();
        cards.push({
            front: `What does this mean: "${sentence.substring(0, 50)}..."?`,
            back: sentence
        });
    }
    
    return cards;
}

function generateMatchingPairs(content) {
    const words = content.split(/\s+/).filter(w => w.length > 5).slice(0, 6);
    const pairs = [];
    
    words.forEach(word => {
        pairs.push({
            term: word,
            definition: `Definition/context of ${word}`
        });
    });
    
    return pairs;
}

function generateFillInBlank(content) {
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    const questions = [];
    
    for (let i = 0; i < Math.min(5, sentences.length); i++) {
        const sentence = sentences[i].trim();
        const words = sentence.split(/\s+/);
        const blankIndex = Math.floor(words.length / 2);
        const answer = words[blankIndex];
        
        words[blankIndex] = '_____';
        
        questions.push({
            sentence: words.join(' '),
            answer: answer.toLowerCase().replace(/[^a-z0-9]/gi, '')
        });
    }
    
    return questions;
}

// Back to upload
document.getElementById('backToUpload').addEventListener('click', () => {
    document.getElementById('gameSelection').style.display = 'none';
    document.getElementById('uploadSection').style.display = 'block';
});

// Game card clicks
document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
        const gameType = card.dataset.game;
        document.getElementById('gameSelection').style.display = 'none';
        
        if (gameType === 'quiz') {
            startQuizGame();
        } else if (gameType === 'flashcards') {
            startFlashcardsGame();
        } else if (gameType === 'matching') {
            startMatchingGame();
        } else if (gameType === 'fill') {
            startFillGame();
        }
    });
});

// Quiz Game
let currentQuestionIndex = 0;
let quizScore = 0;

function startQuizGame() {
    currentQuestionIndex = 0;
    quizScore = 0;
    document.getElementById('quizGame').style.display = 'block';
    document.getElementById('quizScore').textContent = '0';
    document.getElementById('quizTotal').textContent = gameData.quiz.length;
    showQuestion();
}

function showQuestion() {
    const question = gameData.quiz[currentQuestionIndex];
    document.getElementById('questionNumber').textContent = `Question ${currentQuestionIndex + 1} of ${gameData.quiz.length}`;
    document.getElementById('questionText').textContent = question.question;
    
    const optionsContainer = document.getElementById('options');
    optionsContainer.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => checkAnswer(index);
        optionsContainer.appendChild(btn);
    });
    
    document.getElementById('feedback').classList.remove('show');
    document.getElementById('nextBtn').style.display = 'none';
}

function checkAnswer(selected) {
    const question = gameData.quiz[currentQuestionIndex];
    const buttons = document.querySelectorAll('.option-btn');
    const feedback = document.getElementById('feedback');
    
    buttons.forEach(btn => btn.disabled = true);
    
    if (selected === question.correct) {
        buttons[selected].classList.add('correct');
        feedback.className = 'feedback correct show';
        feedback.textContent = '✓ Correct! ' + question.explanation;
        quizScore++;
        document.getElementById('quizScore').textContent = quizScore;
    } else {
        buttons[selected].classList.add('incorrect');
        buttons[question.correct].classList.add('correct');
        feedback.className = 'feedback incorrect show';
        feedback.textContent = '✗ Not quite. ' + question.explanation;
    }
    
    document.getElementById('nextBtn').style.display = 'block';
}

document.getElementById('nextBtn').addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < gameData.quiz.length) {
        showQuestion();
    } else {
        alert(`Quiz Complete! Your score: ${quizScore}/${gameData.quiz.length}`);
        document.getElementById('quizGame').style.display = 'none';
        document.getElementById('gameSelection').style.display = 'block';
    }
});

document.getElementById('backFromQuiz').addEventListener('click', () => {
    document.getElementById('quizGame').style.display = 'none';
    document.getElementById('gameSelection').style.display = 'block';
});

// Flashcards Game
let currentCardIndex = 0;

function startFlashcardsGame() {
    currentCardIndex = 0;
    document.getElementById('flashcardsGame').style.display = 'block';
    showFlashcard();
}

function showFlashcard() {
    const card = gameData.flashcards[currentCardIndex];
    document.getElementById('cardCounter').textContent = `Card ${currentCardIndex + 1} of ${gameData.flashcards.length}`;
    document.getElementById('flashcardFront').textContent = card.front;
    document.getElementById('flashcardBack').textContent = card.back;
    document.getElementById('flashcard').classList.remove('flipped');
    
    document.getElementById('prevCard').disabled = currentCardIndex === 0;
    document.getElementById('nextCard').disabled = currentCardIndex === gameData.flashcards.length - 1;
}

document.getElementById('flashcard').addEventListener('click', () => {
    document.getElementById('flashcard').classList.toggle('flipped');
});

document.getElementById('prevCard').addEventListener('click', () => {
    if (currentCardIndex > 0) {
        currentCardIndex--;
        showFlashcard();
    }
});

document.getElementById('nextCard').addEventListener('click', () => {
    if (currentCardIndex < gameData.flashcards.length - 1) {
        currentCardIndex++;
        showFlashcard();
    }
});

document.getElementById('backFromFlashcards').addEventListener('click', () => {
    document.getElementById('flashcardsGame').style.display = 'none';
    document.getElementById('gameSelection').style.display = 'block';
});

// Matching Game
let selectedCards = [];
let matchedPairs = 0;

function startMatchingGame() {
    selectedCards = [];
    matchedPairs = 0;
    document.getElementById('matchingGame').style.display = 'block';
    document.getElementById('matchScore').textContent = '0';
    document.getElementById('matchTotal').textContent = gameData.matching.length;
    
    const grid = document.getElementById('matchingGrid');
    grid.innerHTML = '';
    
    // Create shuffled array of terms and definitions
    const items = [];
    gameData.matching.forEach((pair, index) => {
        items.push({ text: pair.term, pairId: index, type: 'term' });
        items.push({ text: pair.definition, pairId: index, type: 'definition' });
    });
    
    // Shuffle
    items.sort(() => Math.random() - 0.5);
    
    items.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'match-card';
        card.textContent = item.text;
        card.dataset.pairId = item.pairId;
        card.dataset.index = index;
        card.onclick = () => selectMatchCard(card, item);
        grid.appendChild(card);
    });
}

function selectMatchCard(card, item) {
    if (card.classList.contains('matched') || selectedCards.includes(card)) return;
    
    if (selectedCards.length < 2) {
        card.classList.add('selected');
        selectedCards.push({ card, item });
        
        if (selectedCards.length === 2) {
            setTimeout(checkMatch, 500);
        }
    }
}

function checkMatch() {
    const [first, second] = selectedCards;
    
    if (first.item.pairId === second.item.pairId) {
        first.card.classList.add('matched');
        second.card.classList.add('matched');
        first.card.classList.remove('selected');
        second.card.classList.remove('selected');
        matchedPairs++;
        document.getElementById('matchScore').textContent = matchedPairs;
        
        if (matchedPairs === gameData.matching.length) {
            setTimeout(() => {
                alert('Congratulations! You matched all pairs!');
            }, 300);
        }
    } else {
        first.card.classList.remove('selected');
        second.card.classList.remove('selected');
    }
    
    selectedCards = [];
}

document.getElementById('backFromMatching').addEventListener('click', () => {
    document.getElementById('matchingGame').style.display = 'none';
    document.getElementById('gameSelection').style.display = 'block';
});

// Fill in the Blank Game
let currentFillIndex = 0;
let fillScore = 0;

function startFillGame() {
    currentFillIndex = 0;
    fillScore = 0;
    document.getElementById('fillGame').style.display = 'block';
    document.getElementById('fillScore').textContent = '0';
    document.getElementById('fillTotal').textContent = gameData.fill.length;
    showFillQuestion();
}

function showFillQuestion() {
    const question = gameData.fill[currentFillIndex];
    document.getElementById('fillNumber').textContent = `Question ${currentFillIndex + 1} of ${gameData.fill.length}`;
    document.getElementById('fillSentence').innerHTML = question.sentence.replace('_____', '<span class="fill-blank">_____</span>');
    document.getElementById('fillInput').value = '';
    document.getElementById('fillInput').disabled = false;
    document.getElementById('fillFeedback').classList.remove('show');
    document.getElementById('nextFillBtn').style.display = 'none';
}

document.getElementById('checkFillBtn').addEventListener('click', () => {
    const answer = document.getElementById('fillInput').value.toLowerCase().trim().replace(/[^a-z0-9]/gi, '');
    const correct = gameData.fill[currentFillIndex].answer;
    const feedback = document.getElementById('fillFeedback');
    
    document.getElementById('fillInput').disabled = true;
    
    if (answer === correct) {
        feedback.className = 'feedback correct show';
        feedback.textContent = '✓ Correct!';
        fillScore++;
        document.getElementById('fillScore').textContent = fillScore;
    } else {
        feedback.className = 'feedback incorrect show';
        feedback.textContent = `✗ The correct answer was: ${correct}`;
    }
    
    document.getElementById('nextFillBtn').style.display = 'block';
});

document.getElementById('nextFillBtn').addEventListener('click', () => {
    currentFillIndex++;
    if (currentFillIndex < gameData.fill.length) {
        showFillQuestion();
    } else {
        alert(`Game Complete! Your score: ${fillScore}/${gameData.fill.length}`);
        document.getElementById('fillGame').style.display = 'none';
        document.getElementById('gameSelection').style.display = 'block';
    }
});

document.getElementById('fillInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('checkFillBtn').click();
    }
});

document.getElementById('backFromFill').addEventListener('click', () => {
    document.getElementById('fillGame').style.display = 'none';
    document.getElementById('gameSelection').style.display = 'block';
});
