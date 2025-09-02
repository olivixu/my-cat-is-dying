// Scene 4: "She doesn't know why I feed her so many treats these days."
class Scene4 extends Scene {
    constructor(container) {
        super(container);
        this.text = "She doesn't know why I feed her so many treats these days.";
        
        // Define treats and their correct order (least to most tasty)
        this.treats = [
            { id: 'dryfood', emoji: '🥣', name: 'Dry Food' },
            { id: 'wetfood', emoji: '🥫', name: 'Wet Food' },
            { id: 'tuna', emoji: '🐟', name: 'Tuna' },
            { id: 'salmon', emoji: '🍣', name: 'Salmon' },
            { id: 'chicken', emoji: '🍗', name: 'Chicken' }
        ];
        
        // Correct order (by indices)
        this.correctOrder = ['dryfood', 'wetfood', 'tuna', 'salmon', 'chicken'];
        
        // Current arrangement - shuffle for puzzle
        this.currentOrder = this.shuffleArray([...this.treats]);
        
        // Drag state
        this.draggedTreat = null;
        this.draggedIndex = null;
    }
    
    shuffleArray(array) {
        // Fisher-Yates shuffle
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
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
        
        // Create labels
        const labelsContainer = document.createElement('div');
        labelsContainer.className = 'ranking-labels';
        labelsContainer.innerHTML = `
            <span class="label-left">Least Tasty</span>
            <span class="label-right">Most Tasty</span>
        `;
        
        // Create ranking track
        const rankingTrack = document.createElement('div');
        rankingTrack.className = 'ranking-track';
        
        // Create positions on the track
        for (let i = 0; i < 5; i++) {
            const position = document.createElement('div');
            position.className = 'track-position';
            position.dataset.position = i;
            rankingTrack.appendChild(position);
        }
        
        // Create treats container
        const treatsContainer = document.createElement('div');
        treatsContainer.className = 'treats-container';
        
        // Create treat elements
        this.currentOrder.forEach((treat, index) => {
            const treatElement = document.createElement('div');
            treatElement.className = 'treat-item';
            treatElement.dataset.treatId = treat.id;
            treatElement.dataset.index = index;
            treatElement.draggable = true;
            treatElement.innerHTML = `
                <span class="treat-emoji">${treat.emoji}</span>
                <span class="treat-name">${treat.name}</span>
            `;
            
            // Position treat at its slot with better spacing
            // Start at 10% and space evenly across 80% of width
            const spacing = 70 / 4; // 70% width divided by 4 gaps
            treatElement.style.left = `${10 + index * spacing}%`;
            
            // Add drag event listeners
            treatElement.addEventListener('dragstart', (e) => this.handleDragStart(e));
            treatElement.addEventListener('dragend', (e) => this.handleDragEnd(e));
            treatElement.addEventListener('dragover', (e) => this.handleDragOver(e));
            treatElement.addEventListener('drop', (e) => this.handleDrop(e));
            
            treatsContainer.appendChild(treatElement);
        });
        
        // Create indicator lights
        const lightsContainer = document.createElement('div');
        lightsContainer.className = 'indicator-lights';
        for (let i = 0; i < 5; i++) {
            const light = document.createElement('div');
            light.className = 'indicator-light';
            light.dataset.position = i;
            lightsContainer.appendChild(light);
        }
        
        // Create submit button
        const submitButton = document.createElement('button');
        submitButton.className = 'submit-ranking-btn';
        submitButton.textContent = 'Submit Order';
        submitButton.addEventListener('click', () => this.checkOrder());
        
        // Create success message (hidden initially)
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message hidden';
        successMessage.innerHTML = '<p>Perfect! You know what Smokey likes!</p>';
        
        // Assemble game
        gameContainer.appendChild(labelsContainer);
        gameContainer.appendChild(rankingTrack);
        gameContainer.appendChild(treatsContainer);
        gameContainer.appendChild(lightsContainer);
        gameContainer.appendChild(submitButton);
        gameContainer.appendChild(successMessage);
        
        // Assemble scene
        this.element.appendChild(textContainer);
        this.element.appendChild(gameContainer);
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Store references
        this.treatsContainer = treatsContainer;
        this.lightsContainer = lightsContainer;
        this.successMessage = successMessage;
        this.submitButton = submitButton;
    }
    
