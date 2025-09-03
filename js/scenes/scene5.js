// Scene 5: "She doesn't know why it's so hard to breathe"
class Scene5 extends Scene {
    constructor(container) {
        super(container);
        this.text = "She doesn't know why it's so hard to breathe";
        
        // Game state
        this.isHolding = false;
        this.perfectBreaths = 0;
        this.requiredPerfectBreaths = 3;
        this.lines = [];
        this.currentLine = null;
        this.gameActive = true;
        
        // Timing windows (in pixels from target end)
        this.timingWindows = {
            perfect: 100,  // Very forgiving (200px range)
            good: 150,
            miss: 200
        };
        
        // Animation
        this.animationId = null;
        this.lastSpawnTime = 0;
        this.spawnInterval = 4000; // Spawn new line every 4 seconds
        
        // Breathing circle sizes
        this.circleMinSize = 60;
        this.circleMaxSize = 200;
        this.currentCircleSize = this.circleMinSize;
    }
    
    async init() {
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene story-scene scene-5';
        
        // Create text display
        const textContainer = document.createElement('div');
        textContainer.className = 'story-text';
        textContainer.innerHTML = `<h2>${this.text}</h2>`;
        
        // Create game container
        const gameContainer = document.createElement('div');
        gameContainer.className = 'breathing-game';
        
        // Create rhythm track
        const trackContainer = document.createElement('div');
        trackContainer.className = 'rhythm-track';
        
        // Create target zone
        const targetZone = document.createElement('div');
        targetZone.className = 'target-zone';
        targetZone.innerHTML = '<span>BREATHE</span>';
        
        // Create lines container
        const linesContainer = document.createElement('div');
        linesContainer.className = 'lines-container';
        
        trackContainer.appendChild(targetZone);
        trackContainer.appendChild(linesContainer);
        
        // Create breathing circle
        const breathingContainer = document.createElement('div');
        breathingContainer.className = 'breathing-container';
        
        const breathingCircle = document.createElement('div');
        breathingCircle.className = 'breathing-circle';
        breathingCircle.style.width = `${this.circleMinSize}px`;
        breathingCircle.style.height = `${this.circleMinSize}px`;
        
        breathingContainer.appendChild(breathingCircle);
        
        // Create instruction text
        const instructions = document.createElement('div');
        instructions.className = 'game-instructions';
        instructions.innerHTML = '<p>Click and HOLD while a blue bar is in the green BREATHE zone.<br>Release while the bar is still in the zone for perfect timing!</p>';
        
        // Create score display
        const scoreDisplay = document.createElement('div');
        scoreDisplay.className = 'score-display';
        scoreDisplay.innerHTML = `
            <div class="perfect-counter">
                Perfect Breaths: <span id="perfect-count">0</span> / ${this.requiredPerfectBreaths}
            </div>
            <div class="timing-feedback hidden"></div>
        `;
        
        // Create success message (hidden initially)
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message hidden';
        successMessage.innerHTML = '<p>Perfect breathing achieved!</p>';
        
        // Assemble game
        gameContainer.appendChild(instructions);
        gameContainer.appendChild(trackContainer);
        gameContainer.appendChild(breathingContainer);
        gameContainer.appendChild(scoreDisplay);
        gameContainer.appendChild(successMessage);
        
        // Assemble scene
        this.element.appendChild(textContainer);
        this.element.appendChild(gameContainer);
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Store references
        this.linesContainer = linesContainer;
        this.breathingCircle = breathingCircle;
        this.perfectCountElement = this.element.querySelector('#perfect-count');
        this.timingFeedback = this.element.querySelector('.timing-feedback');
        this.successMessage = successMessage;
        this.targetZone = targetZone;
        
        // Add event listeners
        this.setupEventListeners();
        
        // Start game
        this.startGame();
    }
    
