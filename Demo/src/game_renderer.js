class GameRenderer {
  constructor({ p5, gameEngine, gui }) {
    this.p5 = p5;
    this.gameEngine = gameEngine;
    this.categories = GAME_DATA.CATEGORIES;
    this.options = GAME_DATA.OPTIONS;
    this.buttonManager = new ButtonManager(p5, gui);
    this.introIcons = [];
    // Initialize floating icons for intro
    this.initIntroIcons();
    this.continueButton = null; // continue after event result

    this.eventStartTime = 0;

    // Subscribe to game state changes
    this.gameEngine.subscribe((state) => this.handleStateUpdate(state));
  }

  setup() {
    // Create start button
    const startBtn = document.createElement('button');
    startBtn.className = 'start-button';
    startBtn.textContent = GAME_DATA.INTRO.button_text;
    startBtn.onclick = () => this.startGame();
    document.body.appendChild(startBtn);
    this.startBtn = startBtn;

    // Create title
    const title = document.createElement('div');
    title.className = 'title';
    title.innerHTML = GAME_DATA.INTRO.title;
    document.body.appendChild(title);
    this.titleDiv = title;

    // Create subtitle
    const subtitle = document.createElement('div');
    subtitle.className = 'subtitle';
    subtitle.innerHTML = GAME_DATA.INTRO.subtitle;
    document.body.appendChild(subtitle);
    this.subtitleDiv = subtitle;
  }

  startGame() {
    this.showIntro = false;
    this.gameEngine.dispatch("START_GAME");
    
    // Remove intro elements
    this.startBtn.remove();
    this.titleDiv.remove();
    this.subtitleDiv.remove();
    // Create game buttons
    this.createInitialButtons();
  }

  handleStateUpdate(state) {
    // When entering event or result phase, clear all buttons
    if (state.phase === "event") {
      this.buttonManager.removeAll();

      // Add only the continue button
      const layout = getLayout.evaluateButton();
      this.continueButton = this.buttonManager.createMyButton(
        "continue",
        "Weiter →",
        layout.x,
        layout.y,
        UI_CONFIG.BUTTON.EVALUATE.WIDTH,
        UI_CONFIG.BUTTON.EVALUATE.HEIGHT,
        () => this.gameEngine.dispatch("SHOW_EVENT_RESULT")
      );
    } 
    else if (state.phase === "result") {
      // Clear continue button
      this.buttonManager.removeAll();
      
      // Add restart button
      const layout = getLayout.evaluateButton();
      this.buttonManager.createMyButton(
        "reset",
        "Nochmal Probieren?",
        layout.x,
        layout.y,
        UI_CONFIG.BUTTON.EVALUATE.WIDTH,
        UI_CONFIG.BUTTON.EVALUATE.HEIGHT,
        () => this.gameEngine.dispatch("RESET_GAME")
      );
      const isLastStage = state.currentStage === state.totalStages;

      if (isLastStage) {
        this.buttonManager.createMyButton(
            "finalStage",
            "Mehr Verstehen",
            layout.x + 220,  
            layout.y -60,
            UI_CONFIG.BUTTON.EVALUATE.WIDTH,
            UI_CONFIG.BUTTON.EVALUATE.HEIGHT,
            () => window.open("https://github.com/TobiasSchwartz/robust-planning-demo/blob/b075fec6d61dce6c48e37a771c7a681c7327058a/poster_ki-erlebnistag.pdf") 
        );
      }
    }
    else if (state.phase === "planning") {
      if (state.selectedCategory) {
          // Category is selected, show options
          const categoryOptions = this.options[state.selectedCategory];
          
          // Find the category index for layout calculations
          const categoryIndex = this.categories.findIndex(
            (cat) => cat.id === state.selectedCategory
          );
    
          if (categoryIndex !== -1) {
            // Get the layout helper for this category
            const layout = getLayout.optionButtons(categoryIndex);
    
            // Create option buttons for selected category
            Object.entries(categoryOptions).forEach(([id, option], optionIndex) => {
              // Get exact position for this option button
              const position = layout.getPosition(optionIndex);
              
              this.buttonManager.createOptionButton(
                state.selectedCategory,
                id,
                option,
                position.x,
                position.y,
                UI_CONFIG.BUTTON.OPTION.WIDTH,
                UI_CONFIG.BUTTON.OPTION.HEIGHT,
                () =>
                  this.gameEngine.dispatch("SELECT_OPTION", {
                    category: state.selectedCategory,
                    optionId: id,
                  })
              );
            });
          }
        } else {
        // Category is deselected, hide options
        this.buttonManager.hideAllOptionButtons();
      }
    }

    // Update all button states
    this.buttonManager.updateButtonStates(state);
  }

  initIntroIcons() {
    // Create animated icons for the intro screen
    const icons = ['🎸', '🚗', '🍕', '🎉', '🎶', '🍻', '📀'];
    const offset = 180;
    const noise = 50;
    
    icons.forEach((icon, i) => {
      this.introIcons.push({
        icon,
        x: (i * offset) + this.p5.random(-noise, noise) + this.p5.width * 0.2,
        y: this.p5.random(this.p5.height * 0.6, this.p5.height * 0.8),
        speed: this.p5.random(0.5, 1),
        offset: this.p5.random(0, this.p5.TWO_PI),
        size: this.p5.random(40, 50)
      });
    });
  }

  createInitialButtons() {
    // Get the layout for category buttons
    const categoryLayout = getLayout.categoryButtonsGroup();

    // Create category buttons
    this.categories.forEach((category, index) => {
      const x = categoryLayout.startX + 
                index * (UI_CONFIG.BUTTON.CATEGORY.WIDTH + UI_CONFIG.BUTTON.CATEGORY.SPACING);

      this.buttonManager.createMyButton(
        category.id,
        `${category.icon} ${category.name}`,
        x,
        categoryLayout.y,
        UI_CONFIG.BUTTON.CATEGORY.WIDTH,
        UI_CONFIG.BUTTON.CATEGORY.HEIGHT,
        () => this.gameEngine.dispatch("SELECT_CATEGORY", category.id)
      );
    });

    this.buttonManager.createEvaluateButton(
      "Planung auswerten",
      getLayout.evaluateButton().x,
      getLayout.evaluateButton().y,
      UI_CONFIG.BUTTON.EVALUATE.WIDTH,
      UI_CONFIG.BUTTON.EVALUATE.HEIGHT,
      () => this.gameEngine.dispatch("START_EVALUATION")
    );
  }

  draw(state) {
    // Always draw background
    this.drawBackground();

    switch(state.phase) {
        case "intro":
            this.drawIntro();
            break;
            
        case "planning":
            this.drawPanelBackground();
            this.drawInfoPanel(state);
            this.drawMainPanel(state);
            break;
            
        case "event":
            this.drawEventPanel(state);
            break;
            
        case "result":
            this.drawEventPanel(state);
            break;
    }
  }

  drawIntro() {
    // Draw floating icons
    this.introIcons.forEach(icon => {
      this.p5.push();
      this.p5.textAlign(this.p5.CENTER, this.p5.CENTER);
      this.p5.textSize(icon.size);
      const yOffset = this.p5.sin((this.p5.frameCount * icon.speed + icon.offset) * 0.05) * 15;
      this.p5.text(icon.icon, icon.x, icon.y + yOffset);
      this.p5.pop();
    });
  }

  drawBackground() {
    // Draw background gradient
    const c1 = this.p5.color('#4A148C');
    const c2 = this.p5.color('#311B92');
    for (let y = 0; y < this.p5.height; y++) {
      const inter = y / this.p5.height;
      const c = this.p5.lerpColor(c1, c2, inter);
      this.p5.stroke(c);
      this.p5.line(0, y, this.p5.width, y);
    }
  }

  drawPanelBackground() {
    const { p5 } = this;
    const panelColor = p5.color(UI_CONFIG.COLORS.PANEL_BG);
    panelColor.setAlpha(127);
    p5.fill(panelColor);
    p5.stroke(UI_CONFIG.COLORS.LINE);
    p5.strokeWeight(2);

    // Info panel
    p5.rect(
      UI_CONFIG.LAYOUT.INFO_PANEL.X,
      UI_CONFIG.LAYOUT.INFO_PANEL.Y,
      UI_CONFIG.LAYOUT.INFO_PANEL.WIDTH,
      UI_CONFIG.LAYOUT.INFO_PANEL.HEIGHT,
      10
    );

    // Main panel
    p5.rect(
      UI_CONFIG.LAYOUT.MAIN_PANEL.X,
      UI_CONFIG.LAYOUT.MAIN_PANEL.Y,
      UI_CONFIG.LAYOUT.MAIN_PANEL.WIDTH,
      UI_CONFIG.LAYOUT.MAIN_PANEL.HEIGHT,
      10
    );
  }

  drawConnectionLines(categoryId) {
    const { p5 } = this;
    p5.push();

    const category = this.categories.find((cat) => cat.id === categoryId);
    const categoryOptions = this.options[categoryId];
    const state = this.gameEngine.state;

    // Draw connection lines with animation
    p5.stroke(UI_CONFIG.COLORS.LINE);
    p5.strokeWeight(2);
    p5.noFill();

    Object.entries(categoryOptions).forEach(([id, option], index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;

      const startX = category.x + UI_CONFIG.BUTTON.CATEGORY.WIDTH / 2;
      const startY =
        UI_CONFIG.LAYOUT.CATEGORY_TOP + UI_CONFIG.BUTTON.CATEGORY.HEIGHT;

      const endX = category.x - 100 + col * 200 + 75;
      const endY = UI_CONFIG.LAYOUT.OPTIONS_TOP + row * 100;

      // Draw main connection line
      p5.bezier(
        startX,
        startY,
        startX,
        startY + 50,
        endX,
        endY - 50,
        endX,
        endY
      );

      // Draw highlight if option is selected
      if (state.selections[categoryId] === id) {
        p5.stroke(UI_CONFIG.COLORS.HIGHLIGHT);
        p5.strokeWeight(4);
        p5.bezier(
          startX,
          startY,
          startX,
          startY + 50,
          endX,
          endY - 50,
          endX,
          endY
        );

        // Reset stroke for next line
        p5.stroke(UI_CONFIG.COLORS.LINE);
        p5.strokeWeight(2);
      }
    });

    p5.pop();
  }

  drawInfoPanel(state) {
    const { p5 } = this;
    const panel = UI_CONFIG.LAYOUT.INFO_PANEL;
    
    p5.push();
    p5.fill(UI_CONFIG.COLORS.TEXT);
    p5.noStroke();
    p5.textAlign(p5.LEFT, p5.TOP);

    const y_title = UI_CONFIG.LAYOUT.CATEGORY_TOP + UI_CONFIG.BUTTON.CATEGORY.HEIGHT/2;
    const y_info_text = UI_CONFIG.LAYOUT.OPTIONS_TOP;
    const margin = 30;
    const x = panel.X + margin;
    const text_width = panel.WIDTH - 2 * margin;

    if (state.infoPanel) {
      // Draw selected option information
      const { option } = state.infoPanel;

      // Title
      p5.textSize(30);
      p5.text(option.name, x, y_title);

      // Cost
      p5.textSize(20);
      p5.fill(UI_CONFIG.COLORS.HIGHLIGHT);
      p5.text(`Preis: ${option.cost}€`, x, y_info_text+30);

      // Description
      p5.fill(UI_CONFIG.COLORS.TEXT);
      p5.textSize(20);
      p5.textLeading(24);
      p5.text(option.description, x, y_info_text + 60, panel.WIDTH - 40, text_width);

      // Pros
      if (option.pro) {
        p5.textSize(20);
        p5.fill(UI_CONFIG.COLORS.HIGHLIGHT);
        p5.text("✓ Vorteile:", x, y_info_text + 180);
        
        p5.fill(UI_CONFIG.COLORS.TEXT);
        p5.textSize(16);
        option.pro.forEach((pro, index) => {
          p5.text(`• ${pro}`, x + 10, y_info_text + 210 + index * 25);
        });
      }

      // Cons
      if (option.con) {
        p5.textSize(20);
        p5.fill(UI_CONFIG.COLORS.ERROR);
        p5.text("✗ Nachteile:", x, y_info_text + 310);
        
        p5.fill(UI_CONFIG.COLORS.TEXT);
        p5.textSize(16);
        option.con.forEach((con, index) => {
          p5.text(`• ${con}`, x + 10, y_info_text + 340 + index * 25);
        });
      }
    } else {
      // Draw category information or default instructions
      p5.textSize(30);
      p5.text(
        state.selectedCategory ? 
          GAME_DATA.CATEGORIES.find(c => c.id === state.selectedCategory).name :
          "Wähle eine Kategorie!",
        x,
        y_title
      );
      
      const disabledOptions = this.buttonManager.getDisabledOptions(state.selections);
      const hasDisabledOptions = disabledOptions.length > 0;

      let reason = ".";
      if (state.selectedCategory) {
          const relevantRestrictions = Object.entries(state.selections)
              .filter(([cat, optionId]) => 
                  // Only consider actual selections
                  optionId !== null &&
                  // Get restrictions that affect current category
                  GAME_DATA.DEPENDENCIES.RESTRICTIONS[`${cat}.${optionId}`]?.disables
                      .some(disabled => disabled.startsWith(state.selectedCategory + "."))
              )
              .map(([cat, optionId]) => {
                  const selectedName = GAME_DATA.OPTIONS[cat][optionId].name;
                  const restriction = GAME_DATA.DEPENDENCIES.RESTRICTIONS[`${cat}.${optionId}`];
                  return `• ${restriction.reason}`;
              });

          if (relevantRestrictions.length > 0) {
              reason = ":\n\n" + relevantRestrictions.join("\n\n");
          }
      }
      

      const disabledOptionsText = hasDisabledOptions ?
        `Einige Optionen sind nicht verfügbar${reason}` :
        `Wähle eine Option für mehr Informationen.`;

      p5.textSize(24);
      p5.textLeading(24);
      p5.text(
        GAME_DATA.CATEGORY_DESCRIPTIONS[state.selectedCategory || "default"] 
        + "\n\n" + disabledOptionsText,
        x,
        y_info_text,
        text_width
      );

      
      p5.textSize(20);
      p5.fill(UI_CONFIG.COLORS.HIGHLIGHT);
      p5.text(
        `Ausgegeben: ${state.spent}€`,
        x,
        panel.Y + panel.HEIGHT - 60
      );
    }
    p5.pop();
  }

  drawEventPanel(state) {
    const { p5 } = this;
    p5.push();

    // Full screen overlay mit Fade-In Animation
    p5.fill(0, 0, 0, 127);
    p5.rect(0, 0, p5.width, p5.height);

    // Panel
    const panelWidth = p5.width * 0.8;
    const panelHeight = p5.height * 0.8;
    const panelX = (p5.width - panelWidth) / 2;
    const panelY = (p5.height - panelHeight) / 2;

    p5.push();

    // Pulsierender Glow-Effekt für Event-Phase
    if (state.phase === "event") {
        // Sanftere Pulsation für Event-Phase
        const timeSinceStart = (p5.millis() - this.eventStartTime) * 0.001; // Sekunden
        const pulseIntensity = 15 + Math.sin(timeSinceStart * 2) * 10;
        p5.drawingContext.shadowBlur = pulseIntensity;
        p5.drawingContext.shadowColor = 'rgba(255, 220, 0, 0.5)'; // Goldener Glow
    } else if (state.phase === "result") {
        // Statischer Glow für Result basierend auf Ergebnis
        p5.drawingContext.shadowBlur = 15;
        p5.drawingContext.shadowColor = this.getResultColor(state);
    }

    
    // Dunklerer Hintergrund für besseren Kontrast
    p5.fill(UI_CONFIG.COLORS.PANEL_BG);
    p5.stroke(state.phase === "result" ? this.getResultColor(state) : UI_CONFIG.COLORS.LINE);
    p5.strokeWeight(4);
    p5.rect(panelX, panelY, panelWidth, panelHeight, 30);

    p5.drawingContext.shadowBlur = 0;

    p5.pop();
    // Content mit besserer Textplatzierung
    if (state.phase === "event") {
        // Event announcement - zentriert oben
        p5.fill(UI_CONFIG.COLORS.HIGHLIGHT);
        p5.textSize(56);
        p5.textAlign(p5.CENTER, p5.TOP);
        p5.text("⚡ EREIGNIS ⚡", panelX + panelWidth/2, panelY + 60);
        
        // Event name
        p5.fill(UI_CONFIG.COLORS.TEXT);
        p5.textSize(48);
        p5.text(state.event.name, panelX + panelWidth/2, panelY + 160);
        
        // Event description - linksbündig mit Padding
        p5.textSize(32);
        p5.textAlign(p5.CENTER, p5.TOP);
        p5.textLeading(48);
        const textPadding = 80;
        p5.text(
            state.event.description, 
            panelX + textPadding, 
            panelY + 280,
            panelWidth - (textPadding * 2)
        );

        // Continue Button zentriert unten
        if (this.continueButton) {
            const btnY = panelY + panelHeight - 120;
            this.continueButton.y = btnY;
            this.continueButton.x = panelX + (panelWidth - UI_CONFIG.BUTTON.EVALUATE.WIDTH) / 2;
        }
    } 
    else if (state.phase === "result") {
      // Reset any lingering shadow effects
      p5.drawingContext.shadowBlur = 0;
      p5.drawingContext.shadowColor = 'rgba(0,0,0,0)';
      
      const padding = 40;
      // Two-column layout for result screen
      const colWidth = (panelWidth - padding * 3) / 2;  // Account for padding
      const leftX = panelX + padding;
      const rightX = panelX + panelWidth/2 + padding/2;
      
      // Left column: Result and message
      // Emoji and main result
      p5.textSize(90);
      p5.textAlign(p5.CENTER, p5.TOP);
      p5.text(
        state.eventResult.survived ? "🎉" : "😢",
        leftX + colWidth/2,
        panelY + padding
      );
      
      const resultColor = this.getResultColor(state);
      p5.fill(resultColor);
      p5.textSize(50);
      p5.text(
        state.eventResult.survived ? "Festival überlebt!" : "Festival vorbei!",
        leftX + colWidth/2,
        panelY + padding + 120
      );
      
      // Event result message
      p5.fill(UI_CONFIG.COLORS.TEXT);
      p5.textSize(30);
      p5.textAlign(p5.LEFT, p5.TOP);
      p5.textLeading(48);
      p5.text(
        state.eventResult.message,
        leftX,
        panelY + padding + 240,
        colWidth
      );

      // Right column: Choices summary
      p5.textSize(30);
      p5.fill(UI_CONFIG.COLORS.HIGHLIGHT);
      p5.text(
        "Deine Festival-Planung:",
        rightX,
        panelY + padding
      );

      // Show all choices
      p5.textSize(24);
      p5.fill(UI_CONFIG.COLORS.TEXT);
      let yPos = panelY + padding + 60;

      Object.entries(state.selections).forEach(([category, choiceId]) => {
        const categoryInfo = GAME_DATA.CATEGORIES.find(c => c.id === category);
        const choice = GAME_DATA.OPTIONS[category][choiceId];
        
        p5.text(
          `${categoryInfo.icon} ${categoryInfo.name}:`,
          rightX,
          yPos
        );
        p5.text(
          `${choice.icon} ${choice.name} (${choice.cost}€)`,
          rightX + 30,
          yPos + 40
        );
        yPos += 100;
      });

      // Total cost
      const totalCost = Object.entries(state.selections)
        .reduce((sum, [category, choiceId]) => 
          sum + GAME_DATA.OPTIONS[category][choiceId].cost, 0);

      p5.textSize(30);
      p5.fill(UI_CONFIG.COLORS.HIGHLIGHT);
      p5.text(
        `Gesamtkosten: ${totalCost}€`,
        rightX,
        yPos + 20
      );

      // Quality indicator
      if (state.eventResult.survived) {
        p5.fill(resultColor);
        p5.textSize(32);
        p5.textAlign(p5.CENTER, p5.CENTER);
        const qualityText = {
          'great': '⭐⭐⭐ Perfekt gemeistert!',
          'good': '⭐⭐ Gut gemacht!',
          'rough': '⭐ Knapp geschafft!'
        }[state.eventResult.quality];
        
        p5.text(
          qualityText,
          panelX + panelWidth/2,
          panelY + panelHeight - padding - 90
        );
      }

      // Restart button
      const button = this.buttonManager.getButton("reset");
      if (button) {
        button.y = panelY + panelHeight - padding - 40;
        button.x = panelX + (panelWidth - UI_CONFIG.BUTTON.EVALUATE.WIDTH) / 2;
      }
    }

    p5.pop();
  }

  getResultColor(state) {
    if (!state.eventResult) return this.p5.color(UI_CONFIG.COLORS.LINE);
    
    if (!state.eventResult.survived) {
      return this.p5.color(UI_CONFIG.COLORS.ERROR);
    }
    
    switch(state.eventResult.quality) {
      case 'great':
        return this.p5.color('#4CAF50'); // Green
      case 'good':
        return this.p5.color('#FFC107'); // Yellow
      case 'rough':
        return this.p5.color('#FF9800'); // Orange
      default:
        return this.p5.color(UI_CONFIG.COLORS.LINE);
    }
  }

  drawRobustnessBar(robustness, panelX, panelY, config) {
    const { p5 } = this;
    const robustnessY = panelY + config.HEIGHT - 50;

    p5.textSize(14);
    p5.text("Robustheit:", panelX + 20, robustnessY);

    const barWidth = 180;
    const barHeight = 10;
    const barX = panelX + 100;

    // Background bar
    p5.fill(220);
    p5.rect(barX, robustnessY + 5, barWidth, barHeight, 5);

    // Filled bar
    const fillWidth = (barWidth * robustness) / 10;
    const robustnessColor = this.getRobustnessColor(robustness);
    p5.fill(robustnessColor);
    p5.rect(barX, robustnessY + 5, fillWidth, barHeight, 5);

    // Value
    p5.fill(UI_CONFIG.COLORS.TEXT);
    p5.text(`${robustness}/10`, barX + barWidth + 10, robustnessY);
  }

  getRobustnessColor(value) {
    const { p5 } = this;
    if (value >= 8) return p5.color("#4CAF50"); // Green
    if (value >= 6) return p5.color("#FFC107"); // Yellow
    return p5.color("#FF5252"); // Red
  }

  drawMainPanel(state) {
    // Main panel is handled by ButtonManager
    if (state.selectedCategory) {
      this.drawConnectionLines(state.selectedCategory);
    }
  }

  // Event handlers
  handleOptionHover(x, y) {
    // First, clear all hovers
    this.buttonManager.getAllButtons().forEach(button => {
        this.buttonManager.setButtonHoverState(button, false);
    });

    this.buttonManager.getAllButtons().forEach((button) => {
      if (button.category && button.id !== button.category) {
        const isHovered =
          x >= button.x &&
          x <= button.x + button.width &&
          y >= button.y &&
          y <= button.y + button.height;

        this.buttonManager.setButtonHoverState(button, isHovered);
      }
    });
  }

  // Window resize handling
  handleResize() {
    // Recalculate positions when window is resized
    this.buttonManager.removeAll();
    this.createInitialButtons();
    this.handleStateUpdate(this.gameEngine.state);
  }
}