    handleDragStart(e) {
        this.draggedTreat = e.target;
        this.draggedIndex = parseInt(e.target.dataset.index);
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.innerHTML);
    }
    
    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        this.draggedTreat = null;
        this.draggedIndex = null;
    }
    
    handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        
        // Get the treat being dragged over
        const draggedOver = e.target.closest('.treat-item');
        if (!draggedOver || draggedOver === this.draggedTreat) return;
        
        const draggedOverIndex = parseInt(draggedOver.dataset.index);
        
        // Visual feedback - show where the treat will be inserted
        if (this.draggedIndex !== null && draggedOverIndex !== this.draggedIndex) {
            // Calculate if we're on the left or right half of the target
            const rect = draggedOver.getBoundingClientRect();
            const midpoint = rect.left + rect.width / 2;
            
            if (e.clientX < midpoint) {
                draggedOver.classList.add('drag-over-left');
                draggedOver.classList.remove('drag-over-right');
            } else {
                draggedOver.classList.add('drag-over-right');
                draggedOver.classList.remove('drag-over-left');
            }
        }
        
        return false;
    }
    
    handleDrop(e) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        
        const draggedOver = e.target.closest('.treat-item');
        if (!draggedOver || draggedOver === this.draggedTreat) return false;
        
        // Remove visual feedback
        draggedOver.classList.remove('drag-over-left', 'drag-over-right');
        
        const draggedOverIndex = parseInt(draggedOver.dataset.index);
        
        // Swap positions in the array
        if (this.draggedIndex !== null && draggedOverIndex !== this.draggedIndex) {
            // Update the current order array
            const temp = this.currentOrder[this.draggedIndex];
            
            // Shift elements between the two positions
            if (this.draggedIndex < draggedOverIndex) {
                // Dragging right
                for (let i = this.draggedIndex; i < draggedOverIndex; i++) {
                    this.currentOrder[i] = this.currentOrder[i + 1];
                }
            } else {
                // Dragging left
                for (let i = this.draggedIndex; i > draggedOverIndex; i--) {
                    this.currentOrder[i] = this.currentOrder[i - 1];
                }
            }
            
            this.currentOrder[draggedOverIndex] = temp;
            
            // Update visual positions
            this.updateTreatPositions();
        }
        
        return false;
    }
    
    updateTreatPositions() {
        // Update all treat positions based on current order
        const spacing = 70 / 4; // Same spacing calculation as initial positioning
        this.currentOrder.forEach((treat, index) => {
            const treatElement = this.treatsContainer.querySelector(`[data-treat-id="${treat.id}"]`);
            if (treatElement) {
                treatElement.dataset.index = index;
                treatElement.style.left = `${10 + index * spacing}%`;
            }
        });
        
        // Clear any previous validation lights
        const lights = this.lightsContainer.querySelectorAll('.indicator-light');
        lights.forEach(light => {
            light.classList.remove('correct', 'incorrect');
        });
    }
    
    checkOrder() {
        let allCorrect = true;
        const lights = this.lightsContainer.querySelectorAll('.indicator-light');
        
        // Check each position
        this.currentOrder.forEach((treat, index) => {
            const isCorrect = treat.id === this.correctOrder[index];
            const light = lights[index];
            
            if (isCorrect) {
                light.classList.add('correct');
                light.classList.remove('incorrect');
            } else {
                light.classList.add('incorrect');
                light.classList.remove('correct');
                allCorrect = false;
            }
        });
        
        // If all correct, show success and advance
        if (allCorrect) {
            this.submitButton.disabled = true;
            this.successMessage.classList.remove('hidden');
            
            // Disable dragging
            const treats = this.treatsContainer.querySelectorAll('.treat-item');
            treats.forEach(treat => {
                treat.draggable = false;
                treat.classList.add('success');
            });
            
            // Auto advance after showing success
            setTimeout(() => {
                this.onComplete();
                if (window.sceneManager) {
                    window.sceneManager.nextScene();
                }
            }, 2500);
        }
    }
    
    cleanup() {
        // Remove drag event listeners
        const treats = this.element?.querySelectorAll('.treat-item');
        treats?.forEach(treat => {
            treat.removeEventListener('dragstart', this.handleDragStart);
            treat.removeEventListener('dragend', this.handleDragEnd);
            treat.removeEventListener('dragover', this.handleDragOver);
            treat.removeEventListener('drop', this.handleDrop);
        });
        
        super.cleanup();
    }
}