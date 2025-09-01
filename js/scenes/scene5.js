// Scene 5: "She doesn't know why it's so hard to breathe"
class Scene5 extends Scene {
    constructor(container) {
        super(container);
        this.text = "She doesn't know why it's so hard to breathe";
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-5';
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text';
        textContainer.innerHTML = `<h2>${this.text}</h2>`;
        
        // Create interactive container - breathing visualization
        const interactiveContainer = document.createElement('div');
        interactiveContainer.className = 'interactive-container';
        interactiveContainer.innerHTML = `
            <div class="breathing-circle">
                <div class="breath-inner"></div>
            </div>
            <p class="breath-text">Breathe with her...</p>
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
