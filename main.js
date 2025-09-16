// Main entry point for Vite bundling
import Matter from 'matter-js';

// Make Matter available globally for compatibility
window.Matter = Matter;

// Import styles
import './css/main.css';
import './css/scenes.css';

// Import core modules
import './js/physics.js';
import './js/sceneManager.js';

// Import all scenes
import './js/scenes/scene1.js';
import './js/scenes/scene2.js';
import './js/scenes/scene3.js';
import './js/scenes/scene4.js';
import './js/scenes/scene5.js';
import './js/scenes/scene6.js';
import './js/scenes/scene7.js';
import './js/scenes/scene8.js';
import './js/scenes/scene9.js';
import './js/scenes/scene10.js';
import './js/scenes/scene11.js';
import './js/scenes/scene12.js';
import './js/scenes/scene13.js';

// Import app initialization
import './js/app.js';