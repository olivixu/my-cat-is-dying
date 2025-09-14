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
        this.smokeySpeed = 0.5; // Movement speed (much slower for better control)
        
        // Movement state
        this.keys = {
            left: false,
            right: false
        };
        
        // Animation
        this.animationId = null;
        this.lastSpawnTime = 0;
        this.spawnInterval = 1500; // Spawn pill every 1.5 seconds
        
        // Pill images
        this.pillImages = [
            'assets/images/pill versions/pixil-frame-0.png',
            'assets/images/pill versions/pixil-frame-1.png',
            'assets/images/pill versions/pixil-frame-2.png',
            'assets/images/pill versions/pixil-frame-3.png'
        ];
        this.preloadedImages = [];
        
        // Cat frame images
        this.catFrames = [
            'assets/images/Cat frames/pixil-frame-0.png',
            'assets/images/Cat frames/pixil-frame-1.png'
        ];
        this.currentFrame = 0;
        this.frameTimer = 0;
    }
    
    async init() {
        // Preload images
        await this.preloadPillImages();
        await this.preloadCatFrames();
        
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-6';
        
        // Create Windows XP background elements
        const xpSky = document.createElement('img');
        xpSky.className = 'xp-sky';
        xpSky.src = 'assets/images/windowsxp-sky.png';
        xpSky.alt = 'Windows XP Sky';
        
        const xpLand = document.createElement('img');
        xpLand.className = 'xp-land';
        xpLand.src = 'assets/images/windowsxp-land.png';
        xpLand.alt = 'Windows XP Land';
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text';
        textContainer.innerHTML = `<h2>${this.text}</h2>`;
        
        // Create game container
        const gameContainer = document.createElement('div');
        gameContainer.className = 'pill-game-container';
        
        // Create pill indicators display
        const scoreDisplay = document.createElement('div');
        scoreDisplay.className = 'pill-score';
        
        // Create pill indicators
        const indicatorsContainer = document.createElement('div');
        indicatorsContainer.className = 'pill-indicators';
        for (let i = 0; i < this.targetScore; i++) {
            const indicator = document.createElement('div');
            indicator.className = 'pill-indicator';
            indicator.dataset.index = i;
            
            // Add pixel circle as background
            const circleImg = document.createElement('img');
            circleImg.src = 'assets/images/Pixel circle.png';
            circleImg.alt = '';
            circleImg.className = 'indicator-circle';
            indicator.appendChild(circleImg);
            
            indicatorsContainer.appendChild(indicator);
        }
        
        scoreDisplay.appendChild(indicatorsContainer);
        
        // Create game area
        const gameArea = document.createElement('div');
        gameArea.className = 'pill-game-area';
        
        // Create Smokey (the cat)
        const smokey = document.createElement('div');
        smokey.className = 'smokey-cat';
        
        // Add cat image
        const catImg = document.createElement('img');
        catImg.src = this.catFrames[0];
        catImg.alt = 'Smokey';
        catImg.className = 'smokey-sprite';
        smokey.appendChild(catImg);
        
        smokey.style.left = '50%';
        
        
        // Assemble game
        gameArea.appendChild(smokey);
        gameContainer.appendChild(scoreDisplay);
        gameContainer.appendChild(gameArea);
        
        // Assemble scene (with XP backgrounds as first layers)
        this.element.appendChild(xpSky);
        this.element.appendChild(xpLand);
        this.element.appendChild(textContainer);
        this.element.appendChild(gameContainer);
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Store references
        this.gameArea = gameArea;
        this.smokey = smokey;
        this.scoreElement = this.element.querySelector('#pill-count');
        
        // Setup event listeners
        this.setupControls();
        
        // Start game
        this.startGame();
    }
    
    async preloadPillImages() {
        const loadPromises = this.pillImages.map(src => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => {
                    this.preloadedImages.push(img);
                    resolve();
                };
                img.onerror = reject;
                img.src = src;
            });
        });
        
        await Promise.all(loadPromises);
    }
    
    async preloadCatFrames() {
        const loadPromises = this.catFrames.map(src => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = reject;
                img.src = src;
            });
        });
        
        await Promise.all(loadPromises);
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
        
        // Update cat animation frame
        this.updateCatFrame();
        
        // Update pills
        this.updatePills();
        
        // Check collisions
        this.checkCollisions();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    updateSmokeyPosition() {
        let isMoving = false;
        const catImg = this.smokey.querySelector('.smokey-sprite');
        
        if (this.keys.left && this.smokeyPosition > 2) {
            this.smokeyPosition -= this.smokeySpeed;
            isMoving = true;
            // Face left (flip horizontally)
            if (catImg) {
                catImg.style.transform = 'scaleX(-1)';
            }
        }
        if (this.keys.right && this.smokeyPosition < 98) {
            this.smokeyPosition += this.smokeySpeed;
            isMoving = true;
            // Face right (normal)
            if (catImg) {
                catImg.style.transform = 'scaleX(1)';
            }
        }
        
        this.smokey.style.left = `${this.smokeyPosition}%`;
        
        // Animate frames slightly faster when moving
        if (isMoving) {
            this.frameTimer += 0.5; // Slightly faster animation when moving
        }
    }
    
    updateCatFrame() {
        this.frameTimer++;
        
        // Switch frames every 60 frames (roughly once per second at 60fps)
        if (this.frameTimer >= 60) {
            this.frameTimer = 0;
            this.currentFrame = (this.currentFrame + 1) % this.catFrames.length;
            
            const catImg = this.smokey.querySelector('.smokey-sprite');
            if (catImg) {
                catImg.src = this.catFrames[this.currentFrame];
            }
        }
    }
    
    spawnPill() {
        const pill = document.createElement('div');
        pill.className = 'falling-pill';
        
        // Create pill image element
        const pillImg = document.createElement('img');
        const randomPillIndex = Math.floor(Math.random() * this.pillImages.length);
        pillImg.src = this.pillImages[randomPillIndex];
        pillImg.alt = 'Pill';
        pillImg.style.width = '40px';
        pillImg.style.height = '40px';
        pill.appendChild(pillImg);
        
        // Random x position across full screen width
        const xPos = 5 + Math.random() * 90; // 5% to 95% from left
        pill.style.left = `${xPos}%`;
        pill.style.top = '-100px'; // Start further above screen
        
        this.gameArea.appendChild(pill);
        
        this.pills.push({
            element: pill,
            x: xPos,
            y: -100,
            speed: 3 + Math.random() * 2 // Faster falling speed
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
        // Create container for pixel explosion
        const explosion = document.createElement('div');
        explosion.className = 'pixel-explosion';
        explosion.style.left = `${x}%`;
        explosion.style.top = `${y}px`;
        
        // Create 8 pixel particles
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'pixel-particle';
            
            // Calculate angle for this particle
            const angle = (i / particleCount) * Math.PI * 2;
            particle.style.setProperty('--angle', angle + 'rad');
            
            explosion.appendChild(particle);
        }
        
        this.gameArea.appendChild(explosion);
        
        // Remove after animation
        setTimeout(() => explosion.remove(), 600);
    }
    
    updateScore() {
        // Fill the indicator at the current score index with a pill image
        const indicators = this.element.querySelectorAll('.pill-indicator');
        if (indicators[this.score - 1]) {
            indicators[this.score - 1].classList.add('filled');
            
            // Add pill image on top of the circle
            const pillImg = document.createElement('img');
            // Use the first pill image for consistency in the score display
            pillImg.src = this.pillImages[0];
            pillImg.alt = 'Pill';
            pillImg.className = 'indicator-pill';
            pillImg.style.width = '20px';
            pillImg.style.height = '20px';
            indicators[this.score - 1].appendChild(pillImg);
        }
    }
    
    winGame() {
        this.gameActive = false;
        
        // Clear remaining pills
        this.pills.forEach(pill => pill.element.remove());
        this.pills = [];
        
        // Add celebration effect to Smokey
        this.smokey.classList.add('celebrating');
        
        // Auto-advance to next scene after a short delay
        setTimeout(() => {
            this.cleanup();
            this.onComplete();
            if (window.sceneManager) {
                window.sceneManager.nextScene();
            }
        }, 1500);
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