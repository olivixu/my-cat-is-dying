// Scene 3: "There is a lot she doesn't know because she is a cat."
class Scene3 extends Scene {
    constructor(container) {
        super(container);
        this.text = "There is a lot she doesn't know because she is a cat.";
        this.headOpen = false;
        this.headOpenedOnce = false; // Track if head has been opened
        this.attemptCount = 0;
        this.maxAttempts = 3;
        this.physicsBooks = [];
        this.usePhysics = false;
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-3';
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text scene3-text';
        textContainer.innerHTML = `<h2>${this.text}</h2>`;
        
        // Create game container
        const gameContainer = document.createElement('div');
        gameContainer.className = 'smokey-game-container';
        
        // Create physics canvas
        const physicsCanvas = document.createElement('canvas');
        physicsCanvas.className = 'physics-canvas';
        physicsCanvas.width = window.innerWidth;
        physicsCanvas.height = window.innerHeight;
        physicsCanvas.style.background = 'transparent';
        
        // Initialize physics
        this.initPhysics(physicsCanvas);
        
        // Create Smokey's head
        const smokeyHead = document.createElement('div');
        smokeyHead.className = 'smokey-head';
        
        // Create head back image (bottom layer - inside of head)
        const smokeyHeadBack = document.createElement('img');
        smokeyHeadBack.className = 'smokey-head-back';
        smokeyHeadBack.src = 'assets/images/smokey-head-back.png';
        smokeyHeadBack.alt = 'Smokey head back';
        
        // Create body image (middle layer)
        const smokeyBody = document.createElement('img');
        smokeyBody.className = 'smokey-body';
        smokeyBody.src = 'assets/images/smokey-body.png';
        smokeyBody.alt = 'Smokey body';
        
        // Create head lid image (top layer - lifts up)
        const headLid = document.createElement('img');
        headLid.className = 'head-lid';
        headLid.src = 'assets/images/smokey-head.png';
        headLid.alt = 'Smokey head';
        headLid.style.pointerEvents = 'auto'; // Make head-lid clickable
        headLid.style.cursor = 'pointer';
        
        // Add click to head-lid instead of smokeyHead
        headLid.addEventListener('click', () => {
            this.toggleHead(smokeyHead);
        });
        
        // Only add head-back to the smokey head container
        smokeyHead.appendChild(smokeyHeadBack);
        
        // Create drop zone inside head (invisible but functional)
        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        smokeyHead.appendChild(dropZone);
        
        // Store dropZone reference - collision detection will be set up when head opens
        this.dropZone = dropZone;
        
        // Create overlay container for body and head-lid
        const smokeyOverlay = document.createElement('div');
        smokeyOverlay.className = 'smokey-overlay';
        smokeyOverlay.appendChild(smokeyBody);
        smokeyOverlay.appendChild(headLid);
        
        // Store headLid reference for animation
        this.headLid = headLid;
        
        // Create speech bubble (hidden initially)
        const speechBubble = document.createElement('div');
        speechBubble.className = 'speech-bubble hidden';
        speechBubble.innerHTML = 'Meow!';
        
        // Assemble game
        gameContainer.appendChild(smokeyHead);
        gameContainer.appendChild(speechBubble);
        
        // Assemble scene with proper layering
        this.element.appendChild(textContainer);
        this.element.appendChild(gameContainer);  // Contains head-back
        this.element.appendChild(physicsCanvas);  // Books in middle
        this.element.appendChild(smokeyOverlay);  // Body and head-lid on top
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Store references
        this.speechBubble = speechBubble;
        this.physicsCanvas = physicsCanvas;
        
        // Start physics animation
        this.startAnimation();
    }
    
    toggleHead(headElement) {
        // Only allow opening once
        if (this.headOpenedOnce) return;
        
        this.headOpen = true;
        this.headOpenedOnce = true;
        
        // Open the head permanently
        headElement.classList.add('open');
        
        // Also add open class to head-lid for animation
        if (this.headLid) {
            this.headLid.classList.add('open');
            // Disable pointer events on head-lid after opening to allow dragging
            this.headLid.style.pointerEvents = 'none';
        }
        
        // Create books when head is opened
        if (this.usePhysics && this.physicsBooks.length === 0) {
            this.createInitialBooks(this.physicsCanvas);
        }
        
        // Set up collision detection after head opens
        if (this.usePhysics && this.physics) {
            // Wait for DOM updates and animations
            setTimeout(() => {
                this.setupCollisionDetection();
            }, 500);  // Give time for open animation
        }
        
        console.log('Smokey\'s head opened - books spawned and collision detection will be set up');
    }
    
