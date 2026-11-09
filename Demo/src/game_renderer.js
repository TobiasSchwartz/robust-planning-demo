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
    this._lastPhase = null; // Track last phase for proper button management

    // Subscribe to game state changes
    this.gameEngine.subscribe((state) => this.handleStateUpdate(state));
  }

  setup() {
    // Create start button
    const startBtn = document.createElement('button');
    startBtn.className = 'start-button';
    startBtn.textContent = GAME_DATA.INTRO.button_text;

    // Handle both mouse and touch events for better compatibility
    const startHandler = () => this.startGame();
    startBtn.onclick = startHandler;
    startBtn.ontouchend = (e) => {
      e.preventDefault(); // Prevent ghost click
      startHandler();
    };

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
    // When entering summary, event or result phase, clear all buttons
    if (state.phase === "summary") {
      this.buttonManager.removeAll();

      const layout = getLayout.evaluateButton();
      const buttonGap = 20;
      const backButtonWidth = 200;

      // Add "Zurück" button (left side)
      this.buttonManager.createMyButton(
        "backToPlanning",
        "← Zurück",
        layout.x - backButtonWidth - buttonGap,
        layout.y,
        backButtonWidth,
        UI_CONFIG.BUTTON.EVALUATE.HEIGHT,
        () => this.gameEngine.dispatch("BACK_TO_PLANNING")
      );

      // Add "Zum Festival" button (right side)
      this.buttonManager.createPrimaryButton(
        "continueToEvent",
        "Zum Festival! →",
        layout.x + UI_CONFIG.BUTTON.EVALUATE.WIDTH + buttonGap,
        layout.y,
        UI_CONFIG.BUTTON.EVALUATE.WIDTH,
        UI_CONFIG.BUTTON.EVALUATE.HEIGHT,
        () => this.gameEngine.dispatch("CONTINUE_TO_EVENT")
      );
    }
    else if (state.phase === "event") {
      this.buttonManager.removeAll();

      // Add only the continue button
      const layout = getLayout.evaluateButton();
      this.continueButton = this.buttonManager.createPrimaryButton(
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
      this.buttonManager.createPrimaryButton(
        "reset",
        "Nochmal probieren?",
        layout.x,
        layout.y,
        UI_CONFIG.BUTTON.EVALUATE.WIDTH,
        UI_CONFIG.BUTTON.EVALUATE.HEIGHT,
        () => this.gameEngine.dispatch("RESET_GAME")
      );

      // Info button linking to the poster
      const infoButton = this.buttonManager.createMyButton(
        "finalStage",
        "?",
        layout.x,
        layout.y,
        64,
        64,
        () => window.open("https://github.com/TobiasSchwartz/robust-planning-demo/blob/b075fec6d61dce6c48e37a771c7a681c7327058a/poster_ki-erlebnistag.pdf")
      );

      infoButton.setStyle("rounding", 32);
      infoButton.setStyle("textSize", 32);
      infoButton.setStyle("fillBg", "#23304f");
      infoButton.setStyle("fillLabel", UI_CONFIG.COLORS.TEXT);
    }
    else if (state.phase === "planning") {
      // If returning to planning from another phase, recreate buttons
      if (this._lastPhase && this._lastPhase !== "planning") {
        this.buttonManager.removeAll();
        this.createInitialButtons();
      }

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

    // Track current phase for next update
    this._lastPhase = state.phase;

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

      const button = this.buttonManager.createMyButton(
        category.id,
        `${category.icon} ${category.name}`,
        x,
        categoryLayout.y,
        UI_CONFIG.BUTTON.CATEGORY.WIDTH,
        UI_CONFIG.BUTTON.CATEGORY.HEIGHT,
        () => this.gameEngine.dispatch("SELECT_CATEGORY", category.id)
      );
      // A category button has category === id, an option button has category !== id
      button.category = category.id;
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

        case "summary":
            this.drawSummaryPhase(state);
            break;

        case "event":
            this.drawEventPanel(state);
            break;

        case "result":
            this.drawEventPanel(state);
            break;
    }
  }

  // Category buttons with a chosen option: small category caption above, the option as main line.
  // p5.touchgui draws one label in one style, so this is drawn on top after drawGui().
  drawCategoryLabels(state) {
    const { p5 } = this;
    const maxWidth = UI_CONFIG.BUTTON.CATEGORY.WIDTH - 32;

    this.categories.forEach((category) => {
      const chosen = this.options[category.id][state.selections[category.id]];
      const button = this.buttonManager.getButton(category.id);
      if (!chosen || !button || !button.visible) return;

      // The caption sits on the default fill, the open and hovered fills are lighter
      const onDefaultFill = !button.selected && !button._hover && !button._active;
      const centerX = button.x + button.width / 2;

      p5.push();
      p5.noStroke();
      p5.textFont(UI_CONFIG.FONTS.HEADING);
      p5.textAlign(p5.CENTER, p5.CENTER);

      p5.drawingContext.letterSpacing = "1px";
      p5.textSize(16);
      p5.fill(onDefaultFill ? UI_CONFIG.COLORS.TEXT_CAPTION : UI_CONFIG.COLORS.TEXT);
      p5.text(category.name.toUpperCase(), centerX, button.y + 27);
      p5.drawingContext.letterSpacing = "0px";

      const mainText = `${chosen.icon} ${chosen.name}`;
      let size = 30;
      p5.textSize(size);
      while (size > 16 && p5.textWidth(mainText) > maxWidth) {
        p5.textSize(--size);
      }
      p5.fill(UI_CONFIG.COLORS.TEXT);
      p5.text(mainText, centerX, button.y + 63);
      p5.pop();
    });
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
      p5.text(`${option.icon ? option.icon + " " : ""}${option.name}`, x, y_title);

      // Cost
      p5.textSize(20);
      p5.fill(UI_CONFIG.COLORS.HIGHLIGHT);
      p5.text(`Preis: ${option.costLabel ?? `${option.cost}€`}`, x, y_info_text+30);

      // Description
      p5.fill(UI_CONFIG.COLORS.TEXT);
      p5.textSize(20);
      p5.textLeading(26);
      p5.text(option.description, x, y_info_text + 60, text_width);

      // Pros
      if (option.pro) {
        p5.textSize(20);
        p5.fill("#52E08C");
        p5.text("✓ Vorteile:", x, y_info_text + 180);
        
        p5.fill(UI_CONFIG.COLORS.TEXT);
        p5.textSize(18);
        option.pro.forEach((pro, index) => {
          p5.text(`• ${pro}`, x + 10, y_info_text + 210 + index * 28);
        });
      }

      // Cons
      if (option.con) {
        p5.textSize(20);
        p5.fill(UI_CONFIG.COLORS.ERROR);
        p5.text("✗ Nachteile:", x, y_info_text + 310);
        
        p5.fill(UI_CONFIG.COLORS.TEXT);
        p5.textSize(18);
        option.con.forEach((con, index) => {
          p5.text(`• ${con}`, x + 10, y_info_text + 340 + index * 28);
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
      
      // Hint under the blurb: restriction reasons for the open category, or a short nudge
      let hintText = "";
      let reasonCount = 0;
      if (state.selectedCategory) {
          hintText = "Wähle eine Option für mehr Informationen.";
          // One reason per restriction that disables something in the current category
          const covered = new Set();
          const relevantRestrictions = this.buttonManager.getActiveRestrictions(state.selections)
              .filter(({ disabled }) => {
                  const inCategory = disabled.filter(key => key.startsWith(state.selectedCategory + "."));
                  const isNew = inCategory.some(key => !covered.has(key));
                  inCategory.forEach(key => covered.add(key));
                  return isNew;
              })
              .map(({ reason }) => `• ${reason}`);

          reasonCount = relevantRestrictions.length;
          if (relevantRestrictions.length > 0) {
              // Tighter spacing when several reasons have to fit into the panel
              hintText = "Nicht verfügbar:\n\n" + relevantRestrictions.join(relevantRestrictions.length > 2 ? "\n" : "\n\n");
          }
      }


      // Smaller text when several reasons have to fit above "Ausgegeben"
      p5.textSize(reasonCount > 2 ? 20 : 24);
      p5.textLeading(reasonCount > 2 ? 26 : 31);
      p5.text(
        GAME_DATA.CATEGORY_DESCRIPTIONS[state.selectedCategory || "default"] 
        + (hintText ? "\n\n" + hintText : ""),
        x,
        y_info_text,
        text_width
      );

      
      p5.textSize(20);
      p5.fill(UI_CONFIG.COLORS.TEXT_SECONDARY);
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

      const headingFont = UI_CONFIG.FONTS.HEADING;
      const bodyFont = UI_CONFIG.FONTS.BODY;
      const cardRadius = 24;
      const surfacePadding = 36;
      const cardGap = 28;
      const cardPadding = 24;

      const contentX = panelX + surfacePadding;
      const contentY = panelY + surfacePadding;
      const contentWidth = panelWidth - surfacePadding * 2;

      const outcomeHeight = 236;

      const cardBg = p5.color(18, 32, 65);
      cardBg.setAlpha(235);

      const accent = this.getResultColor(state);
      const textPrimary = p5.color(UI_CONFIG.COLORS.TEXT);
      const textSoft = p5.color(UI_CONFIG.COLORS.TEXT_CAPTION);
      const textMuted = p5.color(UI_CONFIG.COLORS.TEXT_SECONDARY);

      // Outcome card
      p5.fill(cardBg);
      p5.noStroke();
      p5.rect(contentX, contentY, contentWidth, outcomeHeight, cardRadius);

      const emoji = state.eventResult.survived ? "🎉" : "⚠️";
      const statusHeadline = state.eventResult.survived
        ? "Festival gemeistert!"
        : state.event.failHeadline || "Festival gescheitert";

      p5.textAlign(p5.LEFT, p5.TOP);
      p5.textFont(headingFont);
      p5.textSize(64);
      p5.fill(textPrimary);
      p5.text(emoji, contentX + cardPadding, contentY + cardPadding - 6);

      p5.textStyle(p5.BOLD);
      p5.textSize(40);
      p5.fill(accent);
      p5.text(statusHeadline, contentX + cardPadding + 84, contentY + cardPadding - 2);
      p5.textStyle(p5.NORMAL);

      p5.textFont(bodyFont);
      p5.fill(textSoft);
      p5.textSize(28);
      p5.text(state.event.name, contentX + cardPadding + 84, contentY + cardPadding + 52);

      p5.fill(textPrimary);
      p5.textSize(this.fitMessageSize(state.eventResult.message, contentWidth - cardPadding * 2, 30, 26));
      p5.textLeading(40);
      p5.text(
        state.eventResult.message,
        contentX + cardPadding,
        contentY + cardPadding + 108,
        contentWidth - cardPadding * 2
      );

      // Column layout, the restart button sits inside the panel below the cards
      const buttonPadding = 24;
      const buttonY = panelY + panelHeight - buttonPadding - UI_CONFIG.BUTTON.EVALUATE.HEIGHT;
      const columnsTop = contentY + outcomeHeight + cardGap;
      const columnHeight = buttonY - 20 - columnsTop;
      const columnWidth = (contentWidth - cardGap) / 2;

      const leftX = contentX;
      const rightX = contentX + columnWidth + cardGap;

      // Card titles share one baseline, the content starts below it
      const titleBaseline = columnsTop + cardPadding + 28;
      const cardContentTop = columnsTop + cardPadding + 50;
      const cardContentBottom = columnsTop + columnHeight - cardPadding;

      // Left column: robustness insights
      p5.fill(cardBg);
      p5.rect(leftX, columnsTop, columnWidth, columnHeight, cardRadius);

      const leftInnerX = leftX + cardPadding;

      p5.textAlign(p5.LEFT, p5.BASELINE);
      p5.textFont(headingFont);
      p5.textStyle(p5.BOLD);
      p5.textSize(30);
      p5.fill(textPrimary);
      p5.text("Robustheits-Check", leftInnerX, titleBaseline);
      p5.textStyle(p5.NORMAL);

      // Robustness gauge with text beside it
      const gaugeRadius = 52;
      const gaugeCenterX = leftInnerX + gaugeRadius + 6;
      const gaugeCenterY = (cardContentTop + cardContentBottom) / 2;

      p5.noFill();
      p5.strokeWeight(12);
      const trackColor = p5.color(255, 255, 255, 35);
      p5.stroke(trackColor);
      p5.arc(gaugeCenterX, gaugeCenterY, gaugeRadius * 2, gaugeRadius * 2, -p5.HALF_PI, p5.HALF_PI * 3);

      const survivalShare = Math.max(0, Math.min(1, state.survivalShare || 0));
      const verdict = this.getRobustnessVerdict(survivalShare);
      const sweep = survivalShare * p5.TWO_PI;
      p5.stroke(verdict.color);
      p5.arc(
        gaugeCenterX,
        gaugeCenterY,
        gaugeRadius * 2,
        gaugeRadius * 2,
        -p5.HALF_PI,
        -p5.HALF_PI + sweep
      );

      p5.noStroke();
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.textFont(bodyFont);
      p5.textSize(16);
      p5.fill(textMuted);
      p5.text("Robustheit", gaugeCenterX, gaugeCenterY);

      const gaugeInfoX = gaugeCenterX + gaugeRadius + 30;
      const gaugeInfoWidth = columnWidth - (gaugeInfoX - leftX) - cardPadding;

      p5.textAlign(p5.LEFT, p5.TOP);
      p5.textFont(headingFont);
      p5.textStyle(p5.BOLD);
      p5.textSize(32);
      p5.fill(textPrimary);
      p5.text(
        verdict.heading,
        gaugeInfoX,
        gaugeCenterY - 56,
        gaugeInfoWidth
      );
      p5.textStyle(p5.NORMAL);

      p5.textFont(bodyFont);
      p5.textSize(22);
      p5.textLeading(28);
      p5.fill(textSoft);
      p5.text(
        verdict.sentence,
        gaugeInfoX,
        gaugeCenterY - 56 + 42,
        gaugeInfoWidth
      );

      // Right column: plan overview
      p5.fill(cardBg);
      p5.rect(rightX, columnsTop, columnWidth, columnHeight, cardRadius);

      const rightInnerX = rightX + cardPadding;

      p5.textAlign(p5.LEFT, p5.BASELINE);
      p5.textFont(headingFont);
      p5.textStyle(p5.BOLD);
      p5.textSize(30);
      p5.fill(textPrimary);
      p5.text("Deine Auswahl", rightInnerX, titleBaseline);

      const selectionEntries = GAME_DATA.CATEGORIES
        .map(category => {
          const choiceId = state.selections[category.id];
          const option = choiceId ? GAME_DATA.OPTIONS[category.id]?.[choiceId] : null;
          return option ? { category, option } : null;
        })
        .filter(Boolean);

      const totalCost = Object.entries(state.selections).reduce((sum, [category, choiceId]) => {
        const option = GAME_DATA.OPTIONS[category]?.[choiceId];
        return option ? sum + option.cost : sum;
      }, 0);

      // Total sits on the title line, aligned with the right edge of the tile grid
      const tileGap = 16;
      const gridWidth = columnWidth - cardPadding * 2;
      const totalRight = rightInnerX + gridWidth;
      const totalAmount = `${totalCost}€`;
      p5.textAlign(p5.RIGHT, p5.BASELINE);
      p5.text(totalAmount, totalRight, titleBaseline);
      const totalAmountWidth = p5.textWidth(totalAmount);
      p5.textStyle(p5.NORMAL);
      p5.textFont(bodyFont);
      p5.textSize(22);
      p5.fill(textSoft);
      p5.text("Gesamtkosten:", totalRight - totalAmountWidth - 12, titleBaseline);

      const listTop = cardContentTop;
      p5.textAlign(p5.LEFT, p5.TOP);

      if (selectionEntries.length === 0) {
        p5.textFont(bodyFont);
        p5.textSize(22);
        p5.fill(textMuted);
        p5.text("Keine Auswahl getroffen.", rightInnerX, listTop);
      } else {
        const columnsCount = Math.min(3, Math.max(1, selectionEntries.length));
        const tileWidth = (gridWidth - tileGap * (columnsCount - 1)) / columnsCount;
        const tileHeight = cardContentBottom - listTop;
        const tilePadding = 12;

        // One name size for all tiles, it gets smaller instead of wrapping onto the price
        p5.textFont(headingFont);
        const nameSize = this.fitTextSize(
          selectionEntries.map(entry => entry.option.name),
          26,
          16,
          tileWidth - tilePadding * 2
        );

        selectionEntries.forEach((entry, index) => {
          const row = Math.floor(index / columnsCount);
          const col = index % columnsCount;
          const tileX = rightInnerX + col * (tileWidth + tileGap);
          const tileY = listTop + row * (tileHeight + tileGap);

          p5.fill(255, 255, 255, 18);
          p5.rect(tileX, tileY, tileWidth, tileHeight, 14);

          p5.textAlign(p5.LEFT, p5.TOP);
          p5.textFont(bodyFont);
          p5.textSize(16);
          p5.fill(textMuted);
          p5.text(entry.category.name.toUpperCase(), tileX + tilePadding, tileY + tilePadding);

          p5.textFont(headingFont);
          p5.textSize(nameSize);
          p5.fill(textPrimary);
          p5.text(entry.option.name, tileX + tilePadding, tileY + tilePadding + 28);

          p5.textAlign(p5.LEFT, p5.BOTTOM);
          p5.textFont(bodyFont);
          p5.textStyle(p5.BOLD);
          p5.textSize(22);
          p5.fill(textSoft);
          p5.text(entry.option.costLabel ?? `${entry.option.cost}€`, tileX + tilePadding, tileY + tileHeight - tilePadding);
          p5.textStyle(p5.NORMAL);
        });
      }

      // Event recap is already present in the hero card, so we keep the summary focused here.

      // Buttons
      const resetButton = this.buttonManager.getButton("reset");
      const finalButton = this.buttonManager.getButton("finalStage");

      if (resetButton) {
        resetButton.y = buttonY;
        resetButton.x = (this.p5.width - UI_CONFIG.BUTTON.EVALUATE.WIDTH) / 2;
      }

      if (finalButton) {
        const infoMargin = 24;
        finalButton.x = UI_CONFIG.LAYOUT.MAIN_PANEL.X + UI_CONFIG.LAYOUT.MAIN_PANEL.WIDTH - finalButton.width - infoMargin;
        finalButton.y = UI_CONFIG.LAYOUT.MAIN_PANEL.Y + UI_CONFIG.LAYOUT.MAIN_PANEL.HEIGHT - finalButton.height - infoMargin;

        const mouseOverInfo =
          this.p5.mouseX >= finalButton.x &&
          this.p5.mouseX <= finalButton.x + finalButton.width &&
          this.p5.mouseY >= finalButton.y &&
          this.p5.mouseY <= finalButton.y + finalButton.height;

        if (mouseOverInfo) {
          const tooltipText = "Du willst mehr verstehen?";
          const tooltipPadding = 10;
          this.p5.textFont(bodyFont);
          this.p5.textSize(14);
          const tooltipWidth = this.p5.textWidth(tooltipText) + tooltipPadding * 2;
          const tooltipHeight = 28;
        const tooltipX = finalButton.x - tooltipWidth - 12;
        const tooltipY = finalButton.y + finalButton.height / 2 - tooltipHeight / 2;

          this.p5.fill(18, 32, 65, 230);
          this.p5.noStroke();
          this.p5.rect(tooltipX, tooltipY, tooltipWidth, tooltipHeight, 10);

          this.p5.fill(UI_CONFIG.COLORS.TEXT);
          this.p5.textAlign(this.p5.LEFT, this.p5.CENTER);
          this.p5.text(tooltipText, tooltipX + tooltipPadding, tooltipY + tooltipHeight / 2);
          this.p5.textAlign(this.p5.LEFT, this.p5.TOP);
        }
      }
    }

    p5.pop();
  }

  drawSummaryPhase(state) {
    const p5 = this.p5;

    // Full screen overlay similar to result phase
    const panelWidth = p5.width * 0.82;
    const panelHeight = p5.height * 0.82;
    const panelX = (p5.width - panelWidth) / 2;
    const panelY = (p5.height - panelHeight) / 2;

    // Draw semi-transparent overlay
    p5.push();
    const overlayColor = p5.color(UI_CONFIG.COLORS.PANEL_BG);
    overlayColor.setAlpha(240);
    p5.fill(overlayColor);
    p5.stroke(UI_CONFIG.COLORS.LINE);
    p5.strokeWeight(4);
    p5.rect(panelX, panelY, panelWidth, panelHeight, 24);
    p5.noStroke();

    // Constants
    const headingFont = UI_CONFIG.FONTS.HEADING;
    const bodyFont = UI_CONFIG.FONTS.BODY;
    const cardRadius = 24;
    const surfacePadding = 36;
    const cardGap = 28;
    const cardPadding = 24;

    const contentX = panelX + surfacePadding;
    const contentY = panelY + surfacePadding;
    const contentWidth = panelWidth - surfacePadding * 2;

    const cardBg = p5.color(18, 32, 65);
    cardBg.setAlpha(235);

    const textPrimary = p5.color(UI_CONFIG.COLORS.TEXT);
    const textSoft = p5.color(UI_CONFIG.COLORS.TEXT_CAPTION);
    const textMuted = p5.color(UI_CONFIG.COLORS.TEXT_SECONDARY);
    const proColor = p5.color("#52E08C");
    const conColor = p5.color(UI_CONFIG.COLORS.CON);

    const selectionEntries = GAME_DATA.CATEGORIES
      .map(category => {
        const choiceId = state.selections[category.id];
        const option = choiceId ? GAME_DATA.OPTIONS[category.id]?.[choiceId] : null;
        return option ? { category, option } : null;
      })
      .filter(Boolean);

    const clampText = (text = "", maxChars = 110) => {
      if (!text) return "";
      return text.length > maxChars ? `${text.slice(0, maxChars - 1)}…` : text;
    };

    // Top heading
    const instructionsHeight = 60;
    p5.textAlign(p5.LEFT, p5.TOP);
    p5.textFont(headingFont);
    p5.textStyle(p5.BOLD);
    p5.textSize(38);
    p5.fill(textPrimary);
    p5.text("Letzter Check vor dem Festival", contentX, contentY);
    p5.textStyle(p5.NORMAL);

    // Buttons sit inside the panel, the columns end above them
    const buttonPadding = 24;
    const buttonY = panelY + panelHeight - buttonPadding - UI_CONFIG.BUTTON.EVALUATE.HEIGHT;

    // Main area split into two columns like the final overview
    const columnsTop = contentY + instructionsHeight;
    const columnsHeight = buttonY - 20 - columnsTop;
    const leftWidth = (contentWidth - cardGap) * 0.62;
    const rightWidth = contentWidth - leftWidth - cardGap;

    // Card titles share one baseline, the content starts below it
    const titleBaseline = columnsTop + cardPadding + 28;
    const contentTop = columnsTop + cardPadding + 50;
    const contentBottom = columnsTop + columnsHeight - cardPadding;

    // LEFT: Selection grid
    p5.fill(cardBg);
    p5.rect(contentX, columnsTop, leftWidth, columnsHeight, cardRadius);

    const leftInnerX = contentX + cardPadding;
    const gridWidth = leftWidth - cardPadding * 2;

    p5.textAlign(p5.LEFT, p5.BASELINE);
    p5.textFont(headingFont);
    p5.textStyle(p5.BOLD);
    p5.textSize(30);
    p5.fill(textPrimary);
    p5.text("Auswahl-Check", leftInnerX, titleBaseline);

    // Total sits on the title line, aligned with the right edge of the tile grid
    const totalRight = leftInnerX + gridWidth;
    const totalAmount = `${state.spent}€`;
    p5.textAlign(p5.RIGHT, p5.BASELINE);
    p5.text(totalAmount, totalRight, titleBaseline);
    const totalAmountWidth = p5.textWidth(totalAmount);
    p5.textStyle(p5.NORMAL);
    p5.textFont(bodyFont);
    p5.textSize(22);
    p5.fill(textSoft);
    p5.text("Gesamtkosten:", totalRight - totalAmountWidth - 12, titleBaseline);

    const gridStartY = contentTop;
    const tileGap = 18;
    const gridColumns = Math.min(3, Math.max(1, selectionEntries.length || 1));
    const tileWidth = (gridWidth - tileGap * (gridColumns - 1)) / gridColumns;
    const tileHeight = contentBottom - gridStartY;
    const tilePadding = 16;

    // One note size for all tiles, as large as the longest note allows
    const notes = selectionEntries.flatMap(entry => [
      ...(entry.option.pro || []).slice(0, 2).map(point => `+ ${clampText(point, 55)}`),
      ...(entry.option.con || []).slice(0, 2).map(point => `− ${clampText(point, 55)}`)
    ]);
    p5.textFont(bodyFont);
    const noteSize = this.fitTextSize(notes, 20, 16, tileWidth - tilePadding * 2);

    // Same for the names, so all tiles keep one baseline
    p5.textFont(headingFont);
    const nameSize = this.fitTextSize(
      selectionEntries.map(entry => `${entry.option.icon || ""} ${entry.option.name}`),
      28,
      18,
      tileWidth - tilePadding * 2
    );

    selectionEntries.forEach((entry, index) => {
      const row = Math.floor(index / gridColumns);
      const col = index % gridColumns;
      const tileX = leftInnerX + col * (tileWidth + tileGap);
      const tileY = gridStartY + row * (tileHeight + tileGap);

      p5.fill(255, 255, 255, 18);
      p5.rect(tileX, tileY, tileWidth, tileHeight, 14);

      p5.textAlign(p5.LEFT, p5.TOP);
      p5.textFont(bodyFont);
      p5.textSize(16);
      p5.fill(textMuted);
      p5.text(entry.category.name.toUpperCase(), tileX + tilePadding, tileY + tilePadding);

      p5.textFont(headingFont);
      p5.textSize(nameSize);
      p5.fill(textPrimary);
      p5.text(`${entry.option.icon || ""} ${entry.option.name}`, tileX + tilePadding, tileY + tilePadding + 28);

      p5.textFont(bodyFont);
      p5.textStyle(p5.BOLD);
      p5.textSize(24);
      p5.fill(textSoft);
      p5.text(
        entry.option.costLabel ?? `${entry.option.cost}€`,
        tileX + tilePadding,
        tileY + tilePadding + 74
      );
      p5.textStyle(p5.NORMAL);

      // Subtle divider between header and notes
      const dividerY = tileY + tilePadding + 124;
      p5.stroke(255, 255, 255, 30);
      p5.strokeWeight(1);
      p5.line(tileX + tilePadding, dividerY, tileX + tileWidth - tilePadding, dividerY);
      p5.noStroke();

      const proPoints = (entry.option.pro || []).slice(0, 2).map(point => clampText(point, 55));
      const conPoints = (entry.option.con || []).slice(0, 2).map(point => clampText(point, 55));

      const noteStep = noteSize + 14;
      let textCursor = dividerY + 22;

      p5.textFont(bodyFont);
      p5.textSize(noteSize);

      if (proPoints.length > 0) {
        p5.fill(proColor);
        proPoints.forEach(point => {
          p5.text(`+ ${point}`, tileX + tilePadding, textCursor);
          textCursor += noteStep;
        });
      }

      if (conPoints.length > 0) {
        if (proPoints.length > 0) {
          textCursor += 16;
        }
        p5.fill(conColor);
        conPoints.forEach(point => {
          p5.text(`− ${point}`, tileX + tilePadding, textCursor);
          textCursor += noteStep;
        });
      }
    });

    if (selectionEntries.length === 0) {
      p5.textAlign(p5.LEFT, p5.TOP);
      p5.textFont(bodyFont);
      p5.textSize(22);
      p5.fill(textMuted);
      p5.text(
        "Noch keine Auswahl getroffen.",
        leftInnerX,
        gridStartY
      );
    }

    // RIGHT: Risk kinds and plan-B prompt
    const rightX = contentX + leftWidth + cardGap;
    p5.fill(cardBg);
    p5.rect(rightX, columnsTop, rightWidth, columnsHeight, cardRadius);

    const rightInnerX = rightX + cardPadding;
    const rightInnerWidth = rightWidth - cardPadding * 2;

    p5.textAlign(p5.LEFT, p5.BASELINE);
    p5.textFont(headingFont);
    p5.textStyle(p5.BOLD);
    p5.textSize(30);
    p5.fill(textPrimary);
    p5.text("⚠️ Was könnte passieren?", rightInnerX, titleBaseline);
    p5.textStyle(p5.NORMAL);

    const risks = [
      "Wetter",
      "Anreise & Zeitplan",
      "Essen & Trinken",
      "Nachbarn & Überraschungen"
    ];

    // The list is spread over the space above the plan-B line
    const planBSize = 28;
    const planBY = contentBottom - planBSize;
    const planBDividerY = planBY - 26;
    const riskTexts = risks.map(risk => `• ${risk}`);
    p5.textFont(bodyFont);
    const riskSize = this.fitTextSize(riskTexts, 24, 20, rightInnerWidth);
    const riskTop = contentTop + 14;
    const riskStep = Math.min(
      (planBDividerY - 24 - riskTop - riskSize) / (risks.length - 1),
      riskSize + 38
    );

    p5.textAlign(p5.LEFT, p5.TOP);
    p5.fill(textSoft);
    riskTexts.forEach((risk, index) => {
      p5.text(risk, rightInnerX, riskTop + index * riskStep);
    });

    p5.stroke(255, 255, 255, 30);
    p5.strokeWeight(1);
    p5.line(rightInnerX, planBDividerY, rightInnerX + rightInnerWidth, planBDividerY);
    p5.noStroke();

    p5.textFont(headingFont);
    p5.textStyle(p5.BOLD);
    p5.textSize(planBSize);
    p5.fill(textPrimary);
    p5.text("💭 Was ist dein Plan B?", rightInnerX, planBY);
    p5.textStyle(p5.NORMAL);

    // Buttons anchored to box edges
    const backButton = this.buttonManager.getButton("backToPlanning");
    const continueButton = this.buttonManager.getButton("continueToEvent");

    if (backButton) {
      backButton.y = buttonY;
      backButton.x = panelX + buttonPadding;
    }

    if (continueButton) {
      continueButton.y = buttonY;
      continueButton.x = panelX + panelWidth - continueButton.width - buttonPadding;
    }

    p5.pop();
  }

  // Largest size at which the message wraps into at most two lines and no single word is left alone on the second one
  fitMessageSize(message, maxWidth, startSize, minSize) {
    const { p5 } = this;
    for (let size = startSize; size > minSize; size--) {
      p5.textSize(size);
      const lines = [];
      let line = "";
      message.split(" ").forEach(word => {
        const candidate = line ? `${line} ${word}` : word;
        // p5 measures a trial line including the space after the word
        if (line && p5.textWidth(`${candidate} `) > maxWidth) {
          lines.push(line);
          line = word;
        } else {
          line = candidate;
        }
      });
      lines.push(line);
      if (lines.length === 1 || (lines.length === 2 && lines[1].includes(" "))) return size;
    }
    return minSize;
  }

  // Largest size from startSize down to minSize at which all texts fit maxWidth in the current font and style
  fitTextSize(texts, startSize, minSize, maxWidth) {
    const { p5 } = this;
    let size = startSize;
    p5.textSize(size);
    while (size > minSize && texts.some(text => p5.textWidth(text) > maxWidth)) {
      p5.textSize(--size);
    }
    return size;
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

  // Verdict on the share of events the plan survives (0..1), independent of the drawn event
  getRobustnessVerdict(share) {
    const { p5 } = this;
    const VERY_ROBUST_SHARE = 0.85;
    const SOLID_SHARE = 0.6;

    if (share >= VERY_ROBUST_SHARE) {
      return {
        heading: "Sehr robust",
        sentence: "Gut abgesichert - aber kein Plan ist perfekt. Irgendein Ereignis findet immer eine Schwachstelle.",
        color: p5.color("#4CAF50") // Green
      };
    }
    if (share >= SOLID_SHARE) {
      return {
        heading: "Solide",
        sentence: "Gegen vieles gewappnet, aber nicht gegen alles. Wo war dein Plan B?",
        color: p5.color("#FFC107") // Yellow
      };
    }
    return {
      heading: "Anfällig",
      sentence: "Viele mögliche Ereignisse hätten deinen Plan zu Fall gebracht.",
      color: p5.color("#FF5252") // Red
    };
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
    // Only recalculate button positions if game has started
    if (this.gameEngine.state.phase !== "intro") {
      this.buttonManager.removeAll();
      this.createInitialButtons();
      this.handleStateUpdate(this.gameEngine.state);
    }
  }
}
