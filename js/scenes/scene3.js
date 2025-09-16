// Scene 3: "There is a lot she doesn't know because she is a cat."
import { Scene } from '../sceneManager.js';
import { PhysicsWrapper } from '../physics.js';
import * as Matter from 'matter-js';

export class Scene3 extends Scene {
    constructor(container) {
        super(container);
        this.text = "There is a lot she doesn't know because she is a cat.";
        this.headOpen = false;
        this.headOpenedOnce = false; // Track if head has been opened
        this.attemptCount = 0;
        this.maxAttempts = 3;
        this.physicsBooks = [];
        this.bookImagePairs = []; // Track physics body + DOM image pairs
        this.usePhysics = false;
        this.hasCompleted = false; // Prevent multiple completions
        
        // Book cover images
        this.bookCovers = [
            'assets/images/Book%20cover/Untitled_Artwork-1.png',
            'assets/images/Book%20cover/Untitled_Artwork-2.png',
            'assets/images/Book%20cover/Untitled_Artwork-2-1.png',
            'assets/images/Book%20cover/Untitled_Artwork-3.png',
            'assets/images/Book%20cover/Untitled_Artwork-4.png'
        ];
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-3';
        
        // Create stars container
        const starsContainer = document.createElement('div');
        starsContainer.className = 'stars-container';
        
        // Create multiple stars with random positions
        for (let i = 0; i < 40; i++) {
            const star = document.createElement('div');
            star.className = 'star';
            star.style.left = `${Math.random() * 100}%`;
            star.style.top = `${Math.random() * 100}%`;
            star.style.animationDelay = `${Math.random() * 3}s`;
            
            // Vary star sizes slightly
            const size = Math.random() * 2 + 1; // 1-3px
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;
            
            starsContainer.appendChild(star);
        }
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text scene3-text';
        textContainer.innerHTML = `
            <h2>
                <span class="text-part-1">There is a lot she doesn't know</span>
                <span class="text-part-2">because she is a cat.</span>
            </h2>
        `;
        
        // Create game container
        const gameContainer = document.createElement('div');
        gameContainer.className = 'smokey-game-container';
        
        // Create books container with proper z-index layering
        this.booksContainer = document.createElement('div');
        this.booksContainer.style.position = 'absolute';
        this.booksContainer.style.top = '0';
        this.booksContainer.style.left = '0';
        this.booksContainer.style.width = '100%';
        this.booksContainer.style.height = '100%';
        this.booksContainer.style.zIndex = '2';  // Between head-back (1) and smokey-overlay (3)
        this.booksContainer.style.pointerEvents = 'none';
        
        // Create physics canvas
        const physicsCanvas = document.createElement('canvas');
        physicsCanvas.className = 'physics-canvas';
        physicsCanvas.width = window.innerWidth;
        physicsCanvas.height = window.innerHeight;
        physicsCanvas.style.background = 'transparent';
        
        // Initialize physics
        this.initPhysics(physicsCanvas);
        
        // Start update loop for book images
        this.startUpdateLoop();
        
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
        // Initially disable clicking during animation
        headLid.style.pointerEvents = 'none';
        headLid.style.cursor = 'default';
        
        // Enable clicking after animations complete (4s delay)
        setTimeout(() => {
            headLid.style.pointerEvents = 'auto';
            headLid.style.cursor = 'pointer';
        }, 4000);
        
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
        
        // Create instruction overlays
        const instructionStep1 = document.createElement('img');
        instructionStep1.src = 'assets/images/Scene-3-instructions/headArrowstep1.png';
        instructionStep1.className = 'instruction-overlay step1';
        instructionStep1.style.opacity = '0'; // Start invisible for fade-in
        
        const instructionStep2 = document.createElement('img');
        instructionStep2.src = 'assets/images/Scene-3-instructions/headArrowstep2.png';
        instructionStep2.className = 'instruction-overlay step2';
        instructionStep2.style.display = 'none'; // Hidden initially
        instructionStep2.style.opacity = '0';
        
        // Store references for later use
        this.instructionStep1 = instructionStep1;
        this.instructionStep2 = instructionStep2;
        
        // Create speech bubble (hidden initially)
        const speechBubble = document.createElement('div');
        speechBubble.className = 'speech-bubble hidden';
        speechBubble.innerHTML = 'Meow!';
        
        // Assemble game
        gameContainer.appendChild(smokeyHead);
        gameContainer.appendChild(speechBubble);
        
        // Assemble scene with proper layering
        this.element.appendChild(starsContainer);  // Stars in background
        this.element.appendChild(textContainer);
        this.element.appendChild(gameContainer);  // Contains head-back
        this.element.appendChild(physicsCanvas);  // Physics canvas
        this.element.appendChild(this.booksContainer);  // Books container with z-index 2
        this.element.appendChild(smokeyOverlay);  // Body and head-lid on top
        this.element.appendChild(instructionStep1);  // Instruction overlay on top
        this.element.appendChild(instructionStep2);  // Step 2 overlay (hidden)
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Store references
        this.speechBubble = speechBubble;
        this.physicsCanvas = physicsCanvas;
        
        // Immediately create the split pages that cover the scene
        // These pages have the purple paper texture and will open to reveal Scene 3
        const topPage = document.createElement('div');
        topPage.className = 'paper-page-top';
        
        const bottomPage = document.createElement('div');
        bottomPage.className = 'paper-page-bottom';
        
        this.container.appendChild(topPage);
        this.container.appendChild(bottomPage);
        
        // After a brief pause, trigger the page opening animation
        setTimeout(() => {
            topPage.classList.add('turning');
            bottomPage.classList.add('turning');
            
            // Remove pages after animation completes
            setTimeout(() => {
                topPage.remove();
                bottomPage.remove();
            }, 2000); // After page turn completes
        }, 600); // Brief pause before pages start turning
        
        // Physics animation is handled by PhysicsWrapper automatically
    }
    
