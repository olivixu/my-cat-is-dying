// Scene 7: "I wonder if our ideas of death are the same."
import { Scene } from '../sceneManager.js';

export class Scene7 extends Scene {
    constructor(container) {
        super(container);
        this.text = "I wonder if our ideas of death are the same.";
        
        // Card matching game state
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 3;
        this.canFlip = true;
        
        // Animation state
        this.isTransitioning = false;
        this.fluidAnimationId = null;
        this.staticAnimationId = null;
        
        // Card types (each appears twice for pairs)
        this.cardTypes = [
            { id: 'me', image: 'assets/images/Card_Olivia.PNG', name: 'Me' },
            { id: 'smokey', image: 'assets/images/Card_Smokey.PNG', name: 'Smokey' },
            { id: 'skull', image: 'assets/images/Card_Death.PNG', name: 'Death' }
        ];
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-7';
        
        // Like Scene 6, set immediate visibility with black background to prevent flash
        this.element.style.backgroundColor = '#000000'; // Start black to match Scene 6 fade
        this.element.style.opacity = '1'; // Override default opacity: 0 to be immediately visible
        
        // Create fluid background canvas
        const fluidCanvas = document.createElement('canvas');
        fluidCanvas.className = 'fluid-background';
        const fluidCtx = fluidCanvas.getContext('2d');
        
        // Fluid simulation state
        let mouseX = 0;
        let mouseY = 0;
        let lastMouseX = 0;
        let lastMouseY = 0;
        let mouseVelX = 0;
        let mouseVelY = 0;
        let time = 0;
        
        // Set canvas size
        const resizeFluidCanvas = () => {
            fluidCanvas.width = window.innerWidth;
            fluidCanvas.height = window.innerHeight;
        };
        resizeFluidCanvas();
        window.addEventListener('resize', resizeFluidCanvas);
        
        // Simple noise function
        const noise = (x, y, t) => {
            const n = Math.sin(x * 0.01 + t) * Math.cos(y * 0.01 - t) +
                     Math.sin(x * 0.02 - t * 0.5) * Math.cos(y * 0.02 + t * 0.5) +
                     Math.sin(x * 0.005 + t * 0.3) * Math.cos(y * 0.005 - t * 0.3);
            return n / 3;
        };
        
        // Mouse tracking
        const handleMouseMove = (e) => {
            lastMouseX = mouseX;
            lastMouseY = mouseY;
            const rect = fluidCanvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            mouseVelX = mouseX - lastMouseX;
            mouseVelY = mouseY - lastMouseY;
        };
        this.element.addEventListener('mousemove', handleMouseMove);
        
        // Animate fluid background
        const animateFluid = () => {
            // Stop if transitioning
            if (this.isTransitioning) {
                if (this.fluidAnimationId) {
                    cancelAnimationFrame(this.fluidAnimationId);
                    this.fluidAnimationId = null;
                }
                return;
            }
            
            time += 0.008;
            
            // Fill with dark base color first
            fluidCtx.fillStyle = '#1a1118';
            fluidCtx.fillRect(0, 0, fluidCanvas.width, fluidCanvas.height);
            
            // Draw multiple blob layers with higher visibility
            for (let layer = 0; layer < 4; layer++) {
                fluidCtx.save();
                
                // Different movement for each layer
                const layerTime = time * (0.3 + layer * 0.15);
                const offsetX = Math.sin(layerTime) * 100 + Math.cos(layerTime * 1.3) * 50;
                const offsetY = Math.cos(layerTime * 0.7) * 80 + Math.sin(layerTime * 1.1) * 40;
                
                // Create radial gradient for each blob
                const centerX = fluidCanvas.width / 2 + offsetX + (layer - 1.5) * 150;
                const centerY = fluidCanvas.height / 2 + offsetY + (layer - 1.5) * 100;
                
                // Mouse influence
                const mouseDist = Math.sqrt((mouseX - centerX) ** 2 + (mouseY - centerY) ** 2);
                const mouseInfluence = Math.max(0, 1 - mouseDist / 400);
                const blobX = centerX + (mouseX - centerX) * mouseInfluence * 0.4;
                const blobY = centerY + (mouseY - centerY) * mouseInfluence * 0.4;
                
                const gradient = fluidCtx.createRadialGradient(
                    blobX, blobY, 0,
                    blobX, blobY, 500 + mouseInfluence * 150
                );
                
                // Much brighter, more visible colors from the reference
                const colors = [
                    ['rgb(120, 80, 116)', 'rgba(120, 80, 116, 0)'],  // Bright purple-mauve
                    ['rgb(110, 85, 85)', 'rgba(110, 85, 85, 0)'],    // Bright warm brown
                    ['rgb(95, 90, 75)', 'rgba(95, 90, 75, 0)'],      // Bright olive
                    ['rgb(130, 75, 100)', 'rgba(130, 75, 100, 0)']   // Bright magenta
                ];
                
                gradient.addColorStop(0, colors[layer][0]);
                gradient.addColorStop(0.3, colors[layer][0].replace('rgb', 'rgba').replace(')', ', 0.7)'));
                gradient.addColorStop(0.6, colors[layer][0].replace('rgb', 'rgba').replace(')', ', 0.3)'));
                gradient.addColorStop(1, colors[layer][1]);
                
                // Apply gradient with blend mode
                fluidCtx.globalCompositeOperation = 'screen';
                fluidCtx.fillStyle = gradient;
                fluidCtx.fillRect(0, 0, fluidCanvas.width, fluidCanvas.height);
                
                fluidCtx.restore();
            }
            
            // Add vertical gradient overlay for depth
            fluidCtx.globalCompositeOperation = 'multiply';
            const baseGradient = fluidCtx.createLinearGradient(0, 0, 0, fluidCanvas.height);
            baseGradient.addColorStop(0, 'rgba(90, 60, 87, 0.8)');    // Purple-mauve at top
            baseGradient.addColorStop(0.5, 'rgba(85, 65, 65, 0.9)');  // Brown-purple in middle
            baseGradient.addColorStop(1, 'rgba(70, 65, 55, 1)');      // Dark olive-brown at bottom
            fluidCtx.fillStyle = baseGradient;
            fluidCtx.fillRect(0, 0, fluidCanvas.width, fluidCanvas.height);
            
            fluidCtx.globalCompositeOperation = 'source-over';
            
            // Add noise texture
            const imageData = fluidCtx.getImageData(0, 0, fluidCanvas.width, fluidCanvas.height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
                const noiseValue = (Math.random() - 0.5) * 20;
                data[i] = Math.max(0, Math.min(255, data[i] + noiseValue));
                data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noiseValue));
                data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noiseValue));
            }
            
            fluidCtx.putImageData(imageData, 0, 0);
            
            // Use instance property for proper cleanup
            if (!this.isTransitioning) {
                this.fluidAnimationId = requestAnimationFrame(animateFluid);
            }
        };
        animateFluid();
        
        // Create TV static overlay canvas
        const staticCanvas = document.createElement('canvas');
        staticCanvas.className = 'static-overlay';
        const ctx = staticCanvas.getContext('2d');
        
        // Set canvas size to window size
        const resizeCanvas = () => {
            staticCanvas.width = window.innerWidth;
            staticCanvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Animate TV static
        const animateStatic = () => {
            // Stop if transitioning
            if (this.isTransitioning) {
                if (this.staticAnimationId) {
                    cancelAnimationFrame(this.staticAnimationId);
                    this.staticAnimationId = null;
                }
                return;
            }
            
            const imageData = ctx.createImageData(staticCanvas.width, staticCanvas.height);
            const data = imageData.data;
            
            for (let i = 0; i < data.length; i += 4) {
                const noise = Math.random() * 255;
                data[i] = noise;     // red
                data[i + 1] = noise; // green
                data[i + 2] = noise; // blue
                data[i + 3] = Math.random() * 30; // alpha (low opacity)
            }
            
            ctx.putImageData(imageData, 0, 0);
            
            // Only continue if not transitioning
            if (!this.isTransitioning) {
                this.staticAnimationId = requestAnimationFrame(animateStatic);
            }
        };
        animateStatic();
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text';
        textContainer.innerHTML = `<h2>${this.text}</h2>`;
        
        // Create game container
        const gameContainer = document.createElement('div');
        gameContainer.className = 'card-matching-game';
        
        // Remove instructions - no longer needed
        
        // Create card grid
        const cardGrid = document.createElement('div');
        cardGrid.className = 'card-grid';
        
        // Create cards (2 of each type for pairs)
        const cardData = [];
        this.cardTypes.forEach(type => {
            cardData.push({ ...type });
            cardData.push({ ...type });
        });
        
        // Shuffle cards
        this.shuffleArray(cardData);
        
        // Create card elements
        cardData.forEach((data, index) => {
            const card = this.createCard(data, index);
            cardGrid.appendChild(card);
            this.cards.push({
                element: card,
                data: data,
                index: index,
                isFlipped: false,
                isMatched: false
            });
        });
        
        // Remove progress display - no longer needed
        
        // Assemble game container
        gameContainer.appendChild(cardGrid);
        // Remove completionMessage - auto-advance instead
        
        // Assemble scene (layered properly)
        this.element.appendChild(fluidCanvas); // Fluid background
        this.element.appendChild(staticCanvas); // TV static overlay
        this.element.appendChild(textContainer); // Text content
        this.element.appendChild(gameContainer); // Game content
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Store references
        this.cardGrid = cardGrid;
    }
    
    createCard(data, index) {
        const card = document.createElement('div');
        card.className = 'memory-card';
        card.dataset.cardIndex = index;
        card.dataset.cardType = data.id;
        
        // Create card inner (for flip animation)
        const cardInner = document.createElement('div');
        cardInner.className = 'card-inner';
        
        // Create card front (face down)
        const cardFront = document.createElement('div');
        cardFront.className = 'card-front';
        
        // Add base layer for front
        const frontBase = document.createElement('img');
        frontBase.src = 'assets/images/Card_Base.PNG';
        frontBase.alt = 'Card base';
        frontBase.className = 'card-base';
        cardFront.appendChild(frontBase);
        
        // Add back design on top
        const cardBackImg = document.createElement('img');
        cardBackImg.src = 'assets/images/Card_back.PNG';
        cardBackImg.alt = 'Card back';
        cardBackImg.className = 'card-image';
        cardFront.appendChild(cardBackImg);
        
        // Create card back (face up - shows the card image)
        const cardBack = document.createElement('div');
        cardBack.className = 'card-back';
        
        // Add base layer for back
        const backBase = document.createElement('img');
        backBase.src = 'assets/images/Card_Base.PNG';
        backBase.alt = 'Card base';
        backBase.className = 'card-base';
        cardBack.appendChild(backBase);
        
        // Add card face image on top
        const cardFaceImg = document.createElement('img');
        cardFaceImg.src = data.image;
        cardFaceImg.alt = data.name;
        cardFaceImg.className = 'card-image';
        cardBack.appendChild(cardFaceImg);
        
        // Assemble card
        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        card.appendChild(cardInner);
        
        // Add click handler
        card.addEventListener('click', () => this.flipCard(index));
        
        return card;
    }
    
    flipCard(index) {
        const card = this.cards[index];
        
        // Check if card can be flipped
        if (!this.canFlip || card.isFlipped || card.isMatched) {
            return;
        }
        
        // Check if we already have 2 cards flipped
        if (this.flippedCards.length >= 2) {
            return;
        }
        
        // Flip the card
        card.element.classList.add('flipped');
        card.isFlipped = true;
        this.flippedCards.push(card);
        
        // Check for match if 2 cards are flipped
        if (this.flippedCards.length === 2) {
            this.checkForMatch();
        }
    }
    
    checkForMatch() {
        this.canFlip = false;
        
        const [card1, card2] = this.flippedCards;
        
        if (card1.data.id === card2.data.id) {
            // It's a match!
            setTimeout(() => {
                card1.element.classList.add('matched');
                card2.element.classList.add('matched');
                card1.isMatched = true;
                card2.isMatched = true;
                
                this.matchedPairs++;
                this.updateProgress();
                
                // Reset for next turn
                this.flippedCards = [];
                this.canFlip = true;
                
                // Check if game is complete
                if (this.matchedPairs === this.totalPairs) {
                    this.completeGame();
                }
            }, 600);
        } else {
            // Not a match - flip cards back
            setTimeout(() => {
                card1.element.classList.remove('flipped');
                card2.element.classList.remove('flipped');
                card1.isFlipped = false;
                card2.isFlipped = false;
                
                // Reset for next turn
                this.flippedCards = [];
                this.canFlip = true;
            }, 1000);
        }
    }
    
    updateProgress() {
        // Progress display removed - no longer needed
    }
    
    completeGame() {
        // Mark as transitioning to stop animations
        this.isTransitioning = true;
        
        // Pause to let user see all matched cards
        setTimeout(() => {
            // Add shadow-hidden class to keep shadows hidden throughout animation
            this.cards.forEach(card => {
                card.element.classList.add('shadow-hidden');
            });
            
            // Step 1: Flip cards back over sequentially (top-left to bottom-right)
            this.cards.forEach((card, index) => {
                // Calculate delay based on grid position (0-5 for 2x3 grid)
                const row = Math.floor(index / 3);
                const col = index % 3;
                const delay = (row * 3 + col) * 100; // Stagger by position
                
                setTimeout(() => {
                    card.element.classList.remove('flipped');
                    card.element.classList.remove('matched');
                }, delay);
            });
            
            // Step 2: After all cards are flipped back, translate down and fade
            setTimeout(() => {
                this.cards.forEach((card, index) => {
                    // Calculate delay based on grid position
                    const row = Math.floor(index / 3);
                    const col = index % 3;
                    const delay = (row * 3 + col) * 150; // Stagger animation
                    
                    setTimeout(() => {
                        card.element.classList.add('card-falling');
                    }, delay);
                });
                
                // Step 3: Create beige overlay and fade to beige
                setTimeout(() => {
                    const overlay = document.createElement('div');
                    overlay.className = 'beige-fade-overlay';
                    this.element.appendChild(overlay);
                    
                    // Trigger fade animation
                    requestAnimationFrame(() => {
                        overlay.classList.add('fade-in');
                    });
                    
                    // Step 4: Transition to next scene after fade completes
                    setTimeout(() => {
                        this.onComplete();
                        if (window.sceneManager) {
                            window.sceneManager.nextScene();
                        }
                    }, 1500);
                }, 1500); // Wait longer for all cards to completely disappear
            }, 1200); // Wait for all flips to complete
        }, 500);
    }
    
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    
    cleanup() {
        // Mark as transitioning first
        this.isTransitioning = true;
        
        // Stop fluid animation
        if (this.fluidAnimationId) {
            cancelAnimationFrame(this.fluidAnimationId);
            this.fluidAnimationId = null;
        }
        // Stop static animation
        if (this.staticAnimationId) {
            cancelAnimationFrame(this.staticAnimationId);
            this.staticAnimationId = null;
        }
        
        // Clear canvas contexts
        if (this.fluidCtx) {
            this.fluidCtx = null;
        }
        if (this.staticCtx) {
            this.staticCtx = null;
        }
        
        // Clear cards array
        this.cards = [];
        
        // Remove event listeners if needed
        super.cleanup();
    }
}