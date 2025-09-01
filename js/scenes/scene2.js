// Scene 2: "My cat was old when I found her."
class Scene2 extends Scene {
    constructor(container) {
        super(container);
        this.text = "My cat was old when I found her.";
        this.smokeyFound = false;
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-2';
        
        // Create background layer (purple)
        const backgroundLayer = document.createElement('div');
        backgroundLayer.className = 'scene2-background';
        
        // Create full-screen black overlay with spotlight hole
        const blackOverlay = document.createElement('div');
        blackOverlay.className = 'black-overlay';
        
        // Create magnifying glass spotlight (the hole in the overlay)
        const spotlight = document.createElement('div');
        spotlight.className = 'magnifying-spotlight';
        blackOverlay.appendChild(spotlight);
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text scene2-text';
        textContainer.innerHTML = `<h2>${this.text}</h2>`;
        
        // Create game container
        const gameContainer = document.createElement('div');
        gameContainer.className = 'magnifying-game-container';
        
        // Create magnifying glass element
        const magnifyingGlass = document.createElement('img');
        magnifyingGlass.src = 'assets/images/magnifying-glass.png';
        magnifyingGlass.className = 'magnifying-glass';
        
        // Create hidden objects container
        const objectsContainer = document.createElement('div');
        objectsContainer.className = 'hidden-objects';
        
        // Add Smokey (the target to find)
        const smokey = document.createElement('div');
        smokey.className = 'hidden-object smokey-cat';
        smokey.innerHTML = '🐈‍⬛';
        smokey.style.left = '60%';
        smokey.style.top = '70%';
        smokey.setAttribute('data-name', 'Smokey');
        
        // Add other decorative objects
        const objects = [
            { emoji: '🪑', left: '20%', top: '40%', name: 'Chair' },
            { emoji: '🪴', left: '80%', top: '30%', name: 'Plant' },
            { emoji: '📚', left: '35%', top: '60%', name: 'Books' },
            { emoji: '🕰️', left: '70%', top: '50%', name: 'Clock' },
            { emoji: '🖼️', left: '15%', top: '70%', name: 'Picture' }
        ];
        
        objects.forEach(obj => {
            const element = document.createElement('div');
            element.className = 'hidden-object';
            element.innerHTML = obj.emoji;
            element.style.left = obj.left;
            element.style.top = obj.top;
            element.setAttribute('data-name', obj.name);
            objectsContainer.appendChild(element);
        });
        
        objectsContainer.appendChild(smokey);
        
        // Assemble game container
        gameContainer.appendChild(objectsContainer);
        
        // Assemble scene (layered properly)
        this.element.appendChild(backgroundLayer); // Purple background
        this.element.appendChild(gameContainer); // Game objects
        this.element.appendChild(textContainer); // Text on top
        this.element.appendChild(blackOverlay); // Black overlay with spotlight
        this.element.appendChild(magnifyingGlass); // Magnifying glass on top
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Set up magnifying glass movement
        const handleMouseMove = (e) => {
            const sceneRect = this.element.getBoundingClientRect();
            const x = e.clientX - sceneRect.left;
            const y = e.clientY - sceneRect.top;
            
            // Move magnifying glass
            magnifyingGlass.style.left = x + 'px';
            magnifyingGlass.style.top = y + 'px';
            
            // Offset spotlight to align with rotated glass circle (up and left from handle)
            const spotlightOffsetX = x - 15; // Adjust left for 45 degree rotation
            const spotlightOffsetY = y - 15; // Adjust up for 45 degree rotation
            
            // Update CSS variables for radial gradient position
            blackOverlay.style.setProperty('--spotlight-x', `${spotlightOffsetX}px`);
            blackOverlay.style.setProperty('--spotlight-y', `${spotlightOffsetY}px`);
            
            // Check which objects are under the magnifying glass spotlight
            const spotlightRadius = 140; // Slightly larger to ensure objects reveal with background
            const objects = gameContainer.querySelectorAll('.hidden-object');
            const gameRect = gameContainer.getBoundingClientRect();
            
            objects.forEach(obj => {
                const objRect = obj.getBoundingClientRect();
                const objX = objRect.left + objRect.width / 2 - sceneRect.left;
                const objY = objRect.top + objRect.height / 2 - sceneRect.top;
                // Use spotlight position for distance calculation
                const distance = Math.sqrt(Math.pow(spotlightOffsetX - objX, 2) + Math.pow(spotlightOffsetY - objY, 2));
                
                if (distance < spotlightRadius) {
                    obj.classList.add('revealed');
                } else {
                    obj.classList.remove('revealed');
                }
            });
        };
        
        // Handle clicking on objects
        const handleClick = (e) => {
            if (e.target.classList.contains('smokey-cat') && !this.smokeyFound) {
                this.smokeyFound = true;
                e.target.classList.add('found');
                
                // Show success message
                const successMsg = document.createElement('div');
                successMsg.className = 'found-message';
                successMsg.textContent = 'You found Smokey!';
                gameContainer.appendChild(successMsg);
                
                // Advance after a delay
                setTimeout(() => {
                    this.onComplete();
                    if (window.sceneManager) {
                        window.sceneManager.nextScene();
                    }
                }, 2000);
            } else if (e.target.classList.contains('hidden-object')) {
                // Visual feedback for other objects
                e.target.classList.add('wiggle');
                setTimeout(() => {
                    e.target.classList.remove('wiggle');
                }, 500);
            }
        };
        
        this.element.addEventListener('mousemove', handleMouseMove);
        this.element.addEventListener('click', handleClick);
        
        // Store event listeners for cleanup
        this.mouseMoveHandler = handleMouseMove;
        this.clickHandler = handleClick;
    }
    
    cleanup() {
        if (this.element && this.mouseMoveHandler) {
            this.element.removeEventListener('mousemove', this.mouseMoveHandler);
            this.element.removeEventListener('click', this.clickHandler);
        }
        super.cleanup();
    }
}