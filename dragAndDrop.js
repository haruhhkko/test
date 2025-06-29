let draggedItem = null;
let initialTouchX = 0;
let initialTouchY = 0;
let initialElementX = 0;
let initialElementY = 0;

let taskbarElement;

export function setDragAndDropElements(taskbar) {
    taskbarElement = taskbar;
}

export function addDragAndDropListeners() {
    const taskbarItems = taskbarElement.querySelectorAll('.taskbar-item');
    taskbarItems.forEach(item => {
        item.addEventListener('mousedown', handleDragStartOrTouchStart);
        item.addEventListener('touchstart', handleDragStartOrTouchStart);
    });
}

export function removeDragAndDropListeners() {
    const taskbarItems = taskbarElement.querySelectorAll('.taskbar-item');
    taskbarItems.forEach(item => {
        item.removeEventListener('mousedown', handleDragStartOrTouchStart);
        item.removeEventListener('touchstart', handleDragStartOrTouchStart);
    });
}

function handleDragStartOrTouchStart(e) {
    e.preventDefault(); // Prevent default browser drag/scroll behavior
    draggedItem = this;
    draggedItem.classList.add('dragging');

    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    const rect = draggedItem.getBoundingClientRect();

    initialTouchX = clientX;
    initialTouchY = clientY;
    initialElementX = rect.left;
    initialElementY = rect.top;

    // Create a clone for visual feedback
    const clone = draggedItem.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.transform = `translate3d(${initialElementX}px, ${initialElementY}px, 0)`;
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

    draggedItem.clone.style.transform = `translate3d(${initialElementX + (clientX - initialTouchX)}px, ${initialElementY + (clientY - initialTouchY)}px, 0)`;

    const targetElement = document.elementFromPoint(clientX, clientY);

    if (targetElement && targetElement.classList.contains('taskbar-item') && targetElement !== draggedItem) {
        const afterElement = getDragAfterElement(taskbarElement, clientX);
        if (afterElement == null) {
            taskbarElement.appendChild(draggedItem);
        } else {
            taskbarElement.insertBefore(draggedItem, afterElement);
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
