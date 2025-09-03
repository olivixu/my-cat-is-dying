// Scene 8: "There is a lot I don't know because I am a human"
class Scene8 extends Scene {
    constructor(container) {
        super(container);
        this.text = "There is a lot I don't know because I am a human";
        
        // Spiral detection state
        this.mousePositions = [];
        this.maxPositions = 20; // Keep last 20 positions
        this.centerX = 0;
        this.centerY = 0;
        this.totalRotation = 0;
        this.lastAngle = null;
        this.angularVelocity = 0;
        this.requiredRotations = 3;
        this.minSpeed = 2; // Minimum radians per second
        
        // Visual state
        this.vortexStrength = 0;
        this.particles = [];
        this.trail = [];
        this.maxTrailLength = 30;
        
        // Animation
        this.animationId = null;
        this.isTransitioning = false;
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-8';
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text';
        textContainer.innerHTML = `<h2>${this.text}</h2>`;
        
        // Create interactive container
        const interactiveContainer = document.createElement('div');
        interactiveContainer.className = 'interactive-container vortex-container';
        
        // Create canvas for effects
        const canvas = document.createElement('canvas');
        canvas.className = 'vortex-canvas';
        canvas.width = 800;
        canvas.height = 600;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Create vortex center
        const vortexCenter = document.createElement('div');
        vortexCenter.className = 'vortex-center';
        vortexCenter.innerHTML = '🌀';
        
        // Create instruction text
        const instructions = document.createElement('div');
        instructions.className = 'vortex-instructions';
        instructions.innerHTML = `
            <p>Spin your cursor in circles to open the portal</p>
            <div class="rotation-indicator">
                <span id="rotation-count">0</span> / ${this.requiredRotations} rotations
            </div>
        `;
        
        // Create speed indicator
        const speedMeter = document.createElement('div');
        speedMeter.className = 'speed-meter';
        speedMeter.innerHTML = `
            <div class="speed-bar">
                <div class="speed-fill" id="speed-fill"></div>
            </div>
            <div class="speed-label">Speed</div>
        `;
        
        // Assemble interactive container
        interactiveContainer.appendChild(canvas);
        interactiveContainer.appendChild(vortexCenter);
        interactiveContainer.appendChild(instructions);
        interactiveContainer.appendChild(speedMeter);
        
        // Assemble scene
        this.element.appendChild(textContainer);
        this.element.appendChild(interactiveContainer);
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Store references
        this.vortexCenter = vortexCenter;
        this.rotationCount = this.element.querySelector('#rotation-count');
        this.speedFill = this.element.querySelector('#speed-fill');
        this.interactiveContainer = interactiveContainer;
        
        // Calculate center position
        const rect = canvas.getBoundingClientRect();
        this.centerX = rect.width / 2;
        this.centerY = rect.height / 2;
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Create initial particles
        this.createParticles();
        
        // Start animation loop
        this.animate();
    }
    
    setupEventListeners() {
        this.mouseMoveHandler = (e) => this.handleMouseMove(e);
        this.touchMoveHandler = (e) => this.handleTouchMove(e);
        
        this.canvas.addEventListener('mousemove', this.mouseMoveHandler);
        this.canvas.addEventListener('touchmove', this.touchMoveHandler);
    }
    
    handleMouseMove(e) {
        if (this.isTransitioning) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.processMovement(x, y);
    }
    
    handleTouchMove(e) {
        if (this.isTransitioning) return;
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.processMovement(x, y);
    }
    
