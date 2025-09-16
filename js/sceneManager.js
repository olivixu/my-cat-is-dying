export class Scene {
    constructor(container) {
        this.container = container;
        this.element = null;
        this.physics = null;
        this.isComplete = false;
        this.animationFrame = null;
        
        // TRANSITION SAFETY: Track completion state to prevent double transitions
        this.hasCompleted = false;  // Prevents calling onComplete() multiple times
        
        // TIMER MANAGEMENT: Track all timers for proper cleanup
        // Junior devs: Always store timer IDs here to prevent memory leaks
        this.transitionTimers = [];  // Array of setTimeout IDs
        this.intervals = [];         // Array of setInterval IDs
    }
    
    async init() {
        // Override in subclasses
    }
    
    update() {
        // Override in subclasses for animation updates
    }
    
    cleanup(targetSceneIndex = null) {
        // targetSceneIndex: Optional parameter indicating which scene we're transitioning to
        // This allows scenes to handle cleanup differently based on the next scene
        
        // CRITICAL: Clear all timers first to prevent them from firing after cleanup
        // This prevents errors from trying to access cleaned-up elements
        this.clearAllTimers();
        
        // Cancel animation frame if running
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        
        // Destroy physics if exists
        if (this.physics) {
            this.physics.cleanup();
            this.physics = null;
        }
        
        // Remove element from DOM
        if (this.element && this.element.parentNode) {
            this.element.remove();
            this.element = null;
        }
    }
    
    /**
     * Clear all timers to prevent memory leaks and errors
     * Call this in cleanup() or when transitioning scenes
     */
    clearAllTimers() {
        // Clear all setTimeout timers
        this.transitionTimers.forEach(timerId => {
            clearTimeout(timerId);
        });
        this.transitionTimers = [];
        
        // Clear all setInterval timers
        this.intervals.forEach(intervalId => {
            clearInterval(intervalId);
        });
        this.intervals = [];
    }
    
    /**
     * Helper method to safely add a timer that will be auto-cleaned
     * Use this instead of raw setTimeout to prevent memory leaks
     * @param {Function} callback - Function to execute
     * @param {number} delay - Delay in milliseconds
     * @returns {number} Timer ID
     */
    addTimer(callback, delay) {
        const timerId = setTimeout(() => {
            // Remove this timer from our tracking array once it fires
            const index = this.transitionTimers.indexOf(timerId);
            if (index > -1) {
                this.transitionTimers.splice(index, 1);
            }
            // Execute the callback
            callback();
        }, delay);
        
        // Track this timer for cleanup
        this.transitionTimers.push(timerId);
        return timerId;
    }
    
    onComplete() {
        // GUARD: Prevent multiple completion calls
        // This is critical to prevent double scene transitions
        if (this.hasCompleted) {
            console.warn('[Scene] onComplete called multiple times - ignoring');
            return;
        }
        
        this.hasCompleted = true;
        this.isComplete = true;
        
        if (this.onCompleteCallback) {
            this.onCompleteCallback();
        }
    }
    
    startAnimation() {
        const animate = () => {
            this.update();
            this.animationFrame = requestAnimationFrame(animate);
        };
        animate();
    }
    
    stopAnimation() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }
}

export class SceneManager {
    constructor(container, scenes) {
        this.container = container;
        this.scenes = scenes;
        this.currentSceneIndex = 0;
        this.currentScene = null;
        this.isTransitioning = false;
        
        // Queue for pending transitions to prevent race conditions
        this.transitionQueue = [];
        
        this.verticalNav = document.getElementById('vertical-nav');
        
        this.init();
    }
    
    init() {
        // Create vertical navigation dots
        this.createVerticalDots();
        
        // Load first scene
        this.loadScene(0);
    }
    
    createVerticalDots() {
        this.verticalNav.innerHTML = '';
        this.scenes.forEach((scene, index) => {
            const dot = document.createElement('div');
            dot.className = 'scene-dot';
            dot.dataset.sceneIndex = index;
            dot.dataset.scene = scene.name;
            
            // Click to jump to scene
            dot.addEventListener('click', () => {
                if (!this.isTransitioning && index !== this.currentSceneIndex) {
                    this.loadScene(index);
                }
            });
            
            this.verticalNav.appendChild(dot);
        });
    }
    
