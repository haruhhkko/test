const taskbar = document.getElementById('taskbar');
const exampleTaskbar = document.getElementById('example-taskbar');
const checkButton = document.getElementById('check-button');
const resultMessage = document.getElementById('result-message');
const levelElement = document.getElementById('current-level');
const timeLeftElement = document.getElementById('time-left');
const versionDisplayElement = document.getElementById('version-display');

const ALL_ICONS = ['💻', '📁', '📧', '🛒', '🎮', '🎵', '📸', '📊', '💡', '🚀', '📚', '💬', '⚙️', '🔒', '🌐', '⏰', '📅', '📞', '🔍', '🗑️', '✏️']; // 最大21個の絵文字アイコンのリスト

let draggedItem = null;
let currentLevel = 1;

let timeLeft = 60;
let timerInterval;

// Function to load and display the version
async function loadVersion() {
    try {
        const response = await fetch('version.txt');
        const version = await response.text();
        if (versionDisplayElement) {
            versionDisplayElement.textContent = `Version: ${version.trim()}`;
            console.log('Version displayed:', version.trim());
        } else {
            console.error('versionDisplayElement not found in DOM.');
        }
    } catch (error) {
        console.error('Error loading version:', error);
        if (versionDisplayElement) {
            versionDisplayElement.textContent = 'Version: N/A';
        }
    }
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

function createIcon(emoji) {
    const item = document.createElement('div');
    item.className = 'taskbar-item';
    item.textContent = emoji; // テキストとして絵文字を設定
    return item;
}

function startTimer() {
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

function gameOver() {
    resultMessage.textContent = `時間切れ！ゲームオーバー！最終レベル: ${currentLevel}`; 
    resultMessage.style.color = 'red';
    checkButton.disabled = true;
    // Disable drag and drop
    const taskbarItems = document.querySelectorAll('#taskbar .taskbar-item');
    taskbarItems.forEach(item => {
        item.removeEventListener('mousedown', handleDragStartOrTouchStart);
        item.removeEventListener('touchstart', handleDragStartOrTouchStart);
    });
    document.removeEventListener('mousemove', handleDragMoveOrTouchMove);
    document.removeEventListener('touchmove', handleDragMoveOrTouchMove);
    document.removeEventListener('mouseup', handleDragEndOrTouchEnd);
    document.removeEventListener('touchend', handleDragEndOrTouchEnd);
}

function initGame() {
    taskbar.innerHTML = '';
    exampleTaskbar.innerHTML = '';
    resultMessage.textContent = '';
    levelElement.textContent = `レベル ${currentLevel}`;
    timeLeft = 60; // Reset time for new level
    startTimer();

    const numIcons = 3 + (currentLevel - 1) * 2;
    const iconsForLevel = shuffle([...ALL_ICONS]).slice(0, numIcons);

    const correctOrder = shuffle([...iconsForLevel]);
    correctOrder.forEach(emoji => {
        exampleTaskbar.appendChild(createIcon(emoji));
    });

    const userOrder = shuffle([...iconsForLevel]);
    userOrder.forEach(emoji => {
        const item = createIcon(emoji);
        taskbar.appendChild(item);
    });

    addDragAndDropListeners();
    checkButton.disabled = false;
}

function handleDragStartOrTouchStart(e) {
    e.preventDefault(); // Prevent default browser drag/scroll behavior
    draggedItem = this;
    draggedItem.classList.add('dragging');

    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    const rect = draggedItem.getBoundingClientRect();

    draggedItem.dataset.offsetX = clientX - rect.left;
    draggedItem.dataset.offsetY = clientY - rect.top;

    // Create a clone for visual feedback
    const clone = draggedItem.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;
    clone.style.pointerEvents = 'none';
    clone.style.zIndex = '1000';
    clone.classList.add('dragging-clone');
    document.body.appendChild(clone);
    draggedItem.style.opacity = '0';
    draggedItem.clone = clone;

    document.addEventListener('mousemove', handleDragMoveOrTouchMove);
    document.addEventListener('touchmove', handleDragMoveOrTouchMove);
    document.addEventListener('mouseup', handleDragEndOrTouchEnd);
    document.addEventListener('touchend', handleDragEndOrTouchEnd);
}

function handleDragMoveOrTouchMove(e) {
    if (!draggedItem || !draggedItem.clone) return;

    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;

    draggedItem.clone.style.transform = `translate3d(${clientX - draggedItem.dataset.offsetX}px, ${clientY - draggedItem.dataset.offsetY}px, 0)`;

    const targetElement = document.elementFromPoint(clientX, clientY);

    if (targetElement && targetElement.classList.contains('taskbar-item') && targetElement !== draggedItem) {
        const afterElement = getDragAfterElement(taskbar, clientX);
        if (afterElement == null) {
            taskbar.appendChild(draggedItem);
        } else {
            taskbar.insertBefore(draggedItem, afterElement);
        }
    }
}

function handleDragEndOrTouchEnd() {
    if (!draggedItem) return;
    draggedItem.classList.remove('dragging');
    draggedItem.style.opacity = '1';
    if (draggedItem.clone) {
        draggedItem.clone.remove();
        draggedItem.clone = null;
    }
    draggedItem = null;

    document.removeEventListener('mousemove', handleDragMoveOrTouchMove);
    document.removeEventListener('touchmove', handleDragMoveOrTouchMove);
    document.removeEventListener('mouseup', handleDragEndOrTouchEnd);
    document.removeEventListener('touchend', handleDragEndOrTouchEnd);
}

function addDragAndDropListeners() {
    const taskbarItems = document.querySelectorAll('#taskbar .taskbar-item');
    taskbarItems.forEach(item => {
        item.addEventListener('mousedown', handleDragStartOrTouchStart);
        item.addEventListener('touchstart', handleDragStartOrTouchStart);
    });
}

function getDragAfterElement(container, x) {
    const draggableElements = [...container.querySelectorAll('.taskbar-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = x - box.left - box.width / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

checkButton.addEventListener('click', () => {
    const userOrder = [...taskbar.querySelectorAll('.taskbar-item')].map(item => item.textContent);
    const correctOrder = [...exampleTaskbar.querySelectorAll('.taskbar-item')].map(item => item.textContent);

    if (JSON.stringify(userOrder) === JSON.stringify(correctOrder)) {
        resultMessage.textContent = '正解！おめでとう！';
        resultMessage.style.color = 'green';
        currentLevel++;
        clearInterval(timerInterval); // Stop timer on correct answer
        setTimeout(() => {
            initGame();
        }, 1500); // 1.5秒後にリセット
    } else {
        resultMessage.textContent = '残念！もう一度挑戦！';
        resultMessage.style.color = 'red';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    initGame();
    loadVersion();
});

