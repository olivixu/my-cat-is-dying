class Scene3 extends Scene {
    constructor(container) {
        super(container);
        this.pieces = [];
        this.slots = [];
        this.correctPlacements = 0;
        this.totalPieces = 9;
        this.draggedPiece = null;
        this.dragOffset = { x: 0, y: 0 };
    }
    
    async init() {
        console.log('Initializing Scene 3');
        // Create scene element
        this.element = document.createElement('div');
        this.element.className = 'scene scene3';
        
        // Create puzzle container
        const puzzleContainer = document.createElement('div');
        puzzleContainer.className = 'puzzle-container';
        
        // Create puzzle slots (3x3 grid)
        for (let i = 0; i < 9; i++) {
            const slot = document.createElement('div');
            slot.className = 'puzzle-slot';
            slot.dataset.slotIndex = i;
            puzzleContainer.appendChild(slot);
            this.slots.push(slot);
        }
        
        // Create pieces tray
        const piecesTray = document.createElement('div');
        piecesTray.className = 'puzzle-pieces-tray';
        
        // Create puzzle pieces
        const pieceData = this.generatePuzzlePieces();
        pieceData.forEach((data, index) => {
            const piece = document.createElement('div');
            piece.className = 'puzzle-piece';
            piece.dataset.pieceIndex = index;
            piece.dataset.correctSlot = data.correctSlot;
            piece.innerHTML = data.content;
            piece.style.background = data.color;
            
            // Position pieces randomly in the tray
            piecesTray.appendChild(piece);
            this.pieces.push(piece);
        });
        
        // Add title
        const title = document.createElement('div');
        title.style.cssText = `
            position: absolute;
            top: 40px;
            left: 50%;
            transform: translateX(-50%);
            text-align: center;
            z-index: 1;
        `;
        title.innerHTML = `
            <h2 style="font-size: 32px; margin-bottom: 10px;">Drag & Drop Puzzle</h2>
            <p style="color: var(--text-secondary);">Arrange the pieces in the correct order (1-9)</p>
        `;
        
        // Assemble scene
        this.element.appendChild(title);
        this.element.appendChild(puzzleContainer);
        this.element.appendChild(piecesTray);
        
        // Add to container
        this.container.appendChild(this.element);
        
        // Set up drag and drop
        this.setupDragAndDrop();
        
        console.log('Scene 3 initialized successfully');
    }
    
    generatePuzzlePieces() {
        const colors = [
            'linear-gradient(135deg, #667eea, #764ba2)',
            'linear-gradient(135deg, #f093fb, #f5576c)',
            'linear-gradient(135deg, #4facfe, #00f2fe)',
            'linear-gradient(135deg, #43e97b, #38f9d7)',
            'linear-gradient(135deg, #fa709a, #fee140)',
            'linear-gradient(135deg, #30cfd0, #330867)',
            'linear-gradient(135deg, #a8edea, #fed6e3)',
            'linear-gradient(135deg, #ff9a9e, #fecfef)',
            'linear-gradient(135deg, #fbc2eb, #a6c1ee)'
        ];
        
        // Create pieces with numbers 1-9
        const pieces = [];
        for (let i = 0; i < 9; i++) {
            pieces.push({
                content: i + 1,
                correctSlot: i,
                color: colors[i]
            });
        }
        
        // Shuffle the pieces array for random initial order
        return pieces.sort(() => Math.random() - 0.5);
    }
    
    setupDragAndDrop() {
        // Bind event handlers to maintain context
        this.handleDragMoveHandler = (e) => this.handleDragMove(e);
        this.endDragHandler = (e) => this.endDrag(e);
        
        // Add drag listeners to pieces
        this.pieces.forEach(piece => {
            piece.draggable = true;
            
            // Mouse events
            piece.addEventListener('mousedown', (e) => this.startDrag(e, piece));
            
            // Touch events for mobile
            piece.addEventListener('touchstart', (e) => this.startDrag(e, piece), { passive: false });
        });
        
        // Add drop listeners to slots
        this.slots.forEach(slot => {
            slot.addEventListener('dragover', (e) => this.handleDragOver(e, slot));
            slot.addEventListener('drop', (e) => this.handleDrop(e, slot));
            slot.addEventListener('dragleave', (e) => this.handleDragLeave(e, slot));
        });
        
        // Global mouse/touch move and up events
        document.addEventListener('mousemove', this.handleDragMoveHandler);
        document.addEventListener('mouseup', this.endDragHandler);
        document.addEventListener('touchmove', this.handleDragMoveHandler, { passive: false });
        document.addEventListener('touchend', this.endDragHandler);
    }
    
    startDrag(e, piece) {
        e.preventDefault();
        
        // If piece is in a slot, remove it first
        if (piece.classList.contains('placed')) {
            const currentSlot = piece.parentElement;
            if (currentSlot && currentSlot.classList.contains('puzzle-slot')) {
                // Check if it was correctly placed before removing
                const pieceIndex = parseInt(piece.dataset.correctSlot);
                const slotIndex = parseInt(currentSlot.dataset.slotIndex);
                
                if (pieceIndex === slotIndex && currentSlot.classList.contains('filled')) {
                    currentSlot.classList.remove('filled');
                    this.correctPlacements--;
                }
                
                piece.classList.remove('placed');
            }
        }
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        this.draggedPiece = piece;
        const rect = piece.getBoundingClientRect();
        this.dragOffset.x = clientX - rect.left;
        this.dragOffset.y = clientY - rect.top;
        
        piece.classList.add('dragging');
        piece.style.position = 'fixed';
        piece.style.zIndex = '1000';
        piece.style.left = `${clientX - this.dragOffset.x}px`;
        piece.style.top = `${clientY - this.dragOffset.y}px`;
    }
    
    handleDragMove(e) {
        if (!this.draggedPiece) return;
        
        e.preventDefault();
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        this.draggedPiece.style.left = `${clientX - this.dragOffset.x}px`;
        this.draggedPiece.style.top = `${clientY - this.dragOffset.y}px`;
        
        // Check for hover over slots
        const elementBelow = document.elementFromPoint(clientX, clientY);
        if (elementBelow && elementBelow.classList.contains('puzzle-slot')) {
            this.handleDragOver(e, elementBelow);
        } else {
            // Clear all slot hover states
            this.slots.forEach(slot => slot.classList.remove('valid-target'));
        }
    }
    
    handleDragOver(e, slot) {
        e.preventDefault();
        if (!slot.querySelector('.puzzle-piece')) {
            slot.classList.add('valid-target');
        }
    }
    
    handleDragLeave(e, slot) {
        slot.classList.remove('valid-target');
    }
    
    handleDrop(e, slot) {
        e.preventDefault();
        slot.classList.remove('valid-target');
        
        if (this.draggedPiece && !slot.querySelector('.puzzle-piece')) {
            this.placePiece(this.draggedPiece, slot);
        }
    }
    
    endDrag(e) {
        if (!this.draggedPiece) return;
        
        const clientX = e.type.includes('touch') ? e.changedTouches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.changedTouches[0].clientY : e.clientY;
        
        // Find the element under the drop point
        const elementBelow = document.elementFromPoint(clientX, clientY);
        
        if (elementBelow && elementBelow.classList.contains('puzzle-slot') && !elementBelow.querySelector('.puzzle-piece')) {
            this.placePiece(this.draggedPiece, elementBelow);
        } else {
            // Return piece to tray
            this.returnPieceToTray(this.draggedPiece);
        }
        
        this.draggedPiece.classList.remove('dragging');
        this.draggedPiece = null;
        
        // Clear all slot hover states
        this.slots.forEach(slot => slot.classList.remove('valid-target'));
    }
    
    placePiece(piece, slot) {
        // Check if there's already a piece in this slot
        const existingPiece = slot.querySelector('.puzzle-piece');
        if (existingPiece && existingPiece !== piece) {
            // Return existing piece to tray
            this.returnPieceToTray(existingPiece);
            
            // Check if the existing piece was correctly placed
            const existingPieceIndex = parseInt(existingPiece.dataset.correctSlot);
            const slotIndex = parseInt(slot.dataset.slotIndex);
            
            if (existingPieceIndex === slotIndex && slot.classList.contains('filled')) {
                slot.classList.remove('filled');
                this.correctPlacements--;
            }
        }
        
        piece.style.position = 'absolute';
        piece.style.left = '5px';
        piece.style.top = '5px';
        piece.style.zIndex = '';
        piece.classList.add('placed');
        
        slot.appendChild(piece);
        
        // Check if placement is correct
        const pieceIndex = parseInt(piece.dataset.correctSlot);
        const slotIndex = parseInt(slot.dataset.slotIndex);
        
        if (pieceIndex === slotIndex) {
            slot.classList.add('filled');
            this.correctPlacements++;
            
            // Check if puzzle is complete
            if (this.correctPlacements === this.totalPieces) {
                this.completePuzzle();
            }
        }
    }
    
    returnPieceToTray(piece) {
        const tray = this.element.querySelector('.puzzle-pieces-tray');
        piece.style.position = '';
        piece.style.left = '';
        piece.style.top = '';
        piece.style.zIndex = '';
        piece.classList.remove('placed');
        tray.appendChild(piece);
    }
    
    completePuzzle() {
        // Show success message
        setTimeout(() => {
            const message = document.createElement('div');
            message.className = 'success-message';
            message.innerHTML = `
                <h2>Puzzle Complete! 🎉</h2>
                <p>Perfect arrangement!</p>
            `;
            this.element.appendChild(message);
            
            // Mark all pieces as non-draggable
            this.pieces.forEach(piece => {
                piece.draggable = false;
                piece.style.cursor = 'default';
            });
            
            this.onComplete();
        }, 500);
    }
    
    cleanup() {
        // Remove global event listeners
        if (this.handleDragMoveHandler) {
            document.removeEventListener('mousemove', this.handleDragMoveHandler);
            document.removeEventListener('touchmove', this.handleDragMoveHandler);
        }
        if (this.endDragHandler) {
            document.removeEventListener('mouseup', this.endDragHandler);
            document.removeEventListener('touchend', this.endDragHandler);
        }
        
        super.cleanup();
    }
}