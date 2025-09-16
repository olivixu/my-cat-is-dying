// Scene 12: "In between the unknowable and the loose trap of existence, we met."
import { Scene } from '../sceneManager.js';

export class Scene12 extends Scene {
    constructor(container) {
        super(container);
        this.text1 = "In between the unknowable";
        this.text2 = "and the loose trap of existence, we met.";
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-12';
        
        // Create container for the animated content
        const contentContainer = document.createElement('div');
        contentContainer.className = 'scene12-content';
        
        // Create first text element
        const text1Element = document.createElement('div');
        text1Element.className = 'scene12-text1';
        text1Element.innerHTML = `<h2>${this.text1}</h2>`;
        
        // Create the white line
        const whiteLine = document.createElement('div');
        whiteLine.className = 'white-line';
        
        // Create second text element
        const text2Element = document.createElement('div');
        text2Element.className = 'scene12-text2';
        text2Element.innerHTML = `<h2>${this.text2}</h2>`;
        
        // Assemble content
        contentContainer.appendChild(text1Element);
        contentContainer.appendChild(whiteLine);
        contentContainer.appendChild(text2Element);
        
        // Add to scene
        this.element.appendChild(contentContainer);
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Start the animation sequence
        this.startAnimationSequence(text1Element, whiteLine, text2Element);
    }
    
    startAnimationSequence(text1, line, text2) {
        // Hide the line element since we'll use overlay
        line.style.display = 'none';
        
        // Step 1: Fade in first text
        setTimeout(() => {
            text1.classList.add('fade-in');
        }, 500);
        
        // Step 2: Create and animate white line overlay
        setTimeout(() => {
            const whiteOverlay = document.createElement('div');
            whiteOverlay.setAttribute('data-overlay', 'white');
            whiteOverlay.style.cssText = `
                position: fixed;
                top: 50%;
                left: 0;
                width: 0.5px;
                height: 0.5px;
                background: white;
                transform: translateX(-100vw) translateY(-50%);
                z-index: 9999;
                transition: none;
            `;
            document.body.appendChild(whiteOverlay);
            
            // Animate across
            setTimeout(() => {
                whiteOverlay.style.transition = 'all 1.5s ease';
                whiteOverlay.style.transform = 'translateX(0) translateY(-50%)';
                whiteOverlay.style.width = '100vw';
            }, 10);
            
            // Store reference for later expansion
            this.whiteOverlay = whiteOverlay;
        }, 1500);
        
        // Step 3: Fade in second text
        setTimeout(() => {
            text2.classList.add('fade-in');
        }, 3000);
        
        // Step 4: Pause for reading (4s-6s)
        
        // Step 5: Expand line to fill screen
        setTimeout(() => {
            if (this.whiteOverlay) {
                this.whiteOverlay.style.transition = 'height 1.5s ease';
                this.whiteOverlay.style.height = '100vh';
            }
        }, 6000);
        
        // Step 6: Transition to next scene
        setTimeout(() => {
            this.onComplete();
            if (window.sceneManager) {
                window.sceneManager.nextScene();
            }
            // Keep white overlay for transition to Scene 13
        }, 7500);
    }
    
    cleanup() {
        super.cleanup();
    }
}