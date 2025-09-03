// Scene 6: "She doesn't know what the pills are for"
class Scene6 extends Scene {
    constructor(container) {
        super(container);
        this.text = "She doesn't know what the pills are for";
        
        // Game state
        this.gameActive = false;
        this.score = 0;
        this.targetScore = 10;
        this.pills = [];
        this.smokeyPosition = 50; // Percentage from left
        this.smokeySpeed = 2; // Movement speed (reduced for better control)
        
        // Movement state
        this.keys = {
            left: false,
            right: false
        };
        
        // Animation
        this.animationId = null;
        this.lastSpawnTime = 0;
        this.spawnInterval = 1500; // Spawn pill every 1.5 seconds
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-6';
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text';
        textContainer.innerHTML = `<h2>${this.text}</h2>`;
        
        // Create game container
        const gameContainer = document.createElement('div');
        gameContainer.className = 'pill-game-container';
        
        // Create score display
        const scoreDisplay = document.createElement('div');
        scoreDisplay.className = 'pill-score';
        scoreDisplay.innerHTML = `
            <div class="score-text">Pills caught: <span id="pill-count">0</span> / ${this.targetScore}</div>
            <div class="game-hint">Use arrow keys to move Smokey and catch the pills!</div>
        `;
        
        // Create game area
        const gameArea = document.createElement('div');
        gameArea.className = 'pill-game-area';
        
        // Create Smokey (the cat)
        const smokey = document.createElement('div');
        smokey.className = 'smokey-cat';
        smokey.innerHTML = '🐱';
        smokey.style.left = '50%';
        
        // Create success message (hidden initially)
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message hidden';
        successMessage.innerHTML = `
            <p>All pills caught! Good job helping Smokey.</p>
            <button class="continue-btn">Continue</button>
        `;
        
        // Assemble game
        gameArea.appendChild(smokey);
        gameContainer.appendChild(scoreDisplay);
        gameContainer.appendChild(gameArea);
        gameContainer.appendChild(successMessage);
        
        // Assemble scene
        this.element.appendChild(textContainer);
        this.element.appendChild(gameContainer);
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Store references
        this.gameArea = gameArea;
        this.smokey = smokey;
        this.scoreElement = this.element.querySelector('#pill-count');
        this.successMessage = successMessage;
        
        // Setup event listeners
        this.setupControls();
        
        // Add continue button handler
        const btn = successMessage.querySelector('.continue-btn');
        btn?.addEventListener('click', () => {
            this.cleanup();
            this.onComplete();
            if (window.sceneManager) {
                window.sceneManager.nextScene();
            }
        });
        
        // Start game
        this.startGame();
    }
    
    setupControls() {
        // Keyboard controls
        this.keydownHandler = (e) => {
            if (!this.gameActive) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.keys.left = true;
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.keys.right = true;
                    break;
            }
        };
        
