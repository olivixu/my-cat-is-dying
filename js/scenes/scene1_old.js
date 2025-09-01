class Scene1 extends Scene {
    constructor(container) {
        super(container);
        this.collectibles = [];
        this.collectedCount = 0;
        this.totalCollectibles = 5;
        this.mouseX = 0;
        this.mouseY = 0;
        this.revealRadius = 75;
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene scene1';
        
        // Create hidden content layer
        const hiddenContent = document.createElement('div');
        hiddenContent.className = 'hidden-content';
        hiddenContent.innerHTML = `
            <div style="text-align: center;">
                <h1>Secret Revealed!</h1>
                <p style="font-size: 24px; margin-top: 20px;">Find all ${this.totalCollectibles} hidden items</p>
            </div>
        `;
        
        // Create collectibles layer (visible and clickable)
        const collectiblesLayer = document.createElement('div');
        collectiblesLayer.className = 'collectibles-layer';
        collectiblesLayer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 15;
        `;
        this.createCollectibles(collectiblesLayer);
        
        // Create reveal area
        const revealArea = document.createElement('div');
        revealArea.className = 'reveal-area';
        revealArea.appendChild(hiddenContent.cloneNode(true));
        
        // Create dusty overlay
        const dustyOverlay = document.createElement('div');
        dustyOverlay.className = 'dusty-overlay';
        
        // Create magnifying glass
        this.magnifyingGlass = document.createElement('div');
        this.magnifyingGlass.className = 'magnifying-glass';
        
        // Create info panel
        const infoPanel = document.createElement('div');
        infoPanel.className = 'scene1-info';
        infoPanel.innerHTML = `
            <div class="collectibles-counter">
                Items Found: <span id="collected-count">0</span> / ${this.totalCollectibles}
            </div>
        `;
        
        // Assemble the scene
        this.element.appendChild(hiddenContent);
        this.element.appendChild(revealArea);
        this.element.appendChild(dustyOverlay);
        this.element.appendChild(collectiblesLayer);
        this.element.appendChild(this.magnifyingGlass);
        this.element.appendChild(infoPanel);
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start animation
        this.startAnimation();
    }
    
    createCollectibles(container) {
        const positions = [
            { x: 20, y: 30 },
            { x: 70, y: 20 },
            { x: 85, y: 60 },
            { x: 30, y: 70 },
            { x: 50, y: 50 }
        ];
        
        positions.forEach((pos, index) => {
            const collectible = document.createElement('div');
            collectible.className = 'collectible';
            collectible.dataset.index = index;
            collectible.style.left = `${pos.x}%`;
            collectible.style.top = `${pos.y}%`;
            collectible.innerHTML = '⭐';
            collectible.style.fontSize = '24px';
            collectible.style.display = 'flex';
            collectible.style.alignItems = 'center';
            collectible.style.justifyContent = 'center';
            collectible.style.opacity = '0';
            collectible.style.pointerEvents = 'none';
            
            collectible.addEventListener('click', (e) => {
                e.stopPropagation();
                this.collectItem(collectible);
            });
            
            container.appendChild(collectible);
            this.collectibles.push({
                element: collectible,
                x: pos.x,
                y: pos.y,
                collected: false
            });
        });
    }
    
    setupEventListeners() {
        // Mouse move for magnifying glass
        this.mouseMoveHandler = (e) => {
            const rect = this.element.getBoundingClientRect();
            this.mouseX = e.clientX - rect.left;
            this.mouseY = e.clientY - rect.top;
            
            // Update magnifying glass position
            this.magnifyingGlass.style.left = `${this.mouseX}px`;
            this.magnifyingGlass.style.top = `${this.mouseY}px`;
            
            // Update CSS variables for clip-path
            this.element.style.setProperty('--mouse-x', `${this.mouseX}px`);
            this.element.style.setProperty('--mouse-y', `${this.mouseY}px`);
            
            // Update reveal area
            const revealArea = this.element.querySelector('.reveal-area');
            revealArea.style.clipPath = `circle(${this.revealRadius}px at ${this.mouseX}px ${this.mouseY}px)`;
            
            // Check which collectibles are visible
            this.updateCollectibleVisibility();
        };
        
        // Mouse enter/leave for cursor
        this.mouseEnterHandler = () => {
            this.element.style.cursor = 'none';
            this.magnifyingGlass.style.display = 'block';
        };
        
        this.mouseLeaveHandler = () => {
            this.element.style.cursor = 'default';
            this.magnifyingGlass.style.display = 'none';
        };
        
        this.element.addEventListener('mousemove', this.mouseMoveHandler);
        this.element.addEventListener('mouseenter', this.mouseEnterHandler);
        this.element.addEventListener('mouseleave', this.mouseLeaveHandler);
    }
    
    updateCollectibleVisibility() {
        this.collectibles.forEach(item => {
            if (item.collected) return;
            
            const rect = item.element.getBoundingClientRect();
            const parentRect = this.element.getBoundingClientRect();
            const itemX = rect.left - parentRect.left + rect.width / 2;
            const itemY = rect.top - parentRect.top + rect.height / 2;
            
            // Calculate distance from mouse to collectible
            const distance = Math.sqrt(
                Math.pow(itemX - this.mouseX, 2) + 
                Math.pow(itemY - this.mouseY, 2)
            );
            
            // Show collectible if within magnifying glass radius
            if (distance <= this.revealRadius) {
                item.element.style.opacity = '1';
                item.element.style.pointerEvents = 'auto';
                item.element.style.transform = 'scale(1.1)';
            } else {
                item.element.style.opacity = '0';
                item.element.style.pointerEvents = 'none';
                item.element.style.transform = 'scale(1)';
            }
        });
    }
    
    collectItem(collectible) {
        if (collectible.classList.contains('collected')) return;
        
        collectible.classList.add('collected');
        this.collectedCount++;
        
        // Mark as collected in our array
        const index = parseInt(collectible.dataset.index);
        this.collectibles[index].collected = true;
        
        // Update counter
        const counter = this.element.querySelector('#collected-count');
        counter.textContent = this.collectedCount;
        
        // Play collection animation
        setTimeout(() => {
            collectible.style.display = 'none';
        }, 500);
        
        // Check if all items are collected
        if (this.collectedCount === this.totalCollectibles) {
            this.completeScene();
        }
    }
    
    completeScene() {
        // Animate reveal of entire area
        const revealArea = this.element.querySelector('.reveal-area');
        const dustyOverlay = this.element.querySelector('.dusty-overlay');
        
        // Expand reveal area
        let radius = this.revealRadius;
        const expandInterval = setInterval(() => {
            radius += 20;
            revealArea.style.clipPath = `circle(${radius}px at 50% 50%)`;
            
            if (radius > Math.max(window.innerWidth, window.innerHeight)) {
                clearInterval(expandInterval);
                dustyOverlay.style.opacity = '0';
                this.magnifyingGlass.style.display = 'none';
                
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
                    <h2 style="font-size: 32px; margin-bottom: 10px;">Scene Complete!</h2>
                    <p style="font-size: 18px;">All secrets revealed!</p>
                `;
                this.element.appendChild(message);
                
                this.onComplete();
            }
        }, 30);
    }
    
    update() {
        // Animation updates if needed
    }
    
    cleanup() {
        // Remove event listeners
        if (this.element) {
            this.element.removeEventListener('mousemove', this.mouseMoveHandler);
            this.element.removeEventListener('mouseenter', this.mouseEnterHandler);
            this.element.removeEventListener('mouseleave', this.mouseLeaveHandler);
        }
        
        super.cleanup();
    }
}