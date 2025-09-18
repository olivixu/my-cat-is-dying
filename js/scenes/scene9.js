// Scene 9: "I don't know if she thinks of me as much as I think of her while I am away"
import { Scene } from '../sceneManager.js';

export class Scene9 extends Scene {
    constructor(container) {
        super(container);
        this.textPart1 = "I don't know if she thinks of me";
        this.textPart2 = "as much as I think of her";
        
        // Drawing state
        this.isDrawing = false;
        this.hasDrawn = false;
        this.ctx = null;
        this.canvas = null;
        this.lastX = 0;
        this.lastY = 0;
        
        // Separate canvas for user drawing (without blackboard)
        this.drawingCanvas = null;
        this.drawingCtx = null;
        
        // Grading state
        this.score = 0;
        this.hasBeenGraded = false;
        this.scoreInterval = null;
        
        // Blackboard and chalk
        this.blackboardImage = null;
        this.chalkImage = null;
        this.blackboardLoaded = false;
        this.chalkLoaded = false;
        this.chalkX = 0;
        this.chalkY = 0;
        this.showChalk = false;
        
        // Store event handlers for cleanup
        this.documentMouseMoveHandler = null;
        
        // Reference canvas for SVG outline comparison
        this.referenceCanvas = null;
        this.referenceCtx = null;
        this.outlinePixels = null;
        
        // Grade display
        this.gradeImage = null;
    }
    
    async createReferenceCanvas() {
        // Create hidden canvas for SVG outline comparison
        this.referenceCanvas = document.createElement('canvas');
        this.referenceCanvas.width = 600;
        this.referenceCanvas.height = 400;
        this.referenceCtx = this.referenceCanvas.getContext('2d');
        
        // Load and draw the SVG outline
        const svgImg = new Image();
        svgImg.src = '/assets/SVG/Smokey-outline.svg';
        
        await new Promise(resolve => {
            svgImg.onload = () => {
                // Clear and draw the SVG at the same position as displayed
                this.referenceCtx.clearRect(0, 0, 600, 400);
                
                // Match the CSS positioning from .reference-overlay
                const width = 280;
                const height = 280;
                const x = (600 * 0.45) - (width / 2); // 45% from left
                const y = (400 * 0.5) - (height / 2);  // 50% from top
                
                this.referenceCtx.drawImage(svgImg, x, y, width, height);
                
                // Store the outline pixel data for comparison
                const imageData = this.referenceCtx.getImageData(0, 0, 600, 400);
                this.outlinePixels = imageData.data;
                
                resolve();
            };
        });
    }
    