    handleDragStart(e) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('bookId', e.target.dataset.bookId);
        e.target.classList.add('dragging');
    }
    
    handleDragEnd(e) {
        e.target.classList.remove('dragging');
    }
    
    handleDragOver(e) {
        if (e.preventDefault) {
            e.preventDefault();
        }
        e.dataTransfer.dropEffect = 'move';
        return false;
    }
    
    handleDrop(e, dropZone, smokeyHead) {
        if (e.stopPropagation) {
            e.stopPropagation();
        }
        e.preventDefault();
        
        if (!this.headOpen) {
            // Head is closed, can't drop
            return false;
        }
        
        const bookId = e.dataTransfer.getData('bookId');
        const book = document.querySelector(`[data-book-id="${bookId}"]`);
        
        if (book) {
            // Get drop position
            const dropRect = dropZone.getBoundingClientRect();
            const canvasRect = this.physicsCanvas.getBoundingClientRect();
            
            // Create physics book at drop position (50px lower)
            const x = dropRect.left + dropRect.width/2 - canvasRect.left;
            const y = dropRect.top - canvasRect.top + 50;
            
            this.createPhysicsBook(x, y);
            
            // Increment attempt counter
            this.attemptCount++;
            
            // Check if we've reached max attempts
            if (this.attemptCount >= this.maxAttempts) {
                this.showSpeechBubble();
            }
        }
        
        return false;
    }
    
    showSpeechBubble() {
        // Skip speech bubble, just auto advance
        setTimeout(() => {
            this.onComplete();
            if (window.sceneManager) {
                window.sceneManager.nextScene();
            }
        }, 1000);
    }
    
    initPhysics(canvas) {
        console.log('Initializing physics for Scene 3');
        
        // Check if Matter.js is available
        if (typeof Matter === 'undefined') {
            console.warn('Matter.js not loaded, using CSS fallback');
            this.usePhysics = false;
            return;
        }
        
        // Check if PhysicsWrapper exists
        if (typeof PhysicsWrapper === 'undefined') {
            console.warn('PhysicsWrapper not found, using CSS fallback');
            this.usePhysics = false;
            return;
        }
        
        try {
            // Create physics engine with mouse control, no auto boundaries
            this.physics = new PhysicsWrapper(canvas, {
                mouseControl: true,
                wireframes: false,
                background: 'transparent',
                boundaries: false  // Disable auto boundaries so we can create custom ones
            });
            
            // Set gravity
            this.physics.engine.world.gravity.y = 1;
            
            // Create custom boundaries
            const width = canvas.width;
            const height = canvas.height;
            
            console.log('Canvas dimensions:', width, height);
            
            // Floor (visible, at bottom)
            this.physics.createRectangle(width/2, height - 10, width, 20, { 
                isStatic: true,
                render: { fillStyle: '#333333' }
            });
            
            // Invisible side walls (just off screen edges)
            this.physics.createRectangle(-20, height/2, 40, height, { 
                isStatic: true,
                render: { visible: false }
            });
            this.physics.createRectangle(width + 20, height/2, 40, height, { 
                isStatic: true,
                render: { visible: false }
            });
            
            // No ceiling - books can be dragged to any height
            
            this.usePhysics = true;
            console.log('Physics initialized successfully');
            
            // Don't create books initially - wait for head to be opened
            
        } catch (error) {
            console.error('Physics initialization failed:', error);
            this.usePhysics = false;
            this.physics = null;
        }
    }
    
    createInitialBooks(canvas) {
        if (!this.physics) return;
        
        // Create 5 books at the bottom of the screen
        const bookWidth = 40;
        const bookHeight = 60;
        const spacing = 80;
        const startX = canvas.width / 2 - (4 * spacing) / 2;
        const y = canvas.height - 150;
        
        for (let i = 0; i < 5; i++) {
            const x = startX + (i * spacing);
            const book = this.physics.createRectangle(x, y, bookWidth, bookHeight, {
                restitution: 0.6,
                friction: 0.4,
                density: 0.001,
                render: {
                    fillStyle: '#8B4513'
                }
            });
            
            this.physicsBooks.push(book);
        }
    }
    
    setupCollisionDetection() {
        // Safety check
        if (!this.dropZone || !this.physicsCanvas) {
            console.warn('Cannot setup collision detection - missing elements');
            return;
        }

        // Get actual position of Smokey's head element
        const smokeyHead = this.element.querySelector('.smokey-head');
        if (!smokeyHead) {
            console.warn('Smokey head element not found');
            return;
        }
        
        const headRect = smokeyHead.getBoundingClientRect();
        const canvasRect = this.physicsCanvas.getBoundingClientRect();
        
        console.log('Head rect:', headRect);
        console.log('Canvas rect:', canvasRect);
        
        // Calculate position relative to physics canvas (150px lower)
        const dropZoneBounds = {
            x: headRect.left + headRect.width/2 - canvasRect.left,
            y: headRect.top + headRect.height/2 - canvasRect.top + 150,
            width: headRect.width * 0.8,  // Make detection area larger
            height: headRect.height * 0.8
        };
        
        // Debug zone commented out - no visual indicator needed
        /*
        const oldDebug = document.querySelector('.collision-debug-zone');
        if (oldDebug) oldDebug.remove();
        
        const debugZone = document.createElement('div');
        debugZone.className = 'collision-debug-zone';
        debugZone.style.position = 'fixed';
        debugZone.style.left = (dropZoneBounds.x - dropZoneBounds.width/2 + canvasRect.left) + 'px';
        debugZone.style.top = (dropZoneBounds.y - dropZoneBounds.height/2 + canvasRect.top) + 'px';
        debugZone.style.width = dropZoneBounds.width + 'px';
        debugZone.style.height = dropZoneBounds.height + 'px';
        debugZone.style.border = '3px solid rgba(255, 0, 0, 0.8)';
        debugZone.style.pointerEvents = 'none';
        debugZone.style.zIndex = '10000';
        debugZone.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
        document.body.appendChild(debugZone);
        */
        
        console.log('Collision detection zone:', dropZoneBounds);
        
        // Store bounds for collision checking
        this.dropZoneBounds = dropZoneBounds;
        
        // Check collision every frame
        let frameCount = 0;
        const checkCollisions = () => {
            if (!this.physics || !this.headOpen || !this.usePhysics || !this.dropZoneBounds) return;
            
            // Create a copy of the array to avoid modification during iteration
            const booksToCheck = [...this.physicsBooks];
            
            // Log every 60 frames (roughly once per second)
            if (frameCount++ % 60 === 0 && booksToCheck.length > 0) {
                console.log('Checking collisions:', {
                    numBooks: booksToCheck.length,
                    dropZone: this.dropZoneBounds,
                    firstBookPos: booksToCheck[0]?.position
                });
            }
            
            booksToCheck.forEach(book => {
                if (!book || !book.position) return;
                
                // Skip if book was recently processed (cooldown)
                if (book.lastProcessed && Date.now() - book.lastProcessed < 1000) {
                    return;
                }
                
                const bookPos = book.position;
                const bookVel = book.velocity;
                
                // Check if book is in drop zone horizontally
                const inZoneX = Math.abs(bookPos.x - this.dropZoneBounds.x) < this.dropZoneBounds.width/2;
                
                // Check if book is entering from top (above the zone and moving down)
                const topEdge = this.dropZoneBounds.y - this.dropZoneBounds.height/2;
                const bottomEdge = this.dropZoneBounds.y + this.dropZoneBounds.height/2;
                const isEnteringFromTop = bookPos.y >= topEdge && 
                                         bookPos.y <= bottomEdge && 
                                         bookVel.y > 0; // Moving downward
                
                // Check if book is currently being dragged
                const isBeingDragged = this.physics.mouseConstraint && 
                                      this.physics.mouseConstraint.body === book;
                
                if (inZoneX && isEnteringFromTop && !isBeingDragged) {
                    console.log('Book entering from top!', bookPos, 'Velocity:', bookVel);
                    // Book entered head from top - count it and bounce it out
                    this.handleBookInHead(book);
                    book.lastProcessed = Date.now(); // Mark as processed
                }
            });
            
            if (this.usePhysics) {
                requestAnimationFrame(checkCollisions);
            }
        };
        
        requestAnimationFrame(checkCollisions);
    }
    
    handleBookInHead(book) {
        // Make book bounce out instead of removing it
        if (this.physics && book) {
            // First, reset the book's current velocity to stop its downward motion
            Matter.Body.setVelocity(book, { x: 0, y: 0 });
            
            // Set strong upward velocity with leftward horizontal component
            const velX = -12 - Math.random() * 3; // Strong leftward velocity (negative = left)
            const velY = -15 - Math.random() * 5; // Strong upward velocity (negative = up)
            Matter.Body.setVelocity(book, { x: velX, y: velY });
            
            // Add some angular velocity for spinning effect
            Matter.Body.setAngularVelocity(book, (Math.random() - 0.5) * 0.5);
            
            // Change book color to indicate it was processed
            if (book.render) {
                book.render.fillStyle = '#FF6B6B'; // Reddish color
            }
            
            // Fade out and remove book after bounce animation
            let opacity = 1.0;
            const fadeInterval = setInterval(() => {
                opacity -= 0.05; // Decrease opacity
                
                if (opacity <= 0) {
                    // Fully faded - remove the book
                    clearInterval(fadeInterval);
                    if (this.physics && this.physics.world) {
                        Matter.World.remove(this.physics.world, book);
                        const index = this.physicsBooks.indexOf(book);
                        if (index > -1) {
                            this.physicsBooks.splice(index, 1);
                        }
                    }
                } else {
                    // Update book opacity
                    if (book.render) {
                        // Convert hex color to rgba with opacity
                        book.render.fillStyle = `rgba(255, 107, 107, ${opacity})`;
                    }
                }
            }, 25); // Update every 25ms for smooth fade
        }
        
        // Increment counter
        this.attemptCount++;
        console.log('Book bounced out! Count:', this.attemptCount);
        
        // Check if reached max attempts
        if (this.attemptCount >= this.maxAttempts) {
            this.showSpeechBubble();
        }
    }
    
    createPhysicsBook(x, y) {
        if (this.usePhysics && this.physics) {
            // Create a physics book with random size and velocity
            const size = 30 + Math.random() * 20;
            const book = this.physics.createRectangle(x, y, size, size * 0.7, {
                restitution: 0.7,  // Bounciness
                friction: 0.3,
                density: 0.001,
                render: {
                    fillStyle: '#8B4513'  // Brown color for books
                }
            });
            
            // Apply upward and random horizontal force
            const forceX = (Math.random() - 0.5) * 0.01;
            const forceY = -0.015 - Math.random() * 0.01;
            Matter.Body.applyForce(book, book.position, { x: forceX, y: forceY });
            
            // Store reference
            this.physicsBooks.push(book);
            
            // Remove book after 5 seconds
            setTimeout(() => {
                if (this.physics && this.physics.world) {
                    Matter.World.remove(this.physics.world, book);
                    const index = this.physicsBooks.indexOf(book);
                    if (index > -1) {
                        this.physicsBooks.splice(index, 1);
                    }
                }
            }, 5000);
        } else {
            // Fallback to CSS animation
            this.createCSSBook(x, y);
        }
    }
    
    createCSSBook(x, y) {
        // Create animated book element for fallback
        const book = document.createElement('div');
        book.innerHTML = '📚';
        book.className = 'bouncing-book';
        book.style.position = 'absolute';
        book.style.left = x + 'px';
        book.style.top = y + 'px';
        book.style.fontSize = '40px';
        book.style.zIndex = '100';
        
        this.element.appendChild(book);
        
        // Trigger bounce animation
        setTimeout(() => {
            book.classList.add('bounce-out');
        }, 10);
        
        // Remove after animation
        setTimeout(() => {
            book.remove();
        }, 1000);
    }
    
    update() {
        // Physics engine runs automatically via Matter.Runner
        // No manual update needed for PhysicsWrapper
    }
    
    cleanup() {
        // Remove debug zone
        const debugZone = document.querySelector('.collision-debug-zone');
        if (debugZone) {
            debugZone.remove();
        }
        
        // Clean up physics
        if (this.physics) {
            this.physics.cleanup();
            this.physics = null;
        }
        this.physicsBooks = [];
        this.usePhysics = false;
        
        // Stop animation
        this.stopAnimation();
        
        super.cleanup();
    }
}