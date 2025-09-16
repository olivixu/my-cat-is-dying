// Scene 5: "She doesn't know why it's so hard to breathe"
import { Scene } from '../sceneManager.js';

export class Scene5 extends Scene {
    constructor(container) {
        super(container);
        this.text = "She doesn't know why it's so hard to breathe";
        
        // Game state - RESET ALL VALUES
        this.isHolding = false;
        this.perfectBreaths = 0;
        this.requiredPerfectBreaths = 3;
        this.lines = [];
        this.currentLine = null;
        this.gameActive = false; // Start with game inactive until properly initialized
        
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
        
        // Safeguards to prevent auto-completion - RESET ALL VALUES
        this.hasInteracted = false;
        this.hasMeaningfulInteraction = false; // Requires actual breath hold during bar
        this.gameStartTime = 0;
        this.lastPerfectTime = 0; // Prevent rapid-fire perfect breaths
        this.isProcessingBreath = false; // Prevent double-processing
        this.minimumPlayTime = 5000; // Require 5 seconds minimum before allowing completion
        this.holdStartTime = 0; // Track when user started holding
        this.minimumHoldTime = 300; // Require 300ms minimum hold for valid breath
        this.processedLines = new Set(); // Track which lines have already given perfect breaths
        
        // Event cooldown to prevent lingering events from previous scene
        this.eventCooldownTime = 1000; // Ignore events for first 1 second
        this.sceneLoadTime = Date.now();
        
        // Timer tracking for cleanup
        this.setupTimerId = null;
        this.completionTimers = []
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
        
        // Start game (will set up event listeners after delay)
        this.startGame();
    }
    
    setupEventListeners() {
        // Guard: Check if element still exists (might be cleaned up during setTimeout)
        if (!this.element) {
            console.warn('Scene 5: element was cleaned up before setupEventListeners could run');
            return;
        }
        
        // Get the game container specifically, not the entire scene
        this.gameContainer = this.element.querySelector('.breathing-game');
        if (!this.gameContainer) {
            console.error('Game container not found for event listeners');
            return;
        }
        
        // Store bound event handlers so we can remove them later
        this.boundStartHolding = (e) => this.startHolding(e);
        this.boundStopHolding = (e) => this.stopHolding(e);
        this.boundTouchStart = (e) => {
            e.preventDefault();
            this.startHolding(e);
        };
        this.boundTouchEnd = (e) => {
            e.preventDefault();
            this.stopHolding(e);
        };
        
        // Mouse events - only on game area
        this.gameContainer.addEventListener('mousedown', this.boundStartHolding);
        this.gameContainer.addEventListener('mouseup', this.boundStopHolding);
        // REMOVED mouseleave - was causing spurious stopHolding on scene load
        
        // Touch events - only on game area
        this.gameContainer.addEventListener('touchstart', this.boundTouchStart);
        this.gameContainer.addEventListener('touchend', this.boundTouchEnd);
    }
    
    startHolding(e) {
        if (!this.gameActive || this.isHolding) return;
        
        // Ignore events from before game started or if gameStartTime is invalid
        const now = Date.now();
        if (!this.gameStartTime || now - this.gameStartTime < 100) {
            return; // Ignore events if game hasn't properly started
        }
        
        // Event cooldown: Ignore all events for first second after scene loads
        if (now - this.sceneLoadTime < this.eventCooldownTime) {
            return;
        }
        
        // Event source validation: Only accept trusted user events
        if (e && !e.isTrusted) {
            return; // Ignore synthetic/programmatic events
        }
        
        // Mark that player has interacted
        this.hasInteracted = true;
        this.holdStartTime = now; // Track when hold started
        
        this.isHolding = true;
        this.breathingCircle.classList.add('inhaling');
        // Remove the instant class change
        // this.targetZone.classList.add('holding');
        
        // Check if we're starting on a line
        const line = this.getLineInTargetZone();
        if (line) {
            line.element.classList.add('active');
            this.currentLine = line;
            // Mark meaningful interaction when actually holding during a bar
            this.hasMeaningfulInteraction = true;
            
            // Check if bar start is currently in zone using real coordinates
            const containerRect = this.linesContainer.getBoundingClientRect();
            const zoneRect = this.targetZone.getBoundingClientRect();
            const lineRect = line.element.getBoundingClientRect();
            
            const lineStart = lineRect.left - containerRect.left;
            const zoneLeft = zoneRect.left - containerRect.left;
            const zoneRight = zoneLeft + zoneRect.width;
            
            const startInZone = (lineStart >= zoneLeft && lineStart <= zoneRight);
            line.startWasInZone = startInZone; // Actually set the property!
            
        }
    }
    
