const UI_CONFIG = {
    CANVAS: {
      WIDTH: 1600,
      HEIGHT: 800,
      PADDING: 20,
    },
    // Reload the game after this long without input (not on the intro screen)
    IDLE_RESET_MS: 90000,
    LAYOUT: {
      // Two-panel layout with prominent center
      INFO_PANEL: {
        X: 20,
        Y: 20,
        WIDTH: 380,
        HEIGHT: 760
      },
      MAIN_PANEL: {
        X: 420,
        Y: 20,
        WIDTH: 1160,  // Increased width since we removed right panel
        HEIGHT: 760
      },
      // Vertical spacing within main panel
      CATEGORY_TOP: 40,
      OPTIONS_TOP: 250,
    },
    BUTTON: {
      CATEGORY: {
        WIDTH: 340,  // Even bigger now that we have more space
        HEIGHT: 100,
        SPACING: 30  // More spacing between categories
      },
      OPTION: {
        WIDTH: 300,
        HEIGHT: 80,
        COLUMNS: 1,
        VERTICAL_SPACING: 100
      },
      EVALUATE: {
        WIDTH: 300,
        HEIGHT: 60
      }
    },
    // p5 quotes a font name that contains whitespace, so a stack must not contain any
    FONTS: {
      HEADING: "Arial,Helvetica,sans-serif",
      BODY: "Helvetica,Arial,sans-serif"
    },
    COLORS: {
      BACKGROUND: "#1a1a2e",
      PANEL_BG: "#162447",
      BUTTON: {
        DEFAULT: "#314872",
        SELECTED: "#5f6f91",
        DISABLED: "#162447",
        HOVER: "#46659f",
        ACTIVE: "#263d6b",
        // The one forward action per screen, same as COLORS.HIGHLIGHT
        PRIMARY: "#e43f5a",
        PRIMARY_HOVER: "#c72f4b",
        PRIMARY_ACTIVE: "#b52a44"
      },
      TEXT: "#ffffff",
      TEXT_SECONDARY: "#a0a0c0",  // For less important text
      TEXT_CAPTION: "#c9d0e8",    // Small text on button fills
      LINE: "#314872",
      HIGHLIGHT: "#e43f5a",
      ERROR: "#FF5252",
      CON: "#ff8a8a"              // Soft red for the downsides of an option
    }
  };
  
  // Updated layout helpers
  const getLayout = {
    categoryButtonsGroup: () => {
      const totalWidth = UI_CONFIG.BUTTON.CATEGORY.WIDTH * 3 + 
                        UI_CONFIG.BUTTON.CATEGORY.SPACING * 2;
      return {
        startX: UI_CONFIG.LAYOUT.MAIN_PANEL.X + 
                (UI_CONFIG.LAYOUT.MAIN_PANEL.WIDTH - totalWidth) / 2,
        y: UI_CONFIG.LAYOUT.MAIN_PANEL.Y + UI_CONFIG.LAYOUT.CATEGORY_TOP
      };
    },
  
    optionButtons: (categoryIndex) => {
      const group = getLayout.categoryButtonsGroup();
      const categoryX = group.startX + 
                       (UI_CONFIG.BUTTON.CATEGORY.WIDTH + UI_CONFIG.BUTTON.CATEGORY.SPACING) * 
                       categoryIndex;
      const startX = categoryX - UI_CONFIG.BUTTON.OPTION.WIDTH/2 + UI_CONFIG.BUTTON.CATEGORY.WIDTH/2;
      const startY = UI_CONFIG.LAYOUT.MAIN_PANEL.Y + UI_CONFIG.LAYOUT.OPTIONS_TOP;
      
      return {
        startX,
        startY,
        getPosition: (optionIndex) => {
          const row = Math.floor(optionIndex / UI_CONFIG.BUTTON.OPTION.COLUMNS);
          const col = optionIndex % UI_CONFIG.BUTTON.OPTION.COLUMNS;
          return {
            x: startX + col * (UI_CONFIG.BUTTON.OPTION.WIDTH + 20),
            y: startY + row * UI_CONFIG.BUTTON.OPTION.VERTICAL_SPACING
          };
        }
      };
    },
  
    evaluateButton: () => ({
      x: UI_CONFIG.LAYOUT.MAIN_PANEL.X + 
         (UI_CONFIG.LAYOUT.MAIN_PANEL.WIDTH - UI_CONFIG.BUTTON.EVALUATE.WIDTH) / 2,
      y: UI_CONFIG.LAYOUT.MAIN_PANEL.Y + UI_CONFIG.LAYOUT.MAIN_PANEL.HEIGHT - 
         UI_CONFIG.BUTTON.EVALUATE.HEIGHT - 20
    })
  };