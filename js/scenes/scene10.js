// Scene 10: "I don't know how much pain she is in" - Bullet Hell Game
import { Scene } from '../sceneManager.js';

export class Scene10 extends Scene {
    constructor(container) {
        super(container);
        this.text = "I don't know how much pain she holds";
        
        // Game state
        this.gameActive = false;
        this.gameComplete = false;
        this.currentWave = 0;
        this.waveTimer = 0;
        this.survivalTime = 0;
        this.targetSurvivalTime = 20000; // 20 seconds total
        
        // Player state
        this.player = {
            x: 0,
            y: 0,
            size: 8,
            speed: 2,
            invulnerable: false,
            invulnerabilityTimer: 0,
            health: 5,
            maxHealth: 5,
            victorious: false
        };
        
        // Victory fade animation
        this.victoryFade = 1.0;
        this.victoryFadeSpeed = 0.015; // Speed of fade animation
        this.heartYellowBlend = 0; // Blend from red to yellow (0 = red, 1 = yellow)
        
        // Projectiles
        this.projectiles = [];
        this.particles = [];
        
        // Controls - both WASD and Arrow keys
        this.keys = {
            ArrowUp: false,
            ArrowDown: false,
            ArrowLeft: false,
            ArrowRight: false,
            w: false,
            W: false,
            a: false,
            A: false,
            s: false,
            S: false,
            d: false,
            D: false
        };
        
        // Canvas and context
        this.canvas = null;
        this.ctx = null;
        
        // Arena dimensions
        this.arenaWidth = 400;
        this.arenaHeight = 300;
        
        // Animation
        this.animationId = null;
        this.lastTime = 0;
        
        // Wave patterns - different attack patterns
        this.waves = [
            { duration: 3000, pattern: 'gentle_rain' },
            { duration: 3000, pattern: 'spiral' },
            { duration: 4000, pattern: 'cross' },
            { duration: 3000, pattern: 'wave' },
            { duration: 4000, pattern: 'chaos' },
            { duration: 3000, pattern: 'final' }
        ];
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-10 bullet-hell-scene retro-rpg';
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text retro-title';
        textContainer.innerHTML = `<h2>${this.text}</h2>`;
        
        // Create game container
        const gameContainer = document.createElement('div');
        gameContainer.className = 'bullet-hell-container';
        
        // Create canvas
        this.canvas = document.createElement('canvas');
        this.canvas.className = 'bullet-hell-canvas';
        this.canvas.width = this.arenaWidth;
        this.canvas.height = this.arenaHeight;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false; // Pixel perfect rendering
        
        // Create UI elements
        const gameUI = document.createElement('div');
        gameUI.className = 'bullet-hell-ui retro-ui';
        
        // Create health canvas for pixel hearts
        const healthCanvas = document.createElement('canvas');
        healthCanvas.className = 'health-canvas';
        healthCanvas.width = 120;
        healthCanvas.height = 20;
        this.healthCanvas = healthCanvas;
        this.healthCtx = healthCanvas.getContext('2d');
        this.healthCtx.imageSmoothingEnabled = false;
        
        // Assemble game container
        gameContainer.appendChild(this.canvas);
        gameContainer.appendChild(gameUI);
        gameUI.appendChild(healthCanvas);
        
        // Assemble scene
        this.element.appendChild(textContainer);
        this.element.appendChild(gameContainer);
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Store references
        
        // Setup controls
        this.setupControls();
        
        // Update health display
        this.updateHealthDisplay();
        
        // Auto-start the game after a brief delay
        setTimeout(() => {
            this.startGame();
        }, 500);
    }
    
    setupControls() {
        // Keyboard controls
        this.handleKeyDown = (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                // Prevent default and stop propagation when game is active
                if (this.gameActive) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                this.keys[e.key] = true;
            }
        };
        