    stopHolding(e) {
        // Guard: Don't process if game not active
        if (!this.gameActive) {
            this.isHolding = false;
            return;
        }
        
        // Guard: Ignore events from before game properly started
        const now = Date.now();
        if (!this.gameStartTime || now - this.gameStartTime < 100) {
            this.isHolding = false;
            return;
        }
        
        // Event cooldown: Ignore all events for first second after scene loads
        if (now - this.sceneLoadTime < this.eventCooldownTime) {
            this.isHolding = false;
            return;
        }
        
        // Event source validation: Only accept trusted user events
        if (e && !e.isTrusted) {
            this.isHolding = false;
            return; // Ignore synthetic/programmatic events
        }
        
        // Guard: Don't process if not holding or already processing
        if (!this.isHolding || this.isProcessingBreath) return;
        
        // Guard: Don't process breath if user hasn't meaningfully interacted
        if (!this.hasInteracted) {
            this.isHolding = false;
            return;
        }
        
        // Guard: Require minimum hold time for valid breath
        const holdDuration = Date.now() - this.holdStartTime;
        if (holdDuration < this.minimumHoldTime) {
            this.isHolding = false;
            this.breathingCircle.classList.remove('inhaling');
            return;
        }
        
        this.isHolding = false;
        this.isProcessingBreath = true; // Prevent double-processing
        this.breathingCircle.classList.remove('inhaling');
        // Remove the instant class change
        // this.targetZone.classList.remove('holding');
        
        // Check if we're ending on the same line
        if (this.currentLine) {
            
            const startAccuracy = this.calculateStartAccuracy(this.currentLine);
            const endAccuracy = this.calculateEndAccuracy(this.currentLine);
            const timing = this.combineTiming(startAccuracy, endAccuracy);
            
            
            this.showFeedback(timing);
            
            if (timing === 'perfect') {
                // Check if this line has already given a perfect breath
                if (this.processedLines.has(this.currentLine)) {
                    // This line already gave a perfect breath, skip it
                    this.currentLine.element.classList.add('completed');
                    this.currentLine = null;
                    // Don't reset isProcessingBreath here - let the timeout do it
                    return;
                }
                
                // Prevent rapid-fire perfect breaths
                const now = Date.now();
                const timeSinceLastPerfect = now - this.lastPerfectTime;
                
                if (timeSinceLastPerfect < 500) {
                    // Don't reset isProcessingBreath here - let the timeout do it
                    // Clear currentLine to prevent reprocessing the same line
                    if (this.currentLine) {
                        this.currentLine.element.classList.add('completed');
                        this.currentLine = null;
                    }
                    return;
                }
                
                // Mark this line as processed
                this.processedLines.add(this.currentLine);
                
                // Turn the bar green for success
                this.currentLine.element.classList.add('success');
                
                // Trigger success pulse on the target zone
                this.targetZone.classList.add('success-pulse');
                // Use parent class timer tracking for automatic cleanup
                this.addTimer(() => {
                    if (this.targetZone) {
                        this.targetZone.classList.remove('success-pulse');
                    }
                }, 1000);
                
                this.perfectBreaths++;
                this.lastPerfectTime = now;
                this.updateScore();
                
                
                // Only allow completion if:
                // 1. Player has meaningfully interacted (held during a bar)
                // 2. Minimum play time has passed
                // 3. Required breaths achieved
                
                // Guard: Don't complete if gameStartTime is invalid
                if (!this.gameStartTime || this.gameStartTime === 0) {
                    return;
                }
                
                const timeSinceStart = now - this.gameStartTime;
                
                if (this.hasMeaningfulInteraction && 
                    timeSinceStart > this.minimumPlayTime && 
                    this.perfectBreaths >= this.requiredPerfectBreaths) {
                    this.completeGame();
                } else {
                }
            } else if (timing === 'good') {
                // Optional: different color for good timing
                this.currentLine.element.classList.add('active');
            }
            
            this.currentLine.element.classList.add('completed');
            this.currentLine = null;
        }
        
        // Reset processing flag after a longer delay to prevent rapid-fire
        this.addTimer(() => {
            this.isProcessingBreath = false;
        }, 500);
    }
    