    async init() {
        // Load images first
        await this.loadImages();
        
        // Create reference canvas for SVG outline
        await this.createReferenceCanvas();
        
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-9';
        
        // Set immediate visibility with black background to prevent flash from Scene 8
        this.element.style.backgroundColor = '#000000'; // Black to match Scene 8's fade to black
        this.element.style.opacity = '1'; // Override default opacity: 0 to be immediately visible
        console.log('[Scene9] Setting background to black #000000');
        
        // Create first part of text display
        const textContainer1 = document.createElement('div');
        textContainer1.className = 'story-text story-text-part1';
        textContainer1.innerHTML = `<h2>${this.textPart1}</h2>`;
        
        // Create second part of text display (will go after interactive content)
        const textContainer2 = document.createElement('div');
        textContainer2.className = 'story-text story-text-part2';
        textContainer2.innerHTML = `<h2>${this.textPart2}</h2>`;
        
        // Create interactive container
        const interactiveContainer = document.createElement('div');
        interactiveContainer.className = 'interactive-container drawing-game';
        
        // Create blackboard container
        const blackboardContainer = document.createElement('div');
        blackboardContainer.className = 'blackboard-container';
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.className = 'drawing-canvas blackboard-canvas';
        canvas.width = 600;
        canvas.height = 400;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Create separate canvas for tracking user drawing (invisible)
        this.drawingCanvas = document.createElement('canvas');
        this.drawingCanvas.width = 600;
        this.drawingCanvas.height = 400;
        this.drawingCtx = this.drawingCanvas.getContext('2d');
        
        // Draw blackboard background
        this.drawBlackboard();
        
        // Create reference image overlay (visible by default with low opacity)
        const referenceImg = document.createElement('img');
        referenceImg.className = 'reference-overlay';
        referenceImg.src = '/assets/SVG/Smokey-outline.svg';
        referenceImg.alt = 'Trace Smokey';
        
        // Create chalk cursor (hidden initially)
        const chalkCursor = document.createElement('img');
        chalkCursor.className = 'chalk-cursor';
        chalkCursor.src = 'assets/images/Chalk.png';
        chalkCursor.style.display = 'none';
        chalkCursor.style.position = 'fixed';
        chalkCursor.style.pointerEvents = 'none';
        chalkCursor.style.height = '60px'; // Only set height, let width auto-adjust
        chalkCursor.style.width = 'auto'; // Maintain aspect ratio
        chalkCursor.style.zIndex = '1000';
        this.chalkCursor = chalkCursor;
        
        // Create single submit button (invisible initially but takes up space)
        const controls = document.createElement('div');
        controls.className = 'drawing-controls';
        
        // Use SVG image as submit button
        const submitBtn = document.createElement('img');
        submitBtn.className = 'btn-submit invisible';
        submitBtn.src = '/assets/SVG/Submit-button.svg';
        submitBtn.alt = 'Submit Drawing';
        submitBtn.style.cursor = 'pointer';
        controls.appendChild(submitBtn);
        
        this.submitBtn = null;
        
        // Create grade display container (hidden initially)
        const gradeDisplay = document.createElement('div');
        gradeDisplay.className = 'grade-display hidden';
        gradeDisplay.innerHTML = `
            <img class="grade-letter" src="" alt="Grade" />
        `;
        
        // Assemble blackboard container
        blackboardContainer.appendChild(referenceImg);
        blackboardContainer.appendChild(canvas);
        
        // Assemble interactive container
        interactiveContainer.appendChild(blackboardContainer);
        interactiveContainer.appendChild(controls);
        // Add grade display to blackboard container instead to prevent layout shift
        blackboardContainer.appendChild(gradeDisplay);
        
        // Add chalk cursor to body for proper positioning
        document.body.appendChild(chalkCursor);
        
        // Assemble scene
        this.element.appendChild(textContainer1);
        this.element.appendChild(interactiveContainer);
        this.element.appendChild(textContainer2);
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Store references
        this.gradeDisplay = gradeDisplay;
        this.gradeImage = gradeDisplay.querySelector('.grade-letter');
        this.referenceImg = referenceImg;
        
        // Setup event listeners
        this.setupDrawingEvents();
        this.setupControlEvents();
        
        // Store button reference
        this.submitBtn = this.element.querySelector('.btn-submit');
    }
    
    async loadImages() {
        // Load blackboard image
        this.blackboardImage = new Image();
        this.blackboardImage.src = 'assets/images/Blackboard.png';
        
        // Load chalk image
        this.chalkImage = new Image();
        this.chalkImage.src = 'assets/images/Chalk.png';
        
        // Wait for both images to load
        await Promise.all([
            new Promise(resolve => {
                this.blackboardImage.onload = () => {
                    this.blackboardLoaded = true;
                    resolve();
                };
            }),
            new Promise(resolve => {
                this.chalkImage.onload = () => {
                    this.chalkLoaded = true;
                    resolve();
                };
            })
        ]);
    }
    
    drawBlackboard() {
        if (!this.blackboardLoaded) return;
        
        const ctx = this.ctx;
        
        // Calculate scale to fit blackboard to canvas
        const scale = Math.min(
            this.canvas.width / this.blackboardImage.width,
            this.canvas.height / this.blackboardImage.height
        );
        
        const drawWidth = this.blackboardImage.width * scale;
        const drawHeight = this.blackboardImage.height * scale;
        const offsetX = (this.canvas.width - drawWidth) / 2;
        const offsetY = (this.canvas.height - drawHeight) / 2;
        
        // Draw blackboard image
        ctx.drawImage(this.blackboardImage, offsetX, offsetY, drawWidth, drawHeight);
    }
    
    setupDrawingEvents() {
        // Show chalk cursor when mouse enters the scene
        this.element.addEventListener('mouseenter', () => {
            this.showChalk = true;
            this.canvas.style.cursor = 'none';
            if (this.chalkCursor) {
                this.chalkCursor.style.display = 'block';
            }
        });
        
        // Hide chalk cursor when mouse leaves the entire scene
        this.element.addEventListener('mouseleave', () => {
            this.showChalk = false;
            this.canvas.style.cursor = 'auto';
            if (this.chalkCursor) {
                this.chalkCursor.style.display = 'none';
            }
            this.stopDrawing();
        });
        
        // Global mouse move to update chalk position anywhere in the scene
        this.documentMouseMoveHandler = (e) => {
            if (this.showChalk) {
                this.updateChalkPosition(e);
            }
        };
        document.addEventListener('mousemove', this.documentMouseMoveHandler);
        
        // Canvas-specific drawing events
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());
        