    setupEventListeners() {
        // Mouse events
        this.element.addEventListener('mousedown', (e) => this.startHolding(e));
        this.element.addEventListener('mouseup', (e) => this.stopHolding(e));
        this.element.addEventListener('mouseleave', (e) => this.stopHolding(e));
        
        // Touch events
        this.element.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startHolding(e);
        });
        this.element.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.stopHolding(e);
        });
    }
    
    startHolding(e) {
        if (!this.gameActive || this.isHolding) return;
        
        this.isHolding = true;
        this.breathingCircle.classList.add('inhaling');
        
        // Check if we're starting on a line
        const line = this.getLineInTargetZone();
        if (line) {
            line.element.classList.add('active');
            this.currentLine = line;
            
            // Check if bar start is currently in zone using real coordinates
            const containerRect = this.linesContainer.getBoundingClientRect();
            const zoneRect = this.targetZone.getBoundingClientRect();
            const lineRect = line.element.getBoundingClientRect();
            
            const lineStart = lineRect.left - containerRect.left;
            const zoneLeft = zoneRect.left - containerRect.left;
            const zoneRight = zoneLeft + zoneRect.width;
            
            const startInZone = (lineStart >= zoneLeft && lineStart <= zoneRight);
            line.startWasInZone = startInZone; // Actually set the property!
            
            console.log('=== STARTED HOLDING ===');
            console.log('Bar start visual position:', lineStart);
            console.log('Zone bounds:', zoneLeft, 'to', zoneRight);
            console.log('Start in zone:', startInZone);
            console.log('Setting line.startWasInZone to:', line.startWasInZone);
        }
    }
    
    stopHolding(e) {
        if (!this.isHolding) return;
        
        this.isHolding = false;
        this.breathingCircle.classList.remove('inhaling');
        
        // Check if we're ending on the same line
        if (this.currentLine) {
            console.log('=== STOP HOLDING DEBUG ===');
            console.log('Current line startWasInZone before calculateStartAccuracy:', this.currentLine.startWasInZone);
            
            const startAccuracy = this.calculateStartAccuracy(this.currentLine);
            const endAccuracy = this.calculateEndAccuracy(this.currentLine);
            const timing = this.combineTiming(startAccuracy, endAccuracy);
            
            console.log('=== TIMING CALCULATION RESULTS ===');
            console.log('Start accuracy:', startAccuracy);
            console.log('End accuracy:', endAccuracy);
            console.log('Combined timing:', timing);
            
            this.showFeedback(timing);
            
            if (timing === 'perfect') {
                this.perfectBreaths++;
                this.updateScore();
                
                if (this.perfectBreaths >= this.requiredPerfectBreaths) {
                    this.completeGame();
                }
            }
            
            this.currentLine.element.classList.add('completed');
            this.currentLine = null;
        }
    }
    
    startGame() {
        this.gameActive = true;
        this.lastSpawnTime = Date.now();
        
        // Measure coordinate system offset
        this.measureCoordinateOffset();
        
        // Create initial lines
        this.spawnLine();
        
        // Start animation loop
        this.animate();
    }
    
    measureCoordinateOffset() {
        const container = this.linesContainer;
        const zone = this.targetZone;
        
        if (container && zone) {
            const containerRect = container.getBoundingClientRect();
            const zoneRect = zone.getBoundingClientRect();
            this.coordinateOffset = zoneRect.left - containerRect.left;
            
            console.log('=== COORDINATE SYSTEM DEBUG ===');
            console.log('Container left:', containerRect.left);
            console.log('Zone left:', zoneRect.left);
            console.log('Coordinate offset (zone - container):', this.coordinateOffset);
            console.log('Zone should appear at:', this.coordinateOffset, 'to', this.coordinateOffset + zoneRect.width);
        }
    }
    
    animate() {
        if (!this.gameActive) return;
        
        const now = Date.now();
        
        // Spawn new lines
        if (now - this.lastSpawnTime > this.spawnInterval) {
            this.spawnLine();
            this.lastSpawnTime = now;
        }
        
        // Update lines
        this.updateLines();
        
        // Update breathing circle
        this.updateBreathingCircle();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    spawnLine() {
        // Check if we should spawn (not too many lines)
        if (this.lines.length >= 3) return; // Max 3 lines at once
        
        // Create line element
        const lineElement = document.createElement('div');
        lineElement.className = 'breath-line';
        
        // Random length for variety (2-4 seconds of breathing)
        const length = 200 + Math.random() * 100; // 200-300px
        lineElement.style.width = `${length}px`;
        
        // Add visual markers to the line
        lineElement.innerHTML = `
            <span class="line-start">▶</span>
            <span class="line-text">HOLD</span>
            <span class="line-end">◀</span>
        `;
        
        // Get container width properly
        const containerWidth = this.linesContainer.getBoundingClientRect().width;
        
        // Start from right side of container
        lineElement.style.left = `${containerWidth + 100}px`;
        
        // Add to container
        this.linesContainer.appendChild(lineElement);
        
        // Create line object
        const line = {
            element: lineElement,
            position: containerWidth + 100,
            length: length,
            speed: 1.5, // pixels per frame (even slower for easier gameplay)
            started: false,
            ended: false,
            startWasInZone: false // Track if start ever entered zone while holding
        };
        
        this.lines.push(line);
    }
    
    updateLines() {
        this.lines = this.lines.filter(line => {
            // Move line left
            line.position -= line.speed;
            line.element.style.left = `${line.position}px`;
            
            // If this is the current line and we're holding, check if start enters zone
            if (this.currentLine === line && this.isHolding && !line.startWasInZone) {
                // Use real coordinate system
                const containerRect = this.linesContainer.getBoundingClientRect();
                const zoneRect = this.targetZone.getBoundingClientRect();
                const lineRect = line.element.getBoundingClientRect();
                
                const lineStart = lineRect.left - containerRect.left;
                const zoneLeft = zoneRect.left - containerRect.left;
                const zoneRight = zoneLeft + zoneRect.width;
                
                if (lineStart >= zoneLeft && lineStart <= zoneRight) {
                    line.startWasInZone = true;
                    console.log('=== START ENTERED ZONE ===');
                    console.log('Bar start visual position:', lineStart);
                    console.log('Zone bounds:', zoneLeft, 'to', zoneRight);
                }
            }
            
            // Remove if completely off screen
            if (line.position + line.length < -100) {
                line.element.remove();
                return false;
            }
            
            return true;
        });
    }
    
    updateBreathingCircle() {
        const targetSize = this.isHolding ? this.circleMaxSize : this.circleMinSize;
        const speed = 3; // Speed of size change
        
        this.currentCircleSize += (targetSize - this.currentCircleSize) * speed * (1/60);
        
        this.breathingCircle.style.width = `${this.currentCircleSize}px`;
        this.breathingCircle.style.height = `${this.currentCircleSize}px`;
    }
    
    getLineInTargetZone() {
        // Target zone is at left: 100px with width: 100px (from CSS)
        const targetStart = 100;
        const targetEnd = 200;
        
        for (const line of this.lines) {
            const lineStart = line.position;
            const lineEnd = line.position + line.length;
            
            // Check if line overlaps with target zone
            const overlaps = lineStart <= targetEnd && lineEnd >= targetStart;
            
            if (overlaps) {
                return line;
            }
        }
        
        return null;
    }
    
    calculateStartAccuracy(line) {
        // Check if bar start was ever in zone while holding
        console.log('=== CALCULATE START ACCURACY ===');
        console.log('line.startWasInZone:', line.startWasInZone);
        return line.startWasInZone;
    }
    
    calculateEndAccuracy(line) {
        // Use real coordinate system - check if bar END is in the visual zone
        const containerRect = this.linesContainer.getBoundingClientRect();
        const zoneRect = this.targetZone.getBoundingClientRect();
        const lineRect = line.element.getBoundingClientRect();
        
        const lineEnd = lineRect.right - containerRect.left;
        const zoneLeft = zoneRect.left - containerRect.left;
        const zoneRight = zoneLeft + zoneRect.width;
        
        const endInZone = lineEnd >= zoneLeft && lineEnd <= zoneRight;
        
        console.log('=== END ACCURACY CHECK ===');
        console.log('Line visual end:', lineEnd);
        console.log('Zone bounds:', zoneLeft, 'to', zoneRight);
        console.log('End in zone:', endInZone);
        
        return endInZone;
    }
    
    combineTiming(startAccuracy, endAccuracy) {
        // Perfect = both start and end timing were accurate
        if (startAccuracy && endAccuracy) {
            return 'perfect';
        }
        
        // Good = one timing was accurate
        if (startAccuracy || endAccuracy) {
            return 'good';
        }
        
        // Miss = neither timing was accurate
        return 'miss';
    }

    checkTiming(line) {
        // Target zone is from 100px to 200px
        const targetStart = 100;
        const targetEnd = 200;
        const targetCenter = 150;
        const targetWidth = targetEnd - targetStart;
        
        const lineStart = line.position;
        const lineEnd = line.position + line.length;
        const lineCenter = lineStart + (line.length / 2);
        
        // Check if bar overlaps with zone at all
        const overlaps = lineStart < targetEnd && lineEnd > targetStart;
        
        if (!overlaps) {
            console.log('Release timing: MISS - no overlap', {
                lineStart, lineEnd, targetStart, targetEnd
            });
            return 'miss';
        }
        
        // Calculate how much of the bar is in the zone
        const overlapStart = Math.max(lineStart, targetStart);
        const overlapEnd = Math.min(lineEnd, targetEnd);
        const overlapAmount = overlapEnd - overlapStart;
        
        // Calculate how centered the bar is in the zone
        const centerDistance = Math.abs(lineCenter - targetCenter);
        
        // Debug logging
        console.log('Release timing check:', {
            lineStart: lineStart,
            lineEnd: lineEnd,
            lineCenter: lineCenter,
            targetCenter: targetCenter,
            centerDistance: centerDistance,
            overlapAmount: overlapAmount,
            targetWidth: targetWidth
        });
        
        // Perfect = bar END is in the zone (bar is exiting/about to exit)
        // Good = bar overlaps significantly with zone
        // Miss = minimal overlap
        if (lineEnd >= targetStart && lineEnd <= targetEnd) {
            console.log('Result: PERFECT - bar end is in zone');
            return 'perfect';
        } else if (overlapAmount > 50) {
            console.log('Result: GOOD - significant overlap');
            return 'good';
        } else if (overlapAmount > 0) {
            console.log('Result: MISS - minimal overlap');
            return 'miss';
        } else {
            console.log('Result: MISS - no overlap');
            return 'miss';
        }
    }
    
    showFeedback(timing) {
        this.timingFeedback.textContent = timing.toUpperCase() + '!';
        this.timingFeedback.className = `timing-feedback ${timing}`;
        this.timingFeedback.classList.remove('hidden');
        
        setTimeout(() => {
            this.timingFeedback.classList.add('hidden');
        }, 1000);
    }
    
    updateScore() {
        this.perfectCountElement.textContent = this.perfectBreaths;
    }
    
    completeGame() {
        this.gameActive = false;
        this.successMessage.classList.remove('hidden');
        
        // Clear remaining lines
        this.lines.forEach(line => line.element.remove());
        this.lines = [];
        
        // Auto advance after showing success
        setTimeout(() => {
            this.onComplete();
            if (window.sceneManager) {
                window.sceneManager.nextScene();
            }
        }, 2500);
    }
    
    cleanup() {
        // Stop animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Remove event listeners
        this.element?.removeEventListener('mousedown', this.startHolding);
        this.element?.removeEventListener('mouseup', this.stopHolding);
        this.element?.removeEventListener('mouseleave', this.stopHolding);
        this.element?.removeEventListener('touchstart', this.startHolding);
        this.element?.removeEventListener('touchend', this.stopHolding);
        
        super.cleanup();
    }
}