// Defines how we weight different outcome qualities
const OUTCOME_WEIGHTS = {
  criticalFailure: -3, // Causes immediate game over
  rough: 1, // Survived but barely
  good: 2, // Good outcome
  great: 3, // Best possible outcome
};

class RobustnessCalculator {
  constructor(events, options) {
    this.events = events;
    this.options = options;
  }

  // Calculate robustness scores for all options in a category
  calculateCategoryRobustness(categoryId) {
    const categoryOptions = this.options[categoryId];
    const results = {};

    for (const [optionId, option] of Object.entries(categoryOptions)) {
      results[optionId] = this.calculateOptionRobustness(categoryId, optionId);
    }

    return this.normalizeScores(results);
  }

  // Calculate raw robustness score for a specific option
  calculateOptionRobustness(categoryId, optionId) {
    let totalScore = 0;
    let scenarioCount = 0;

    // Test the option against every event
    this.events.forEach((event) => {
      // Generate all possible selection combinations for other categories
      const otherCategories = Object.keys(this.options).filter(
        (cat) => cat !== categoryId
      );
      const combinations = this.generateCombinations(otherCategories);

      // Test each combination
      combinations.forEach((combo) => {
        const selections = {
          ...combo,
          [categoryId]: optionId,
        };

        totalScore += this.evaluateScenario(event, selections);
        scenarioCount++;
      });
    });

    return totalScore / scenarioCount;
  }

  // Generate all possible combinations of options for given categories
  generateCombinations(categories) {
    if (categories.length === 0) return [{}];

    const category = categories[0];
    const remainingCategories = categories.slice(1);
    const combinations = [];

    // Get all options for this category
    const options = Object.keys(this.options[category]);

    // Recursively build combinations
    options.forEach((option) => {
      const subCombinations = this.generateCombinations(remainingCategories);
      subCombinations.forEach((subCombo) => {
        combinations.push({
          ...subCombo,
          [category]: option,
        });
      });
    });

    return combinations;
  }

  // Evaluate a specific scenario and return a score
  evaluateScenario(event, selections) {
    // Check for critical failures first
    for (const [category, failures] of Object.entries(
      event.criticalFailures || {}
    )) {
      const choice = selections[category];
      if (failures[choice]) {
        if (failures[choice].fails) {
          return OUTCOME_WEIGHTS.criticalFailure;
        }

        // Check conditional failures
        if (failures[choice].failsUnless) {
          const saved = Object.entries(failures[choice].failsUnless).every(
            ([reqCategory, validChoices]) =>
              validChoices.includes(selections[reqCategory])
          );
          if (!saved) {
            return OUTCOME_WEIGHTS.criticalFailure;
          }
        }

        if (failures[choice].failsIf) {
          const fails = Object.entries(failures[choice].failsIf).every(
            ([reqCategory, badChoices]) =>
              badChoices.includes(selections[reqCategory])
          );
          if (fails) {
            return OUTCOME_WEIGHTS.criticalFailure;
          }
        }
      }
    }

    // Check for positive outcomes
    if (event.survivedOutcomes.great?.conditions) {
      const isGreat = Object.entries(
        event.survivedOutcomes.great.conditions
      ).every(([category, validChoices]) =>
        validChoices.includes(selections[category])
      );
      if (isGreat) return OUTCOME_WEIGHTS.great;
    }

    if (event.survivedOutcomes.good?.conditions) {
      const isGood = Object.entries(
        event.survivedOutcomes.good.conditions
      ).every(([category, validChoices]) =>
        validChoices.includes(selections[category])
      );
      if (isGood) return OUTCOME_WEIGHTS.good;
    }

    // Default to rough outcome
    return OUTCOME_WEIGHTS.rough;
  }

  // Normalize scores to a 1-10 range
  normalizeScores(scores) {
    const values = Object.values(scores);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    const normalized = {};
    for (const [key, value] of Object.entries(scores)) {
      // Convert to 1-10 range
      normalized[key] = Math.round(((value - min) / range) * 9 + 1);
    }

    return normalized;
  }

  // Calculate robustness ranges for all options
  calculateAllRanges() {
    const ranges = {};

    for (const categoryId of Object.keys(this.options)) {
      ranges[categoryId] = {};

      for (const optionId of Object.keys(this.options[categoryId])) {
        ranges[categoryId][optionId] = this.calculateOptionRange(
          categoryId,
          optionId
        );
      }
    }

    return ranges;
  }

  // Calculate min/max robustness for a specific option
  calculateOptionRange(categoryId, optionId) {
    let min = Infinity;
    let max = -Infinity;

    // Test against all events with different combinations
    this.events.forEach((event) => {
      const otherCategories = Object.keys(this.options).filter(
        (cat) => cat !== categoryId
      );
      const combinations = this.generateCombinations(otherCategories);

      combinations.forEach((combo) => {
        const selections = {
          ...combo,
          [categoryId]: optionId,
        };

        const score = this.evaluateScenario(event, selections);
        min = Math.min(min, score);
        max = Math.max(max, score);
      });
    });

    return {
      min: this.normalizeScores({ min: min }).min,
      max: this.normalizeScores({ max: max }).max,
    };
  }
}