    processMovement(x, y) {
        // Add to trail
        this.trail.push({ x, y, life: 1.0 });
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Add to position history
        this.mousePositions.push({ x, y, time: Date.now() });
        if (this.mousePositions.length > this.maxPositions) {
            this.mousePositions.shift();
        }
        
        // Calculate angle from center
        const dx = x - this.centerX;
        const dy = y - this.centerY;
        const angle = Math.atan2(dy, dx);
        
        // Detect rotation
        if (this.lastAngle !== null) {
            let deltaAngle = angle - this.lastAngle;
            
            // Handle angle wrap-around
            if (deltaAngle > Math.PI) {
                deltaAngle -= 2 * Math.PI;
            } else if (deltaAngle < -Math.PI) {
                deltaAngle += 2 * Math.PI;
            }
            
            // Only count if moving in consistent direction and not too fast (avoid jumps)
            if (Math.abs(deltaAngle) < Math.PI / 4) {
                this.totalRotation += deltaAngle;
                
                // Calculate angular velocity
                if (this.mousePositions.length >= 2) {
                    const timeDelta = (Date.now() - this.mousePositions[0].time) / 1000;
                    if (timeDelta > 0) {
                        this.angularVelocity = Math.abs(deltaAngle) / timeDelta * this.mousePositions.length;
                    }
                }
            }
        }
        
        this.lastAngle = angle;
        
        // Update vortex strength based on speed
        const targetStrength = Math.min(1, this.angularVelocity / this.minSpeed);
        this.vortexStrength += (targetStrength - this.vortexStrength) * 0.1;
        
        // Update displays
        this.updateDisplays();
        
        // Check for completion
        const rotations = Math.abs(this.totalRotation) / (2 * Math.PI);
        if (rotations >= this.requiredRotations && this.angularVelocity >= this.minSpeed) {
            this.triggerTransition();
        }
    }
    
    updateDisplays() {
        // Update rotation count
        const rotations = Math.floor(Math.abs(this.totalRotation) / (2 * Math.PI));
        this.rotationCount.textContent = Math.min(rotations, this.requiredRotations);
        
        // Update speed meter
        const speedPercent = Math.min(100, (this.angularVelocity / this.minSpeed) * 100);
        this.speedFill.style.width = `${speedPercent}%`;
        
        // Update vortex visual
        const scale = 1 + this.vortexStrength * 2;
        const rotation = this.totalRotation * 10;
        this.vortexCenter.style.transform = `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`;
        this.vortexCenter.style.opacity = 0.3 + this.vortexStrength * 0.7;
    }
    
    createParticles() {
        // Create floating particles around the vortex
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                size: Math.random() * 3 + 1,
                life: 1
            });
        }
    }
    
    animate() {
        if (this.isTransitioning) return;
        
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw trail
        this.drawTrail();
        
        // Update and draw particles
        this.updateParticles();
        
        // Decay values
        this.angularVelocity *= 0.95;
        this.vortexStrength *= 0.95;
        
        // Update trail life
        this.trail.forEach(point => {
            point.life *= 0.95;
        });
        this.trail = this.trail.filter(point => point.life > 0.01);
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    drawTrail() {
        if (this.trail.length < 2) return;
        
        this.ctx.strokeStyle = `rgba(139, 92, 246, 0.5)`;
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        
        for (let i = 1; i < this.trail.length; i++) {
            const prev = this.trail[i - 1];
            const curr = this.trail[i];
            
            this.ctx.globalAlpha = curr.life * 0.5;
            this.ctx.beginPath();
            this.ctx.moveTo(prev.x, prev.y);
            this.ctx.lineTo(curr.x, curr.y);
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            // Pull toward center when vortex is active
            if (this.vortexStrength > 0.1) {
                const dx = this.centerX - particle.x;
                const dy = this.centerY - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance > 10) {
                    const force = this.vortexStrength * 10 / distance;
                    particle.vx += (dx / distance) * force;
                    particle.vy += (dy / distance) * force;
                }
            }
            
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Apply friction
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            
            // Wrap around edges
            if (particle.x < 0) particle.x = this.canvas.width;
            if (particle.x > this.canvas.width) particle.x = 0;
            if (particle.y < 0) particle.y = this.canvas.height;
            if (particle.y > this.canvas.height) particle.y = 0;
            
            // Draw particle
            this.ctx.fillStyle = `rgba(139, 92, 246, ${particle.life})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    triggerTransition() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        // Add transition class for CSS animation
        this.interactiveContainer.classList.add('vortex-transition');
        
        // Create sucking animation
        this.element.style.animation = 'suckIntoVortex 1.5s ease-in forwards';
        
        // Transition to next scene after animation
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
        if (this.canvas) {
            this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
            this.canvas.removeEventListener('touchmove', this.touchMoveHandler);
        }
        
        super.cleanup();
    }
}