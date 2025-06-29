import * as gameLogic from './gameLogic.js';
import * as dragAndDrop from './dragAndDrop.js';

const taskbar = document.getElementById('taskbar');
const exampleTaskbar = document.getElementById('example-taskbar');
const checkButton = document.getElementById('check-button');
const resultMessage = document.getElementById('result-message');
const levelElement = document.getElementById('current-level');
const timeLeftElement = document.getElementById('time-left');

const settingsButton = document.getElementById('settings-button');
const settingsModal = document.getElementById('settings-modal');
const closeButton = document.querySelector('.close-button');
const resetGameButton = document.getElementById('reset-game-button');

// Set elements for gameLogic and dragAndDrop modules
gameLogic.setGameElements({ taskbar, exampleTaskbar, checkButton, resultMessage, levelElement, timeLeftElement });
dragAndDrop.setDragAndDropElements(taskbar);

// Event Listeners
checkButton.addEventListener('click', gameLogic.checkAnswer);

settingsButton.addEventListener('click', () => {
    settingsModal.style.display = 'flex';
});

closeButton.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target == settingsModal) {
        settingsModal.style.display = 'none';
    }
});

resetGameButton.addEventListener('click', () => {
    gameLogic.resetGameToLevel1();
    settingsModal.style.display = 'none';
});

// Initial game setup
document.addEventListener('DOMContentLoaded', () => {
    gameLogic.initGame();
    dragAndDrop.addDragAndDropListeners();
});
