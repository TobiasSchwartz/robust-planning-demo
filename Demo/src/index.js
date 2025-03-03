let gameEngine;
let gameRenderer;
let gui;

// p5.js setup function - called once at startup
function setup() {
    // Create canvas
    createCanvas(UI_CONFIG.CANVAS.WIDTH, UI_CONFIG.CANVAS.HEIGHT);
    
    // Initialize GUI
    gui = createGui();
    
    // Initialize game components
    gameEngine = new GameEngine();
    
    gameRenderer = new GameRenderer({
        p5: window,
        gameEngine: gameEngine,
        gui: gui
    });
    
    // Initial setup
    gameRenderer.setup();
}

// p5.js draw function - called continuously
function draw() {
    // Clear background
    background(UI_CONFIG.COLORS.BACKGROUND);
    
    // Draw game state
    gameRenderer.draw(gameEngine.state);
    
    // Draw GUI elements
    drawGui();
}

// Handle window resizing
function windowResized() {
    resizeCanvas(UI_CONFIG.CANVAS.WIDTH, UI_CONFIG.CANVAS.HEIGHT);
    if (gameRenderer) {
        gameRenderer.handleResize();
    }
}