// Scene 1: "My cat is dying."
class Scene1 extends Scene {
    constructor(container) {
        super(container);
        this.text = "My cat is dying.";
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-1';
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text scene1-text';
        textContainer.innerHTML = `<h1>${this.text}</h1>`;
        
        // Create circular button with SVG
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'begin-button-container';
        
        // Create button (just the black circle)
        const beginButton = document.createElement('button');
        beginButton.className = 'begin-button';
        
        // Create SVG as separate element
        const svgText = document.createElement('img');
        svgText.src = 'assets/SVG/Begin-button-text.svg';
        svgText.alt = 'Begin';
        svgText.className = 'begin-text-svg';
        
        // Add both to container
        buttonContainer.appendChild(beginButton);
        buttonContainer.appendChild(svgText);
        
        // Assemble scene
        this.element.appendChild(textContainer);
        this.element.appendChild(buttonContainer);
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Track if transition is in progress
        let isTransitioning = false;
        
        // Add button click handler
        beginButton.addEventListener('click', () => {
            if (isTransitioning) return; // Prevent multiple clicks
            isTransitioning = true;
            
            // Add expanding animation class to container
            buttonContainer.classList.add('expanding');
            
            // Wait for animation to complete before transitioning
            setTimeout(() => {
                this.onComplete();
                // Advance to next scene
                if (window.sceneManager) {
                    window.sceneManager.nextScene();
                }
            }, 1200); // Wait for expansion animation
        });
        
        // Also allow space/enter to continue
        const handleKeyPress = (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                if (isTransitioning) return; // Prevent multiple triggers
                isTransitioning = true;
                
                // Trigger the button animation
                buttonContainer.classList.add('expanding');
                
                // Wait for animation before transitioning
                setTimeout(() => {
                    this.onComplete();
                    if (window.sceneManager) {
                        window.sceneManager.nextScene();
                    }
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