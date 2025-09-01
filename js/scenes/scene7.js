// Scene 7: "She doesn't know where I go after giving her a kiss every morning."
class Scene7 extends Scene {
    constructor(container) {
        super(container);
        this.text = "She doesn't know where I go after giving her a kiss every morning.";
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-7';
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text';
        textContainer.innerHTML = `<h2>${this.text}</h2>`;
        
        // Create interactive container - door animation
        const interactiveContainer = document.createElement('div');
        interactiveContainer.className = 'interactive-container';
        interactiveContainer.innerHTML = `
            <div class="door-scene">
                <div class="door">
                    <div class="door-frame"></div>
                    <div class="kiss-mark">💕</div>
                </div>
                <p class="goodbye-text">Until I return...</p>
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
