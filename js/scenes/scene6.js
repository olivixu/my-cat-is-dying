// Scene 6: "She doesn't know what the pills are for"
class Scene6 extends Scene {
    constructor(container) {
        super(container);
        this.text = "She doesn't know what the pills are for";
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-6';
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text';
        textContainer.innerHTML = `<h2>${this.text}</h2>`;
        
        // Create interactive container - pill bottles
        const interactiveContainer = document.createElement('div');
        interactiveContainer.className = 'interactive-container';
        interactiveContainer.innerHTML = `
            <div class="pill-bottles">
                <div class="pill-bottle" style="animation-delay: 0s">💊</div>
                <div class="pill-bottle" style="animation-delay: 0.3s">💊</div>
                <div class="pill-bottle" style="animation-delay: 0.6s">💊</div>
            </div>
            <p class="medicine-text">Hidden in treats, wrapped in love</p>
            <button class="continue-btn">Continue</button>
        `;
        
        // Assemble scene
        this.element.appendChild(textContainer);
        this.element.appendChild(interactiveContainer);
        
        // Add to container
        this.container.appendChild(this.element);
        
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
