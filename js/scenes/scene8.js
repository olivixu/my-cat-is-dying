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
        
        // Store dot properties for consistent movement
        this.floatingDots = [];
        
        // Store event handlers for cleanup
        this.resizeHandler = null;
        this.mouseMoveHandler = null;
        this.touchMoveHandler = null;
        this.mouseLeaveHandler = null;
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
            // Use diagonal distance to ensure spiral covers entire screen
            this.maxRadius = Math.sqrt(canvas.width * canvas.width + canvas.height * canvas.height) / 2;
            this.generateSpiralPath();
        };
        resizeCanvas();
        
        // Store resize handler for cleanup
        let resizeTimer;
        this.resizeHandler = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resizeCanvas, 250);
        };
        window.addEventListener('resize', this.resizeHandler);
        
        // Assemble
        interactiveContainer.appendChild(canvas);
        this.element.appendChild(textContainer);
        this.element.appendChild(interactiveContainer);
        this.container.appendChild(this.element);
        
        // Setup
        this.setupEventListeners();
        this.generateSpiralPath();
        this.initializeFloatingDots();
        this.animate();
    }
    
    initializeFloatingDots() {
        // Initialize dots with fixed properties
        this.floatingDots = [];
        const dotCount = 60; // Increased from 36
        for (let i = 0; i < dotCount; i++) {
            this.floatingDots.push({
                startOffset: i / dotCount, // Distribute along spiral
                speed: 0.02 + Math.random() * 0.01, // Even slower speed (was 0.08-0.12, now 0.02-0.03)
                position: 0,
                rotation: Math.random() * Math.PI * 2 // Random initial rotation for stars
            });
        }
    }
    
    draw4PointStar(ctx, x, y, size, rotation) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rotation);
        ctx.beginPath();
        // Draw 4-pointed star (diamond/cross shape)
        ctx.moveTo(0, -size);  // top point
        ctx.lineTo(size * 0.4, 0);  // right point
        ctx.lineTo(0, size);  // bottom point
        ctx.lineTo(-size * 0.4, 0);  // left point
        ctx.closePath();
        ctx.restore();
    }
    
    generateSpiralPath() {
        // Generate spiral with non-linear density (denser in center)
        this.spiralSegments = [];
        const turns = 20; // More turns to cover full screen
        const basePointsPerTurn = 150; // High base density
        
        let totalPoints = 0;
        
        // Calculate points with variable density based on radius
        for (let turn = 0; turn < turns; turn++) {
            // More points in inner turns, fewer in outer turns
            const densityFactor = Math.pow(1 - (turn / turns), 2); // Quadratic falloff
            const pointsThisTurn = Math.floor(basePointsPerTurn * (0.3 + 0.7 * densityFactor));
            
            for (let p = 0; p < pointsThisTurn; p++) {
                const turnProgress = p / pointsThisTurn;
                const t = (turn + turnProgress) * Math.PI * 2;
                
                // Non-linear radius growth (exponential) - denser in center
                const normalizedT = (turn + turnProgress) / turns;
                const r = this.maxRadius * Math.pow(normalizedT, 1.8); // Power of 1.8 for tighter center
                
                // Calculate thickness - much thicker in center
                const thickness = Math.max(1, 30 * Math.pow(1 - r / this.maxRadius, 2));
                
                this.spiralSegments.push({
                    angle: t,
                    radius: r,
                    thickness: thickness,
                    opacity: 1 - (r / this.maxRadius) * 0.5
                });
                
                totalPoints++;
            }
        }
    }
    
    setupEventListeners() {
        const handleMove = (x, y) => {
            this.lastInteractionTime = Date.now();
            this.isIdle = false;
            this.processMovement(x, y);
        };
        
        // Store handlers for cleanup
        this.mouseMoveHandler = (e) => {
            const rect = this.canvas.getBoundingClientRect();
            handleMove(e.clientX - rect.left, e.clientY - rect.top);
        };
        
        this.touchMoveHandler = (e) => {
            e.preventDefault();
            const rect = this.canvas.getBoundingClientRect();
            const touch = e.touches[0];
            handleMove(touch.clientX - rect.left, touch.clientY - rect.top);
        };
        
        this.mouseLeaveHandler = () => {
            this.isIdle = true;
        };
        
        // Add event listeners
        this.canvas.addEventListener('mousemove', this.mouseMoveHandler);
        this.canvas.addEventListener('touchmove', this.touchMoveHandler);
        this.canvas.addEventListener('mouseleave', this.mouseLeaveHandler);
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
                
                // Increase glow based on speed - smoother transitions
                const targetGlow = Math.min(0.4, Math.abs(this.angularVelocity) / 8); // Lower max, higher divisor
                this.glowIntensity += (targetGlow - this.glowIntensity) * 0.02; // Much smoother interpolation
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
        // Create more randomly distributed, smaller particles
        const particleCount = 25; // Fewer particles
        for (let i = 0; i < particleCount; i++) {
            // More random angle distribution
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1.5; // Much slower speeds
            
            // Random spawn position around center (not exactly at center)
            const spawnRadius = Math.random() * 30;
            const spawnAngle = Math.random() * Math.PI * 2;
            
            this.particles.push({
                x: this.centerX + Math.cos(spawnAngle) * spawnRadius,
                y: this.centerY + Math.sin(spawnAngle) * spawnRadius,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                size: 3 + Math.random() * 5, // Smaller particles (3-8px instead of 10-15px)
                hue: 55 + Math.random() * 5, // Lighter yellow range
                rotation: Math.random() * Math.PI * 2, // Initial rotation for star
                rotationSpeed: (Math.random() - 0.5) * 0.1 // Spin speed
            });
        }
    }
    
    drawSpiral() {
        const ctx = this.ctx;
        
        // Draw multiple interleaved spirals - INCREASED TO 7 for maximum density
        for (let spiral = 0; spiral < 7; spiral++) {
            ctx.save();
            ctx.translate(this.centerX, this.centerY);
            
            // Rotate this spiral - adjusted spacing for 7 spirals
            const rotation = this.spiralRotation + (spiral * Math.PI * 2 / 7);
            ctx.rotate(rotation);
            
            // Draw spiral segments with varying line width
            let lastRadius = 0;
            this.spiralSegments.forEach((segment, i) => {
                const x = Math.cos(segment.angle) * segment.radius;
                const y = Math.sin(segment.angle) * segment.radius;
                
                // Skip if radius hasn't changed enough (optimization for outer segments)
                if (i > 0 && segment.radius - lastRadius < 1 && segment.radius > this.maxRadius * 0.5) {
                    return;
                }
                
                ctx.beginPath();
                if (i > 0) {
                    const prevSegment = this.spiralSegments[i - 1];
                    const prevX = Math.cos(prevSegment.angle) * prevSegment.radius;
                    const prevY = Math.sin(prevSegment.angle) * prevSegment.radius;
                    ctx.moveTo(prevX, prevY);
                    ctx.lineTo(x, y);
                    
                    // Variable line width - thicker in center, thinner outside
                    const radiusRatio = segment.radius / this.maxRadius;
                    const lineWidth = Math.max(1, 8 * Math.pow(1 - radiusRatio, 1.5)); // Exponential thinning
                    
                    // Apply gradient stroke
                    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.maxRadius);
                    gradient.addColorStop(0, '#000000');
                    gradient.addColorStop(0.5, '#111111');
                    gradient.addColorStop(1, '#000000');
                    
                    ctx.strokeStyle = gradient;
                    ctx.lineWidth = lineWidth;
                    ctx.stroke();
                }
                
                lastRadius = segment.radius;
            });
            
            // Add glow layer when active with variable width - smoother threshold
            if (this.glowIntensity > 0.05) { // Lower threshold for earlier activation
                ctx.globalAlpha = this.glowIntensity;
                
                // Re-draw with glow, also with variable width
                this.spiralSegments.forEach((segment, i) => {
                    if (i > 0) {
                        const prevSegment = this.spiralSegments[i - 1];
                        const x = Math.cos(segment.angle) * segment.radius;
                        const y = Math.sin(segment.angle) * segment.radius;
                        const prevX = Math.cos(prevSegment.angle) * prevSegment.radius;
                        const prevY = Math.sin(prevSegment.angle) * prevSegment.radius;
                        
                        ctx.beginPath();
                        ctx.moveTo(prevX, prevY);
                        ctx.lineTo(x, y);
                        
                        const radiusRatio = segment.radius / this.maxRadius;
                        const glowWidth = Math.max(2, 12 * Math.pow(1 - radiusRatio, 1.5));
                        
                        ctx.strokeStyle = '#fff5b3'; // Light yellow instead of neon
                        ctx.lineWidth = glowWidth;
                        ctx.stroke();
                    }
                });
                
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
                ctx.strokeStyle = '#fff5b3'; // Light yellow instead of neon
                ctx.lineWidth = 15;
            } else if (pass === 1) {
                // Middle glow
                ctx.globalAlpha = 0.4;
                ctx.strokeStyle = '#fff5b3'; // Light yellow instead of neon
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
        // Smaller central black circle to show more of the dense spiral center
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, 40  // Reduced from 100 to 40
        );
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(1, 'rgba(10, 10, 10, 0.8)'); // Slight transparency at edge
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 40, 0, Math.PI * 2); // Reduced from 100 to 40
        this.ctx.fill();
    }
    
    drawFloatingDots() {
        // Draw dots along spiral path - SLOWER
        const time = Date.now() * 0.0003; // Much slower animation
        
        this.floatingDots.forEach((dot, i) => {
            // Update position smoothly
            dot.position = (dot.startOffset + time * dot.speed) % 1;
            
            // Non-linear radius matching spiral growth
            const r = this.maxRadius * Math.pow(dot.position, 1.8);
            
            const t = dot.position * Math.PI * 2 * 20; // Full spiral angle
            
            const x = this.centerX + Math.cos(t + this.spiralRotation) * r;
            const y = this.centerY + Math.sin(t + this.spiralRotation) * r;
            
            // Update rotation for twinkling effect
            dot.rotation += 0.02; // Slow rotation
            
            // Subtle glow for tiny stars
            const glow = this.ctx.createRadialGradient(x, y, 0, x, y, 6);
            glow.addColorStop(0, 'rgba(255, 245, 179, 0.3)'); // Light yellow glow
            glow.addColorStop(1, 'rgba(255, 245, 179, 0)');
            
            this.ctx.fillStyle = glow;
            this.ctx.fillRect(x - 6, y - 6, 12, 12);
            
            // Draw tiny star - 3px size
            this.ctx.fillStyle = '#fff5b3'; // Light yellow
            this.draw4PointStar(this.ctx, x, y, 3, dot.rotation);
            this.ctx.fill();
        });
    }
    
    updateParticles() {
        this.particles = this.particles.filter(particle => {
            // Update physics - slower movement and decay
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.99; // Less velocity decay (was 0.98)
            particle.vy *= 0.99;
            particle.life -= 0.005; // Slower life decay (was 0.01)
            particle.rotation += particle.rotationSpeed; // Spin the star
            
            if (particle.life <= 0) return false;
            
            // Draw particle star with glow
            const alpha = particle.life;
            const size = particle.size * particle.life;
            
            // Glow layer
            const glow = this.ctx.createRadialGradient(
                particle.x, particle.y, 0,
                particle.x, particle.y, size * 3
            );
            glow.addColorStop(0, `hsla(${particle.hue}, 70%, 80%, ${alpha * 0.6})`);
            glow.addColorStop(1, `hsla(${particle.hue}, 70%, 80%, 0)`);
            
            this.ctx.fillStyle = glow;
            this.ctx.fillRect(
                particle.x - size * 3, 
                particle.y - size * 3, 
                size * 6, 
                size * 6
            );
            
            // Draw star shape
            this.ctx.fillStyle = `hsla(${particle.hue}, 70%, 90%, ${alpha})`;
            this.draw4PointStar(this.ctx, particle.x, particle.y, size, particle.rotation);
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
        
        // Clear and fill background - match Scene 7's beige fade
        this.ctx.fillStyle = '#f5e6d3';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update rotation speed based on interaction - SLOWER
        const targetSpeed = this.isIdle ? 0.001 : 0.002 + Math.abs(this.angularVelocity) * 0.005;
        this.spiralRotation += targetSpeed;
        
        // Draw layers with variable stroke width
        this.drawSpiral();
        // this.drawBlackCircle(); // Removed center black circle
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
        
        // Decay values - slower decay for smoother transitions
        this.angularVelocity *= 0.98;
        this.glowIntensity *= 0.95; // Much slower glow decay
        
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
        // Cancel animation frame
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Remove event listeners
        if (this.resizeHandler) {
            window.removeEventListener('resize', this.resizeHandler);
            this.resizeHandler = null;
        }
        
        if (this.canvas) {
            if (this.mouseMoveHandler) {
                this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
                this.mouseMoveHandler = null;
            }
            if (this.touchMoveHandler) {
                this.canvas.removeEventListener('touchmove', this.touchMoveHandler);
                this.touchMoveHandler = null;
            }
            if (this.mouseLeaveHandler) {
                this.canvas.removeEventListener('mouseleave', this.mouseLeaveHandler);
                this.mouseLeaveHandler = null;
            }
        }
        
        // Clear heavy data structures
        this.spiralSegments = [];
        this.particles = [];
        this.trail = [];
        this.floatingDots = [];
        this.mousePositions = [];
        
        // Clear canvas context
        if (this.ctx) {
            this.ctx = null;
        }
        if (this.canvas) {
            this.canvas = null;
        }
        
        super.cleanup();
    }
}