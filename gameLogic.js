import { addDragAndDropListeners, removeDragAndDropListeners } from './dragAndDrop.js';

const ALL_ICONS = ['💻', '📁', '📧', '🛒', '🎮', '🎵', '📸', '📊', '💡', '🚀', '📚', '💬', '⚙️', '🔒', '🌐', '⏰', '📅', '📞', '🔍', '🗑️', '✏️'];
const MAX_LEVEL = 10;

let currentLevel = 1;
let timeLeft = 60;
let timerInterval;

let taskbarElement;
let exampleTaskbarElement;
let checkButtonElement;
let resultMessageElement;
let levelElement;
let timeLeftElement;

export function setGameElements(elements) {
    taskbarElement = elements.taskbar;
    exampleTaskbarElement = elements.exampleTaskbar;
    checkButtonElement = elements.checkButton;
    resultMessageElement = elements.resultMessage;
    levelElement = elements.levelElement;
    timeLeftElement = elements.timeLeftElement;
}

function saveGame() {
    localStorage.setItem('taskbarGameLevel', currentLevel);
}

function loadGame() {
    const savedLevel = localStorage.getItem('taskbarGameLevel');
    if (savedLevel) {
        currentLevel = parseInt(savedLevel, 10);
    }
}

export function startGame() {
    loadGame();
    initGame();
}

export function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

export function createIcon(emoji) {
    const item = document.createElement('div');
    item.className = 'taskbar-item icon'; // Add 'icon' class for styling
    item.textContent = emoji;
    return item;
}

export function startTimer() {
    clearInterval(timerInterval);
    timeLeftElement.textContent = timeLeft;
    timerInterval = setInterval(() => {
        timeLeft--;
        timeLeftElement.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            gameOver();
        }
    }, 1000);
}

export function gameOver() {
    resultMessageElement.textContent = `時間切れ！ゲームオーバー！最終レベル: ${currentLevel}`;
    resultMessageElement.style.color = 'red';
    checkButtonElement.disabled = true;
    removeDragAndDropListeners();
}

export function initGame() {
    taskbarElement.innerHTML = '';
    exampleTaskbarElement.innerHTML = '';
    resultMessageElement.textContent = '';
    levelElement.textContent = `レベル ${currentLevel}`;
    timeLeft = 60;
    startTimer();

    const numIcons = Math.min(3 + (currentLevel - 1) * 2, ALL_ICONS.length);
    const iconsForLevel = shuffle([...ALL_ICONS]).slice(0, numIcons);

    const correctOrder = [...iconsForLevel];
    correctOrder.forEach(emoji => {
        exampleTaskbarElement.appendChild(createIcon(emoji));
    });

    const userOrder = shuffle([...iconsForLevel]);
    userOrder.forEach(emoji => {
        const item = createIcon(emoji);
        taskbarElement.appendChild(item);
    });

    checkButtonElement.disabled = false;
    addDragAndDropListeners();
}

export function checkAnswer() {
    const userOrder = [...taskbarElement.querySelectorAll('.taskbar-item')].map(item => item.textContent);
    const correctOrder = [...exampleTaskbarElement.querySelectorAll('.taskbar-item')].map(item => item.textContent);

    if (JSON.stringify(userOrder) === JSON.stringify(correctOrder)) {
        currentLevel++;
        clearInterval(timerInterval);

        if (currentLevel > MAX_LEVEL) {
            resultMessageElement.textContent = 'ゲームクリア！おめでとうございます！';
            resultMessageElement.style.color = 'blue';
            checkButtonElement.disabled = true;
            removeDragAndDropListeners();
            localStorage.removeItem('taskbarGameLevel');
            return;
        }

        resultMessageElement.textContent = '正解！おめでとう！';
        resultMessageElement.style.color = 'green';
        saveGame();

        setTimeout(() => {
            initGame();
        }, 1500);
    } else {
        resultMessageElement.textContent = '残念！もう一度挑戦！';
        resultMessageElement.style.color = 'red';
    }
}

export function resetGameToLevel1() {
    currentLevel = 1;
    localStorage.removeItem('taskbarGameLevel');
    initGame();
}