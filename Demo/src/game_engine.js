class GameEngine {
  constructor() {
    this.state = this.getInitialState();
    this.handlers = new Map();
  }

  getInitialState() {
    return {
      phase: "intro", // planning or evaluation
      selectedCategory: null,
      selections: {
        transport: null,
        accommodation: null,
        food: null
      },
      spent: 0,
      robustness: 0,
      infoPanel: null
    };
  }

  // Event dispatch handling
  dispatch(action, payload) {
    switch (action) {
      case "START_GAME":
        this.state.phase = "planning";
        break;
      case "SELECT_CATEGORY":
        this.handleCategorySelection(payload);
        break;
      case "SELECT_OPTION":
        this.handleOptionSelection(payload.category, payload.optionId);
        break;
      case "START_EVALUATION":
        this.startEvaluation();
        break;
      case "SHOW_EVENT_RESULT":
        this.showEventResult();
        break;
      case "RESET_GAME":
        this.resetGame();
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }

    this.notifyStateChange();
  }

  // Category selection handling
  handleCategorySelection(categoryId) {
    const category = GAME_DATA.CATEGORIES.find(cat => cat.id === categoryId);
    if (!category) {
      console.error("Invalid category:", categoryId);
      return;
    }

    this.state.selectedCategory = this.state.selectedCategory === categoryId ? null : categoryId;
    this.state.infoPanel = null;
  }

  // Option selection handling
  handleOptionSelection(category, optionId) {
    if (!GAME_DATA.OPTIONS[category]?.[optionId]) {
      console.error(`Invalid option selection: ${category} - ${optionId}`);
      return;
    }

    // Handle toggling selection
    if (this.state.selections[category] === optionId) {
      this.state.selections[category] = null;
      this.state.infoPanel = null;
      optionId = null;
    } else {
      this.state.selections[category] = optionId;
    }

    // Update info panel
    this.updateInfoPanel(category, optionId);
    
    // Update budget
    this.updateBudget();
  }

  // Budget calculations
  updateBudget() {
    const totalCost = Object.entries(this.state.selections).reduce((total, [category, selection]) => {
      if (selection && GAME_DATA.OPTIONS[category]?.[selection]) {
        return total + GAME_DATA.OPTIONS[category][selection].cost;
      }
      return total;
    }, 0);

    this.state.spent = totalCost;
  }

  // Info panel management
  updateInfoPanel(category, optionId) {
    const option = GAME_DATA.OPTIONS[category]?.[optionId];
    if (option) {
      this.state.infoPanel = {
        option,
        category
      };
    } else {
      this.state.infoPanel = null;
    }
  }

  // Startet die Auswertung und zeigt das zufällige Event
  startEvaluation() {
    if (!this.isSelectionComplete()) {
      console.log("Cannot start evaluation - selection not complete");
      return;
    }

    // Phase auf "event" setzen
    this.state.phase = "event";
    
    // Zufälliges Event auswählen
    const event = EVENT_SYSTEM.getRandomEvent();
    this.state.event = event;

    // Info-Panel mit Event-Beschreibung
    this.state.infoPanel = {
      option: {
        name: event.name,
        description: event.description,
      }
    };
  }

  showEventResult() {
    // Auswertung durchführen
    const result = EVENT_SYSTEM.evaluateEvent(this.state.event, this.state.selections);
    this.state.eventResult = result;
    
    // Phase auf "result" setzen
    this.state.phase = "result";

    // Info-Panel mit Ergebnis
    this.state.infoPanel = {
      option: {
        name: result.survived ? "🎉 Festival überlebt!" : "😢 Festival vorbei!",
        description: result.message,
        // Extra Info für UI-Styling
        quality: result.survived ? result.quality : 'failed'
      }
    };
  }

  calculateRobustness() {
    let total = 0;
    let count = 0;

    // Calculate base robustness from selections
    Object.entries(this.state.selections).forEach(([category, selection]) => {
      if (selection && GAME_DATA.OPTIONS[category]?.[selection]) {
        total += GAME_DATA.OPTIONS[category][selection].robustness;
        count++;
      }
    });

    // Apply combination bonuses
    const combinations = this.checkCombinations();
    total += combinations;

    return count > 0 ? Math.round(total / count) : 0;
  }

  checkCombinations() {
    let modifier = 0;
    const { selections } = this.state;

    GAME_DATA.COMBINATION_RULES.forEach(rule => {
      const categoriesMatch = rule.categories.every((category, index) => {
        const condition = rule.condition[index];
        if (condition.startsWith('!')) {
          return selections[category] !== condition.slice(1);
        } else if (Array.isArray(condition)) {
          return condition.includes(selections[category]);
        } else {
          return selections[category] === condition;
        }
      });

      if (categoriesMatch) {
        modifier += rule.bonus;
      }
    });

    return modifier;
  }

  // Utility methods
  isSelectionComplete() {
    return Object.values(this.state.selections).every(selection => selection !== null);
  }

  resetGame() {
    location.reload();
  }

  // State change subscription handling
  subscribe(handler) {
    const handlerId = Symbol();
    this.handlers.set(handlerId, handler);
    return () => this.handlers.delete(handlerId);
  }

  notifyStateChange() {
    this.handlers.forEach(handler => handler(this.state));
  }
}
