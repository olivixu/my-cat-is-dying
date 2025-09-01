// Base class for story scenes with common functionality
class StoryScene extends Scene {
    constructor(container, text, interactiveType = 'placeholder') {
        super(container);
        this.text = text;
        this.interactiveType = interactiveType;
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene';
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text';
        textContainer.innerHTML = `<p>${this.text}</p>`;
        
        // Create interactive container
        const interactiveContainer = document.createElement('div');
        interactiveContainer.className = 'interactive-container';
        
        // Add placeholder interactive based on type
        this.createInteractive(interactiveContainer);
        
        // Assemble scene
        this.element.appendChild(textContainer);
        this.element.appendChild(interactiveContainer);
        
        // Add to container
        this.container.appendChild(this.element);
    }
    
    createInteractive(container) {
        // Override in subclasses for specific interactions
        const placeholder = document.createElement('div');
        placeholder.className = 'interactive-placeholder';
        placeholder.innerHTML = `
            <div class="placeholder-content">
                <p>Interactive element coming soon</p>
                <button class="complete-btn">Continue</button>
            </div>
        `;
        
        // Add complete button handler
        const btn = placeholder.querySelector('.complete-btn');
        btn?.addEventListener('click', () => this.onComplete());
        
        container.appendChild(placeholder);
    }
}