// Scene 8: "There is a lot I don't know because I am a human"
import { Scene } from '../sceneManager.js';

export class Scene8 extends Scene {
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
        
        // Visual state - OPTIMIZED
        this.arcsLayers = []; // Reduced to 5 layers max
        this.spiralDots = []; // Dots spiraling inward
        this.trail = []; // Cursor trail
        this.maxTrailLength = 30;
        
        // OPTIMIZATION: Particle pooling
        this.particlePool = [];
        this.activeParticles = [];
        this.maxParticles = 50;
        this.lastRotationCount = 0;
        
        // Animation state
        this.animationId = null;
        this.isTransitioning = false;
        this.spiralProgress = 0;
        
        // OPTIMIZATION: Performance monitoring
        this.lastFrameTime = 0;
        this.frameCount = 0;
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS;
        
        // OPTIMIZATION: Idle detection
        this.lastInteractionTime = Date.now();
        this.idleTimeout = 2000; // 2 seconds
        this.isIdle = false;
        
        // OPTIMIZATION: Throttling
        this.lastMouseProcess = 0;
        this.mouseThrottle = 16; // ~60fps
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
        // OPTIMIZATION: Get context with performance hints
        this.ctx = canvas.getContext('2d', {
            alpha: false,
            desynchronized: true,
            willReadFrequently: false
        });
        
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
        
        // Initialize visual elements with optimizations
        this.createOptimizedArcs();
        this.initializeSpiralDots();
        this.initializeParticlePool();
        
