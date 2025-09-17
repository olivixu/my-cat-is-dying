// Scene 4: "She doesn't know why I feed her so many treats these days."
import { Scene } from '../sceneManager.js';

export class Scene4 extends Scene {
    constructor(container) {
        super(container);
        this.text = "She doesn't know why I feed her so many treats these days.";
        
        // TRANSITION SAFETY: Track completion state
        // This prevents completeGame() from being called multiple times
        this.gameCompleted = false;
        this.completionTimer = null;
        
        // Define treats and their correct order (least to most tasty)
        this.treats = [
            { id: 'wetfood', image: 'assets/images/Treat/Treat_0000_Layer-wet-food-1.png', name: 'Wet Food', tastiness: 1 },
            { id: 'greenies', image: 'assets/images/Treat/Treat_0004_Layer-greenies-2.png', name: 'Greenies', tastiness: 2 },
            { id: 'minnows', image: 'assets/images/Treat/Treat_0003_Layer-minnows-4.png', name: 'Minnows', tastiness: 3 },
            { id: 'chicken', image: 'assets/images/Treat/Treat_0000_Layer-chicken-3.png', name: 'Chicken', tastiness: 4 },
            { id: 'churu', image: 'assets/images/Treat/Treat_0001_Layer-churu-5.png', name: 'Churu', tastiness: 5 }
        ];
        
        // Correct order (by IDs from least to most tasty)
        this.correctOrder = ['wetfood', 'greenies', 'minnows', 'chicken', 'churu'];
        
        // Current arrangement - shuffle for puzzle, ensuring it's not already correct
        this.currentOrder = this.shuffleForPuzzle([...this.treats]);
        
        // Drag state
        this.draggedTreat = null;
        this.draggedIndex = null;
        
        // Bind event handlers
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.handleDragOver = this.handleDragOver.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
    }
    
