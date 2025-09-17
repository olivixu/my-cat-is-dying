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
        
        // Grading state
        this.score = 0;
        this.hasBeenGraded = false;
        this.scoreInterval = null;
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-9';
        
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
        
        // Create Post-it container (no instructions text)
        const postItContainer = document.createElement('div');
        postItContainer.className = 'postit-container';
        
        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.className = 'drawing-canvas';
        canvas.width = 400;
        canvas.height = 400;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Setup canvas style - dark stroke for Post-it background
        this.ctx.strokeStyle = '#333333';
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        // Create reference image overlay (visible by default with low opacity)
        const referenceImg = document.createElement('img');
        referenceImg.className = 'reference-overlay';
        referenceImg.src = '/assets/images/happy smokey.png';
        referenceImg.alt = 'Trace Smokey';
        
        // Create single submit button (invisible initially but takes up space)
        const controls = document.createElement('div');
        controls.className = 'drawing-controls';
        controls.innerHTML = `
            <button class="btn-submit invisible">Submit Drawing</button>
        `;
        this.submitBtn = null;
        
        // Create grade display (hidden initially)
        const gradeDisplay = document.createElement('div');
        gradeDisplay.className = 'grade-display hidden';
        gradeDisplay.innerHTML = `
            <div class="grade-score">
                <span class="score-number">0</span>%
            </div>
            <p class="grade-message"></p>
            <button class="continue-btn">Continue</button>
        `;
        
        // Assemble Post-it container
        postItContainer.appendChild(referenceImg);
        postItContainer.appendChild(canvas);
        
        // Assemble interactive container
        interactiveContainer.appendChild(postItContainer);
        interactiveContainer.appendChild(controls);
        interactiveContainer.appendChild(gradeDisplay);
        
        // Assemble scene
        this.element.appendChild(textContainer1);
        this.element.appendChild(interactiveContainer);
        this.element.appendChild(textContainer2);
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Store references
        this.gradeDisplay = gradeDisplay;
        this.scoreElement = gradeDisplay.querySelector('.score-number');
        this.messageElement = gradeDisplay.querySelector('.grade-message');
        this.referenceImg = referenceImg;
        
        // Setup event listeners
        this.setupDrawingEvents();
        this.setupControlEvents();
        
        // Store button reference
        this.submitBtn = this.element.querySelector('.btn-submit');
        
        // Add continue button handler
        const continueBtn = gradeDisplay.querySelector('.continue-btn');
        continueBtn?.addEventListener('click', () => {
            this.onComplete();
            if (window.sceneManager) {
                window.sceneManager.nextScene();
            }
        });
    }
    
    setupDrawingEvents() {
        // Mouse events
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
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.lastX, this.lastY);
        this.ctx.lineTo(x, y);
        this.ctx.stroke();
        
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
        this.hasDrawn = false;
        this.hasBeenGraded = false;
        this.gradeDisplay.classList.add('hidden');
        // Remove all grade color classes
        this.gradeDisplay.classList.remove('grade-perfect', 'grade-great', 'grade-good', 'grade-try');
    }
    
    gradeDrawing() {
        // Analyze the drawing for cat-like features
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
        const pixels = imageData.data;
        
        // Calculate various metrics
        const coverage = this.calculateCoverage(pixels);
        const hasEars = this.detectEars(pixels, imageData.width, imageData.height);
        const hasBody = this.detectBody(pixels, imageData.width, imageData.height);
        const hasTail = this.detectTail(pixels, imageData.width, imageData.height);
        const proportions = this.checkProportions(pixels, imageData.width, imageData.height);
        const continuity = this.checkContinuity(pixels, imageData.width, imageData.height);
        const complexity = this.checkComplexity(pixels, imageData.width, imageData.height);
        
        // Calculate score (0-100)
        let score = 0;
        
        // Base score from coverage (max 15 points)
        score += Math.min(coverage * 200, 15);
        
        // Feature detection (15 points each)
        if (hasEars) score += 15;
        if (hasBody) score += 15;
        if (hasTail) score += 15;
        
        // Proportions (max 15 points)
        score += proportions * 15;
        
        // Line continuity (max 10 points)
        score += continuity * 10;
        
        // Drawing complexity (max 15 points)
        score += complexity * 15;
        
        // Ensure score is between 0 and 100
        score = Math.min(Math.max(Math.round(score), 0), 100);
        
        // Add some randomness for fun (±5 points)
        score = Math.min(Math.max(score + Math.floor(Math.random() * 11) - 5, 0), 100);
        
        this.score = score;
        this.displayGrade(score);
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
    
    displayGrade(score) {
        this.hasBeenGraded = true;
        
        // Determine message based on score
        let message = '';
        if (score >= 95) {
            message = "PERFECT! That's unmistakably Smokey! She's purring with pride! 😻";
        } else if (score >= 85) {
            message = "Amazing! That's definitely Smokey! She would be so proud.";
        } else if (score >= 75) {
            message = "Wonderful! I can clearly see Smokey in your drawing!";
        } else if (score >= 65) {
            message = "Great job! That's a lovely cat drawing!";
        } else if (score >= 50) {
            message = "Good attempt! It has definite cat-like qualities.";
        } else if (score >= 35) {
            message = "Nice try! Keep practicing, Smokey believes in you!";
        } else if (score >= 20) {
            message = "Creative interpretation! Smokey appreciates the effort.";
        } else {
            message = "Abstract art! Smokey appreciates all artistic expressions.";
        }
        
        // Display grade with animation
        this.gradeDisplay.classList.remove('hidden');
        this.scoreElement.textContent = '0';
        this.messageElement.textContent = message;
        
        // Add grade color based on score
        if (score >= 85) {
            this.gradeDisplay.classList.add('grade-perfect');
        } else if (score >= 70) {
            this.gradeDisplay.classList.add('grade-great');
        } else if (score >= 50) {
            this.gradeDisplay.classList.add('grade-good');
        } else {
            this.gradeDisplay.classList.add('grade-try');
        }
        
        // Animate score counting up
        // Clear any existing interval
        if (this.scoreInterval) {
            clearInterval(this.scoreInterval);
            this.scoreInterval = null;
        }
        
        let currentScore = 0;
        const increment = Math.ceil(score / 30);
        this.scoreInterval = setInterval(() => {
            // Check if element still exists
            if (!this.scoreElement) {
                clearInterval(this.scoreInterval);
                this.scoreInterval = null;
                return;
            }
            
            currentScore = Math.min(currentScore + increment, score);
            this.scoreElement.textContent = currentScore;
            
            if (currentScore >= score) {
                clearInterval(this.scoreInterval);
                this.scoreInterval = null;
                // Add celebration for high scores
                if (score >= 85) {
                    this.celebrate();
                }
            }
        }, 50);
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
        
        // Clean up canvas and context
        if (this.ctx) {
            this.ctx = null;
        }
        if (this.canvas) {
            this.canvas = null;
        }
        
        // Clean up references
        this.submitBtn = null;
        this.gradeDisplay = null;
        this.scoreElement = null;
        this.messageElement = null;
        this.referenceImg = null;
        
        super.cleanup();
    }
}