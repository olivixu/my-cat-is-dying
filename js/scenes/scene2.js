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
        
        // Removed magnifying glass image element
        
        // Create hidden objects container
        const objectsContainer = document.createElement('div');
        objectsContainer.className = 'hidden-objects';
        
        // Helper function to generate random position
        const getRandomPosition = () => {
            return {
                left: Math.floor(Math.random() * 60 + 20) + '%', // Between 20% and 80%
                top: Math.floor(Math.random() * 50 + 30) + '%'   // Between 30% and 80%
            };
        };
        
        // Get random position for Smokey
        const smokeyPosition = getRandomPosition();
        
        // Add Smokey (the target to find)
        const smokey = document.createElement('img');
        smokey.className = 'hidden-object smokey-cat';
        smokey.src = 'assets/images/find-smokey.png';
        smokey.style.left = smokeyPosition.left;
        smokey.style.top = smokeyPosition.top;
        smokey.style.width = '150px';
        smokey.style.height = 'auto';
        smokey.setAttribute('data-name', 'Smokey');
        
        // Add other decorative objects with random positions
        const objectEmojis = [
            { emoji: '🪑', name: 'Chair' },
            { emoji: '🪴', name: 'Plant' },
            { emoji: '📚', name: 'Books' },
            { emoji: '🕰️', name: 'Clock' },
            { emoji: '🖼️', name: 'Picture' }
        ];
        
        const objects = objectEmojis.map(obj => {
            const position = getRandomPosition();
            return {
                emoji: obj.emoji,
                left: position.left,
                top: position.top,
                name: obj.name
            };
        });
        
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
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Initialize spotlight position to current mouse position from global tracker
        const sceneRect = this.element.getBoundingClientRect();
        const currentMouseX = window.mousePosition.x - sceneRect.left;
        const currentMouseY = window.mousePosition.y - sceneRect.top;
        
        // Set initial spotlight position
        blackOverlay.style.setProperty('--spotlight-x', `${currentMouseX}px`);
        blackOverlay.style.setProperty('--spotlight-y', `${currentMouseY}px`);
        
        // Animate spotlight growing in
        let spotlightRadius = 0;
        const targetRadius = 120;
        const animationDuration = 1500; // 1.5 seconds
        const animationDelay = 500; // 0.5 seconds delay
        const startTime = Date.now() + animationDelay;
        
        const animateSpotlight = () => {
            const now = Date.now();
            const elapsed = Math.max(0, now - startTime);
            const progress = Math.min(1, elapsed / animationDuration);
            
            if (progress > 0) {
                // Ease-out animation
                const easeOut = 1 - Math.pow(1 - progress, 3);
                spotlightRadius = targetRadius * easeOut;
                
                // Update the CSS variable
                blackOverlay.style.setProperty('--spotlight-radius', `${spotlightRadius}px`);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animateSpotlight);
            }
        };
        
        requestAnimationFrame(animateSpotlight);
        
        // Set up magnifying glass movement
        const handleMouseMove = (e) => {
            const sceneRect = this.element.getBoundingClientRect();
            const x = e.clientX - sceneRect.left;
            const y = e.clientY - sceneRect.top;
            
            // Update spotlight position to follow mouse
            const spotlightOffsetX = x;
            const spotlightOffsetY = y
            
            // Update CSS variables for radial gradient position
            blackOverlay.style.setProperty('--spotlight-x', `${spotlightOffsetX}px`);
            blackOverlay.style.setProperty('--spotlight-y', `${spotlightOffsetY}px`);
        };
        
        // Handle clicking on objects
        const handleClick = (e) => {
            if (e.target.classList.contains('smokey-cat') && !this.smokeyFound) {
                this.smokeyFound = true;
                e.target.classList.add('found');
                
                // Expand spotlight to reveal entire scene
                const expandSpotlight = () => {
                    const startTime = performance.now();
                    const startRadius = 120;
                    // Calculate radius to cover entire viewport diagonal
                    const endRadius = Math.sqrt(window.innerWidth ** 2 + window.innerHeight ** 2);
                    const duration = 1500; // 1.5 seconds for expansion
                    
                    const animate = (currentTime) => {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);
                        
                        // Ease-out animation
                        const easeOut = 1 - Math.pow(1 - progress, 3);
                        const currentRadius = startRadius + (endRadius - startRadius) * easeOut;
                        
                        blackOverlay.style.setProperty('--spotlight-radius', `${currentRadius}px`);
                        
                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        }
                    };
                    
                    requestAnimationFrame(animate);
                };
                
                // Start the spotlight expansion
                expandSpotlight();
                
                // Advance after spotlight expansion completes
                setTimeout(() => {
                    this.onComplete();
                    if (window.sceneManager) {
                        window.sceneManager.nextScene();
                    }
                }, 2500);
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