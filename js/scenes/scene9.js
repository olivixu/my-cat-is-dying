// Scene 9: "I don't know if she thinks of me as much as I think of her while I am away"
class Scene9 extends Scene {
    constructor(container) {
        super(container);
        this.text = "I don't know if she thinks of me as much as I think of her while I am away";
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-9';
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text';
        textContainer.innerHTML = `<h2>${this.text}</h2>`;
        
        // Create interactive container - thought bubbles
        const interactiveContainer = document.createElement('div');
        interactiveContainer.className = 'interactive-container';
        interactiveContainer.innerHTML = `
            <div class="thought-bubbles">
                <div class="thought-bubble left">
                    <span>💭</span>
                    <p>Waiting by the window...</p>
                </div>
                <div class="thought-bubble right">
                    <span>💭</span>
                    <p>Counting the hours...</p>
                </div>
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