        this.keyupHandler = (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    this.keys.left = false;
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    this.keys.right = false;
                    break;
            }
        };
        
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
        
        // Touch controls for mobile
        let touchStartX = null;
        
        this.touchStartHandler = (e) => {
            if (!this.gameActive) return;
            touchStartX = e.touches[0].clientX;
        };
        
        this.touchMoveHandler = (e) => {
            if (!this.gameActive || touchStartX === null) return;
            e.preventDefault();
            
            const touchX = e.touches[0].clientX;
            const diff = touchX - touchStartX;
            
            if (Math.abs(diff) > 10) {
                this.keys.left = diff < 0;
                this.keys.right = diff > 0;
            }
        };
        
        this.touchEndHandler = () => {
            touchStartX = null;
            this.keys.left = false;
            this.keys.right = false;
        };
        
        this.gameArea.addEventListener('touchstart', this.touchStartHandler);
        this.gameArea.addEventListener('touchmove', this.touchMoveHandler);
        this.gameArea.addEventListener('touchend', this.touchEndHandler);
    }
    
    startGame() {
        this.gameActive = true;
        this.score = 0;
        this.pills = [];
        this.lastSpawnTime = Date.now();
        
        // Start animation loop
        this.animate();
    }
    
    animate() {
        if (!this.gameActive) return;
        
        const now = Date.now();
        
        // Spawn new pills
        if (now - this.lastSpawnTime > this.spawnInterval) {
            this.spawnPill();
            this.lastSpawnTime = now;
        }
        
        // Update Smokey position
        this.updateSmokeyPosition();
        
        // Update pills
        this.updatePills();
        
        // Check collisions
        this.checkCollisions();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    updateSmokeyPosition() {
        if (this.keys.left && this.smokeyPosition > 5) {
            this.smokeyPosition -= this.smokeySpeed;
        }
        if (this.keys.right && this.smokeyPosition < 95) {
            this.smokeyPosition += this.smokeySpeed;
        }
        
        this.smokey.style.left = `${this.smokeyPosition}%`;
    }
    
    spawnPill() {
        const pill = document.createElement('div');
        pill.className = 'falling-pill';
        pill.innerHTML = '💊';
        
        // Random x position
        const xPos = 10 + Math.random() * 80; // 10% to 90% from left
        pill.style.left = `${xPos}%`;
        pill.style.top = '-40px';
        
        this.gameArea.appendChild(pill);
        
        this.pills.push({
            element: pill,
            x: xPos,
            y: -40,
            speed: 2 + Math.random() // Variable falling speed
        });
    }
    
    updatePills() {
        this.pills = this.pills.filter(pill => {
            // Move pill down
            pill.y += pill.speed;
            pill.element.style.top = `${pill.y}px`;
            
            // Remove if off screen
            if (pill.y > this.gameArea.offsetHeight) {
                pill.element.remove();
                return false;
            }
            
            return true;
        });
    }
    
    checkCollisions() {
        const smokeyRect = this.smokey.getBoundingClientRect();
        
        this.pills = this.pills.filter(pill => {
            const pillRect = pill.element.getBoundingClientRect();
            
            // Check if pill overlaps with Smokey
            const overlaps = !(
                pillRect.right < smokeyRect.left ||
                pillRect.left > smokeyRect.right ||
                pillRect.bottom < smokeyRect.top ||
                pillRect.top > smokeyRect.bottom
            );
            
            if (overlaps) {
                // Caught the pill!
                this.catchPill(pill);
                return false;
            }
            
            return true;
        });
    }
    
    catchPill(pill) {
        // Remove pill element
        pill.element.remove();
        
        // Increment score
        this.score++;
        this.updateScore();
        
        // Show catch effect
        this.showCatchEffect(pill.x, pill.y);
        
        // Check win condition
        if (this.score >= this.targetScore) {
            this.winGame();
        }
    }
    
    showCatchEffect(x, y) {
        const effect = document.createElement('div');
        effect.className = 'catch-effect';
        effect.innerHTML = '✨';
        effect.style.left = `${x}%`;
        effect.style.top = `${y}px`;
        
        this.gameArea.appendChild(effect);
        
        // Remove after animation
        setTimeout(() => effect.remove(), 500);
    }
    
    updateScore() {
        this.scoreElement.textContent = this.score;
    }
    
    winGame() {
        this.gameActive = false;
        
        // Clear remaining pills
        this.pills.forEach(pill => pill.element.remove());
        this.pills = [];
        
        // Show success message
        this.successMessage.classList.remove('hidden');
        
        // Add celebration effect to Smokey
        this.smokey.classList.add('celebrating');
    }
    
    cleanup() {
        // Stop animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Remove event listeners
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);
        
        if (this.gameArea) {
            this.gameArea.removeEventListener('touchstart', this.touchStartHandler);
            this.gameArea.removeEventListener('touchmove', this.touchMoveHandler);
            this.gameArea.removeEventListener('touchend', this.touchEndHandler);
        }
        
        super.cleanup();
    }
}