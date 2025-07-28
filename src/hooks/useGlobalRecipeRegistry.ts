import { Recipe } from '@/types/recipe';

// Global registry to track all generated recipe titles across all days/meals
class GlobalRecipeRegistry {
  private static instance: GlobalRecipeRegistry;
  private generatedTitles: Set<string> = new Set();
  private recipes: Recipe[] = [];

  private constructor() {
    this.loadFromStorage();
  }

  static getInstance(): GlobalRecipeRegistry {
    if (!GlobalRecipeRegistry.instance) {
      GlobalRecipeRegistry.instance = new GlobalRecipeRegistry();
    }
    return GlobalRecipeRegistry.instance;
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('globalRecipeRegistry');
      if (stored) {
        const data = JSON.parse(stored);
        this.generatedTitles = new Set(data.titles || []);
        this.recipes = data.recipes || [];
        console.log(`Loaded ${this.generatedTitles.size} recipe titles from global registry`);
      }
    } catch (error) {
      console.warn('Error loading global recipe registry:', error);
    }
  }

  private saveToStorage() {
    try {
      const data = {
        titles: Array.from(this.generatedTitles),
        recipes: this.recipes
      };
      localStorage.setItem('globalRecipeRegistry', JSON.stringify(data));
    } catch (error) {
      console.warn('Error saving global recipe registry:', error);
    }
  }

  addRecipe(recipe: Recipe): boolean {
    if (this.generatedTitles.has(recipe.title)) {
      return false; // Recipe already exists
    }
    
    this.generatedTitles.add(recipe.title);
    this.recipes.push(recipe);
    this.saveToStorage();
    console.log(`Added recipe to global registry: ${recipe.title}`);
    return true;
  }

  hasRecipe(title: string): boolean {
    return this.generatedTitles.has(title);
  }

  getAllTitles(): string[] {
    return Array.from(this.generatedTitles);
  }

  getAllRecipes(): Recipe[] {
    return [...this.recipes];
  }

  clear() {
    this.generatedTitles.clear();
    this.recipes = [];
    localStorage.removeItem('globalRecipeRegistry');
    console.log('Cleared global recipe registry');
  }

  getCount(): number {
    return this.generatedTitles.size;
  }

  // Get variety prompts that exclude already generated recipes
  getAvoidancePrompts(): string[] {
    const titles = this.getAllTitles();
    if (titles.length === 0) return [];
    
    return [
      `EVITA ABSOLUTAMENTE generar estas recetas ya existentes: ${titles.join(', ')}`,
      `NO repitas ninguna de estas ${titles.length} recetas creadas anteriormente`,
      `Crea algo completamente diferente a: ${titles.slice(-5).join(', ')}`
    ];
  }
}

export const useGlobalRecipeRegistry = () => {
  const registry = GlobalRecipeRegistry.getInstance();

  return {
    addRecipe: (recipe: Recipe) => registry.addRecipe(recipe),
    hasRecipe: (title: string) => registry.hasRecipe(title),
    getAllTitles: () => registry.getAllTitles(),
    getAllRecipes: () => registry.getAllRecipes(),
    clear: () => registry.clear(),
    getCount: () => registry.getCount(),
    getAvoidancePrompts: () => registry.getAvoidancePrompts()
  };
};