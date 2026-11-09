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
      button.setStyle("fillBgHover", UI_CONFIG.COLORS.BUTTON.HOVER);
      button.setStyle("fillBgActive", UI_CONFIG.COLORS.BUTTON.ACTIVE);
      // p5.touchgui labels are black by default
      button.setStyle("fillLabel", UI_CONFIG.COLORS.TEXT);
      button.setStyle("fillLabelHover", UI_CONFIG.COLORS.TEXT);
      button.setStyle("fillLabelActive", UI_CONFIG.COLORS.TEXT);
      button.setStyle("rounding", 10);
      button.setStyle("font", UI_CONFIG.FONTS.HEADING);
      button.setStyle("textSize", 30);
      
      button.id = id;
      button.x = x;
      button.y = y;
      button.width = width;
      button.height = height;

      this.buttons.set(id, button);
      return button;
    }
  
    // The single forward action of a screen
    createPrimaryButton(id, label, x, y, width, height, onClick) {
      const button = this.createMyButton(id, label, x, y, width, height, onClick);
      this.setPrimaryStyle(button);
      return button;
    }

    setPrimaryStyle(button) {
      button.setStyle("fillBg", UI_CONFIG.COLORS.BUTTON.PRIMARY);
      button.setStyle("fillBgHover", UI_CONFIG.COLORS.BUTTON.PRIMARY_HOVER);
      button.setStyle("fillBgActive", UI_CONFIG.COLORS.BUTTON.PRIMARY_ACTIVE);
    }

    createEvaluateButton(label, x, y, width, height, onClick) {
      const button = this.createPrimaryButton("evaluate", label, x, y, width, height, onClick);

      button.enabled = false;
      button.visible = false;
      button.setStyle("fillBg", UI_CONFIG.COLORS.BUTTON.DISABLED);
      button.setStyle("fillLabel", UI_CONFIG.COLORS.TEXT_SECONDARY);
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
          // With a chosen option the label is blank: GameRenderer.drawCategoryLabels
          // draws the category caption and the option itself
          const categoryInfo = GAME_DATA.CATEGORIES.find((cat) => cat.id === buttonKey);
          if (categoryInfo) {
              const chosen = GAME_DATA.OPTIONS[categoryInfo.id][state.selections[categoryInfo.id]];
              button.label = chosen ? "" : `${categoryInfo.icon} ${categoryInfo.name}`;
          }

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
                      ? UI_CONFIG.COLORS.BUTTON.PRIMARY
                      : UI_CONFIG.COLORS.BUTTON.DISABLED
              );
              button.setStyle(
                  "fillLabel",
                  isComplete
                      ? UI_CONFIG.COLORS.TEXT
                      : UI_CONFIG.COLORS.TEXT_SECONDARY
              );
          }
      else if (buttonKey === "finalStage") {
            // Info button, only created on the result screen
            button.enabled = true;
            button.visible = true;
            button.setStyle("fillBg", "#23304f");
            button.setStyle("fillLabel", UI_CONFIG.COLORS.TEXT);
            button.setStyle("textSize", 32);
            button.setStyle("rounding", 32);
        }
      });
    }

    // Restrictions that apply to the current selections, as { disabled, reason }.
    // A restriction applies in both directions: selecting its option disables
    // the listed ones, and selecting any listed one disables its option.
    getActiveRestrictions(selections) {
      const isSelected = (key) => {
        const [category, optionId] = key.split(".");
        return selections[category] === optionId;
      };
      const active = [];

      const restrictions = Object.entries(GAME_DATA.DEPENDENCIES.RESTRICTIONS);

      restrictions.forEach(([key, restriction]) => {
        if (isSelected(key)) {
          active.push({ disabled: restriction.disables, reason: restriction.reason });
        }
      });
      restrictions.forEach(([key, restriction]) => {
        if (restriction.disables.some(isSelected)) {
          active.push({ disabled: [key], reason: restriction.reason });
        }
      });

      return active;
    }

    getDisabledOptions(selections) {
      return this.getActiveRestrictions(selections).flatMap((r) => r.disabled);
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
  
    createFinalButton(label,x,y,width,height,onClick){
      const button = this.createMyButton("finalStage", label, x, y, width, height, onClick);
    
    button.visible = false; 
    button.enabled = false;
    button.setStyle("fillBg", UI_CONFIG.COLORS.BUTTON.DISABLED);
    button.setStyle("textSize", 26);
    
    return button;
    }
    setButtonHoverState(button, isHovered) {
        if (button.enabled && button._lastHoverState !== isHovered) {
          button._lastHoverState = isHovered;
          let color;
          if (button.id === "finalStage") {
            color = isHovered ? UI_CONFIG.COLORS.BUTTON.HOVER : "#23304f";
          } else {
            color = isHovered 
              ? UI_CONFIG.COLORS.BUTTON.HOVER 
              : (button.selected 
                ? UI_CONFIG.COLORS.BUTTON.SELECTED 
                : UI_CONFIG.COLORS.BUTTON.DEFAULT);
          }
              
          button.setStyle("fillBg", color);
        }
      }
  
    removeFromGui(button) {
      // Remove button from p5.touchgui's global registry
      if (this.gui && this.gui.objects) {
        const index = this.gui.objects.indexOf(button);
        if (index > -1) {
          this.gui.objects.splice(index, 1);

          // Reindex remaining objects
          for (let i = index; i < this.gui.objects.length; i++) {
            this.gui.objects[i]._index = i;
          }
        }
      }
    }

    removeAll() {
      this.buttons.forEach((button) => {
        button.visible = false;
        button.enabled = false;
        // Actually remove from p5.touchgui registry
        this.removeFromGui(button);
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
  