    updateProgressIndicator() {
        console.log('Updating progress indicator for scene:', this.currentSceneIndex);
        
        // Update vertical dots
        const dots = this.verticalNav.querySelectorAll('.scene-dot');
        dots.forEach((dot, index) => {
            dot.classList.remove('active', 'completed');
            if (index === this.currentSceneIndex) {
                dot.classList.add('active');
            } else if (index < this.currentSceneIndex || 
                      (this.scenes[index].instance && this.scenes[index].instance.isComplete)) {
                dot.classList.add('completed');
            }
        });
    }
    
    async loadScene(index) {
        // GUARD: Prevent multiple simultaneous transitions
        // This prevents race conditions when multiple transitions are triggered
        if (this.isTransitioning) {
            console.warn(`[SceneManager] Transition already in progress. Queueing scene ${index}`);
            // Queue this transition to run after current one completes
            if (!this.transitionQueue.includes(index)) {
                this.transitionQueue.push(index);
            }
            return;
        }
        
        // VALIDATION: Ensure scene index is valid
        if (index < 0 || index >= this.scenes.length) {
            console.error(`[SceneManager] Invalid scene index: ${index}`);
            return;
        }
        
        this.isTransitioning = true;
        
        try {
            // Clean up current scene
            if (this.currentScene) {
                this.currentScene.element?.classList.add('exiting');
                // Pass the target scene index so cleanup knows where we're going
                this.currentScene.cleanup(index);
                
                // Force cleanup of references
                this.currentScene = null;
                
                // No delay needed - garbage collection happens automatically
                // Removing delay prevents black flash between scenes
            }
            
            // Load new scene
            this.currentSceneIndex = index;
            const sceneConfig = this.scenes[index];
            
            // Always create a fresh instance (scenes were being reused incorrectly)
            sceneConfig.instance = new sceneConfig.class(this.container);
            this.currentScene = sceneConfig.instance;
            
            await this.currentScene.init();
            
            // Add active class immediately
            this.currentScene.element?.classList.add('active');
            
            // Set up completion callback
            this.currentScene.onCompleteCallback = () => {
                this.onSceneComplete();
            };
            
        } catch (error) {
            console.error(`Failed to load scene ${index}:`, error);
            // Make sure to reset transition state on error
            this.isTransitioning = false;
            return;
        }
        
        this.updateProgressIndicator();
        this.isTransitioning = false;
        
        // Process any queued transitions after current one completes
        this.processTransitionQueue();
    }
    
    /**
     * Process any pending transitions that were queued during a transition
     * This prevents lost transitions while maintaining order
     */
    processTransitionQueue() {
        if (this.transitionQueue.length > 0 && !this.isTransitioning) {
            const nextIndex = this.transitionQueue.shift();
            console.log(`[SceneManager] Processing queued transition to scene ${nextIndex}`);
            this.loadScene(nextIndex);
        }
    }
    
    async nextScene() {
        // GUARD: Don't allow advancing during a transition
        if (this.isTransitioning) {
            console.warn('[SceneManager] Cannot advance to next scene - transition in progress');
            // Queue the next scene instead
            const nextIndex = this.currentSceneIndex + 1;
            if (nextIndex < this.scenes.length && !this.transitionQueue.includes(nextIndex)) {
                this.transitionQueue.push(nextIndex);
            }
            return;
        }
        
        if (this.currentSceneIndex < this.scenes.length - 1) {
            await this.loadScene(this.currentSceneIndex + 1);
        }
    }
    
    async previousScene() {
        // GUARD: Don't allow going back during a transition
        if (this.isTransitioning) {
            console.warn('[SceneManager] Cannot go to previous scene - transition in progress');
            return;
        }
        
        if (this.currentSceneIndex > 0) {
            await this.loadScene(this.currentSceneIndex - 1);
        }
    }
    
    onSceneComplete() {
        // Mark current scene as completed
        const dots = this.verticalNav.querySelectorAll('.scene-dot');
        dots[this.currentSceneIndex].classList.add('completed');
    }
    
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}