    startGame() {
        // Clear any pending mouse/touch events from previous scene
        if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
        
        // Delay game activation to prevent spurious events during scene load
        this.setupTimerId = setTimeout(() => {
            // Set up event listeners AFTER delay to avoid spurious events
            this.setupEventListeners();
            
            this.gameActive = true;
            this.lastSpawnTime = Date.now();
            this.gameStartTime = Date.now(); // Track when game started
            
            // Measure coordinate system offset
            this.measureCoordinateOffset();
            
            // Create initial lines
            this.spawnLine();
            
            // Start animation loop
            this.animate();
        }, 500); // 500ms delay to let scene settle
    }
    
    measureCoordinateOffset() {
        const container = this.linesContainer;
        const zone = this.targetZone;
        
        if (container && zone) {
            const containerRect = container.getBoundingClientRect();
            const zoneRect = zone.getBoundingClientRect();
            this.coordinateOffset = zoneRect.left - containerRect.left;
            
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
        
        // Ensure lines spawn well past the target zone (which ends at 470px)
        // This prevents lines from spawning inside the zone on narrow viewports
        const spawnPosition = Math.max(viewportWidth, 600);
        
        // Start from right side, but never in the target zone
        lineElement.style.left = `${spawnPosition}px`;
        
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
            return 'miss'; // No overlap
        }
        
        // Calculate how much of the bar is in the zone
        const overlapStart = Math.max(lineStart, targetStart);
        const overlapEnd = Math.min(lineEnd, targetEnd);
        const overlapAmount = overlapEnd - overlapStart;
        
        // Calculate how centered the bar is in the zone
        const centerDistance = Math.abs(lineCenter - targetCenter);
        
        // Perfect = bar END is in the zone (bar is exiting/about to exit)
        // Good = bar overlaps significantly with zone
        // Miss = minimal overlap
        if (lineEnd >= targetStart && lineEnd <= targetEnd) {
            return 'perfect';
        } else if (overlapAmount > 50) {
            return 'good';
        } else if (overlapAmount > 0) {
            return 'miss';
        } else {
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
        // GUARD: Prevent multiple completions
        if (this.hasCompleted) {
            console.log('[Scene5] Game already completed - ignoring');
            return;
        }
        
        this.gameActive = false;
        
        // Fade out remaining lines
        this.lines.forEach(line => {
            line.element.style.transition = 'opacity 1.5s ease-out';
            line.element.style.opacity = '0';
        });
        
        // After fade, remove lines and trigger dot expansion
        // Use parent class timer tracking for automatic cleanup
        const fadeTimer = this.addTimer(() => {
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
            const skyTimer = this.addTimer(() => {
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
                    z-index: 100000;
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
            const advanceTimer = this.addTimer(() => {
                // DON'T remove the sky overlay - keep it visible for Scene 6
                // Scene 6 starts with XP sky, so this prevents black flash
                this.onComplete();
                if (window.sceneManager) {
                    window.sceneManager.nextScene();
                }
            }, 3000);
        }, 1500); // 1.5 second delay for fade and pause
    }
    
    cleanup(targetSceneIndex = null) {
        // Cancel setup timer if it's still pending
        if (this.setupTimerId) {
            clearTimeout(this.setupTimerId);
            this.setupTimerId = null;
        }
        
        // Cancel all completion timers (legacy - keeping for safety)
        if (this.completionTimers) {
            this.completionTimers.forEach(timer => clearTimeout(timer));
            this.completionTimers = [];
        }
        
        // Stop animation
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        
        // Clean up XP sky overlay if it exists (for navigation or scene end)
        // SPECIAL CASE: Keep overlay when transitioning to Scene 6 for seamless transition
        if (this.xpSkyOverlay) {
            // Use the passed targetSceneIndex to check if going to Scene 6
            const goingToScene6 = targetSceneIndex === 5; // Scene 6 is at index 5
            
            if (!goingToScene6) {
                // Remove overlay if NOT going to Scene 6
                this.xpSkyOverlay.remove();
            } else {
                // Mark overlay as coming from Scene 5 so Scene 6 knows to handle it
                this.xpSkyOverlay.dataset.fromScene5 = 'true';
            }
            this.xpSkyOverlay = null;
        }
        
        // Remove event listeners from the game container using stored bound functions
        if (this.gameContainer) {
            this.gameContainer.removeEventListener('mousedown', this.boundStartHolding);
            this.gameContainer.removeEventListener('mouseup', this.boundStopHolding);
            // mouseleave was removed from setupEventListeners
            this.gameContainer.removeEventListener('touchstart', this.boundTouchStart);
            this.gameContainer.removeEventListener('touchend', this.boundTouchEnd);
        }
        
        // Call parent cleanup with the target index
        super.cleanup(targetSceneIndex);
    }
}