    shuffleArray(array) {
        // Fisher-Yates shuffle
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    shuffleForPuzzle(array) {
        // Keep shuffling until we get an order where NO treats are in correct positions
        let shuffled = [...array];
        let hasCorrectPosition = true;
        
        while (hasCorrectPosition) {
            shuffled = this.shuffleArray([...array]);
            
            // Check if ANY treat is in its correct position
            hasCorrectPosition = false;
            for (let i = 0; i < shuffled.length; i++) {
                if (shuffled[i].id === this.correctOrder[i]) {
                    hasCorrectPosition = true;
                    break;
                }
            }
        }
        
        return shuffled;
    }
    
    isCorrectOrder(array) {
        // Check if the current array order matches the correct order
        for (let i = 0; i < array.length; i++) {
            if (array[i].id !== this.correctOrder[i]) {
                return false;
            }
        }
        return true;
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-4';
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text';
        textContainer.innerHTML = `<h2>${this.text}</h2>`;
        
        // Create game container
        const gameContainer = document.createElement('div');
        gameContainer.className = 'treat-ranking-game';
        
        // Create empty labels container (keeping for spacing)
        const labelsContainer = document.createElement('div');
        labelsContainer.className = 'ranking-labels';
        
        // Create game board container
        const gameBoard = document.createElement('div');
        gameBoard.className = 'treat-game-board';
        
        // Add Smokey images at the ends
        const angrySmokeyImg = document.createElement('img');
        angrySmokeyImg.className = 'board-end-left smokey-angry';
        angrySmokeyImg.src = 'assets/images/angry smokey.png';
        angrySmokeyImg.alt = 'Angry Smokey';
        
        const happySmokeyImg = document.createElement('img');
        happySmokeyImg.className = 'board-end-right smokey-happy';
        happySmokeyImg.src = 'assets/images/happy smokey.png';
        happySmokeyImg.alt = 'Happy Smokey';
        
        gameBoard.appendChild(angrySmokeyImg);
        gameBoard.appendChild(happySmokeyImg);
        
        // Add axis line SVG instead of div track line
        const axisLine = document.createElement('img');
        axisLine.src = 'assets/SVG/axis-line.svg';
        axisLine.className = 'axis-line';
        axisLine.alt = 'Least to Most Tasty';
        gameBoard.appendChild(axisLine);
        
        // Create slots container
        const slotsContainer = document.createElement('div');
        slotsContainer.className = 'slots-container';
        
        // Create 5 slots, each containing a treat and a feedback dot
        this.currentOrder.forEach((treat, index) => {
            // Create slot container
            const slot = document.createElement('div');
            slot.className = 'treat-slot';
            slot.dataset.index = index;
            
            // Create treat element
            const treatElement = document.createElement('div');
            treatElement.className = 'treat-item';
            treatElement.dataset.treatId = treat.id;
            treatElement.dataset.index = index;
            treatElement.draggable = true;
            treatElement.innerHTML = `
                <img class="treat-image" src="${treat.image}" alt="${treat.name}">
                <span class="treat-name">${treat.name}</span>
            `;
            
            // Create feedback dot (using SVG images)
            const feedbackDot = document.createElement('img');
            feedbackDot.className = 'position-feedback';
            feedbackDot.dataset.position = index;
            feedbackDot.style.display = 'none'; // Hidden initially
            
            // Add elements to slot
            slot.appendChild(treatElement);
            slot.appendChild(feedbackDot);
            
            // Add drag event listeners to treat
            treatElement.addEventListener('dragstart', this.handleDragStart);
            treatElement.addEventListener('dragend', this.handleDragEnd);
            treatElement.addEventListener('dragover', this.handleDragOver);
            treatElement.addEventListener('drop', this.handleDrop);
            
            slotsContainer.appendChild(slot);
        });
        
        gameBoard.appendChild(slotsContainer);
        
        // Store references
        this.slotsContainer = slotsContainer;
        this.feedbackDots = slotsContainer.querySelectorAll('.position-feedback');
        
        // Create success message image (hidden initially)
        const successMessage = document.createElement('img');
        successMessage.className = 'success-message hidden';
        successMessage.src = 'assets/SVG/Correct-1.svg';
        successMessage.alt = 'Success!';
        
        // Assemble game
        gameContainer.appendChild(labelsContainer);
        gameContainer.appendChild(gameBoard);
        gameContainer.appendChild(successMessage);
        
        // Assemble scene
        this.element.appendChild(textContainer);
        this.element.appendChild(gameContainer);
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Store references
        this.successMessage = successMessage;
        
        // Check initial positions
        this.checkPositions();
    }
    
    handleDragStart(e) {
        // Make sure we're dragging the treat element, not its children
        const treatElement = e.target.closest('.treat-item');
        if (!treatElement) return;
        
        this.draggedTreat = treatElement;
        this.draggedIndex = parseInt(treatElement.dataset.index);
        treatElement.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', treatElement.innerHTML);
    }
    
    handleDragEnd(e) {
        // Make sure we're removing the class from the treat element, not its children
        const treatElement = e.target.closest('.treat-item');
        if (treatElement) {
            treatElement.classList.remove('dragging');
        }
        // Also ensure the dragged treat loses the class
        if (this.draggedTreat) {
            this.draggedTreat.classList.remove('dragging');
        }
        this.draggedTreat = null;
        this.draggedIndex = null;
    }
    
    handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        
        const container = e.target.closest('.slots-container');
        if (!container) return;
        
        // Find the slot being dragged over
        const targetSlot = e.target.closest('.treat-slot');
        if (!targetSlot) return;
        
        const targetIndex = parseInt(targetSlot.dataset.index);
        const currentIndex = parseInt(this.draggedTreat.dataset.index);
        
        if (currentIndex !== targetIndex) {
            this.shiftItems(currentIndex, targetIndex);
        }
        
        return false;
    }
    
    
    shiftItems(fromIndex, toIndex) {
        if (fromIndex === toIndex) return;
        
        // Move item in array
        const [movedItem] = this.currentOrder.splice(fromIndex, 1);
        this.currentOrder.splice(toIndex, 0, movedItem);
        
        // Update positions with animation
        this.updateTreatPositions(true);
    }
    
    handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        
        // Final position update
        this.updateTreatPositions();
        
