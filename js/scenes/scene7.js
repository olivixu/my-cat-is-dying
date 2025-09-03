// Scene 7: "She doesn't know where I go after giving her a kiss every morning."
class Scene7 extends Scene {
    constructor(container) {
        super(container);
        this.text = "She doesn't know where I go after giving her a kiss every morning.";
        
        // Track which photos have been kissed
        this.kissedPhotos = new Set();
        this.requiredKisses = 5; // Number of photos to kiss
        this.photos = [];
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-7';
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text';
        textContainer.innerHTML = `<h2>${this.text}</h2>`;
        
        // Create interactive container
        const interactiveContainer = document.createElement('div');
        interactiveContainer.className = 'interactive-container kiss-scene';
        
        // Create instruction text
        const instructions = document.createElement('p');
        instructions.className = 'kiss-instructions';
        instructions.innerHTML = 'Click on Smokey\'s head to give morning kisses';
        
        // Create photo gallery
        const photoGallery = document.createElement('div');
        photoGallery.className = 'photo-gallery';
        
        // Create photos of Smokey in different poses
        const smokeyPoses = [
            { emoji: '🐱', pose: 'sitting' },
            { emoji: '😸', pose: 'happy' },
            { emoji: '😺', pose: 'smiling' },
            { emoji: '😻', pose: 'loving' },
            { emoji: '😿', pose: 'sleepy' }
        ];
        
        smokeyPoses.forEach((smokey, index) => {
            const photoFrame = document.createElement('div');
            photoFrame.className = 'photo-frame';
            photoFrame.dataset.photoId = index;
            
            const photo = document.createElement('div');
            photo.className = 'smokey-photo';
            photo.dataset.photoId = index;
            
            // Create the cat emoji
            const cat = document.createElement('div');
            cat.className = 'smokey-emoji';
            cat.innerHTML = smokey.emoji;
            
            // Create invisible click zone for the head (upper part of the emoji)
            const headZone = document.createElement('div');
            headZone.className = 'head-click-zone';
            headZone.dataset.photoId = index;
            
            photo.appendChild(cat);
            photo.appendChild(headZone);
            photoFrame.appendChild(photo);
            photoGallery.appendChild(photoFrame);
            
            // Store reference
            this.photos.push({
                element: photoFrame,
                kissed: false,
                id: index
            });
            
            // Add click handler for the head zone
            headZone.addEventListener('click', (e) => this.giveKiss(e, index));
        });
        
        // Create progress display
        const progressDisplay = document.createElement('div');
        progressDisplay.className = 'kiss-progress';
        progressDisplay.innerHTML = `
            <span id="kiss-count">0</span> / ${this.requiredKisses} morning kisses given
        `;
        
        // Create completion message (hidden initially)
        const completionMessage = document.createElement('div');
        completionMessage.className = 'completion-message hidden';
        completionMessage.innerHTML = `
            <p>Every morning, without fail... 💕</p>
            <button class="continue-btn">Continue</button>
        `;
        
        // Assemble interactive container
        interactiveContainer.appendChild(instructions);
        interactiveContainer.appendChild(photoGallery);
        interactiveContainer.appendChild(progressDisplay);
        interactiveContainer.appendChild(completionMessage);
        
        // Assemble scene
        this.element.appendChild(textContainer);
        this.element.appendChild(interactiveContainer);
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Store references
        this.kissCountElement = this.element.querySelector('#kiss-count');
        this.completionMessage = completionMessage;
        this.photoGallery = photoGallery;
        
        // Add continue button handler
        const btn = completionMessage.querySelector('.continue-btn');
        btn?.addEventListener('click', () => {
            this.onComplete();
            if (window.sceneManager) {
                window.sceneManager.nextScene();
            }
        });
    }
    
    giveKiss(event, photoId) {
        // Prevent multiple kisses on the same photo
        if (this.kissedPhotos.has(photoId)) {
            return;
        }
        
        // Mark photo as kissed
        this.kissedPhotos.add(photoId);
        
        // Get click position relative to the photo
        const photo = this.photos[photoId].element;
        const rect = photo.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Create kiss icon at click position
        const kiss = document.createElement('div');
        kiss.className = 'kiss-icon';
        kiss.innerHTML = '💋';
        kiss.style.left = `${x}px`;
        kiss.style.top = `${y}px`;
        
        // Add kiss to photo
        photo.appendChild(kiss);
        
        // Add kissed state to photo
        photo.classList.add('kissed');
        
        // Create floating hearts effect
        this.createHearts(photo, x, y);
        
        // Update progress
        this.updateProgress();
        
        // Check if all required kisses are given
        if (this.kissedPhotos.size >= this.requiredKisses) {
            this.completeScene();
        }
    }
    
    createHearts(photo, x, y) {
        // Create multiple small hearts that float up
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.className = 'floating-heart';
                heart.innerHTML = '💕';
                heart.style.left = `${x + (Math.random() - 0.5) * 20}px`;
                heart.style.top = `${y}px`;
                
                photo.appendChild(heart);
                
                // Remove after animation completes
                setTimeout(() => heart.remove(), 2000);
            }, i * 200);
        }
    }
    
    updateProgress() {
        this.kissCountElement.textContent = this.kissedPhotos.size;
        
        // Add a little celebration for each kiss
        this.kissCountElement.classList.add('pop');
        setTimeout(() => {
            this.kissCountElement.classList.remove('pop');
        }, 300);
    }
    
    completeScene() {
        // Show completion message
        setTimeout(() => {
            this.completionMessage.classList.remove('hidden');
            
            // Add glow effect to all photos
            this.photos.forEach(photo => {
                photo.element.classList.add('glowing');
            });
        }, 500);
    }
    
    cleanup() {
        // Remove event listeners if needed
        super.cleanup();
    }
}