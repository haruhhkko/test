const taskbar = document.getElementById('taskbar');
const exampleTaskbar = document.getElementById('example-taskbar');
const checkButton = document.getElementById('check-button');
const resultMessage = document.getElementById('result-message');
const levelElement = document.getElementById('current-level');

const ALL_ICONS = ['💻', '📁', '📧', '🛒', '🎮', '🎵', '📸', '📊', '💡', '🚀', '📚', '💬', '⚙️', '🔒', '🌐', '⏰', '📅', '📞', '🔍', '🗑️', '✏️']; // 最大21個の絵文字アイコンのリスト

let draggedItem = null;
let currentLevel = 1;

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

function createIcon(emoji, draggable) {
    const item = document.createElement('div');
    item.className = 'taskbar-item';
    item.draggable = draggable;
    item.textContent = emoji; // テキストとして絵文字を設定
    return item;
}

function initGame() {
    taskbar.innerHTML = '';
    exampleTaskbar.innerHTML = '';
    resultMessage.textContent = '';
    levelElement.textContent = `レベル ${currentLevel}`;

    const numIcons = 3 + (currentLevel - 1) * 2;
    const iconsForLevel = shuffle([...ALL_ICONS]).slice(0, numIcons);

    const correctOrder = shuffle([...iconsForLevel]);
    correctOrder.forEach(emoji => {
        exampleTaskbar.appendChild(createIcon(emoji, false));
    });

    const userOrder = shuffle([...iconsForLevel]);
    userOrder.forEach(emoji => {
        const item = createIcon(emoji, true);
        taskbar.appendChild(item);
    });

    addDragAndDropListeners();
}

function addDragAndDropListeners() {
    const taskbarItems = document.querySelectorAll('#taskbar .taskbar-item');
    taskbarItems.forEach(item => {
        item.addEventListener('dragstart', () => {
            draggedItem = item;
            setTimeout(() => item.classList.add('dragging'), 0);
        });
        item.addEventListener('dragend', () => {
            setTimeout(() => {
                if (draggedItem) {
                    draggedItem.classList.remove('dragging');
                }
                draggedItem = null;
            }, 0);
        });
    });
}

taskbar.addEventListener('dragover', e => {
    e.preventDefault();
    const afterElement = getDragAfterElement(taskbar, e.clientX);
    if (draggedItem) {
        if (afterElement == null) {
            taskbar.appendChild(draggedItem);
        } else {
            taskbar.insertBefore(draggedItem, afterElement);
        }
    }
});

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
        setTimeout(() => {
            initGame();
        }, 1500); // 1.5秒後にリセット
    } else {
        resultMessage.textContent = '残念！もう一度挑戦！';
        resultMessage.style.color = 'red';
    }
});

initGame();

