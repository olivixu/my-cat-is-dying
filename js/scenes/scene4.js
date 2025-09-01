// Scene 4: "She doesn't know why I feed her so many treats these days."
class Scene4 extends Scene {
    constructor(container) {
        super(container);
        this.text = "She doesn't know why I feed her so many treats these days.";
        this.treatCount = 0;
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-4';
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text';
        textContainer.innerHTML = `<h2>${this.text}</h2>`;
        
        // Create interactive container - clickable treats
        const interactiveContainer = document.createElement('div');
        interactiveContainer.className = 'interactive-container';
        interactiveContainer.innerHTML = `
            <div class="treat-dispenser">
                <div class="treat-bowl"></div>
                <button class="give-treat-btn">Give Treat</button>
                <p class="treat-counter">Treats given: <span id="treat-count">0</span></p>
            </div>
            <button class="continue-btn">Continue</button>
        `;
        
        // Assemble scene
        this.element.appendChild(textContainer);
        this.element.appendChild(interactiveContainer);
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Add treat button handler
        const treatBtn = this.element.querySelector('.give-treat-btn');
        treatBtn?.addEventListener('click', () => {
            this.treatCount++;
            const counter = this.element.querySelector('#treat-count');
            if (counter) counter.textContent = this.treatCount;
            
            // Create floating treat animation
            const treat = document.createElement('div');
            treat.className = 'floating-treat';
            treat.innerHTML = '=';
            treat.style.left = Math.random() * 80 + 10 + '%';
            this.element.querySelector('.treat-bowl').appendChild(treat);
            setTimeout(() => treat.remove(), 2000);
        });
        
        // Add continue button handler
        const btn = this.element.querySelector('.continue-btn');
        btn?.addEventListener('click', () => {
            this.onComplete();
            // Advance to next scene
            if (window.sceneManager) {
                window.sceneManager.nextScene();
            }
        });
    }
}