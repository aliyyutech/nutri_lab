export interface DietaryClassification {
  isVegan: boolean;
  isVegetarian: boolean;
  isGlutenFree: boolean;
  isKetoFriendly: boolean;
  isLowCarb: boolean;
}

export interface Micronutrient {
  name: string;
  amount: number;
  unit: string;
  pctDV?: number; // Percent Daily Value (optional)
}

export interface NutritionData {
  foodName: string;
  searchTerm: string;
  servingSizeValue: number;
  servingSizeUnit: string; // e.g., "g", "oz", "piece", "cup"
  servingDescription: string; // e.g., "1 large apple (approx. 182g)"
  calories: number; // kcal
  
  // Macronutrients
  protein: number; // g
  totalCarbs: number; // g
  totalFat: number; // g
  
  // Fat breakdown
  saturatedFat?: number; // g
  transFat?: number; // g
  monounsaturatedFat?: number; // g
  polyunsaturatedFat?: number; // g
  
  // Carb breakdown
  sugar?: number; // g
  addedSugar?: number; // g
  fiber?: number; // g
  starch?: number; // g
  
  // Primary minerals & electrolytes
  sodium: number; // mg
  potassium?: number; // mg
  cholesterol?: number; // mg
  calcium?: number; // mg
  iron?: number; // mg
  
  // Vitamins & other micros
  vitaminA?: number; // mcg
  vitaminC?: number; // mg
  vitaminD?: number; // mcg
  vitaminE?: number; // mg
  
  // Estimated metrics
  glycemicIndex?: number;
  healthScore: number; // 1-100 rating based on nutrient density and healthiness
  
  // Tags/Metadata
  category: string; // e.g. "Fruits", "Vegetables", "Dairy & Eggs", "Poultry", "Beef & Pork", "Fish & Seafood", "Grains & Pasta", "Legumes", "Nuts & Seeds", "Bakery", "Beverages", "Fast Food", "Sweets & Desserts", "Condiments & Sauces", "Mixed Dishes"
  allergens: string[]; // e.g. ["Dairy", "Gluten", "Nuts", "Soy", "Eggs", "Shellfish"]
  dietClassification: DietaryClassification;
  
  // Insights
  nutritionSummary: string; // 1-2 sentence description of overall health impact
  healthWarningOrTip: string; // Practical warning or tip (e.g. "High in sodium", "High in antioxidant Vitamin C")
}

export interface FoodSearchHistory {
  id: string;
  timestamp: number;
  query: string;
  nutrition: NutritionData;
}
