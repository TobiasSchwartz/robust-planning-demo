class ButtonManager {
    constructor(p5Instance, gui) {
      this.p5 = p5Instance;
      this.gui = gui;
      this.buttons = new Map();
    }

    createMyButton(id, label, x, y, width, height, onClick) {
      const button = createButton(label, x, y, width, height);
      button.onPress = onClick;
      button.setStyle("fillBg", UI_CONFIG.COLORS.BUTTON.DEFAULT);
      button.setStyle("rounding", 10);
      button.setStyle("textSize", 30);
      
      button.id = id;
      button.x = x;
      button.y = y;
      button.width = width;
      button.height = height;

      this.buttons.set(id, button);
      return button;
    }
  
    createEvaluateButton(label, x, y, width, height, onClick) {
      const button = this.createMyButton("evaluate", label, x, y, width, height, onClick);

      button.enabled = false;
      button.visible = false;
      button.setStyle("fillBg", UI_CONFIG.COLORS.BUTTON.DISABLED);
      button.setStyle("textSize", 26);
      return button;
    }
  
    createOptionButton(catId, optId, option, x, y, width, height, onClick) {
      // Clear old button if exists
      const buttonKey = `${catId}.${optId}`; // Use dot notation to match dependency format
      if (this.buttons.has(buttonKey)) {
          const existingButton = this.buttons.get(buttonKey);
          existingButton.visible = false;
          existingButton.enabled = false;
          this.buttons.delete(buttonKey);
      }
  
      // Create new button using existing createMyButton
      const button = this.createMyButton(
          buttonKey,
          `${option.icon} ${option.name}`,
          x, y, width, height,
          onClick
      );
      
      // Add option-specific properties
      button.buttonKey = buttonKey;
      button.category = catId;
      button.optionId = optId;
      button.setStyle("textSize", 26);
  
      return button;
    }
  
    updateButtonStates(state) {
      // Get disabled options
      const disabledOptions = this.getDisabledOptions(state.selections);
      
      this.buttons.forEach((button, buttonKey) => {
          // Handle category buttons
          if (button.category === button.id) {
              const isSelected = state.selectedCategory === button.category;
              button.selected = isSelected;
              button.setStyle(
                  "fillBg",
                  isSelected
                      ? UI_CONFIG.COLORS.BUTTON.SELECTED
                      : UI_CONFIG.COLORS.BUTTON.DEFAULT
              );
          }
          // Handle option buttons
          else if (button.category) {
              const isSelected = state.selections[button.category] === button.optionId;
              const isDisabled = disabledOptions.includes(buttonKey);
              const isVisible = state.selectedCategory === button.category;
  
              // Update button state
              button.visible = isVisible;
              button.enabled = !isDisabled && isVisible;
              button.selected = isSelected;
  
              // Update style
              if (isDisabled) {
                  button.setStyle("fillBg", UI_CONFIG.COLORS.BUTTON.DISABLED);
                  button.setStyle("fillLabel", UI_CONFIG.COLORS.TEXT_SECONDARY);
              } else if (isSelected) {
                  button.setStyle("fillBg", UI_CONFIG.COLORS.BUTTON.SELECTED);
                  button.setStyle("fillLabel", UI_CONFIG.COLORS.TEXT);
              } else {
                  button.setStyle("fillBg", UI_CONFIG.COLORS.BUTTON.DEFAULT);
                  button.setStyle("fillLabel", UI_CONFIG.COLORS.TEXT);
              }
          }
          // Handle evaluate button
          else if (buttonKey === "evaluate") {
              const isComplete = Object.values(state.selections).every(
                  (v) => v !== null
              );
              button.enabled = isComplete;
              button.visible = true;
              button.setStyle(
                  "fillBg",
                  isComplete
                      ? UI_CONFIG.COLORS.BUTTON.SELECTED
                      : UI_CONFIG.COLORS.BUTTON.DISABLED
              );
          }
      });
    }

    getDisabledOptions(selections) {
      let disabledOptions = [];
  
      // Check each current selection for restrictions
      Object.entries(selections).forEach(([category, optionId]) => {
        if (optionId) {
          const key = `${category}.${optionId}`;
          const restrictions = GAME_DATA.DEPENDENCIES.RESTRICTIONS[key];
          if (restrictions) {
            disabledOptions = [...disabledOptions, ...restrictions.disables];
          }
        }
      });
  
      return disabledOptions;
    }   
  
    hideAllOptionButtons() {
      const buttonsToRemove = [];
  
      this.buttons.forEach((button, key) => {
        if (button.category && button.id !== button.category) {
          console.log("Hiding option button:", key);
          button.visible = false;
          button.enabled = false;
          buttonsToRemove.push(key);
        }
      });
  
      // Remove from our tracking Map
      buttonsToRemove.forEach((key) => {
        this.buttons.delete(key);
      });
    }
  
    showOptionButtons(categoryId) {
      this.buttons.forEach((button) => {
        if (button.category === categoryId && button.id !== categoryId) {
          button.visible = true;
        }
      });
    }
  
    setButtonHoverState(button, isHovered) {
        if (button.enabled && button._lastHoverState !== isHovered) {
          button._lastHoverState = isHovered;
          const color = isHovered 
            ? UI_CONFIG.COLORS.BUTTON.HOVER 
            : (button.selected 
              ? UI_CONFIG.COLORS.BUTTON.SELECTED 
              : UI_CONFIG.COLORS.BUTTON.DEFAULT);
              
          button.setStyle("fillBg", color);
        }
      }
  
    removeAll() {
      this.buttons.forEach((button) => {
        button.visible = false;
        button.enabled = false;
      });
      this.buttons.clear();
    }
  
    getButton(id) {
      return this.buttons.get(id);
    }
  
    getAllButtons() {
      return Array.from(this.buttons.values());
    }
  
    getCategoryButtons() {
      return Array.from(this.buttons.values()).filter(
        (button) => button.category === button.id
      );
    }
  
    getOptionButtons(categoryId) {
      return Array.from(this.buttons.values()).filter(
        (button) => button.category === categoryId && button.id !== categoryId
      );
    }
  }
  