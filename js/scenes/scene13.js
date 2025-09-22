// Scene 13: "I love you forever, little bean"
import { Scene } from '../sceneManager.js';

export class Scene13 extends Scene {
    constructor(container) {
        super(container);
        this.text = "I love you forever, little bean.";
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-13';
        
        // Remove any cream overlay from Scene 12 after a delay
        setTimeout(() => {
            const overlays = document.querySelectorAll('[data-overlay="white"]');
            overlays.forEach(overlay => overlay.remove());
        }, 500);
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text scene13-text';
        textContainer.innerHTML = `<h1>${this.text}</h1>`;
        
        // Create interactive container - letter
        const interactiveContainer = document.createElement('div');
        interactiveContainer.className = 'interactive-container';
        interactiveContainer.innerHTML = `
            <div class="love-scene">
                <img src="assets/images/last-image.png" alt="Smokey" class="last-photo" />
                <img src="assets/images/Letter.png" alt="Letter to Smokey" class="letter-image" />
            </div>
            <button class="restart-btn">Start Again</button>
            <div style="min-height: 40px; color: #FAF8F3;">Made with love</div>
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