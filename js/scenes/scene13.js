// Scene 13: "I love you forever, little bean"
class Scene13 extends Scene {
    constructor(container) {
        super(container);
        this.text = "I love you forever, little bean";
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-13';
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text';
        textContainer.innerHTML = `<h2>${this.text}</h2>`;
        
        // Create interactive container - hearts
        const interactiveContainer = document.createElement('div');
        interactiveContainer.className = 'interactive-container';
        interactiveContainer.innerHTML = `
            <div class="love-scene">
                <div class="eternal-hearts">
                    <span class="heart" style="animation-delay: 0s">💗</span>
                    <span class="heart" style="animation-delay: 0.2s">💗</span>
                    <span class="heart" style="animation-delay: 0.4s">💗</span>
                    <span class="heart" style="animation-delay: 0.6s">💗</span>
                    <span class="heart" style="animation-delay: 0.8s">💗</span>
                </div>
                <p class="love-text">Forever and always</p>
            </div>
            <button class="restart-btn">Start Again</button>
        `;
        
        // Assemble scene
        this.element.appendChild(textContainer);
        this.element.appendChild(interactiveContainer);
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Add restart button handler
        const btn = this.element.querySelector('.restart-btn');
        btn?.addEventListener('click', () => {
            // Go back to first scene
            if (window.sceneManager) {
                window.sceneManager.loadScene(0);
            }
        });
    }
}