        return false;
    }
    
    updateTreatPositions(animated = false) {
        // Get all slots
        const slots = this.slotsContainer.querySelectorAll('.treat-slot');
        
        // Update each slot with the correct treat
        this.currentOrder.forEach((treat, index) => {
            const slot = slots[index];
            const treatElement = this.slotsContainer.querySelector(`[data-treat-id="${treat.id}"]`);
            
            if (treatElement && slot) {
                // Update data attributes
                treatElement.dataset.index = index;
                slot.dataset.index = index;
                
                // Move treat to correct slot if needed
                if (treatElement.parentElement !== slot) {
                    // Remove treat from current slot
                    const currentSlot = treatElement.parentElement;
                    
                    // Move treat to new slot
                    slot.insertBefore(treatElement, slot.querySelector('.position-feedback'));
                }
            }
        });
        
        // Check positions after update
        this.checkPositions();
    }
    
    checkPositions() {
        // Check each position and update feedback dots
        this.currentOrder.forEach((treat, index) => {
            const isCorrect = treat.id === this.correctOrder[index];
            const feedbackDot = this.feedbackDots[index];
            
            if (feedbackDot) {
                feedbackDot.style.display = 'block'; // Show the feedback dot
                
                if (isCorrect) {
                    feedbackDot.src = 'assets/SVG/Success.svg';
                    feedbackDot.classList.add('correct');
                    feedbackDot.classList.remove('incorrect');
                } else {
                    feedbackDot.src = 'assets/SVG/Error.svg';
                    feedbackDot.classList.add('incorrect');
                    feedbackDot.classList.remove('correct');
                }
            }
        });
        
        // Check if all are correct
        const allCorrect = this.currentOrder.every((treat, index) => 
            treat.id === this.correctOrder[index]
        );
        
        if (allCorrect) {
            this.completeGame();
        }
    }
    
    completeGame() {
        // CRITICAL GUARD: Prevent multiple completions
        // This fixes the bug where drag events could trigger multiple completions
        // causing Scene 5 to load then immediately skip
        if (this.gameCompleted) {
            console.log('[Scene4] Game already completed - ignoring duplicate call');
            return;
        }
        
        // Mark as completed immediately to prevent race conditions
        this.gameCompleted = true;
        
        // Disable dragging
        const treats = this.slotsContainer.querySelectorAll('.treat-item');
        treats.forEach(treat => {
            treat.draggable = false;
            treat.classList.add('success');
        });
        
        // Fade out game elements
        const gameBoard = this.element.querySelector('.treat-game-board');
        if (gameBoard) {
            gameBoard.classList.add('fade-out-complete');
        }
        
        // Show success message with scale-in animation
        this.successMessage.classList.remove('hidden');
        this.successMessage.classList.add('scale-in');
        
        // Animate between Correct-1 and Correct-2
        let isCorrect1 = true;
        const swapInterval = setInterval(() => {
            isCorrect1 = !isCorrect1;
            this.successMessage.src = isCorrect1 ? 
                'assets/SVG/Correct-1.svg' : 
                'assets/SVG/Correct-2.svg';
        }, 400); // Swap every 400ms
        
        // Auto advance after showing success
        // Store timer ID for cleanup to prevent memory leaks
        this.completionTimer = setTimeout(() => {
            clearInterval(swapInterval); // Stop the animation
            this.onComplete();
            if (window.sceneManager) {
                window.sceneManager.nextScene();
            }
        }, 2500);
        
        // Track this timer in parent class for automatic cleanup
        this.transitionTimers.push(this.completionTimer);
    }
    
    
    cleanup() {
        // IMPORTANT: Clear completion timer if it hasn't fired yet
        // This prevents the timer from firing after scene is cleaned up
        if (this.completionTimer) {
            clearTimeout(this.completionTimer);
            this.completionTimer = null;
        }
        
        // Remove drag event listeners
        const treats = this.element?.querySelectorAll('.treat-item');
        treats?.forEach(treat => {
            treat.removeEventListener('dragstart', this.handleDragStart);
            treat.removeEventListener('dragend', this.handleDragEnd);
            treat.removeEventListener('dragover', this.handleDragOver);
            treat.removeEventListener('drop', this.handleDrop);
        });
        
        // Call parent cleanup which will clear all tracked timers
        super.cleanup();
    }
}