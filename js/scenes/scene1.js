// Scene 1: "My cat is dying."
import { Scene } from '../sceneManager.js';

export class Scene1 extends Scene {
    constructor(container) {
        super(container);
        this.text = "My cat is dying.";
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-1';
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text scene1-text';
        textContainer.innerHTML = `<h1>${this.text}</h1>`;
        
        // Create circular button with SVG
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'begin-button-container';
        
        // Create button (just the black circle)
        const beginButton = document.createElement('button');
        beginButton.className = 'begin-button';
        
        // Create SVG as separate element
        const svgText = document.createElement('img');
        svgText.src = 'assets/SVG/Begin-button-text.svg';
        svgText.alt = 'Begin';
        svgText.className = 'begin-text-svg';
        
        // Particle system for hover effect - add canvas BEFORE button so it's behind
        const particles = [];
        let isEmitting = false;
        let animationId = null;
        
        // Particle class
        class Particle {
            constructor(x, y, vx = 0, vy = 0) {
                this.x = x;
                this.y = y;
                this.vx = vx;
                this.vy = vy;
                this.size = 10; // Slightly larger for more presence
                this.maxSize = 10;
                this.shrinkRate = 0.01; // Much slower shrinking for ominous effect
            }
            
            update() {
                this.x += this.vx;
                this.y += this.vy;
                this.size -= this.shrinkRate; // Shrink instead of fade
            }
            
            isDead() {
                return this.size <= 0;
            }
        }
        
        // Create particle canvas
        const particleCanvas = document.createElement('canvas');
        particleCanvas.className = 'particle-canvas';
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
        particleCanvas.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 0;
        `;
        buttonContainer.insertBefore(particleCanvas, buttonContainer.firstChild);
        
        // Add button and text AFTER canvas so they appear on top
        buttonContainer.appendChild(beginButton);
        buttonContainer.appendChild(svgText);
        const ctx = particleCanvas.getContext('2d');
        
        // Animation loop
        function animateParticles() {
            ctx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
            
            // Emit new particles on hover
            if (isEmitting) {
                const rect = beginButton.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                for (let i = 0; i < 2; i++) { // Fewer particles for sparse, ominous effect
                    const angle = Math.random() * Math.PI * 2;
                    const speed = 0.3 + Math.random() * 0.4; // Very slow, gentle movement
                    
                    // Start near the edge of button (80px from center, button radius is 90px)
                    const spawnRadius = 80;
                    const spawnX = centerX + Math.cos(angle) * spawnRadius;
                    const spawnY = centerY + Math.sin(angle) * spawnRadius;
                    const particle = new Particle(spawnX, spawnY);
                    
                    // Set velocity based on angle (radial movement)
                    particle.vx = Math.cos(angle) * speed;
                    particle.vy = Math.sin(angle) * speed;
                    
                    particles.push(particle);
                }
            }
            
            // Update and draw particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.update();
                
                if (p.isDead()) {
                    particles.splice(i, 1);
                    continue;
                }
                
                ctx.globalAlpha = 1; // Full opacity always
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            
            animationId = requestAnimationFrame(animateParticles);
        }
        
        // Start/stop emitting on hover
        beginButton.addEventListener('mouseenter', () => {
            isEmitting = true;
        });
        
        beginButton.addEventListener('mouseleave', () => {
            isEmitting = false;
        });
        
        // Start animation
        animateParticles();
        
        // Store animation ID for cleanup
        this.particleAnimationId = animationId;
        
        // Assemble scene
        this.element.appendChild(textContainer);
        this.element.appendChild(buttonContainer);
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Track if transition is in progress
        let isTransitioning = false;
        
        // Add button click handler
        beginButton.addEventListener('click', () => {
            if (isTransitioning) return; // Prevent multiple clicks
            isTransitioning = true;
            
            // Add expanding animation class to container
            buttonContainer.classList.add('expanding');
            
            // Wait for animation to complete before transitioning
            setTimeout(() => {
                this.onComplete();
                // Advance to next scene
                if (window.sceneManager) {
                    window.sceneManager.nextScene();
                }
            }, 1200); // Wait for expansion animation
        });
        
        // Also allow space/enter to continue
        const handleKeyPress = (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                if (isTransitioning) return; // Prevent multiple triggers
                isTransitioning = true;
                
                // Trigger the button animation
                buttonContainer.classList.add('expanding');
                
                // Wait for animation before transitioning
                setTimeout(() => {
                    this.onComplete();
                    if (window.sceneManager) {
                        window.sceneManager.nextScene();
                    }
                }, 1200);
                
                // Remove the event listener after use
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
        
        // Add keyboard listener
        document.addEventListener('keydown', handleKeyPress);
        
        // Store reference to remove on cleanup
        this.keyPressHandler = handleKeyPress;
    }
    
    cleanup() {
        // Remove keyboard listener if it exists
        if (this.keyPressHandler) {
            document.removeEventListener('keydown', this.keyPressHandler);
        }
        // Cancel particle animation
        if (this.particleAnimationId) {
            cancelAnimationFrame(this.particleAnimationId);
        }
        super.cleanup();
    }
}