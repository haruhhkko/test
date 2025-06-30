
import { addDragAndDropListeners, removeDragAndDropListeners } from './dragAndDrop.js';
const ALL_ICONS = ['💻', '📁', '📧', '🛒', '🎮', '🎵', '📸', '📊', '💡', '🚀', '📚', '💬', '⚙️', '🔒', '🌐', '⏰', '📅', '📞', '🔍', '🗑️', '✏️']; // 最大21個の絵文字アイコンのリスト

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
    item.className = 'taskbar-item';
    item.textContent = emoji; // テキストとして絵文字を設定
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
    timeLeft = 60; // Reset time for new level
    startTimer();

    const numIcons = 3 + (currentLevel - 1) * 2;
    const iconsForLevel = shuffle([...ALL_ICONS]).slice(0, numIcons);

    const correctOrder = shuffle([...iconsForLevel]);
    correctOrder.forEach(emoji => {
        exampleTaskbarElement.appendChild(createIcon(emoji));
    });

    const userOrder = shuffle([...iconsForLevel]);
    userOrder.forEach(emoji => {
        const item = createIcon(emoji);
        taskbarElement.appendChild(item);
    });

    checkButtonElement.disabled = false;
    // 新しく生成されたアイコンにD&Dイベントリスナーを再度追加します
    addDragAndDropListeners();
}

export function checkAnswer() {
    const userOrder = [...taskbarElement.querySelectorAll('.taskbar-item')].map(item => item.textContent);
    const correctOrder = [...exampleTaskbarElement.querySelectorAll('.taskbar-item')].map(item => item.textContent);

    if (JSON.stringify(userOrder) === JSON.stringify(correctOrder)) {
        resultMessageElement.textContent = '正解！おめでとう！';
        resultMessageElement.style.color = 'green';
        currentLevel++;
        clearInterval(timerInterval); // Stop timer on correct answer
        setTimeout(() => {
            initGame();
        }, 1500); // 1.5秒後にリセット
    } else {
        resultMessageElement.textContent = '残念！もう一度挑戦！';
        resultMessageElement.style.color = 'red';
    }
}

export function resetGameToLevel1() {
    currentLevel = 1;
    initGame();
}
