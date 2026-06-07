import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Initialize express
const app = express();
const PORT = 3000;

app.use(express.json());

// Setup Google Gen AI client lazily to avoid throwing crash errors during startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY is not defined in environment variables.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "MOCK_KEY",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Nutrition structured schema mapping
const nutritionSchema = {
  type: Type.OBJECT,
  properties: {
    foodName: { type: Type.STRING, description: "Standard standardized name of the food item" },
    searchTerm: { type: Type.STRING, description: "The original search term requested by the user" },
    servingSizeValue: { type: Type.NUMBER, description: "Numeric serving size value (e.g. 100, 1, 150)" },
    servingSizeUnit: { type: Type.STRING, description: "Unit of serving size (e.g. g, oz, piece, cup, slice)" },
    servingDescription: { type: Type.STRING, description: "Human friendly serving description (e.g. '1 medium apple (approx 182g)' or '100g serving')" },
    calories: { type: Type.NUMBER, description: "Calories in kcal" },
    protein: { type: Type.NUMBER, description: "Protein in grams" },
    totalCarbs: { type: Type.NUMBER, description: "Total Carbohydrates in grams" },
    totalFat: { type: Type.NUMBER, description: "Total Fat in grams" },
    saturatedFat: { type: Type.NUMBER, description: "Saturated Fat in grams (optional / estimation)" },
    transFat: { type: Type.NUMBER, description: "Trans Fat in grams (optional / estimation)" },
    monounsaturatedFat: { type: Type.NUMBER, description: "Monounsaturated Fat in grams (optional / estimation)" },
    polyunsaturatedFat: { type: Type.NUMBER, description: "Polyunsaturated Fat in grams (optional / estimation)" },
    sugar: { type: Type.NUMBER, description: "Sugars in grams (optional / estimation)" },
    addedSugar: { type: Type.NUMBER, description: "Added sugars in grams (optional / estimation)" },
    fiber: { type: Type.NUMBER, description: "Dietary Fiber in grams (optional / estimation)" },
    starch: { type: Type.NUMBER, description: "Starch in grams" },
    sodium: { type: Type.NUMBER, description: "Sodium in mg" },
    potassium: { type: Type.NUMBER, description: "Potassium in mg" },
    cholesterol: { type: Type.NUMBER, description: "Cholesterol in mg" },
    calcium: { type: Type.NUMBER, description: "Calcium in mg" },
    iron: { type: Type.NUMBER, description: "Iron in mg" },
    vitaminA: { type: Type.NUMBER, description: "Vitamin A in mcg" },
    vitaminC: { type: Type.NUMBER, description: "Vitamin C in mg" },
    vitaminD: { type: Type.NUMBER, description: "Vitamin D in mcg" },
    vitaminE: { type: Type.NUMBER, description: "Vitamin E in mg" },
    glycemicIndex: { type: Type.NUMBER, description: "Estimated glycemic index (1-100)" },
    healthScore: { type: Type.NUMBER, description: "A nutrition and health value score from 1 (unhealthiest) to 100 (most nutrient-dense/superfood)" },
    category: { 
      type: Type.STRING, 
      description: "Category of the food. Must be one of: Fruits, Vegetables, Dairy & Eggs, Poultry, Beef & Pork, Fish & Seafood, Grains & Pasta, Legumes, Nuts & Seeds, Bakery, Beverages, Fast Food, Sweets & Desserts, Condiments & Sauces, Mixed Dishes" 
    },
    allergens: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Potential major allergens present in this food (e.g. Dairy, Gluten, Nuts, Soy, Eggs, Shellfish, Fish, Sesame, None)" 
    },
    dietClassification: {
      type: Type.OBJECT,
      properties: {
        isVegan: { type: Type.BOOLEAN },
        isVegetarian: { type: Type.BOOLEAN },
        isGlutenFree: { type: Type.BOOLEAN },
        isKetoFriendly: { type: Type.BOOLEAN },
        isLowCarb: { type: Type.BOOLEAN }
      },
      required: ["isVegan", "isVegetarian", "isGlutenFree", "isKetoFriendly", "isLowCarb"]
    },
    nutritionSummary: { type: Type.STRING, description: "A concise 1-2 sentence nutritional summary of the food's health properties and diet suitability." },
    healthWarningOrTip: { type: Type.STRING, description: "A practical advice tip or warning, e.g. 'High in saturated fat, consume sparingly' or 'Excellent rich source of dietary potassium and fiber.'" }
  },
  required: [
    "foodName",
    "searchTerm",
    "servingSizeValue",
    "servingSizeUnit",
    "servingDescription",
    "calories",
    "protein",
    "totalCarbs",
    "totalFat",
    "sodium",
    "healthScore",
    "category",
    "allergens",
    "dietClassification",
    "nutritionSummary",
    "healthWarningOrTip"
  ]
};

// API Endpoint to check nutrition details
app.post("/api/nutrition", async (req, res) => {
  const { foodName, language } = req.body;

  if (!foodName || typeof foodName !== "string" || foodName.trim() === "") {
    const isId = language === "id";
    return res.status(400).json({ 
      error: isId ? "Silakan masukkan nama makanan yang valid." : "Please enter a valid food name." 
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return res.status(500).json({
      error: "Gemini API key is not configured. Please add your GEMINI_API_KEY in the Secrets panel in AI Studio settings.",
    });
  }

  try {
    const ai = getGenAI();
    const isIndonesian = language === "id";
    
    const prompt = isIndonesian
      ? `Analyze the nutritional profile of the food or meal: "${foodName}". Provide detailed, highly accurate estimates of its major macro and micro nutritional contents based on the requested serving size. Provide the output properties ("foodName", "servingDescription", "nutritionSummary", "healthWarningOrTip", and items in "allergens") in natural Bahasa Indonesia (Indonesian language). For example, translate standard English food names into proper Indonesian standard ones, e.g., "Egg" to "Telur", "Banana" to "Pisang", and output all summaries/warnings in natural, friendly Bahasa Indonesia. Keep the "category" value strictly in English as defined in the enum categories.`
      : `Analyze the nutritional profile of the food or meal: "${foodName}". Provide detailed, highly accurate estimates of its major macro and micro nutritional contents based on the standard serving size described. If the user specifies any portions (for example: "two large hardboiled eggs" or "half cup of cooked black beans"), estimate specifically for that requested portion. If the food is ambiguous, provide information for the most popular form.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: nutritionSchema,
        temperature: 0.1, // low temperature for consistent and analytical results
      },
    });

    const textResult = response.text;
    if (!textResult) {
      throw new Error("No response received from the nutrition generation service.");
    }

    const parsedData = JSON.parse(textResult);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Error analyzing nutrition:", error);
    const isId = language === "id";
    res.status(500).json({
      error: isId 
        ? "Gagal mengestimasi profil nutrisi. Pastikan koneksi dan kunci API telah dikonfigurasi dengan benar."
        : "Failed to estimate nutritional profile. " + (error.message || ""),
    });
  }
});

// Setup Vite or static asset server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve HTML
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
