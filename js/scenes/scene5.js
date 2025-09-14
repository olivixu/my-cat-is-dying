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
        this.spawnInterval = 2500; // Check for spawn more frequently, but spacing will prevent overlap
        
        // Breathing circle sizes
        this.circleMinSize = 60;
        this.circleMaxSize = 200;
        this.currentCircleSize = this.circleMinSize;
        
        // Target zone animation
        this.targetZoneScale = 1;
        this.targetZoneBaseScale = 1;
        this.targetZoneMaxScale = 1.3;
        this.pulseTime = 0;
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
        
        // Create target zone (blue circle)
        const targetZone = document.createElement('div');
        targetZone.className = 'target-zone';
        
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
        
        // Create progress dots
        const progressDots = document.createElement('div');
        progressDots.className = 'progress-dots';
        for (let i = 0; i < this.requiredPerfectBreaths; i++) {
            const dot = document.createElement('div');
            dot.className = 'progress-dot';
            progressDots.appendChild(dot);
        }
        
        // Create success message (hidden initially)
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message hidden';
        successMessage.innerHTML = '<p>Perfect breathing achieved!</p>';
        
        // Assemble game
        gameContainer.appendChild(trackContainer);
        gameContainer.appendChild(breathingContainer);
        gameContainer.appendChild(progressDots);
        gameContainer.appendChild(successMessage);
        
        // Assemble scene
        this.element.appendChild(textContainer);
        this.element.appendChild(gameContainer);
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Store references
        this.linesContainer = linesContainer;
        this.breathingCircle = breathingCircle;
        this.progressDots = progressDots;
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
        // Remove the instant class change
        // this.targetZone.classList.add('holding');
        
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
        // Remove the instant class change
        // this.targetZone.classList.remove('holding');
        
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
                // Turn the bar green for success
                this.currentLine.element.classList.add('success');
                
                // Trigger success pulse on the target zone
                this.targetZone.classList.add('success-pulse');
                setTimeout(() => {
                    this.targetZone.classList.remove('success-pulse');
                }, 1000);
                
                this.perfectBreaths++;
                this.updateScore();
                
                if (this.perfectBreaths >= this.requiredPerfectBreaths) {
                    this.completeGame();
                }
            } else if (timing === 'good') {
                // Optional: different color for good timing
                this.currentLine.element.classList.add('active');
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
        
        // Update target zone animation
        this.updateTargetZone();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    spawnLine() {
        // Check if we should spawn (not too many lines)
        if (this.lines.length >= 3) return; // Max 3 lines at once
        
        // Check if the last bar has moved far enough
        if (this.lines.length > 0) {
            const lastLine = this.lines[this.lines.length - 1];
            const minSpacing = 400; // Minimum pixels between bars
            
            // Get viewport width
            const viewportWidth = window.innerWidth;
            
            // Check if last bar has moved far enough from spawn point
            if (viewportWidth - lastLine.position < minSpacing) {
                return; // Don't spawn yet, last bar is too close
            }
        }
        
        // Create line element
        const lineElement = document.createElement('div');
        lineElement.className = 'breath-line';
        
        // Random length for variety (2-4 seconds of breathing)
        const length = 200 + Math.random() * 100; // 200-300px
        lineElement.style.width = `${length}px`;
        
        // No visual markers needed for minimal design
        
        // Get viewport width to start bars off-screen
        const viewportWidth = window.innerWidth;
        
        // Start from right side of viewport
        lineElement.style.left = `${viewportWidth}px`;
        
        // Add to container
        this.linesContainer.appendChild(lineElement);
        
        // Create line object
        const line = {
            element: lineElement,
            position: viewportWidth,
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
    
    updateTargetZone() {
        // Update pulse time for gentle pulsing
        this.pulseTime += 0.015; // Controls pulse speed
        
        // Calculate base scale with gentle pulse (1 to 1.05)
        const pulseScale = 1 + Math.sin(this.pulseTime) * 0.025; // 2.5% pulse
        
        // Determine target scale based on holding state
        const targetScale = this.isHolding ? this.targetZoneMaxScale : pulseScale;
        const speed = 0.02; // Slower speed for smooth animation
        
        // Smoothly interpolate to target scale
        this.targetZoneScale += (targetScale - this.targetZoneScale) * speed;
        
        // Apply the transform
        this.targetZone.style.transform = `translateY(-50%) scale(${this.targetZoneScale})`;
    }
    
    getLineInTargetZone() {
        // Target zone is at left: 400px with width: 70px (from CSS)
        const targetStart = 400;
        const targetEnd = 470;
        
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
        // No visual feedback text in minimal design
    }
    
    updateScore() {
        // Update progress dots
        const dots = this.progressDots.querySelectorAll('.progress-dot');
        for (let i = 0; i < this.perfectBreaths && i < dots.length; i++) {
            dots[i].classList.add('active');
        }
    }
    
    completeGame() {
        this.gameActive = false;
        
        // Fade out remaining lines
        this.lines.forEach(line => {
            line.element.style.transition = 'opacity 1.5s ease-out';
            line.element.style.opacity = '0';
        });
        
        // After fade, remove lines and trigger dot expansion
        setTimeout(() => {
            // Clear remaining lines
            this.lines.forEach(line => line.element.remove());
            this.lines = [];
            
            // Trigger dot expansion animation - only expand the middle dot
            const dots = this.progressDots.querySelectorAll('.progress-dot');
            if (dots.length >= 2) {
                const middleDot = dots[1]; // Get the middle dot (index 1)
                
                // Create a placeholder to maintain the gap
                const placeholder = document.createElement('div');
                placeholder.style.width = '12px';
                placeholder.style.height = '12px';
                placeholder.style.display = 'inline-block';
                
                // Insert placeholder before setting position
                middleDot.parentNode.insertBefore(placeholder, middleDot.nextSibling);
                
                // Get the dot's position to maintain it during expansion
                const rect = middleDot.getBoundingClientRect();
                middleDot.style.position = 'fixed';
                middleDot.style.left = `${rect.left + rect.width / 2}px`;
                middleDot.style.top = `${rect.top + rect.height / 2}px`;
                middleDot.style.transform = 'translate(-50%, -50%)';
                
                // Add expanding class to trigger animation
                middleDot.classList.add('expanding');
            }
            
            // Create and fade in Windows XP sky overlay during dot expansion
            setTimeout(() => {
                const xpSkyOverlay = document.createElement('img');
                xpSkyOverlay.className = 'xp-sky-transition';
                xpSkyOverlay.src = 'assets/images/windowsxp-sky.png';
                xpSkyOverlay.alt = 'Windows XP Sky';
                xpSkyOverlay.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    object-fit: cover;
                    z-index: 9998;
                    opacity: 0;
                    transition: opacity 1.5s ease-in;
                    pointer-events: none;
                `;
                document.body.appendChild(xpSkyOverlay);
                
                // Trigger fade in
                requestAnimationFrame(() => {
                    xpSkyOverlay.style.opacity = '1';
                });
                
                // Store reference for cleanup
                this.xpSkyOverlay = xpSkyOverlay;
            }, 500); // Start fading in sky 0.5 seconds after dot expansion starts
            
            // Auto advance after expansion animation completes
            setTimeout(() => {
                // Clean up the sky overlay as scene transitions
                if (this.xpSkyOverlay) {
                    this.xpSkyOverlay.remove();
                }
                this.onComplete();
                if (window.sceneManager) {
                    window.sceneManager.nextScene();
                }
            }, 3000);
        }, 1500); // 1.5 second delay for fade and pause
    }
    
    cleanup() {
        // Stop animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Clean up XP sky overlay if it exists
        if (this.xpSkyOverlay) {
            this.xpSkyOverlay.remove();
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