    toggleHead(headElement) {
        // Only allow opening once
        if (this.headOpenedOnce) return;
        
        // Transition instruction overlays
        if (this.instructionStep1 && this.instructionStep2) {
            this.instructionStep1.style.opacity = '0';
            setTimeout(() => {
                this.instructionStep1.style.display = 'none';
                this.instructionStep2.style.display = 'block';
                setTimeout(() => {
                    this.instructionStep2.style.opacity = '1';
                }, 50); // Small delay to ensure display change takes effect
            }, 500);
        }
        
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
                this.completeScene();
            }
        }
        
        return false;
    }
    
    completeScene() {
        // Prevent multiple completions
        if (this.hasCompleted) return;
        this.hasCompleted = true;
        
        // Auto advance after delay
        setTimeout(() => {
            this.onComplete();
            if (window.sceneManager) {
                window.sceneManager.nextScene();
            }
        }, 1000);
    }
    
    initPhysics(canvas) {
        console.log('Initializing physics for Scene 3');
        
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
            
            // Hide the physics canvas since we're using DOM images for visuals
            this.physics.render.canvas.style.opacity = '0';
            
            // Don't create books initially - wait for head to be opened
            
        } catch (error) {
            console.error('Physics initialization failed:', error);
            this.usePhysics = false;
            this.physics = null;
        }
    }
    
    createInitialBooks(canvas) {
        if (!this.physics) return;
        
        // Create 5 books falling from above the screen
        const bookWidth = 160;
        const bookHeight = 240;
        const spacing = 180;
        const startX = canvas.width / 2 - (4 * spacing) / 2 - 300; // Shift left by 300px to avoid Smokey
        const y = -200; // Start above the screen
        
        for (let i = 0; i < 5; i++) {
            // Stagger book creation for a cascade effect
            setTimeout(() => {
                const x = startX + (i * spacing) + (Math.random() * 40 - 20); // Add slight X randomness
                const bookY = y + (Math.random() * 100); // Vary starting height slightly
                const book = this.physics.createRectangle(x, bookY, bookWidth, bookHeight, {
                restitution: 0.9,  // Higher bounce
                friction: 0.1,     // Lower friction
                density: 0.001,
                render: {
                    visible: false  // Hide physics body since we're using DOM images
                },
                label: 'book'  // Add label for identification
            });
            
            // Create DOM image for this book - use index to ensure unique covers
            const bookCover = this.bookCovers[i % this.bookCovers.length];  // Use index for unique covers
            const bookImage = document.createElement('img');
            bookImage.src = bookCover;
            bookImage.className = 'physics-book-image';
            bookImage.style.position = 'absolute';
            bookImage.style.width = bookWidth + 'px';
            bookImage.style.height = bookHeight + 'px';
            bookImage.style.objectFit = 'cover';
            bookImage.style.pointerEvents = 'none';
            
                // Add to books container
                this.booksContainer.appendChild(bookImage);
                
                // No upward force - let books fall naturally from above
                
                // Store references
                this.physicsBooks.push(book);
                this.bookImagePairs.push({ body: book, image: bookImage });
            }, i * 200); // Stagger each book by 200ms
        }
    }
    
    respawnBook(canvas) {
        if (!this.physics || !canvas) return;
        
        const bookWidth = 160;
        const bookHeight = 240;
        const spacing = 180;
        const startX = canvas.width / 2 - (4 * spacing) / 2 - 300; // Same left shift as original
        const y = -200; // Start above screen
        
        // Random position within the book range
        const i = Math.floor(Math.random() * 5);
        const x = startX + (i * spacing) + (Math.random() * 40 - 20);
        const bookY = y + (Math.random() * 100);
        
        // Create new physics book
        const book = this.physics.createRectangle(x, bookY, bookWidth, bookHeight, {
            restitution: 0.9,
            friction: 0.1,
            density: 0.001,
            render: {
                visible: false
            },
            label: 'book'
        });
        
        // Create DOM image with random cover
        const bookCover = this.bookCovers[Math.floor(Math.random() * this.bookCovers.length)];
        const bookImage = document.createElement('img');
        bookImage.src = bookCover;
        bookImage.className = 'physics-book-image';
        bookImage.style.position = 'absolute';
        bookImage.style.width = bookWidth + 'px';
        bookImage.style.height = bookHeight + 'px';
        bookImage.style.objectFit = 'cover';
        bookImage.style.pointerEvents = 'none';
        
        // Add to containers
        this.booksContainer.appendChild(bookImage);
        this.physicsBooks.push(book);
        this.bookImagePairs.push({ body: book, image: bookImage });
        
        console.log('Book respawned at position:', x, bookY);
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
        
        // ADD INVISIBLE BOUNCE PLATFORM INSIDE HEAD
        const platformX = headRect.left + headRect.width/2 - canvasRect.left;
        const platformY = headRect.top + headRect.height/2 - canvasRect.top + 100; // Inside head
        
        // Create bouncy platform that books will bounce off
        if (this.physics) {
            const bouncePlatform = this.physics.createRectangle(
                platformX,
                platformY,
                headRect.width * 0.5,  // Platform width (smaller than head)
                20,                     // Thicker platform for better collision
                {
                    isStatic: true,
                    restitution: 2.5,   // SUPER bouncy! (>1 adds energy)
                    friction: 0.01,     // Almost no friction
                    render: { 
                        visible: false,   // Invisible
                        fillStyle: 'transparent'
                    },
                    label: 'bouncePlatform'
                }
            );
            console.log('Created bounce platform at:', platformX, platformY);
        }
        
        // Calculate position relative to physics canvas (150px lower) for detection zone
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
        
        // Listen for collision events on the bounce platform
        if (this.physics && this.physics.engine) {
            Matter.Events.on(this.physics.engine, 'collisionStart', (event) => {
                const pairs = event.pairs;
                
                pairs.forEach(pair => {
                    // Check if one body is the bounce platform and the other is a book
                    const isPlatformA = pair.bodyA.label === 'bouncePlatform';
                    const isPlatformB = pair.bodyB.label === 'bouncePlatform';
                    
                    if (isPlatformA || isPlatformB) {
                        const book = isPlatformA ? pair.bodyB : pair.bodyA;
                        
                        // Check if this is one of our books
                        if (this.physicsBooks.includes(book)) {
                            console.log('Book hit bounce platform!');
                            
                            // Apply strong bounce velocity - left and up
                            Matter.Body.setVelocity(book, { 
                                x: -15 - Math.random() * 5,  // Strong leftward velocity
                                y: -20 - Math.random() * 5   // Strong upward velocity
                            });
                            
                            // Add spin for visual effect
                            Matter.Body.setAngularVelocity(book, (Math.random() - 0.5) * 0.5);
                            
                            // Count the attempt
                            this.attemptCount++;
                            console.log('Book bounced! Count:', this.attemptCount);
                            
                            // Change book color to indicate it bounced
                            if (book.render) {
                                book.render.fillStyle = '#FF6B6B'; // Reddish color
                            }
                            
                            // Find corresponding image
                            const pairIndex = this.bookImagePairs.findIndex(pair => pair.body === book);
                            const bookImage = pairIndex > -1 ? this.bookImagePairs[pairIndex].image : null;
                            
                            // Start fade out after a short delay
                            setTimeout(() => {
                                let opacity = 1.0;
                                const fadeInterval = setInterval(() => {
                                    opacity -= 0.15; // Decrease opacity faster
                                    
                                    if (opacity <= 0) {
                                        // Fully faded - remove the book
                                        clearInterval(fadeInterval);
                                        
                                        const index = this.physicsBooks.indexOf(book);
                                        if (index > -1) {
                                            this.physicsBooks.splice(index, 1);
                                        }
                                        // Remove from world after fully faded
                                        if (this.physics && this.physics.world) {
                                            Matter.World.remove(this.physics.world, book);
                                        }
                                        // Remove DOM image
                                        if (bookImage && bookImage.parentNode) {
                                            bookImage.remove();
                                        }
                                        // Remove from pairs
                                        if (pairIndex > -1) {
                                            this.bookImagePairs.splice(pairIndex, 1);
                                        }
                                        
                                        // Respawn a new book after a delay
                                        setTimeout(() => {
                                            this.respawnBook(this.physicsCanvas);
                                        }, 1000); // Respawn 1 second after removal
                                    } else {
                                        // Update book and image opacity
                                        if (book.render) {
                                            // Convert to rgba with current opacity
                                            book.render.fillStyle = `rgba(255, 107, 107, ${opacity})`;
                                        }
                                        // Update image opacity
                                        if (bookImage) {
                                            bookImage.style.opacity = opacity;
                                        }
                                    }
                                }, 30); // Update every 30ms for smooth fade (about 0.2 seconds total)
                            }, 500); // Start fade after 0.5 seconds of bouncing
                            
                            // Check if we've hit max attempts
                            if (this.attemptCount >= this.maxAttempts && !this.hasCompleted) {
                                this.completeScene();
                            }
                        }
                    }
                });
            });
        }
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
            
            // Find corresponding image
            const pairIndex = this.bookImagePairs.findIndex(pair => pair.body === book);
            const bookImage = pairIndex > -1 ? this.bookImagePairs[pairIndex].image : null;
            
            // Fade out and remove book after bounce animation
            let opacity = 1.0;
            const fadeInterval = setInterval(() => {
                opacity -= 0.05; // Decrease opacity
                
                if (opacity <= 0) {
                    // Fully faded - remove the book and image
                    clearInterval(fadeInterval);
                    if (this.physics && this.physics.world) {
                        Matter.World.remove(this.physics.world, book);
                        const index = this.physicsBooks.indexOf(book);
                        if (index > -1) {
                            this.physicsBooks.splice(index, 1);
                        }
                    }
                    // Remove image
                    if (bookImage && bookImage.parentNode) {
                        bookImage.remove();
                    }
                    // Remove from pairs
                    if (pairIndex > -1) {
                        this.bookImagePairs.splice(pairIndex, 1);
                    }
                } else {
                    // Update image opacity
                    if (bookImage) {
                        bookImage.style.opacity = opacity;
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
            // Create a physics book with random size and velocity - doubled size again
            const size = 160 + Math.random() * 40;  // Doubled size again
            const book = this.physics.createRectangle(x, y, size, size * 0.7, {
                restitution: 0.7,  // Bounciness
                friction: 0.3,
                density: 0.001,
                render: {
                    visible: false  // Hide physics body as we'll use DOM image
                }
            });
            
            // Create DOM image that follows the physics body
            const bookImage = document.createElement('img');
            const randomCover = this.bookCovers[Math.floor(Math.random() * this.bookCovers.length)];
            
            console.log('Creating book image:', randomCover, 'at position:', x, y);
            
            // Add error and load handlers
            bookImage.onerror = () => {
                console.error('Failed to load book image:', randomCover);
                // Fallback to emoji
                bookImage.style.display = 'none';
            };
            
            bookImage.onload = () => {
                console.log('Book image loaded successfully:', randomCover);
            };
            
            bookImage.src = randomCover;
            bookImage.className = 'physics-book-image';
            bookImage.style.position = 'absolute';
            bookImage.style.width = size + 'px';
            bookImage.style.height = 'auto';
            bookImage.style.pointerEvents = 'none';
            
            // Add to books container
            this.booksContainer.appendChild(bookImage);
            console.log('Book image added to books container');
            
            // Apply upward and random horizontal force
            const forceX = (Math.random() - 0.5) * 0.01;
            const forceY = -0.015 - Math.random() * 0.01;
            Matter.Body.applyForce(book, book.position, { x: forceX, y: forceY });
            
            // Store reference
            this.physicsBooks.push(book);
            this.bookImagePairs.push({ body: book, image: bookImage });
        } else {
            // Fallback to CSS animation
            this.createCSSBook(x, y);
        }
    }
    
    createCSSBook(x, y) {
        // Create animated book element for fallback
        const book = document.createElement('img');
        // Select random book cover
        const randomCover = this.bookCovers[Math.floor(Math.random() * this.bookCovers.length)];
        book.src = randomCover;
        book.className = 'bouncing-book';
        book.style.position = 'absolute';
        book.style.left = x + 'px';
        book.style.top = y + 'px';
        book.style.width = '50px';
        book.style.height = 'auto';
        book.style.zIndex = '100';
        
        // Add random initial rotation
        const initialRotation = Math.random() * 30 - 15; // -15 to +15 degrees
        book.style.transform = `rotate(${initialRotation}deg)`;
        
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
    
    startUpdateLoop() {
        const updateImages = () => {
            this.update();
            if (!this.isCleanedUp) {
                requestAnimationFrame(updateImages);
            }
        };
        updateImages();
    }
    
    update() {
        // Update book image positions to match physics bodies
        if (this.bookImagePairs.length > 0) {
            console.log('Updating', this.bookImagePairs.length, 'book images');
        }
        
        this.bookImagePairs.forEach((pair, index) => {
            if (pair.body && pair.image && pair.image.parentNode) {
                const canvasRect = this.element.querySelector('.physics-canvas').getBoundingClientRect();
                const elRect = this.element.getBoundingClientRect();
                
                // Position image at physics body location
                const x = pair.body.position.x + canvasRect.left - elRect.left;
                const y = pair.body.position.y + canvasRect.top - elRect.top;
                
                // Log first book position occasionally
                if (index === 0 && Math.random() < 0.02) {
                    console.log('Book 0 position:', x, y, 'body pos:', pair.body.position);
                }
                
                // Center the image on the body position
                const width = parseFloat(pair.image.style.width);
                const height = pair.image.offsetHeight;
                
                pair.image.style.left = (x - width/2) + 'px';
                pair.image.style.top = (y - height/2) + 'px';
                
                // Match rotation
                pair.image.style.transform = `rotate(${pair.body.angle}rad)`;
            }
        });
        
        // Physics engine runs automatically via Matter.Runner
        // No manual update needed for PhysicsWrapper
    }
    
    cleanup() {
        // Mark as cleaned up to stop update loop
        this.isCleanedUp = true;
        
        // Remove all book images
        this.bookImagePairs.forEach(pair => {
            if (pair.image && pair.image.parentNode) {
                pair.image.remove();
            }
        });
        this.bookImagePairs = [];
        
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