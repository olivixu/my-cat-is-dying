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
        
        // Visual state - new minimal design
        this.arcsLayers = []; // Multiple arc layers with different speeds
        this.spiralDots = []; // Dots spiraling inward
        this.trail = []; // Cursor trail
        this.maxTrailLength = 30;
        this.explosionParticles = []; // Particles for rotation celebration
        this.lastRotationCount = 0; // Track rotations for explosions
        
        // Animation
        this.animationId = null;
        this.isTransitioning = false;
        this.spiralProgress = 0; // 0 to 1, controls spiral intensity
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
        interactiveContainer.className = 'interactive-container spiral-container';
        
        // Create canvas for effects
        const canvas = document.createElement('canvas');
        canvas.className = 'spiral-canvas';
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Resize canvas to full viewport
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            this.centerX = canvas.width / 2;
            this.centerY = canvas.height / 2;
            this.maxRadius = Math.max(canvas.width, canvas.height) / 2;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        // Assemble interactive container
        interactiveContainer.appendChild(canvas);
        
        // Assemble scene
        this.element.appendChild(textContainer);
        this.element.appendChild(interactiveContainer);
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Store references
        this.interactiveContainer = interactiveContainer;
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Initialize visual elements
        this.createArcsCanvas();
        this.initializeSpiralDots();
        
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
        
        // Update spiral progress based on speed and rotation
        const targetProgress = Math.min(1, Math.abs(this.totalRotation) / (2 * Math.PI * this.requiredRotations));
        this.spiralProgress += (targetProgress - this.spiralProgress) * 0.1;
        
        // Check for rotation milestones for explosions
        const currentRotationCount = Math.floor(Math.abs(this.totalRotation) / (2 * Math.PI));
        if (currentRotationCount > this.lastRotationCount) {
            this.createExplosion();
            this.lastRotationCount = currentRotationCount;
            
            // If this is the third explosion, wait before transitioning
            if (currentRotationCount === 3) {
                setTimeout(() => {
                    this.triggerTransition();
                }, 2000); // 2 second delay after third burst
            }
        }
    }
    
    createArcsCanvas() {
        // Create many layers of arcs with random rotation speeds
        const maxDimension = Math.max(window.innerWidth, window.innerHeight) * 1.5;
        const maxRadius = maxDimension / 2;
        
        // Create a layer for every few radii - starting from 0 to fill entire screen
        for (let r = 20; r <= maxRadius; r += 30) {
            const canvas = document.createElement('canvas');
            canvas.width = maxDimension;
            canvas.height = maxDimension;
            const ctx = canvas.getContext('2d');
            
            ctx.strokeStyle = '#000000';
            ctx.translate(maxDimension / 2, maxDimension / 2);
            
            // Draw arcs for this radius range
            for (let radius = r; radius < Math.min(r + 30, maxRadius); radius += 6) {
                // Calculate line thickness
                const distanceFromCenter = radius;
                const maxDistance = maxRadius;
                const thicknessFactor = Math.max(0, 1 - (distanceFromCenter / maxDistance));
                
                // Inner arcs are much thicker - 15px at center
                ctx.lineWidth = Math.max(1, 15 * thicknessFactor);
                
                const densityFactor = 1 - (distanceFromCenter / maxDistance) * 0.5;
                const numArcs = Math.floor(12 * densityFactor + 8);
                
                for (let i = 0; i < numArcs; i++) {
                    const arcLength = 0.15 + Math.random() * 0.7;
                    const startAngle = Math.random() * Math.PI * 2;
                    
                    ctx.beginPath();
                    ctx.arc(0, 0, radius, startAngle, startAngle + arcLength, false);
                    ctx.stroke();
                }
            }
            
            // Random speed for each layer, some rotating backwards
            this.arcsLayers.push({
                canvas: canvas,
                rotation: Math.random() * Math.PI * 2, // Random starting rotation
                speed: (Math.random() - 0.5) * 0.01 // Random speed between -0.005 and 0.005
            });
        }
    }
    
    initializeSpiralDots() {
        // Create MORE dots that will spiral inward from viewport edges
        this.maxRadius = Math.max(window.innerWidth, window.innerHeight) / 2;
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 / 15) * i;
            this.spiralDots.push({
                angle: angle,
                radius: this.maxRadius + Math.random() * 200, // Start from viewport edge
                speed: 0.003 + Math.random() * 0.007, // Varied speeds
                size: 6 + Math.random() * 6 // 6-12px dots
            });
        }
    }
    
    drawTrail() {
        if (this.trail.length < 2) return;
        
        // Neon yellow trail with glow
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#ffff00';
        
        for (let i = 1; i < this.trail.length; i++) {
            const prev = this.trail[i - 1];
            const curr = this.trail[i];
            
            this.ctx.globalAlpha = curr.life * 0.6;
            this.ctx.beginPath();
            this.ctx.moveTo(prev.x, prev.y);
            this.ctx.lineTo(curr.x, curr.y);
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
    }
    
    drawBlackCircle() {
        // Draw larger solid black circle in center
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 90, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    createExplosion() {
        // Create neon particle explosion from center - slower like Scene 1
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 / 30) * i + Math.random() * 0.2;
            const speed = 1.5 + Math.random() * 1; // Slow but steady speed
            this.explosionParticles.push({
                x: this.centerX,
                y: this.centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                size: 8 + Math.random() * 4 // Start at 8-12px
            });
        }
    }
    
    updateExplosionParticles() {
        if (this.explosionParticles.length === 0) return;
        
        // Draw explosion particles
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#ffff00';
        this.ctx.fillStyle = '#ffff00';
        
        this.explosionParticles = this.explosionParticles.filter(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.995; // Very minimal slowdown to travel further
            particle.vy *= 0.995;
            particle.life -= 0.005; // Even slower life decay
            
            // Calculate current size - shrink from initial size to 1px
            const currentSize = Math.max(1, particle.size * particle.life);
            
            if (currentSize >= 1) {
                this.ctx.globalAlpha = 1; // Keep full opacity
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
                this.ctx.fill();
                return true;
            }
            return false;
        });
        
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
    }
    
    drawRotatingArcs() {
        // Draw each arc layer with its own rotation
        this.arcsLayers.forEach(layer => {
            this.ctx.save();
            this.ctx.translate(this.centerX, this.centerY);
            this.ctx.rotate(layer.rotation);
            this.ctx.drawImage(
                layer.canvas,
                -layer.canvas.width / 2,
                -layer.canvas.height / 2
            );
            this.ctx.restore();
        });
    }
    
    updateAndDrawSpiralDots() {
        // Draw all dots as bright neon yellow with glow
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#ffff00';
        this.ctx.fillStyle = '#ffff00';
        
        this.spiralDots.forEach(dot => {
            // Update position
            dot.angle += dot.speed * (1 + this.spiralProgress * 2);
            dot.radius = Math.max(0, dot.radius - (0.5 + this.spiralProgress * 1));
            
            // Reset dot when it reaches center
            if (dot.radius < 5) {
                dot.radius = this.maxRadius + Math.random() * 200;
            }
            
            const x = this.centerX + Math.cos(dot.angle) * dot.radius;
            const y = this.centerY + Math.sin(dot.angle) * dot.radius;
            
            // Calculate size based on distance from center - smaller as it gets closer
            const distanceRatio = dot.radius / this.maxRadius;
            const currentSize = Math.max(1, dot.size * distanceRatio);
            
            // Draw glowing neon dot
            this.ctx.beginPath();
            this.ctx.arc(x, y, currentSize, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
    }
    
    animate() {
        if (this.isTransitioning) return;
        
        // Clear canvas efficiently
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fill background
        this.ctx.fillStyle = '#2a2a2a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update each arc layer rotation at different speeds
        this.arcsLayers.forEach(layer => {
            layer.rotation += layer.speed;
        });
        
        // Draw rotating arcs pattern
        this.drawRotatingArcs();
        
        // Draw black circle in center
        this.drawBlackCircle();
        
        // Draw spiraling dots
        this.updateAndDrawSpiralDots();
        
        // Draw trail on top of everything
        this.drawTrail();
        
        // Update and draw explosion particles
        this.updateExplosionParticles();
        
        // Update trail life
        this.trail.forEach(point => {
            point.life *= 0.95;
        });
        this.trail = this.trail.filter(point => point.life > 0.01);
        
        // Decay values
        this.angularVelocity *= 0.95;
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    
    triggerTransition() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        // Simple fade out
        this.element.style.transition = 'opacity 0.5s ease-out';
        this.element.style.opacity = '0';
        
        // Transition to next scene after fade
        setTimeout(() => {
            this.cleanup();
            this.onComplete();
            if (window.sceneManager) {
                window.sceneManager.nextScene();
            }
        }, 500);
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