        this.handleKeyUp = (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                // Prevent default and stop propagation when game is active
                if (this.gameActive) {
                    e.preventDefault();
                    e.stopPropagation();
                }
                this.keys[e.key] = false;
            }
        };
        
        window.addEventListener('keydown', this.handleKeyDown);
        window.addEventListener('keyup', this.handleKeyUp);
    }
    
    startGame() {
        this.gameActive = true;
        this.gameComplete = false;
        this.currentWave = 0;
        this.waveTimer = 0;
        this.survivalTime = 0;
        this.player.health = this.player.maxHealth;
        this.player.victorious = false;
        this.victoryFade = 1.0;
        this.heartYellowBlend = 0;
        this.player.x = this.arenaWidth / 2;
        this.player.y = this.arenaHeight - 50;
        this.projectiles = [];
        this.particles = [];
        
        this.updateHealthDisplay();
        
        // Start animation loop
        this.lastTime = performance.now();
        this.animate();
    }
    
    animate(currentTime = 0) {
        if (!this.gameActive) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Update game state
        this.update(deltaTime);
        
        // Render
        this.render();
        
        // Continue animation
        this.animationId = requestAnimationFrame((t) => this.animate(t));
    }
    
    update(deltaTime) {
        if (!this.gameActive) return;
        
        // Update survival time only if game not complete
        if (!this.gameComplete) {
            this.survivalTime += deltaTime;
        }
        
        // Always update player (even during victory)
        this.updatePlayer(deltaTime);
        
        // Update victory animations
        if (this.player.victorious) {
            // Animate heart color transition
            if (this.heartYellowBlend < 1) {
                this.heartYellowBlend = Math.min(1, this.heartYellowBlend + 0.02);
            }
        }
        
        // Only update game mechanics if not complete
        if (!this.gameComplete) {
            // Update wave
            this.updateWave(deltaTime);
            
            // Check collisions
            this.checkCollisions();
            
            // Check win condition
            if (this.survivalTime >= this.targetSurvivalTime) {
                this.completeGame();
            }
            
            // Check lose condition
            if (this.player.health <= 0) {
                this.gameOver();
            }
        }
        
        // Always update projectiles and particles (for fade out)
        this.updateProjectiles(deltaTime);
        this.updateParticles(deltaTime);
    }
    
    updatePlayer(deltaTime) {
        // Handle invulnerability
        if (this.player.invulnerable) {
            this.player.invulnerabilityTimer -= deltaTime;
            if (this.player.invulnerabilityTimer <= 0) {
                this.player.invulnerable = false;
            }
        }
        
        // Movement - check both WASD and arrow keys
        let dx = 0;
        let dy = 0;
        
        if (this.keys.ArrowLeft || this.keys.a || this.keys.A) dx -= this.player.speed;
        if (this.keys.ArrowRight || this.keys.d || this.keys.D) dx += this.player.speed;
        if (this.keys.ArrowUp || this.keys.w || this.keys.W) dy -= this.player.speed;
        if (this.keys.ArrowDown || this.keys.s || this.keys.S) dy += this.player.speed;
        
        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
            dx *= 0.707;
            dy *= 0.707;
        }
        
        // Apply movement with boundaries
        this.player.x = Math.max(this.player.size, Math.min(this.arenaWidth - this.player.size, this.player.x + dx));
        this.player.y = Math.max(this.player.size, Math.min(this.arenaHeight - this.player.size, this.player.y + dy));
    }
    
    updateWave(deltaTime) {
        this.waveTimer += deltaTime;
        
        const currentWaveData = this.waves[this.currentWave];
        
        if (!currentWaveData) return;
        
        // Spawn projectiles based on pattern
        this.spawnProjectiles(currentWaveData.pattern, deltaTime);
        
        // Check if wave is complete
        if (this.waveTimer >= currentWaveData.duration) {
            this.currentWave++;
            this.waveTimer = 0;
            
            // No wave messages, just continue to next pattern
        }
    }
    
    spawnProjectiles(pattern, deltaTime) {
        const spawnRate = 100; // Base spawn rate in ms
        
        if (this.waveTimer % spawnRate < deltaTime) {
            switch (pattern) {
                case 'gentle_rain':
                    // Falling tears
                    if (Math.random() < 0.3) {
                        this.projectiles.push({
                            x: Math.random() * this.arenaWidth,
                            y: -10,
                            vx: 0,
                            vy: 1.5,
                            size: 6,
                            type: 'tear',
                            color: '#ffffff'
                        });
                    }
                    break;
                    
                case 'spiral':
                    // Spiraling questions
                    const angle = (this.waveTimer / 100) * Math.PI / 4;
                    const radius = 150;
                    const centerX = this.arenaWidth / 2;
                    const centerY = this.arenaHeight / 2;
                    
                    if (Math.random() < 0.2) {
                        const x = centerX + Math.cos(angle) * radius;
                        const y = centerY + Math.sin(angle) * radius;
                        const targetAngle = Math.atan2(this.player.y - y, this.player.x - x);
                        
                        this.projectiles.push({
                            x: x,
                            y: y,
                            vx: Math.cos(targetAngle) * 1.2,
                            vy: Math.sin(targetAngle) * 1.2,
                            size: 6,
                            type: 'spiral',
                            color: '#ffffff'
                        });
                    }
                    break;
                    
                case 'cross':
                    // Cross pattern from edges
                    if (Math.random() < 0.15) {
                        const side = Math.floor(Math.random() * 4);
                        let x, y, vx, vy;
                        
                        switch (side) {
                            case 0: // Top
                                x = Math.random() * this.arenaWidth;
                                y = -10;
                                vx = (Math.random() - 0.5) * 1;
                                vy = 3;
                                break;
                            case 1: // Right
                                x = this.arenaWidth + 10;
                                y = Math.random() * this.arenaHeight;
                                vx = -3;
                                vy = (Math.random() - 0.5) * 1;
                                break;
                            case 2: // Bottom
                                x = Math.random() * this.arenaWidth;
                                y = this.arenaHeight + 10;
                                vx = (Math.random() - 0.5) * 1;
                                vy = -3;
                                break;
                            case 3: // Left
                                x = -10;
                                y = Math.random() * this.arenaHeight;
                                vx = 3;
                                vy = (Math.random() - 0.5) * 1;
                                break;
                        }
                        
                        this.projectiles.push({
                            x, y, vx, vy,
                            size: 4,
                            type: 'cross',
                            color: '#ffffff'
                        });
                    }
                    break;
                    
                case 'wave':
                    // Sine wave pattern
                    if (Math.random() < 0.25) {
                        const startX = Math.random() < 0.5 ? -10 : this.arenaWidth + 10;
                        const direction = startX < 0 ? 1 : -1;
                        
                        this.projectiles.push({
                            x: startX,
                            y: this.arenaHeight / 2 + Math.sin(this.waveTimer / 200) * 50,
                            vx: direction * 2,
                            vy: Math.cos(this.waveTimer / 200) * 1.5,
                            size: 4,
                            type: 'wave',
                            color: '#ffffff',
                            phase: this.waveTimer
                        });
                    }
                    break;
                    
                case 'chaos':
                    // Random chaotic pattern
                    if (Math.random() < 0.4) {
                        const edge = Math.random() * (this.arenaWidth + this.arenaHeight) * 2;
                        let x, y;
                        
                        if (edge < this.arenaWidth) {
                            x = edge;
                            y = -10;
                        } else if (edge < this.arenaWidth + this.arenaHeight) {
                            x = this.arenaWidth + 10;
                            y = edge - this.arenaWidth;
                        } else if (edge < this.arenaWidth * 2 + this.arenaHeight) {
                            x = edge - this.arenaWidth - this.arenaHeight;
                            y = this.arenaHeight + 10;
                        } else {
                            x = -10;
                            y = edge - this.arenaWidth * 2 - this.arenaHeight;
                        }
                        
                        const angle = Math.atan2(this.player.y - y, this.player.x - x);
                        const speed = 1.5 + Math.random() * 2;
                        
                        this.projectiles.push({
                            x, y,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            size: 4 + Math.random() * 4,
                            type: 'chaos',
                            color: '#ffffff'
                        });
                    }
                    break;
                    
                case 'final':
                    // Gentle ending pattern
                    if (Math.random() < 0.1) {
                        const angle = Math.random() * Math.PI * 2;
                        const distance = 200;
                        
                        this.projectiles.push({
                            x: this.arenaWidth / 2 + Math.cos(angle) * distance,
                            y: this.arenaHeight / 2 + Math.sin(angle) * distance,
                            vx: -Math.cos(angle) * 0.8,
                            vy: -Math.sin(angle) * 0.8,
                            size: 6,
                            type: 'final',
                            color: '#ffffff'
                        });
                    }
                    break;
            }
        }
    }
    
    updateProjectiles(deltaTime) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const proj = this.projectiles[i];
            
            // Update position
            proj.x += proj.vx;
            proj.y += proj.vy;
            
            // Special movement for wave type
            if (proj.type === 'wave') {
                proj.vy = Math.cos((this.waveTimer - proj.phase) / 150) * 2;
            }
            
            // Remove if out of bounds
            if (proj.x < -20 || proj.x > this.arenaWidth + 20 ||
                proj.y < -20 || proj.y > this.arenaHeight + 20) {
                this.projectiles.splice(i, 1);
            }
        }
    }
    
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= deltaTime;
            particle.opacity = particle.life / particle.maxLife;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        if (this.player.invulnerable) return;
        
        for (const proj of this.projectiles) {
            const dx = this.player.x - proj.x;
            const dy = this.player.y - proj.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.player.size / 2 + proj.size / 2) {
                // Hit!
                this.playerHit();
                
                // Create hit particles
                this.createHitParticles(this.player.x, this.player.y);
                
                // Remove projectile
                const index = this.projectiles.indexOf(proj);
                if (index > -1) {
                    this.projectiles.splice(index, 1);
                }
                
                break;
            }
        }
    }
    
    playerHit() {
        this.player.health--;
        this.player.invulnerable = true;
        this.player.invulnerabilityTimer = 1000; // 1 second of invulnerability
        
        this.updateHealthDisplay();
        
        // Screen shake effect
        this.canvas.classList.add('screen-shake');
        setTimeout(() => {
            this.canvas.classList.remove('screen-shake');
        }, 200);
    }
    
    createHitParticles(x, y) {
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 * i) / 10;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * 3,
                vy: Math.sin(angle) * 3,
                size: 4,
                color: '#ef4444',
                life: 500,
                maxLife: 500,
                opacity: 1
            });
        }
    }
    
    updateHealthDisplay() {
        if (!this.healthCtx) return;
        
        // Clear health canvas
        this.healthCtx.clearRect(0, 0, this.healthCanvas.width, this.healthCanvas.height);
        
        // Draw pixel hearts
        for (let i = 0; i < this.player.maxHealth; i++) {
            const x = i * 24 + 10;
            const y = 8;
            
            if (i < this.player.health) {
                // Draw filled heart - blend to yellow when victorious
                if (this.player.victorious) {
                    const r = 255;
                    const g = Math.floor(255 * this.heartYellowBlend);
                    const b = 0;
                    this.healthCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                } else {
                    this.healthCtx.fillStyle = '#ff0000';
                }
                this.healthCtx.fillRect(x - 3, y - 2, 2, 2);
                this.healthCtx.fillRect(x + 1, y - 2, 2, 2);
                this.healthCtx.fillRect(x - 4, y, 8, 2);
                this.healthCtx.fillRect(x - 3, y + 2, 6, 2);
                this.healthCtx.fillRect(x - 2, y + 4, 4, 2);
                this.healthCtx.fillRect(x - 1, y + 6, 2, 1);
            } else {
                // Draw empty heart outline
                this.healthCtx.fillStyle = '#ffffff';
                // Top bumps
                this.healthCtx.fillRect(x - 3, y - 2, 2, 1);
                this.healthCtx.fillRect(x + 1, y - 2, 2, 1);
                // Sides
                this.healthCtx.fillRect(x - 4, y - 1, 1, 3);
                this.healthCtx.fillRect(x + 3, y - 1, 1, 3);
                // Bottom outline
                this.healthCtx.fillRect(x - 3, y + 3, 1, 1);
                this.healthCtx.fillRect(x + 2, y + 3, 1, 1);
                this.healthCtx.fillRect(x - 2, y + 4, 1, 1);
                this.healthCtx.fillRect(x + 1, y + 4, 1, 1);
                this.healthCtx.fillRect(x - 1, y + 5, 2, 1);
            }
        }
    }
    
    render() {
        // Update fade animation if victorious
        if (this.player.victorious && this.victoryFade > 0) {
            this.victoryFade = Math.max(0, this.victoryFade - this.victoryFadeSpeed);
        }
        
        // Clear canvas with black
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.arenaWidth, this.arenaHeight);
        
        // Apply fade effect if victorious
        if (this.player.victorious) {
            this.ctx.globalAlpha = this.victoryFade;
        }
        
        // Draw particles as pixels
        for (const particle of this.particles) {
            if (particle.opacity > 0.3) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(Math.floor(particle.x), Math.floor(particle.y), 2, 2);
            }
        }
        
        // Draw projectiles as white pixels/teardrops
        this.ctx.fillStyle = '#ffffff';
        for (const proj of this.projectiles) {
            if (proj.type === 'tear') {
                // Draw simple teardrop
                this.ctx.fillRect(proj.x - 2, proj.y - 4, 4, 6);
                this.ctx.fillRect(proj.x - 1, proj.y + 2, 2, 2);
            } else {
                // Draw as simple white squares
                const size = Math.max(2, proj.size / 2);
                this.ctx.fillRect(proj.x - size/2, proj.y - size/2, size, size);
            }
        }
        
        // Draw player as pixel heart (always full opacity when victorious)
        if (this.player.victorious) {
            this.ctx.globalAlpha = 1;
        }
        
        if (this.player.invulnerable && Math.floor(this.player.invulnerabilityTimer / 100) % 2 === 0) {
            // Skip drawing when flashing
        } else {
            // Blend from red to yellow during victory
            if (this.player.victorious) {
                const r = 255;
                const g = Math.floor(255 * this.heartYellowBlend);
                const b = 0;
                this.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            } else {
                this.ctx.fillStyle = '#ff0000';
            }
            const x = Math.floor(this.player.x);
            const y = Math.floor(this.player.y);
            
            // Draw pixel heart shape
            this.ctx.fillRect(x - 3, y - 2, 2, 2);
            this.ctx.fillRect(x + 1, y - 2, 2, 2);
            this.ctx.fillRect(x - 4, y, 8, 2);
            this.ctx.fillRect(x - 3, y + 2, 6, 2);
            this.ctx.fillRect(x - 2, y + 4, 4, 2);
            this.ctx.fillRect(x - 1, y + 6, 2, 1);
        }
        
        // Restore fade for other elements
        if (this.player.victorious) {
            this.ctx.globalAlpha = this.victoryFade;
        }
        
        // Draw border (on top)
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(1, 1, this.arenaWidth - 2, this.arenaHeight - 2);
        
        // Draw progress bar (retro style)
        const progress = Math.min(1, this.survivalTime / this.targetSurvivalTime);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(10, this.arenaHeight - 15, this.arenaWidth - 20, 8);
        this.ctx.fillStyle = '#ffffff';
        const barWidth = Math.floor((this.arenaWidth - 22) * progress);
        for (let i = 0; i < barWidth; i += 3) {
            this.ctx.fillRect(11 + i, this.arenaHeight - 14, 2, 6);
        }
        
        // Reset global alpha
        this.ctx.globalAlpha = 1;
    }
    
    completeGame() {
        this.gameComplete = true;
        // Keep gameActive true so animation continues
        this.player.victorious = true;
        
        // Clear projectiles with effect
        for (const proj of this.projectiles) {
            this.createHitParticles(proj.x, proj.y);
        }
        this.projectiles = [];
        
        // Wait for the full animation, then advance
        setTimeout(() => {
            this.gameActive = false; // Now stop the game loop
            this.onComplete();
            if (window.sceneManager) {
                window.sceneManager.nextScene();
            }
        }, 3000);
    }
    
    gameOver() {
        this.gameActive = false;
        
        // Reset all keys to prevent stuck keys
        for (let key in this.keys) {
            this.keys[key] = false;
        }
        
        // Auto-restart after a brief delay
        setTimeout(() => {
            this.startGame();
        }, 1500);
    }
    
    cleanup() {
        // Stop animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Remove event listeners
        window.removeEventListener('keydown', this.handleKeyDown);
        window.removeEventListener('keyup', this.handleKeyUp);
        
        super.cleanup();
    }
}