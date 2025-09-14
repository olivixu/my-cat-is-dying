class Scene {
    constructor(container) {
        this.container = container;
        this.element = null;
        this.physics = null;
        this.isComplete = false;
        this.animationFrame = null;
    }
    
    async init() {
        // Override in subclasses
    }
    
    update() {
        // Override in subclasses for animation updates
    }
    
    cleanup() {
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
    
    onComplete() {
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

class SceneManager {
    constructor(container, scenes) {
        this.container = container;
        this.scenes = scenes;
        this.currentSceneIndex = 0;
        this.currentScene = null;
        this.isTransitioning = false;
        
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
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        try {
            // Clean up current scene
            if (this.currentScene) {
                this.currentScene.element?.classList.add('exiting');
                this.currentScene.cleanup();
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
    }
    
    async nextScene() {
        if (this.currentSceneIndex < this.scenes.length - 1) {
            await this.loadScene(this.currentSceneIndex + 1);
        }
    }
    
    async previousScene() {
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