        // Start optimized animation loop
        this.animate();
    }
    
    setupEventListeners() {
        // OPTIMIZATION: Throttled mouse move handler
        this.mouseMoveHandler = (e) => {
            const now = Date.now();
            if (now - this.lastMouseProcess < this.mouseThrottle) return;
            this.lastMouseProcess = now;
            this.lastInteractionTime = now;
            this.isIdle = false;
            this.handleMouseMove(e);
        };
        
        // OPTIMIZATION: Throttled touch move handler  
        this.touchMoveHandler = (e) => {
            const now = Date.now();
            if (now - this.lastMouseProcess < this.mouseThrottle) return;
            this.lastMouseProcess = now;
            this.lastInteractionTime = now;
            this.isIdle = false;
            this.handleTouchMove(e);
        };
        
        this.canvas.addEventListener('mousemove', this.mouseMoveHandler, { passive: true });
        this.canvas.addEventListener('touchmove', this.touchMoveHandler, { passive: false });
        
        // Detect idle state
        this.canvas.addEventListener('mouseenter', () => {
            this.isIdle = false;
            this.lastInteractionTime = Date.now();
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.lastInteractionTime = Date.now() - this.idleTimeout;
            this.isIdle = true;
        });
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
    
    // OPTIMIZATION: Create only 5 arc layers instead of 50+
    createOptimizedArcs() {
        const numLayers = 5; // Reduced from potentially 50+ layers
        const maxDimension = Math.max(window.innerWidth, window.innerHeight) * 1.5;
        const maxRadius = maxDimension / 2;
        
        for (let i = 0; i < numLayers; i++) {
            const canvas = document.createElement('canvas');
            canvas.width = maxDimension;
            canvas.height = maxDimension;
            const ctx = canvas.getContext('2d');
            
            ctx.strokeStyle = '#000000';
            ctx.translate(maxDimension / 2, maxDimension / 2);
            
            // Draw arcs for this layer
            const radiusStart = (maxRadius / numLayers) * i;
            const radiusEnd = (maxRadius / numLayers) * (i + 1);
            
            for (let radius = radiusStart; radius < radiusEnd; radius += 30) {
                const distanceFactor = 1 - (radius / maxRadius);
                ctx.lineWidth = Math.max(1, 10 * distanceFactor);
                
                const numArcs = Math.floor(8 + 8 * distanceFactor);
                for (let j = 0; j < numArcs; j++) {
                    const arcLength = 0.3 + Math.random() * 0.5;
                    const startAngle = (Math.PI * 2 / numArcs) * j + Math.random() * 0.5;
                    
                    ctx.beginPath();
                    ctx.arc(0, 0, radius, startAngle, startAngle + arcLength, false);
                    ctx.stroke();
                }
            }
            
            this.arcsLayers.push({
                canvas: canvas,
                rotation: Math.random() * Math.PI * 2,
                speed: (Math.random() - 0.5) * 0.01
            });
        }
    }
    
    initializeSpiralDots() {
        // OPTIMIZATION: Fewer dots for better performance
        this.maxRadius = Math.max(window.innerWidth, window.innerHeight) / 2;
        for (let i = 0; i < 10; i++) { // Reduced from 15
            const angle = (Math.PI * 2 / 10) * i;
            this.spiralDots.push({
                angle: angle,
                radius: this.maxRadius + Math.random() * 100,
                speed: 0.003 + Math.random() * 0.005,
                size: 6 + Math.random() * 4
            });
        }
    }
    
    // OPTIMIZATION: Particle pooling system
    initializeParticlePool() {
        for (let i = 0; i < this.maxParticles; i++) {
            this.particlePool.push({
                x: 0,
                y: 0,
                vx: 0,
                vy: 0,
                life: 0,
                size: 0,
                active: false
            });
        }
    }
    
    getParticleFromPool() {
        for (let particle of this.particlePool) {
            if (!particle.active) {
                particle.active = true;
                return particle;
            }
        }
        return null;
    }
    
    returnParticleToPool(particle) {
        particle.active = false;
        particle.life = 0;
    }
    
    drawTrail() {
        if (this.trail.length < 2) return;
        
        // OPTIMIZATION: No shadowBlur - CSS handles glow
        this.ctx.strokeStyle = '#ffff00';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        
        this.ctx.beginPath();
        for (let i = 1; i < this.trail.length; i++) {
            const prev = this.trail[i - 1];
            const curr = this.trail[i];
            
            if (i === 1) {
                this.ctx.moveTo(prev.x, prev.y);
            }
            this.ctx.globalAlpha = curr.life * 0.6;
            this.ctx.lineTo(curr.x, curr.y);
        }
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }
    
    drawBlackCircle() {
        // Draw larger solid black circle in center
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 90, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    createExplosion() {
        // OPTIMIZATION: Use particle pool instead of creating new objects
        for (let i = 0; i < 20; i++) { // Reduced from 30
            const particle = this.getParticleFromPool();
            if (!particle) break;
            
            const angle = (Math.PI * 2 / 20) * i + Math.random() * 0.2;
            const speed = 1.5 + Math.random() * 1;
            
            particle.x = this.centerX;
            particle.y = this.centerY;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.life = 1.0;
            particle.size = 8 + Math.random() * 4;
            
            this.activeParticles.push(particle);
        }
    }
    
    updateExplosionParticles() {
        if (this.activeParticles.length === 0) return;
        
        // OPTIMIZATION: No shadowBlur - use CSS for glow
        this.ctx.fillStyle = '#ffff00';
        
        this.activeParticles = this.activeParticles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.995;
            particle.vy *= 0.995;
            particle.life -= 0.01; // Faster decay for performance
            
            const currentSize = Math.max(1, particle.size * particle.life);
            
            if (particle.life > 0 && currentSize >= 1) {
                this.ctx.globalAlpha = particle.life;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, currentSize, 0, Math.PI * 2);
                this.ctx.fill();
                return true;
            } else {
                this.returnParticleToPool(particle);
                return false;
            }
        });
        
        this.ctx.globalAlpha = 1;
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
        // OPTIMIZATION: Batch draw without shadowBlur
        this.ctx.fillStyle = '#ffff00';
        
        this.ctx.beginPath();
        this.spiralDots.forEach(dot => {
            // Update position
            dot.angle += dot.speed * (1 + this.spiralProgress * 2);
            dot.radius = Math.max(0, dot.radius - (0.5 + this.spiralProgress * 1));
            
            // Reset dot when it reaches center
            if (dot.radius < 5) {
                dot.radius = this.maxRadius + Math.random() * 100;
            }
            
            const x = this.centerX + Math.cos(dot.angle) * dot.radius;
            const y = this.centerY + Math.sin(dot.angle) * dot.radius;
            
            const distanceRatio = dot.radius / this.maxRadius;
            const currentSize = Math.max(1, dot.size * distanceRatio);
            
            // Add to batch path
            this.ctx.moveTo(x + currentSize, y);
            this.ctx.arc(x, y, currentSize, 0, Math.PI * 2);
        });
        this.ctx.fill();
    }
    
    // OPTIMIZATION: Adaptive frame rate and idle detection
    animate(currentTime) {
        if (this.isTransitioning) return;
        
        // Calculate FPS and throttle
        if (currentTime) {
            const deltaTime = currentTime - this.lastFrameTime;
            
            // Skip frames if running too fast
            if (deltaTime < this.frameInterval) {
                this.animationId = requestAnimationFrame((time) => this.animate(time));
                return;
            }
            
            this.lastFrameTime = currentTime;
        }
        
        // Check idle state
        const now = Date.now();
        if (now - this.lastInteractionTime > this.idleTimeout) {
            this.isIdle = true;
        }
        
        // Reduce animation when idle
        const shouldSkipFrame = this.isIdle && this.frameCount % 2 === 0;
        this.frameCount++;
        
        if (!shouldSkipFrame) {
            // Clear and fill background
            this.ctx.fillStyle = '#2a2a2a';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            // Update arc rotations (slower when idle)
            const speedMultiplier = this.isIdle ? 0.3 : 1;
            this.arcsLayers.forEach(layer => {
                layer.rotation += layer.speed * speedMultiplier;
            });
            
            // Draw everything
            this.drawRotatingArcs();
            this.drawBlackCircle();
            
            // Only update dots if active or transitioning
            if (!this.isIdle || this.spiralProgress > 0.1) {
                this.updateAndDrawSpiralDots();
            }
            
            // Draw trail if exists
            if (this.trail.length > 0) {
                this.drawTrail();
            }
            
            // Update particles if active
            if (this.activeParticles.length > 0) {
                this.updateExplosionParticles();
            }
            
            // Update trail life
            this.trail.forEach(point => {
                point.life *= 0.95;
            });
            this.trail = this.trail.filter(point => point.life > 0.01);
            
            // Decay values
            this.angularVelocity *= 0.95;
        }
        
        // Continue animation
        this.animationId = requestAnimationFrame((time) => this.animate(time));
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
        
        // Clear particle pools
        this.particlePool = [];
        this.activeParticles = [];
        
        super.cleanup();
    }
}