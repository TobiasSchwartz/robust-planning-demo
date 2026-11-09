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

    setupIdleReset();
}

// Unattended screen: reload when nobody touches it for a while
function setupIdleReset() {
    let lastInput = Date.now();
    const markActive = () => { lastInput = Date.now(); };

    ["pointerdown", "pointermove", "touchstart", "keydown"].forEach((type) =>
        document.addEventListener(type, markActive, { capture: true, passive: true })
    );

    setInterval(() => {
        if (gameEngine.state.phase === "intro") {
            lastInput = Date.now();
        } else if (Date.now() - lastInput >= UI_CONFIG.IDLE_RESET_MS) {
            gameEngine.resetGame();
        }
    }, 1000);
}

// p5.js draw function - called continuously
function draw() {
    // Clear background
    background(UI_CONFIG.COLORS.BACKGROUND);

    // Draw game state
    gameRenderer.draw(gameEngine.state);

    // Only draw GUI elements after game has started
    if (gameEngine.state.phase !== "intro") {
        drawGui();
    }
    if (gameEngine.state.phase === "planning") {
        gameRenderer.drawCategoryLabels(gameEngine.state);
    }
}

// Handle window resizing
function windowResized() {
    resizeCanvas(UI_CONFIG.CANVAS.WIDTH, UI_CONFIG.CANVAS.HEIGHT);
    if (gameRenderer) {
        gameRenderer.handleResize();
    }
}