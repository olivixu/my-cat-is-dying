class Scene2 extends Scene {
    constructor(container) {
        super(container);
        this.objectCount = 0;
        this.maxObjects = 20;
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene scene2';
        
        // Create canvas for physics
        const canvas = document.createElement('canvas');
        canvas.className = 'physics-canvas';
        canvas.width = this.container.offsetWidth;
        canvas.height = this.container.offsetHeight;
        
        // Create controls panel
        const controls = document.createElement('div');
        controls.className = 'physics-controls';
        controls.innerHTML = `
            <div class="control-group">
                <label class="control-label">Add Objects</label>
                <button class="control-btn" id="add-ball">Add Bouncy Ball</button>
                <button class="control-btn" id="add-box">Add Heavy Box</button>
                <button class="control-btn" id="add-ice">Add Ice Block</button>
            </div>
            <div class="control-group">
                <label class="control-label">Gravity Control</label>
                <button class="control-btn" id="gravity-normal">Normal Gravity</button>
                <button class="control-btn" id="gravity-low">Low Gravity</button>
                <button class="control-btn" id="gravity-reverse">Reverse Gravity</button>
                <button class="control-btn" id="gravity-zero">Zero Gravity</button>
            </div>
            <div class="control-group">
                <label class="control-label">Actions</label>
                <button class="control-btn" id="clear-objects">Clear All Objects</button>
                <button class="control-btn" id="complete-scene">Complete Scene</button>
            </div>
            <div class="control-group">
                <label class="control-label">Objects: <span id="object-count">0</span> / ${this.maxObjects}</label>
            </div>
        `;
        
        // Add elements to scene
        this.element.appendChild(canvas);
        this.element.appendChild(controls);
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Initialize physics
        this.physics = new PhysicsWrapper(canvas, {
            mouseControl: true,
            boundaries: true,
            wireframes: false
        });
        
        // Add some initial objects
        this.addInitialObjects();
        
        // Set up control listeners
        this.setupControls();
        
        // Handle window resize
        this.resizeHandler = () => this.handleResize();
        window.addEventListener('resize', this.resizeHandler);
    }
    
    addInitialObjects() {
        const centerX = this.physics.canvas.width / 2;
        const startY = 100;
        
        // Add a few starter objects
        this.physics.createBouncyBall(centerX - 100, startY, 25);
        this.physics.createHeavyBox(centerX, startY, 60, 60);
        this.physics.createIceBlock(centerX + 100, startY, 80, 40);
        
        this.objectCount = 3;
        this.updateObjectCount();
    }
    
    setupControls() {
        // Get buttons from this scene's element only
        const addBallBtn = this.element.querySelector('#add-ball');
        const addBoxBtn = this.element.querySelector('#add-box');
        const addIceBtn = this.element.querySelector('#add-ice');
        const gravityNormalBtn = this.element.querySelector('#gravity-normal');
        const gravityLowBtn = this.element.querySelector('#gravity-low');
        const gravityReverseBtn = this.element.querySelector('#gravity-reverse');
        const gravityZeroBtn = this.element.querySelector('#gravity-zero');
        const clearBtn = this.element.querySelector('#clear-objects');
        const completeBtn = this.element.querySelector('#complete-scene');
        
        // Add object buttons
        addBallBtn?.addEventListener('click', () => {
            if (this.objectCount < this.maxObjects) {
                const x = Math.random() * (this.physics.canvas.width - 100) + 50;
                const y = Math.random() * 200 + 50;
                const radius = Math.random() * 15 + 15;
                this.physics.createBouncyBall(x, y, radius);
                this.objectCount++;
                this.updateObjectCount();
            }
        });
        
        addBoxBtn?.addEventListener('click', () => {
            if (this.objectCount < this.maxObjects) {
                const x = Math.random() * (this.physics.canvas.width - 100) + 50;
                const y = Math.random() * 200 + 50;
                const size = Math.random() * 30 + 40;
                this.physics.createHeavyBox(x, y, size, size);
                this.objectCount++;
                this.updateObjectCount();
            }
        });
        
        addIceBtn?.addEventListener('click', () => {
            if (this.objectCount < this.maxObjects) {
                const x = Math.random() * (this.physics.canvas.width - 100) + 50;
                const y = Math.random() * 200 + 50;
                const width = Math.random() * 40 + 60;
                const height = Math.random() * 20 + 30;
                this.physics.createIceBlock(x, y, width, height);
                this.objectCount++;
                this.updateObjectCount();
            }
        });
        
        // Gravity controls
        gravityNormalBtn?.addEventListener('click', () => {
            this.physics.setGravity(0, 1);
        });
        
        gravityLowBtn?.addEventListener('click', () => {
            this.physics.setGravity(0, 0.3);
        });
        
        gravityReverseBtn?.addEventListener('click', () => {
            this.physics.setGravity(0, -0.5);
        });
        
        gravityZeroBtn?.addEventListener('click', () => {
            this.physics.setGravity(0, 0);
        });
        
        // Action buttons
        clearBtn?.addEventListener('click', () => {
            this.physics.clearBodies();
            this.objectCount = 0;
            this.updateObjectCount();
        });
        
        completeBtn?.addEventListener('click', () => {
            this.completeScene();
        });
    }
    
    updateObjectCount() {
        const counter = this.element.querySelector('#object-count');
        if (counter) {
            counter.textContent = this.objectCount;
            
            // Change color based on count
            if (this.objectCount >= this.maxObjects) {
                counter.style.color = '#ef4444';
            } else if (this.objectCount >= this.maxObjects * 0.8) {
                counter.style.color = '#f59e0b';
            } else {
                counter.style.color = '#10b981';
            }
        }
    }
    
    completeScene() {
        // Show completion message
        const message = document.createElement('div');
        message.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 30px;
            background: linear-gradient(135deg, #10b981, #059669);
            border-radius: 20px;
            text-align: center;
            z-index: 100;
            animation: successPop 0.5s ease;
        `;
        message.innerHTML = `
            <h2 style="font-size: 32px; margin-bottom: 10px;">Physics Mastered!</h2>
            <p style="font-size: 18px;">You've explored the physics playground!</p>
        `;
        this.element.appendChild(message);
        
        this.onComplete();
    }
    
    handleResize() {
        if (this.physics && this.physics.canvas) {
            const width = this.container.offsetWidth;
            const height = this.container.offsetHeight;
            this.physics.resize(width, height);
        }
    }
    
    cleanup() {
        // Remove resize listener
        window.removeEventListener('resize', this.resizeHandler);
        
        // Clean up physics
        if (this.physics) {
            this.physics.cleanup();
            this.physics = null;
        }
        
        super.cleanup();
    }
}