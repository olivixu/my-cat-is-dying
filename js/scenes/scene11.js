// Scene 11: "I don't know when she will leave me"
import { Scene } from '../sceneManager.js';

export class Scene11 extends Scene {
    constructor(container) {
        super(container);
        this.text = "I wonder how I will live without her.";
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-11';
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text scene11-text';
        textContainer.innerHTML = `<h2>${this.text}</h2>`;
        
        // Create circular button with hourglass
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'continue-button-container';
        
        // Create button (black circle)
        const continueButton = document.createElement('button');
        continueButton.className = 'continue-button';
        
        // Add hourglass icon inside the circle
        const buttonIcon = document.createElement('span');
        buttonIcon.className = 'button-icon';
        buttonIcon.innerHTML = '⏳';
        
        // Add icon to button
        continueButton.appendChild(buttonIcon);
        
        // Add button to container
        buttonContainer.appendChild(continueButton);
        
        // Assemble scene
        this.element.appendChild(textContainer);
        this.element.appendChild(buttonContainer);
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Track if transition is in progress
        let isTransitioning = false;
        
        // Add button click handler
        continueButton.addEventListener('click', () => {
            if (isTransitioning) return; // Prevent multiple clicks
            isTransitioning = true;
            
            // Get button position
            const buttonRect = continueButton.getBoundingClientRect();
            const buttonCenterX = buttonRect.left + buttonRect.width / 2;
            const buttonCenterY = buttonRect.top + buttonRect.height / 2;
            
            // Create black overlay at button position
            const blackOverlay = document.createElement('div');
            blackOverlay.setAttribute('data-overlay', 'black');
            blackOverlay.style.cssText = `
                position: fixed;
                top: ${buttonCenterY}px;
                left: ${buttonCenterX}px;
                width: 180px;
                height: 180px;
                background: black;
                border-radius: 50%;
                transform: translate(-50%, -50%);
                z-index: 9999;
                transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
            `;
            document.body.appendChild(blackOverlay);
            
            // Trigger expansion
            setTimeout(() => {
                blackOverlay.style.transform = 'translate(-50%, -50%) scale(20)';
            }, 10);
            
            // Transition to next scene
            setTimeout(() => {
                this.onComplete();
                if (window.sceneManager) {
                    window.sceneManager.nextScene();
                }
                // Remove overlay after scene loads
                setTimeout(() => blackOverlay.remove(), 100);
            }, 1200);
        });
        
        // Also allow space/enter to continue
        const handleKeyPress = (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                if (isTransitioning) return; // Prevent multiple triggers
                isTransitioning = true;
                
                // Get button position
                const buttonRect = continueButton.getBoundingClientRect();
                const buttonCenterX = buttonRect.left + buttonRect.width / 2;
                const buttonCenterY = buttonRect.top + buttonRect.height / 2;
                
                // Same as button click - create black overlay at button position
                const blackOverlay = document.createElement('div');
                blackOverlay.setAttribute('data-overlay', 'black');
                blackOverlay.style.cssText = `
                    position: fixed;
                    top: ${buttonCenterY}px;
                    left: ${buttonCenterX}px;
                    width: 180px;
                    height: 180px;
                    background: black;
                    border-radius: 50%;
                    transform: translate(-50%, -50%);
                    z-index: 9999;
                    transition: transform 1.2s cubic-bezier(0.4, 0, 0.2, 1);
                `;
                document.body.appendChild(blackOverlay);
                
                setTimeout(() => {
                    blackOverlay.style.transform = 'translate(-50%, -50%) scale(20)';
                }, 10);
                
                setTimeout(() => {
                    this.onComplete();
                    if (window.sceneManager) {
                        window.sceneManager.nextScene();
                    }
                    setTimeout(() => blackOverlay.remove(), 100);
                }, 1200);
                
                // Remove the event listener after use
                document.removeEventListener('keydown', handleKeyPress);
            }
        };
        
        // Add keyboard listener
        document.addEventListener('keydown', handleKeyPress);
        
        // Store reference to remove on cleanup
        this.keyPressHandler = handleKeyPress;
    }
    
    cleanup() {
        // Remove keyboard listener if it exists
        if (this.keyPressHandler) {
            document.removeEventListener('keydown', this.keyPressHandler);
        }
        super.cleanup();
    }
}