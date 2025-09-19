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
            // Handle scene transition with animation
            const previousScene = this.currentScene;
            
            if (previousScene) {
                // Special case for Scene 2 to 3 - don't cleanup yet, let it fade over Scene 3
                if (this.currentSceneIndex === 1 && index === 2) {
                    // Store reference to clean up later
                    const sceneToCleanup = previousScene;
                    
                    // Load Scene 3 first (it will appear behind Scene 2)
                    // Then start Scene 2's fade out animation
                    // This ensures Scene 3 is visible as Scene 2 fades
                    
                    // We'll add the fade class after Scene 3 loads below
                    
                    // Delay cleanup for fade animation
                    setTimeout(() => {
                        sceneToCleanup.cleanup(index);
                    }, 900); // Slightly longer than fadeOut animation
                } 
                // Special case for Scene 8 to 9 - let the black fade complete
                else if (this.currentSceneIndex === 7 && index === 8) {
                    // Set container to black immediately to prevent flash
                    this.container.style.backgroundColor = '#000000';
                    console.log('[SceneManager] Scene 8 to 9 - setting black background and delaying cleanup');
                    
                    // Store reference to clean up later
                    const sceneToCleanup = previousScene;
                    
                    // Delay cleanup to let Scene 8's fade to black complete
                    setTimeout(() => {
                        sceneToCleanup.cleanup(index);
                    }, 2800); // Wait for Scene 8's black overlay fade (2500ms + buffer)
                }
                // Special case for Scene 11 to 12 - let the black expansion complete
                else if (this.currentSceneIndex === 10 && index === 11) {
                    // Set container to black immediately to prevent flash
                    this.container.style.backgroundColor = '#000000';
                    console.log('[SceneManager] Scene 11 to 12 - setting black background and immediate scene cleanup, delayed overlay cleanup');
                    
                    // Clean up scene immediately but keep overlay
                    previousScene.element?.classList.add('exiting');
                    
                    // Store the overlay reference before cleanup
                    const overlayToRemove = previousScene.blackOverlay;
                    
                    // Clear the reference so cleanup doesn't remove it
                    previousScene.blackOverlay = null;
                    
                    // Clean up the scene (but not the overlay)
                    previousScene.cleanup(index);
                    
                    // Delay removal of just the overlay
                    setTimeout(() => {
                        if (overlayToRemove && overlayToRemove.parentNode) {
                            overlayToRemove.parentNode.removeChild(overlayToRemove);
                        }
                    }, 5500); // Wait for Scene 12 to load (5000ms) + brief overlap
                }
                // Special case for Scene 12 to 13 - preserve white overlay
                else if (this.currentSceneIndex === 11 && index === 12) {
                    // Set container to white to prevent flash
                    this.container.style.backgroundColor = '#ffffff';
                    
                    // Store the white overlay before cleanup
                    const overlayToKeep = previousScene.whiteOverlay;
                    previousScene.whiteOverlay = null; // Clear so cleanup won't remove it
                    
                    // Normal cleanup
                    previousScene.element?.classList.add('exiting');
                    previousScene.cleanup(index);
                    this.currentScene = null;
                    
                    // Remove overlay after Scene 13 settles
                    if (overlayToKeep) {
                        setTimeout(() => {
                            if (overlayToKeep.parentNode) {
                                overlayToKeep.parentNode.removeChild(overlayToKeep);
                            }
                        }, 2000);
                    }
                }
                else {
                    // All other transitions: immediate cleanup
                    previousScene.element?.classList.add('exiting');
                    previousScene.cleanup(index);
                    this.currentScene = null;
                }
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
            
            // Now that Scene 3 is loaded, start Scene 2's fade out
            if (previousScene && this.currentSceneIndex === 2) {
                // Set container background to dark blue for smooth transition
                this.container.style.backgroundColor = '#0a0a1f';
                previousScene.element?.classList.add('scene2-slide-out');
                
                // Reset to black after transition completes
                setTimeout(() => {
                    this.container.style.backgroundColor = '#000000';
                }, 1000);
            }
            
            // Handle Scene 3 to 4 transition
            if (previousScene && this.currentSceneIndex === 3) {
                // Delay setting container background to allow Scene 3's fade to complete
                setTimeout(() => {
                    this.container.style.backgroundColor = '#000000';
                }, 2000); // Wait for Scene 3's fade animation
            }
            
            // Handle Scene 4 to 5 transition
            if (previousScene && this.currentSceneIndex === 4) {
                // Set container background to black for Scene 5
                this.container.style.backgroundColor = '#000000';
            }
            
            // Handle Scene 6 to 7 transition
            if (previousScene && this.currentSceneIndex === 6) {
                // Set container background to black to match Scene 6's fade to black
                this.container.style.backgroundColor = '#000000';
            }
            
            // Handle Scene 7 to 8 transition
            if (previousScene && this.currentSceneIndex === 7) {
                console.log('[SceneManager] Scene 7 to 8 transition - setting beige background');
                // Set container background to beige to match Scene 7's ending colors
                this.container.style.backgroundColor = '#5F5A4B';
            }
            
            // Handle Scene 8 to 9 transition
            if (previousScene && this.currentSceneIndex === 8) {
                console.log('[SceneManager] Scene 8 to 9 transition - setting black background');
                // Set container background to black to match Scene 8's fade to black
                this.container.style.backgroundColor = '#000000';
            }
            
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