        // Touch events
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.startDrawing(mouseEvent);
        });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const rect = this.canvas.getBoundingClientRect();
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.draw(mouseEvent);
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopDrawing();
        });
    }
    
    updateChalkPosition(e) {
        if (!this.chalkCursor || !this.showChalk) return;
        
        // Position chalk so cursor is at top-left of chalk image
        this.chalkCursor.style.left = e.clientX + 'px';
        this.chalkCursor.style.top = e.clientY + 'px';
    }
    
    setupControlEvents() {
        // Submit button
        const submitBtn = this.element.querySelector('.btn-submit');
        submitBtn?.addEventListener('click', () => {
            if (this.hasDrawn && !this.hasBeenGraded) {
                this.gradeDrawing();
            }
        });
    }
    
    startDrawing(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
    }
    
    draw(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Save current composite operation
        const prevComposite = this.ctx.globalCompositeOperation;
        
        // Use source-over to draw on top of blackboard
        this.ctx.globalCompositeOperation = 'source-over';
        
        // Draw chalk stroke with texture effect - using neon color from title screen
        for (let pass = 0; pass < 3; pass++) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.lastX, this.lastY);
            this.ctx.lineTo(x, y);
            
            if (pass === 0) {
                // Rough outer texture
                this.ctx.globalAlpha = 0.3;
                this.ctx.strokeStyle = '#DEFF96'; // Neon yellow/lime
                this.ctx.lineWidth = 6 + Math.random() * 2;
            } else if (pass === 1) {
                // Middle layer
                this.ctx.globalAlpha = 0.5;
                this.ctx.strokeStyle = '#DEFF96'; // Neon yellow/lime
                this.ctx.lineWidth = 4;
            } else {
                // Core chalk line
                this.ctx.globalAlpha = 0.8;
                this.ctx.strokeStyle = '#DEFF96'; // Neon yellow/lime
                this.ctx.lineWidth = 2;
            }
            
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.stroke();
        }
        
        // Also draw on the tracking canvas (simple white line for detection)
        this.drawingCtx.beginPath();
        this.drawingCtx.moveTo(this.lastX, this.lastY);
        this.drawingCtx.lineTo(x, y);
        this.drawingCtx.strokeStyle = '#FFFFFF';
        this.drawingCtx.lineWidth = 5;
        this.drawingCtx.lineCap = 'round';
        this.drawingCtx.lineJoin = 'round';
        this.drawingCtx.stroke();
        
        // Reset composite operation and alpha
        this.ctx.globalCompositeOperation = prevComposite;
        this.ctx.globalAlpha = 1.0;
        
        this.lastX = x;
        this.lastY = y;
        
        // Show submit button when user starts drawing
        if (!this.hasDrawn) {
            this.hasDrawn = true;
            if (this.submitBtn) {
                this.submitBtn.classList.remove('invisible');
            }
        }
    }
    
    stopDrawing() {
        this.isDrawing = false;
    }
    
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawingCtx.clearRect(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        // Redraw blackboard after clearing
        this.drawBlackboard();
        this.hasDrawn = false;
        this.hasBeenGraded = false;
        this.gradeDisplay.classList.add('hidden');
        // Remove all grade color classes
        this.gradeDisplay.classList.remove('grade-perfect', 'grade-great', 'grade-good', 'grade-try');
    }
    
    gradeDrawing() {
        if (!this.outlinePixels) {
            console.error('[Scene9] Reference outline not loaded');
            return;
        }
        
        // Get the user's drawing from the tracking canvas (without blackboard)
        const imageData = this.drawingCtx.getImageData(0, 0, this.drawingCanvas.width, this.drawingCanvas.height);
        const userPixels = imageData.data;
        
        // Calculate tracing accuracy with more lenient detection
        let tracedCorrectly = 0;
        let totalOutlinePixels = 0;
        let missedOutline = 0;
        let drawnOutsideOutline = 0;
        let totalDrawnPixels = 0;
        
        // First pass: count outline pixels and check with larger radius
        for (let i = 0; i < this.outlinePixels.length; i += 4) {
            const outlineAlpha = this.outlinePixels[i + 3];
            const userAlpha = userPixels[i + 3];
            
            if (userAlpha > 50) {
                totalDrawnPixels++;
            }
            
            // Check if this pixel is part of the outline
            if (outlineAlpha > 128) {
                totalOutlinePixels++;
                
                // Check in a small radius around this pixel for user drawing
                // This accounts for slight misalignment
                let foundNearby = false;
                const pixelIndex = i / 4;
                const x = pixelIndex % 600;
                const y = Math.floor(pixelIndex / 600);
                
                // Check 3x3 area around this pixel
                for (let dx = -3; dx <= 3; dx++) {
                    for (let dy = -3; dy <= 3; dy++) {
                        const nx = x + dx;
                        const ny = y + dy;
                        if (nx >= 0 && nx < 600 && ny >= 0 && ny < 400) {
                            const nearbyIndex = (ny * 600 + nx) * 4;
                            if (userPixels[nearbyIndex + 3] > 50) {
                                foundNearby = true;
                                break;
                            }
                        }
                    }
                    if (foundNearby) break;
                }
                
                if (foundNearby) {
                    tracedCorrectly++;
                } else {
                    missedOutline++;
                }
            } else {
                // Check if user drew outside the outline (but be more lenient)
                if (userAlpha > 50) {
                    // Check if this drawn pixel is near an outline pixel
                    let nearOutline = false;
                    const pixelIndex = i / 4;
                    const x = pixelIndex % 600;
                    const y = Math.floor(pixelIndex / 600);
                    
                    // Check 5x5 area for nearby outline
                    for (let dx = -5; dx <= 5; dx++) {
                        for (let dy = -5; dy <= 5; dy++) {
                            const nx = x + dx;
                            const ny = y + dy;
                            if (nx >= 0 && nx < 600 && ny >= 0 && ny < 400) {
                                const nearbyIndex = (ny * 600 + nx) * 4;
                                if (this.outlinePixels[nearbyIndex + 3] > 128) {
                                    nearOutline = true;
                                    break;
                                }
                            }
                        }
                        if (nearOutline) break;
                    }
                    
                    if (!nearOutline) {
                        drawnOutsideOutline++;
                    }
                }
            }
        }
        
        // Calculate accuracy percentage
        let accuracy = 0;
        if (totalOutlinePixels > 0) {
            // Base accuracy from how much of the outline was traced
            accuracy = (tracedCorrectly / totalOutlinePixels) * 100;
            
            // Much smaller penalty for drawing outside (people aren't perfect!)
            const outsidePenalty = Math.min((drawnOutsideOutline / totalOutlinePixels) * 5, 10);
            accuracy = Math.max(accuracy - outsidePenalty, 0);
            
            // Bonus for drawing a reasonable amount (shows effort)
            if (totalDrawnPixels > totalOutlinePixels * 0.5) {
                accuracy += 10;
            }
        }
        
        // Add some bonus for effort if they drew something
        const hasDrawn = tracedCorrectly > totalOutlinePixels * 0.1;
        if (hasDrawn && accuracy < 30) {
            accuracy = 30; // Minimum score for trying
        }
        
        // Round to nearest integer
        accuracy = Math.round(accuracy);
        
        // Debug logging
        console.log('[Scene9] Grading debug:', {
            totalOutlinePixels,
            tracedCorrectly,
            missedOutline,
            drawnOutsideOutline,
            totalDrawnPixels,
            accuracy,
            percentTraced: ((tracedCorrectly / totalOutlinePixels) * 100).toFixed(1) + '%'
        });
        
        // Determine letter grade (minimum is C- since there's no F SVG)
        let gradeLetter;
        if (accuracy >= 90) {
            gradeLetter = 'A+';
        } else if (accuracy >= 85) {
            gradeLetter = 'A';
        } else if (accuracy >= 80) {
            gradeLetter = 'A-';
        } else if (accuracy >= 75) {
            gradeLetter = 'B+';
        } else if (accuracy >= 70) {
            gradeLetter = 'B';
        } else if (accuracy >= 65) {
            gradeLetter = 'B-';
        } else if (accuracy >= 60) {
            gradeLetter = 'C+';
        } else if (accuracy >= 55) {
            gradeLetter = 'C';
        } else {
            // Minimum grade is C-
            gradeLetter = 'C-';
        }
        
        this.score = accuracy;
        this.displayGrade(gradeLetter);
    }
    
    calculateCoverage(pixels) {
        // Calculate how much of the canvas has been drawn on
        let drawnPixels = 0;
        const totalPixels = pixels.length / 4;
        
        for (let i = 3; i < pixels.length; i += 4) {
            if (pixels[i] > 0) drawnPixels++;
        }
        
        return drawnPixels / totalPixels;
    }
    
    detectEars(pixels, width, height) {
        // Check for peaked shapes in the top portion of the canvas
        const topRegion = height * 0.3;
        let hasTopContent = false;
        
        for (let y = 0; y < topRegion; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4 + 3;
                if (pixels[idx] > 0) {
                    hasTopContent = true;
                    break;
                }
            }
            if (hasTopContent) break;
        }
        
        return hasTopContent;
    }
    
    detectBody(pixels, width, height) {
        // Check for substantial content in the middle region
        const midStart = height * 0.3;
        const midEnd = height * 0.7;
        let bodyPixels = 0;
        
        for (let y = midStart; y < midEnd; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4 + 3;
                if (pixels[idx] > 0) bodyPixels++;
            }
        }
        
        // Body should have substantial coverage
        return bodyPixels > (width * (midEnd - midStart) * 0.05);
    }
    
    detectTail(pixels, width, height) {
        // Check for content extending to the sides or bottom
        const bottomRegion = height * 0.7;
        let hasTailContent = false;
        
        // Check bottom region
        for (let y = bottomRegion; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4 + 3;
                if (pixels[idx] > 0) {
                    hasTailContent = true;
                    break;
                }
            }
            if (hasTailContent) break;
        }
        
        return hasTailContent;
    }
    
    checkProportions(pixels, width, height) {
        // Check if the drawing has reasonable cat-like proportions
        let minX = width, maxX = 0, minY = height, maxY = 0;
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4 + 3;
                if (pixels[idx] > 0) {
                    minX = Math.min(minX, x);
                    maxX = Math.max(maxX, x);
                    minY = Math.min(minY, y);
                    maxY = Math.max(maxY, y);
                }
            }
        }
        
        const drawingWidth = maxX - minX;
        const drawingHeight = maxY - minY;
        
        if (drawingWidth === 0 || drawingHeight === 0) return 0;
        
        const aspectRatio = drawingWidth / drawingHeight;
        
        // Cat should be wider than tall (aspect ratio between 0.8 and 2.0)
        if (aspectRatio >= 0.8 && aspectRatio <= 2.0) {
            return 1;
        } else if (aspectRatio >= 0.6 && aspectRatio <= 2.5) {
            return 0.5;
        }
        
        return 0;
    }
    
    checkContinuity(pixels, width, height) {
        // Check if the drawing has continuous lines (not too scattered)
        let groups = 0;
        const visited = new Array(width * height).fill(false);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4 + 3;
                const visitIdx = y * width + x;
                
                if (pixels[idx] > 0 && !visited[visitIdx]) {
                    groups++;
                    // Flood fill to mark connected components
                    this.floodFill(pixels, visited, x, y, width, height);
                }
            }
        }
        
        // Fewer groups = more continuous
        if (groups <= 3) return 1;
        if (groups <= 6) return 0.7;
        if (groups <= 10) return 0.4;
        return 0.2;
    }
    
    floodFill(pixels, visited, startX, startY, width, height) {
        const stack = [[startX, startY]];
        
        while (stack.length > 0) {
            const [x, y] = stack.pop();
            
            if (x < 0 || x >= width || y < 0 || y >= height) continue;
            
            const idx = (y * width + x) * 4 + 3;
            const visitIdx = y * width + x;
            
            if (visited[visitIdx] || pixels[idx] === 0) continue;
            
            visited[visitIdx] = true;
            
            // Check 8 neighbors
            for (let dx = -1; dx <= 1; dx++) {
                for (let dy = -1; dy <= 1; dy++) {
                    if (dx === 0 && dy === 0) continue;
                    stack.push([x + dx, y + dy]);
                }
            }
        }
    }
    
    checkComplexity(pixels, width, height) {
        // Check if the drawing has sufficient detail
        let strokes = 0;
        let lastDrawn = false;
        
        // Count horizontal strokes
        for (let y = 0; y < height; y++) {
            let currentlyDrawing = false;
            for (let x = 0; x < width; x++) {
                const idx = (y * width + x) * 4 + 3;
                if (pixels[idx] > 0) {
                    if (!currentlyDrawing) {
                        strokes++;
                        currentlyDrawing = true;
                    }
                } else {
                    currentlyDrawing = false;
                }
            }
        }
        
        // Good complexity has multiple strokes
        if (strokes >= 15) return 1;
        if (strokes >= 10) return 0.7;
        if (strokes >= 5) return 0.4;
        return 0.2;
    }
    
    displayGrade(gradeLetter) {
        this.hasBeenGraded = true;
        
        // Map grade letter to SVG file - match actual filenames
        const gradeFile = `/assets/SVG/Grades/${gradeLetter.replace('+', 'plus').replace('-', 'minus')}.svg`;
        
        // Display the grade
        this.gradeDisplay.classList.remove('hidden');
        this.gradeImage.src = gradeFile;
        this.gradeImage.alt = `Grade: ${gradeLetter}`;
        
        // Add grade color class based on letter
        this.gradeDisplay.classList.remove('grade-perfect', 'grade-great', 'grade-good', 'grade-try');
        if (gradeLetter.startsWith('A')) {
            this.gradeDisplay.classList.add('grade-perfect');
            // Celebrate for A grades
            setTimeout(() => this.celebrate(), 500);
        } else if (gradeLetter.startsWith('B')) {
            this.gradeDisplay.classList.add('grade-great');
        } else if (gradeLetter.startsWith('C')) {
            this.gradeDisplay.classList.add('grade-good');
        } else {
            this.gradeDisplay.classList.add('grade-try');
        }
        
        // Hide the submit button after grading (use visibility to maintain layout)
        if (this.submitBtn) {
            this.submitBtn.style.visibility = 'hidden';
        }
        
        // Hide the reference overlay after grading
        if (this.referenceImg) {
            this.referenceImg.style.display = 'none';
        }
        
        // Auto-advance to next scene after showing grade
        setTimeout(() => {
            this.startExitTransition();
        }, 3000); // Show grade for 3 seconds before starting exit
    }
    
    startExitTransition() {
        console.log('[Scene9] Starting exit transition');
        
        // Create black overlay for smooth fade
        const blackOverlay = document.createElement('div');
        blackOverlay.className = 'scene9-black-overlay';
        blackOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #000000;
            opacity: 0;
            z-index: 100;
            pointer-events: none;
        `;
        this.element.appendChild(blackOverlay);
        
        // Add exit class to all scene elements for slide-down animation
        const textElements = this.element.querySelectorAll('.story-text');
        const interactiveElements = this.element.querySelectorAll('.interactive-container');
        
        textElements.forEach(el => el.classList.add('scene-9-exit'));
        interactiveElements.forEach(el => el.classList.add('scene-9-exit'));
        
        // Fade in the black overlay (start slightly before elements finish)
        setTimeout(() => {
            blackOverlay.style.transition = 'opacity 1s cubic-bezier(0.4, 0, 0.2, 1)';
            blackOverlay.style.opacity = '1';
        }, 400);
        
        // Complete transition and advance to next scene
        setTimeout(() => {
            this.onComplete();
            if (window.sceneManager) {
                window.sceneManager.nextScene();
            }
        }, 1500); // Wait for animations to complete
    }
    
    celebrate() {
        // Add celebration animation for high scores
        const celebration = document.createElement('div');
        celebration.className = 'celebration';
        celebration.innerHTML = '✨';
        this.gradeDisplay.appendChild(celebration);
        
        setTimeout(() => {
            celebration.remove();
        }, 2000);
    }
    
    cleanup() {
        // Clear any running intervals
        if (this.scoreInterval) {
            clearInterval(this.scoreInterval);
            this.scoreInterval = null;
        }
        
        // Remove document-level event listener
        if (this.documentMouseMoveHandler) {
            document.removeEventListener('mousemove', this.documentMouseMoveHandler);
            this.documentMouseMoveHandler = null;
        }
        
        // Remove chalk cursor from DOM
        if (this.chalkCursor && this.chalkCursor.parentNode) {
            this.chalkCursor.parentNode.removeChild(this.chalkCursor);
            this.chalkCursor = null;
        }
        
        // Clean up canvas and context
        if (this.ctx) {
            this.ctx = null;
        }
        if (this.canvas) {
            this.canvas = null;
        }
        if (this.drawingCtx) {
            this.drawingCtx = null;
        }
        if (this.drawingCanvas) {
            this.drawingCanvas = null;
        }
        
        // Clean up references
        this.submitBtn = null;
        this.gradeDisplay = null;
        this.gradeImage = null;
        this.referenceImg = null;
        this.referenceCanvas = null;
        this.referenceCtx = null;
        this.outlinePixels = null;
        this.blackboardImage = null;
        this.chalkImage = null;
        
        super.cleanup();
    }
}