// Main Application Entry Point
import { SceneManager } from './sceneManager.js';

// Import all scene classes
import { Scene1 } from './scenes/scene1.js';
import { Scene2 } from './scenes/scene2.js';
import { Scene3 } from './scenes/scene3.js';
import { Scene4 } from './scenes/scene4.js';
import { Scene5 } from './scenes/scene5.js';
import { Scene6 } from './scenes/scene6.js';
import { Scene7 } from './scenes/scene7.js';
import { Scene8 } from './scenes/scene8.js';
import { Scene9 } from './scenes/scene9.js';
import { Scene10 } from './scenes/scene10.js';
import { Scene11 } from './scenes/scene11.js';
import { Scene12 } from './scenes/scene12.js';
import { Scene13 } from './scenes/scene13.js';

// Global mouse position tracking
window.mousePosition = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
document.addEventListener('mousemove', (e) => {
    window.mousePosition.x = e.clientX;
    window.mousePosition.y = e.clientY;
});

document.addEventListener('DOMContentLoaded', () => {
    // Define scenes configuration - Story about my cat
    const scenes = [
        {
            name: 'My cat is dying',
            class: Scene1
        },
        {
            name: 'Old when I found her',
            class: Scene2
        },
        {
            name: 'What she doesn\'t know',
            class: Scene3
        },
        {
            name: 'Why so many treats',
            class: Scene4
        },
        {
            name: 'Hard to breathe',
            class: Scene5
        },
        {
            name: 'What the pills are for',
            class: Scene6
        },
        {
            name: 'Where I go',
            class: Scene7
        },
        {
            name: 'What I don\'t know',
            class: Scene8
        },
        {
            name: 'Does she think of me',
            class: Scene9
        },
        {
            name: 'How much pain',
            class: Scene10
        },
        {
            name: 'When she will leave',
            class: Scene11
        },
        {
            name: 'We met',
            class: Scene12
        },
        {
            name: 'Love you forever',
            class: Scene13
        }
    ];
    
    // Get the scene container
    const container = document.getElementById('scene-container');
    
    // Check if all required elements exist
    if (!container) {
        console.error('Scene container not found');
        return;
    }
    
    // Matter.js is now imported as a module in physics.js
    
    // Initialize the scene manager
    try {
        const sceneManager = new SceneManager(container, scenes);
        
        // Store reference for debugging
        window.sceneManager = sceneManager;
        
        console.log('Story slideshow initialized successfully');
    } catch (error) {
        console.error('Failed to initialize scene manager:', error);
    }
    
    // Add some helpful keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Press 'R' to reload current scene
        if (e.key === 'r' || e.key === 'R') {
            if (window.sceneManager && !window.sceneManager.isTransitioning) {
                window.sceneManager.loadScene(window.sceneManager.currentSceneIndex);
            }
        }
        
        // Press number keys to jump to specific scenes
        if (e.key >= '1' && e.key <= '9') {
            const sceneIndex = parseInt(e.key) - 1;
            if (window.sceneManager && !window.sceneManager.isTransitioning && sceneIndex < scenes.length) {
                window.sceneManager.loadScene(sceneIndex);
            }
        }
        
        // Press 'H' for help
        if (e.key === 'h' || e.key === 'H') {
            showHelp();
        }
    });
    
    // Help modal
    function showHelp() {
        const existingHelp = document.getElementById('help-modal');
        if (existingHelp) {
            existingHelp.remove();
            return;
        }
        
        const helpModal = document.createElement('div');
        helpModal.id = 'help-modal';
        helpModal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(30, 41, 59, 0.95);
            padding: 30px;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            z-index: 10000;
            max-width: 500px;
        `;
        helpModal.innerHTML = `
            <h3 style="margin-bottom: 20px; color: var(--primary-color);">Keyboard Shortcuts</h3>
            <div style="line-height: 1.8;">
                <p><strong>Click dots on left:</strong> Navigate between scenes</p>
                <p><strong>1-9:</strong> Jump to specific scene</p>
                <p><strong>R:</strong> Reload current scene</p>
                <p><strong>H:</strong> Toggle this help menu</p>
                <p><strong>ESC:</strong> Close this menu</p>
            </div>
            <button onclick="this.parentElement.remove()" style="
                margin-top: 20px;
                padding: 10px 20px;
                background: var(--primary-color);
                border: none;
                border-radius: 6px;
                color: white;
                cursor: pointer;
            ">Close</button>
        `;
        document.body.appendChild(helpModal);
        
        // Close on ESC
        const closeOnEsc = (e) => {
            if (e.key === 'Escape') {
                helpModal.remove();
                document.removeEventListener('keydown', closeOnEsc);
            }
        };
        document.addEventListener('keydown', closeOnEsc);
    }
    
    // Performance monitoring (optional)
    if (window.location.hash === '#debug') {
        const stats = document.createElement('div');
        stats.id = 'stats';
        stats.style.cssText = `
            position: fixed;
            top: 10px;
            left: 10px;
            background: rgba(0, 0, 0, 0.7);
            color: #0f0;
            padding: 5px 10px;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
        `;
        document.body.appendChild(stats);
        
        let lastTime = performance.now();
        let frames = 0;
        
        function updateStats() {
            frames++;
            const currentTime = performance.now();
            if (currentTime >= lastTime + 1000) {
                stats.textContent = `FPS: ${Math.round(frames * 1000 / (currentTime - lastTime))}`;
                frames = 0;
                lastTime = currentTime;
            }
            requestAnimationFrame(updateStats);
        }
        updateStats();
    }
});