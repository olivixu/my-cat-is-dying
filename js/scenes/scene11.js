// Scene 11: "I don't know when she will leave me"
class Scene11 extends Scene {
    constructor(container) {
        super(container);
        this.text = "I don't know when she will leave me";
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-11';
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text';
        textContainer.innerHTML = `<h2>${this.text}</h2>`;
        
        // Create interactive container - hourglass
        const interactiveContainer = document.createElement('div');
        interactiveContainer.className = 'interactive-container';
        interactiveContainer.innerHTML = `
            <div class="time-scene">
                <div class="hourglass">⏳</div>
                <p class="time-text">Every moment is precious</p>
            </div>
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
