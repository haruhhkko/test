const taskbar = document.getElementById('taskbar');
const exampleTaskbar = document.getElementById('example-taskbar');
const checkButton = document.getElementById('check-button');
const resultMessage = document.getElementById('result-message');
const levelElement = document.getElementById('current-level');

const ALL_ICONS = ['💻', '📁', '📧', '🛒', '🎮', '🎵', '📸', '📊', '💡', '🚀', '📚', '💬', '⚙️', '🔒', '🌐', '⏰', '📅', '📞', '🔍', '🗑️', '✏️']; // 最大21個の絵文字アイコンのリスト

let draggedItem = null;
let currentLevel = 1;
let initialTouchX = 0;
let initialTouchY = 0;
let initialElementX = 0;
let initialElementY = 0;

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

function initGame() {
    taskbar.innerHTML = '';
    exampleTaskbar.innerHTML = '';
    resultMessage.textContent = '';
    levelElement.textContent = `レベル ${currentLevel}`;

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
}

function addDragAndDropListeners() {
    const taskbarItems = document.querySelectorAll('#taskbar .taskbar-item');
    taskbarItems.forEach(item => {
        // Mouse events
        item.addEventListener('dragstart', (e) => {
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

        // Touch events
        item.addEventListener('touchstart', (e) => {
            e.preventDefault(); // Prevent scrolling
            draggedItem = item;
            item.classList.add('dragging');
            
            const touch = e.touches[0];
            const rect = item.getBoundingClientRect();
            
            initialTouchX = touch.clientX;
            initialTouchY = touch.clientY;
            initialElementX = rect.left;
            initialElementY = rect.top;

            // Create a clone for visual feedback during touch drag
            const clone = item.cloneNode(true);
            clone.style.position = 'fixed';
            clone.style.transform = `translate3d(${initialElementX}px, ${initialElementY}px, 0)`;
            clone.style.width = `${rect.width}px`;
            clone.style.height = `${rect.height}px`;
            clone.style.pointerEvents = 'none'; // So it doesn't interfere with elementFromPoint
            clone.style.zIndex = '1000';
            clone.classList.add('dragging-clone');
            document.body.appendChild(clone);
            draggedItem.style.opacity = '0'; // Hide original item
            draggedItem.clone = clone; // Store clone reference

            console.log('touchstart - original rect:', rect);
            console.log('touchstart - clone transform:', clone.style.transform);
        });

        item.addEventListener('touchmove', (e) => {
            e.preventDefault(); // Prevent scrolling
            if (!draggedItem || !draggedItem.clone) return;

            const touch = e.touches[0];
            const deltaX = touch.clientX - initialTouchX;
            const deltaY = touch.clientY - initialTouchY;

            draggedItem.clone.style.transform = `translate3d(${initialElementX + deltaX}px, ${initialElementY + deltaY}px, 0)`;

            console.log('touchmove - touch clientX, clientY:', touch.clientX, touch.clientY);
            console.log('touchmove - clone transform:', draggedItem.clone.style.transform);

            // Determine the element under the touch
            draggedItem.clone.style.display = 'none'; // Temporarily hide clone to get element underneath
            const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
            draggedItem.clone.style.display = ''; // Show clone again

            if (targetElement && targetElement.classList.contains('taskbar-item') && targetElement !== draggedItem) {
                const afterElement = getDragAfterElement(taskbar, touch.clientX);
                if (afterElement == null) {
                    taskbar.appendChild(draggedItem);
                } else {
                    taskbar.insertBefore(draggedItem, afterElement);
                }
            }
        });

        item.addEventListener('touchend', () => {
            if (!draggedItem) return;
            draggedItem.classList.remove('dragging');
            draggedItem.style.opacity = '1'; // Show original item
            if (draggedItem.clone) {
                draggedItem.clone.remove();
                draggedItem.clone = null;
            }
            draggedItem = null;
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

