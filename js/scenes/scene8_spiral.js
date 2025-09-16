// Scene 8: "There is a lot I don't know because I am a human" - SPIRAL VERSION
import { Scene } from '../sceneManager.js';

export class Scene8 extends Scene {
    constructor(container) {
        super(container);
        this.text = "There is a lot I don't know because I am a human";
        
        // Spiral detection state
        this.mousePositions = [];
        this.maxPositions = 20;
        this.centerX = 0;
        this.centerY = 0;
        this.totalRotation = 0;
        this.lastAngle = null;
        this.angularVelocity = 0;
        this.requiredRotations = 3;
        
        // Visual state - MATHEMATICAL SPIRAL
        this.spiralRotation = 0;
        this.spiralSegments = [];
        this.trail = [];
        this.maxTrailLength = 40;
        
        // Particle system
        this.particles = [];
        this.lastRotationCount = 0;
        
        // Animation state
        this.animationId = null;
        this.isTransitioning = false;
        this.spiralProgress = 0;
        
        // Performance
        this.lastFrameTime = 0;
        this.lastInteractionTime = Date.now();
        this.isIdle = false;
        
        // Glow layers
        this.glowIntensity = 0;
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
        
        // Create main canvas
        const canvas = document.createElement('canvas');
        canvas.className = 'spiral-canvas';
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', {
            alpha: false,
            desynchronized: true
        });
        
        // Resize canvas
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            this.centerX = canvas.width / 2;
            this.centerY = canvas.height / 2;
            this.maxRadius = Math.min(canvas.width, canvas.height) * 0.45;
            this.generateSpiralPath();
        };
        resizeCanvas();
        
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resizeCanvas, 250);
        });
        
        // Assemble
        interactiveContainer.appendChild(canvas);
        this.element.appendChild(textContainer);
        this.element.appendChild(interactiveContainer);
        this.container.appendChild(this.element);
        
        // Setup
        this.setupEventListeners();
        this.generateSpiralPath();
        this.animate();
    }
    
    generateSpiralPath() {
        // Generate Archimedean spiral points
        this.spiralSegments = [];
        const turns = 6; // Number of complete rotations
        const pointsPerTurn = 50;
        const totalPoints = turns * pointsPerTurn;
        
        for (let i = 0; i < totalPoints; i++) {
            const t = (i / totalPoints) * turns * Math.PI * 2;
            const r = (this.maxRadius / turns) * (t / (Math.PI * 2));
            
            // Calculate thickness based on distance from center
            const thickness = Math.max(1, 20 * (1 - r / this.maxRadius));
            
            this.spiralSegments.push({
                angle: t,
                radius: r,
                thickness: thickness,
                opacity: 1 - (r / this.maxRadius) * 0.3
            });
        }
    }
    
    setupEventListeners() {
        const handleMove = (x, y) => {
            this.lastInteractionTime = Date.now();
            this.isIdle = false;
            this.processMovement(x, y);
        };
        
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            handleMove(e.clientX - rect.left, e.clientY - rect.top);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            handleMove(touch.clientX - rect.left, touch.clientY - rect.top);
        });
        
        this.canvas.addEventListener('mouseleave', () => {
            this.isIdle = true;
        });
    }
    
    processMovement(x, y) {
        // Add to trail with glow
        this.trail.push({ 
            x, 
            y, 
            life: 1.0,
            glow: 1.0
        });
        
        if (this.trail.length > this.maxTrailLength) {
            this.trail.shift();
        }
        
        // Track rotation
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
            
            if (deltaAngle > Math.PI) {
                deltaAngle -= 2 * Math.PI;
            } else if (deltaAngle < -Math.PI) {
                deltaAngle += 2 * Math.PI;
            }
            
            if (Math.abs(deltaAngle) < Math.PI / 4) {
                this.totalRotation += deltaAngle;
                this.angularVelocity = deltaAngle * 60; // Approximate per second
                
                // Increase glow based on speed
                this.glowIntensity = Math.min(1, Math.abs(this.angularVelocity) / 5);
            }
        }
        
        this.lastAngle = angle;
        
        // Update spiral progress
        const targetProgress = Math.min(1, Math.abs(this.totalRotation) / (2 * Math.PI * this.requiredRotations));
        this.spiralProgress += (targetProgress - this.spiralProgress) * 0.1;
        
        // Check for rotation milestones
        const currentRotationCount = Math.floor(Math.abs(this.totalRotation) / (2 * Math.PI));
        if (currentRotationCount > this.lastRotationCount) {
            this.createExplosion();
            this.lastRotationCount = currentRotationCount;
            
            if (currentRotationCount === 3) {
                setTimeout(() => this.triggerTransition(), 2000);
            }
        }
    }
    
    createExplosion() {
        // Create burst of particles
        const particleCount = 40;
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 / particleCount) * i + Math.random() * 0.2;
            const speed = 2 + Math.random() * 2;
            
            this.particles.push({
                x: this.centerX,
                y: this.centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                size: 10 + Math.random() * 5,
                hue: 50 + Math.random() * 10 // Golden yellow
            });
        }
    }
    
    drawSpiral() {
        const ctx = this.ctx;
        
        // Draw multiple interleaved spirals
        for (let spiral = 0; spiral < 3; spiral++) {
            ctx.save();
            ctx.translate(this.centerX, this.centerY);
            
            // Rotate this spiral
            const rotation = this.spiralRotation + (spiral * Math.PI * 2 / 3);
            ctx.rotate(rotation);
            
            // Draw spiral segments
            ctx.beginPath();
            
            let firstPoint = true;
            this.spiralSegments.forEach((segment, i) => {
                const x = Math.cos(segment.angle) * segment.radius;
                const y = Math.sin(segment.angle) * segment.radius;
                
                if (firstPoint) {
                    ctx.moveTo(x, y);
                    firstPoint = false;
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            // Apply gradient stroke
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.maxRadius);
            gradient.addColorStop(0, '#000000');
            gradient.addColorStop(0.5, '#111111');
            gradient.addColorStop(1, '#000000');
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 3;
            ctx.stroke();
            
            // Add glow layer when active
            if (this.glowIntensity > 0.1) {
                ctx.globalAlpha = this.glowIntensity * 0.5;
                ctx.strokeStyle = '#ffff00';
                ctx.lineWidth = 6;
                ctx.stroke();
                ctx.globalAlpha = 1;
            }
            
            ctx.restore();
        }
    }
    
    drawTrail() {
        if (this.trail.length < 2) return;
        
        const ctx = this.ctx;
        
        // Draw glowing trail
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Multiple passes for glow effect
        for (let pass = 0; pass < 3; pass++) {
            ctx.beginPath();
            
            this.trail.forEach((point, i) => {
                if (i === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            });
            
            if (pass === 0) {
                // Outer glow
                ctx.globalAlpha = 0.2;
                ctx.strokeStyle = '#ffff00';
                ctx.lineWidth = 15;
            } else if (pass === 1) {
                // Middle glow
                ctx.globalAlpha = 0.4;
                ctx.strokeStyle = '#ffff00';
                ctx.lineWidth = 8;
            } else {
                // Core
                ctx.globalAlpha = 0.8;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 3;
            }
            
            ctx.stroke();
        }
        
        ctx.globalAlpha = 1;
    }
    
    drawBlackCircle() {
        // Central black circle with subtle gradient
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, 100
        );
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(1, '#0a0a0a');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 100, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawFloatingDots() {
        // Draw dots that follow the spiral path
        const time = Date.now() * 0.001;
        
        for (let i = 0; i < 12; i++) {
            const offset = (i / 12) * Math.PI * 2;
            const t = (time + offset) % (Math.PI * 2 * 6);
            const r = (this.maxRadius / 6) * (t / (Math.PI * 2));
            
            const x = this.centerX + Math.cos(t + this.spiralRotation) * r;
            const y = this.centerY + Math.sin(t + this.spiralRotation) * r;
            
            // Glow effect
            const glow = this.ctx.createRadialGradient(x, y, 0, x, y, 15);
            glow.addColorStop(0, 'rgba(255, 255, 0, 0.8)');
            glow.addColorStop(1, 'rgba(255, 255, 0, 0)');
            
            this.ctx.fillStyle = glow;
            this.ctx.fillRect(x - 15, y - 15, 30, 30);
            
            // Core dot
            this.ctx.fillStyle = '#ffff00';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            // Update physics
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            particle.life -= 0.01;
            
            if (particle.life <= 0) return false;
            
            // Draw particle with glow
            const alpha = particle.life;
            const size = particle.size * particle.life;
            
            // Glow
            const glow = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, size * 2
            );
            glow.addColorStop(0, `hsla(${particle.hue}, 100%, 60%, ${alpha})`);
            glow.addColorStop(1, `hsla(${particle.hue}, 100%, 60%, 0)`);
            
            this.ctx.fillStyle = glow;
            this.ctx.fillRect(
                particle.x - size * 2, 
                particle.y - size * 2, 
                size * 4, 
                size * 4
            );
            
            // Core
            this.ctx.fillStyle = `hsla(${particle.hue}, 100%, 80%, ${alpha})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
            this.ctx.fill();
            
            return true;
        });
    }
    
    animate(currentTime) {
        if (this.isTransitioning) return;
        
        // Check idle state
        const now = Date.now();
        if (now - this.lastInteractionTime > 2000) {
            this.isIdle = true;
        }
        
        // Clear and fill background
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update rotation speed based on interaction
        const targetSpeed = this.isIdle ? 0.002 : 0.005 + Math.abs(this.angularVelocity) * 0.01;
        this.spiralRotation += targetSpeed;
        
        // Draw layers
        this.drawSpiral();
        this.drawBlackCircle();
        this.drawFloatingDots();
        
        if (this.trail.length > 0) {
            this.drawTrail();
        }
        
        if (this.particles.length > 0) {
            this.updateParticles();
        }
        
        // Update trail
        this.trail.forEach(point => {
            point.life *= 0.95;
            point.glow *= 0.9;
        });
        this.trail = this.trail.filter(point => point.life > 0.01);
        
        // Decay values
        this.angularVelocity *= 0.95;
        this.glowIntensity *= 0.9;
        
        // Continue animation
        this.animationId = requestAnimationFrame((time) => this.animate(time));
    }
    
    triggerTransition() {
        if (this.isTransitioning) return;
        this.isTransitioning = true;
        
        this.element.style.transition = 'opacity 0.5s ease-out';
        this.element.style.opacity = '0';
        
        setTimeout(() => {
            this.cleanup();
            this.onComplete();
            if (window.sceneManager) {
                window.sceneManager.nextScene();
            }
        }, 500);
    }
    
    cleanup() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.canvas) {
            this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
            this.canvas.removeEventListener('touchmove', this.touchMoveHandler);
        }
        
        super.cleanup();
    }
}