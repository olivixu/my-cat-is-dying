class PhysicsWrapper {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.engine = null;
        this.world = null;
        this.render = null;
        this.runner = null;
        this.mouse = null;
        this.mouseConstraint = null;
        this.bodies = [];
        
        this.options = {
            gravity: { x: 0, y: 1 },
            wireframes: false,
            background: 'transparent',
            ...options
        };
        
        this.init();
    }
    
    init() {
        // Create engine
        this.engine = Matter.Engine.create();
        this.world = this.engine.world;
        
        // Set gravity
        this.engine.world.gravity = this.options.gravity;
        
        // Create renderer
        this.render = Matter.Render.create({
            canvas: this.canvas,
            engine: this.engine,
            options: {
                width: this.canvas.width,
                height: this.canvas.height,
                wireframes: this.options.wireframes,
                background: this.options.background,
                showVelocity: false,
                showAngleIndicator: false
            }
        });
        
        // Create runner
        this.runner = Matter.Runner.create();
        
        // Start the renderer and runner
        Matter.Render.run(this.render);
        Matter.Runner.run(this.runner, this.engine);
        
        // Set up mouse control if enabled
        if (this.options.mouseControl) {
            this.setupMouseControl();
        }
        
        // Create boundaries
        if (this.options.boundaries !== false) {
            this.createBoundaries();
        }
    }
    
    setupMouseControl() {
        this.mouse = Matter.Mouse.create(this.canvas);
        this.mouseConstraint = Matter.MouseConstraint.create(this.engine, {
            mouse: this.mouse,
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false
                }
            }
        });
        
        Matter.World.add(this.world, this.mouseConstraint);
        
        // Keep the mouse in sync with rendering
        this.render.mouse = this.mouse;
    }
    
    createBoundaries() {
        const thickness = 50;
        const navHeight = 100; // Account for navigation bar height
        const boundaries = [
            // Bottom (raised to avoid nav overlap)
            this.createRectangle(
                this.canvas.width / 2,
                this.canvas.height - navHeight + thickness / 2,
                this.canvas.width,
                thickness,
                { isStatic: true, label: 'floor' }
            ),
            // Top
            this.createRectangle(
                this.canvas.width / 2,
                -thickness / 2,
                this.canvas.width,
                thickness,
                { isStatic: true, label: 'ceiling' }
            ),
            // Left
            this.createRectangle(
                -thickness / 2,
                this.canvas.height / 2,
                thickness,
                this.canvas.height,
                { isStatic: true, label: 'leftWall' }
            ),
            // Right
            this.createRectangle(
                this.canvas.width + thickness / 2,
                this.canvas.height / 2,
                thickness,
                this.canvas.height,
                { isStatic: true, label: 'rightWall' }
            )
        ];
        
        Matter.World.add(this.world, boundaries);
    }
    
    createRectangle(x, y, width, height, options = {}) {
        const defaults = {
            render: {
                fillStyle: options.color || '#3b82f6',
                strokeStyle: '#1e40af',
                lineWidth: 2
            }
        };
        
        const body = Matter.Bodies.rectangle(x, y, width, height, {
            ...defaults,
            ...options
        });
        
        this.bodies.push(body);
        Matter.World.add(this.world, body);
        return body;
    }
    
    createCircle(x, y, radius, options = {}) {
        const defaults = {
            render: {
                fillStyle: options.color || '#8b5cf6',
                strokeStyle: '#6d28d9',
                lineWidth: 2
            }
        };
        
        const body = Matter.Bodies.circle(x, y, radius, {
            ...defaults,
            ...options
        });
        
        this.bodies.push(body);
        Matter.World.add(this.world, body);
        return body;
    }
    
    createPolygon(x, y, sides, radius, options = {}) {
        const defaults = {
            render: {
                fillStyle: options.color || '#10b981',
                strokeStyle: '#059669',
                lineWidth: 2
            }
        };
        
        const body = Matter.Bodies.polygon(x, y, sides, radius, {
            ...defaults,
            ...options
        });
        
        this.bodies.push(body);
        Matter.World.add(this.world, body);
        return body;
    }
    
    applyForce(body, force) {
        Matter.Body.applyForce(body, body.position, force);
    }
    
    setGravity(x, y) {
        this.engine.world.gravity.x = x;
        this.engine.world.gravity.y = y;
    }
    
    clearBodies() {
        // Remove all non-static bodies
        const bodiesToRemove = this.bodies.filter(body => !body.isStatic);
        Matter.World.remove(this.world, bodiesToRemove);
        this.bodies = this.bodies.filter(body => body.isStatic);
    }
    
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.render.options.width = width;
        this.render.options.height = height;
        this.render.canvas.width = width;
        this.render.canvas.height = height;
    }
    
    cleanup() {
        // Stop the renderer and runner
        if (this.render) {
            Matter.Render.stop(this.render);
        }
        if (this.runner) {
            Matter.Runner.stop(this.runner);
        }
        
        // Clear the world
        Matter.World.clear(this.world);
        Matter.Engine.clear(this.engine);
        
        // Clear references
        this.bodies = [];
        this.engine = null;
        this.world = null;
        this.render = null;
        this.runner = null;
        this.mouse = null;
        this.mouseConstraint = null;
    }
    
    // Utility methods for common physics scenarios
    createBouncyBall(x, y, radius = 20) {
        return this.createCircle(x, y, radius, {
            restitution: 0.9,
            friction: 0.05,
            density: 0.001,
            color: '#fbbf24'
        });
    }
    
    createHeavyBox(x, y, width = 60, height = 60) {
        return this.createRectangle(x, y, width, height, {
            density: 0.01,
            friction: 0.8,
            restitution: 0.2,
            color: '#64748b'
        });
    }
    
    createIceBlock(x, y, width = 80, height = 40) {
        return this.createRectangle(x, y, width, height, {
            friction: 0.01,
            restitution: 0.3,
            density: 0.005,
            color: '#67e8f9',
            render: {
                fillStyle: 'rgba(103, 232, 249, 0.8)',
                strokeStyle: '#06b6d4',
                lineWidth: 2
            }
        });
    }
}