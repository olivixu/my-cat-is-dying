// Scene 2: "My cat was old when I found her."
import { Scene } from '../sceneManager.js';

export class Scene2 extends Scene {
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
        
        // Create paper texture overlay (between background and game objects)
        const paperTexture = document.createElement('div');
        paperTexture.className = 'paper-texture-overlay';
        
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
        
        // Helper function to generate grid-based positions to prevent overlap
        const generateNonOverlappingPositions = (count) => {
            const positions = [];
            const cols = 4; // 4 columns for better spacing
            const rows = 4; // Fixed 4 rows to ensure full screen coverage
            const cellWidth = 85 / cols; // Use 85% of width
            const cellHeight = 75 / rows; // Use 75% of height to leave room for tooltips at top
            
            let imageIndex = 0;
            // Fill grid evenly, distributing images across all cells
            for (let row = 0; row < rows; row++) {
                for (let col = 0; col < cols; col++) {
                    if (imageIndex >= count) break;
                    
                    // Spread across screen with top margin for tooltips
                    const baseLeft = 7.5 + col * cellWidth; // Start at 7.5% for centering
                    const baseTop = 15 + row * cellHeight; // Start at 15% to leave room for tooltips
                    
                    positions.push({
                        left: (baseLeft + Math.random() * cellWidth * 0.7) + '%',
                        top: (baseTop + Math.random() * cellHeight * 0.7) + '%'
                    });
                    imageIndex++;
                }
            }
            
            // Shuffle positions so images don't appear in predictable order
            return positions.sort(() => Math.random() - 0.5);
        };
        
        // Helper function to format image names
        const formatImageName = (filename) => {
            // Remove extension and format camelCase to readable text
            const name = filename.replace('.png', '');
            // Split on capital letters and add spaces
            const formatted = name.replace(/([a-z])([A-Z])/g, '$1 $2')
                                 .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2');
            // Capitalize first letter
            return formatted.charAt(0).toUpperCase() + formatted.slice(1);
        };
        
        // Define all images from the Find smokey images folder
        const allImages = [
            { filename: 'smokey.png', name: 'Smokey', isSmokey: true },
            { filename: 'acatimetonthestreet.png', name: 'A cat I met on the street' },
            { filename: 'acheaptoysheignores.png', name: 'A cheap toy she ignores' },
            { filename: 'afriendscatthatimet.png', name: "A friend's cat that I met" },
            { filename: 'afriendsdog.png', name: "A friend's dog" },
            { filename: 'afunnytoythatshelikes.png', name: 'A funny toy that she likes' },
            { filename: 'almostsmokey.png', name: 'Almost Smokey' },
            { filename: 'asuitablesittingspot.png', name: 'A suitable sitting spot' },
            { filename: 'cheaptoythatsheloves.png', name: 'Cheap toy that she loves' },
            { filename: 'mybeautifulgrandmother.png', name: 'My beautiful grandmother' },
            { filename: 'officedog.png', name: 'Office dog' },
            { filename: 'ourbountifulsummerharvest.png', name: 'Our bountiful summer harvest' },
            { filename: 'twocatsthatarentsmokey.png', name: "Two cats that aren't Smokey" },
            { filename: 'welllovednapspot.png', name: 'Well-loved nap spot' }
        ];
        
        // Shuffle all images for random placement
        const selectedImages = [...allImages].sort(() => Math.random() - 0.5);
        
        // Generate non-overlapping positions
        const positions = generateNonOverlappingPositions(selectedImages.length);
        
        // Create image elements
        selectedImages.forEach((imgData, index) => {
            const position = positions[index];
            const element = document.createElement('img');
            element.className = imgData.isSmokey ? 'hidden-object smokey-cat' : 'hidden-object';
            element.src = `assets/images/Find smokey images/${imgData.filename}`;
            // Make Smokey slightly larger to be findable but still challenging
            const imageWidth = imgData.isSmokey ? 
                200 + Math.random() * 80 : // Smokey: 200-280px
                160 + Math.random() * 100;   // Others: 160-260px
            element.style.width = `${imageWidth}px`;
            element.style.height = 'auto';
            element.setAttribute('data-name', imgData.name);
            
            // Create tooltip
            const tooltip = document.createElement('div');
            tooltip.className = 'image-tooltip';
            tooltip.textContent = imgData.name;
            
            // Wrapper for image and tooltip
            const wrapper = document.createElement('div');
            wrapper.className = 'image-wrapper';
            wrapper.style.position = 'absolute';
            wrapper.style.left = position.left;
            wrapper.style.top = position.top;
            wrapper.style.width = `${imageWidth}px`; // Set wrapper width to match image
            wrapper.appendChild(element);
            wrapper.appendChild(tooltip);
            
            objectsContainer.appendChild(wrapper);
        });
        
        // Assemble game container
        gameContainer.appendChild(objectsContainer);
        
        // Assemble scene (layered properly)
        this.element.appendChild(backgroundLayer); // Purple background
        this.element.appendChild(paperTexture); // Paper texture overlay
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
                
                // After spotlight expansion, trigger transition sequence
                setTimeout(() => {
                    // Fade out text
                    const textContainer = this.element.querySelector('.scene2-text');
                    if (textContainer) {
                        // Add class for fade out animation
                        textContainer.classList.add('fading-out');
                    }
                    
                    // Create and animate hand sweep
                    const handSweep = document.createElement('div');
                    handSweep.className = 'hand-sweep';
                    this.element.appendChild(handSweep);
                    
                    // Sweep away objects and their tooltips
                    const wrappers = this.element.querySelectorAll('.image-wrapper');
                    wrappers.forEach((wrapper, index) => {
                        setTimeout(() => {
                            wrapper.style.transition = 'transform 0.8s ease-out, opacity 0.6s ease-out';
                            wrapper.style.transform = `translateX(${150 + Math.random() * 100}vw) translateY(${-20 + Math.random() * 40}px) rotate(${Math.random() * 360}deg)`;
                            wrapper.style.opacity = '0';
                        }, index * 50);
                    });
                    
                    // After sweep completes, add slide animation and transition
                    setTimeout(() => {
                        // Add slide-out class to entire scene (purple background and all)
                        this.element.classList.add('scene2-slide-out');
                        
                        // Trigger Scene 3 immediately to slide in from right
                        this.onComplete();
                        if (window.sceneManager) {
                            window.sceneManager.nextScene();
                        }
                    }, 1500); // Wait for sweep to complete
                }, 1500); // Start after spotlight expansion
            } else if (e.target.classList.contains('hidden-object')) {
                // No visual feedback for wrong items
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
        // Remove transition elements if they exist
        const handSweep = this.element?.querySelector('.hand-sweep');
        if (handSweep) handSweep.remove();
        super.cleanup();
    }
}