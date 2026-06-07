import React, { useState, useEffect } from "react";
import FoodSearch from "./components/FoodSearch";
import NutritionDetails from "./components/NutritionDetails";
import SearchHistory from "./components/SearchHistory";
import { NutritionData, FoodSearchHistory } from "./types";
import { Scale, Database, Flame } from "lucide-react";
import { translations } from "./utils/translations";

export default function App() {
  const [currentNutrition, setCurrentNutrition] = useState<NutritionData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Set default language to "id" (Bahasa Indonesia) so it launches in Indonesian out of the box
  const [language, setLanguage] = useState<"en" | "id">("id");
  const t = translations[language];

  // High density states persistent in localStorage
  const [history, setHistory] = useState<FoodSearchHistory[]>([]);
  const [loggedMeals, setLoggedMeals] = useState<Array<{
    id: string;
    timestamp: number;
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    portionMultiplier: number;
    servingUnit: string;
  }>>([]);

  // Load from localStorage on mount including active language choice
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem("nutrilab_language");
      if (savedLang === "en" || savedLang === "id") {
        setLanguage(savedLang);
      } else {
        localStorage.setItem("nutrilab_language", "id");
      }

      const savedHistory = localStorage.getItem("nutrilab_history");
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      
      const savedMeals = localStorage.getItem("nutrilab_logged_meals");
      if (savedMeals) {
        setLoggedMeals(JSON.parse(savedMeals));
      }
    } catch (e) {
      console.error("Failed to load local storage data", e);
    }
  }, []);

  // Update language preference
  const handleLanguageChange = (lang: "en" | "id") => {
    setLanguage(lang);
    localStorage.setItem("nutrilab_language", lang);
  };

  // Sync to database-status imitation / localStorage
  const saveHistory = (newHistory: FoodSearchHistory[]) => {
    setHistory(newHistory);
    localStorage.setItem("nutrilab_history", JSON.stringify(newHistory));
  };

  const saveLoggedMeals = (newMeals: typeof loggedMeals) => {
    setLoggedMeals(newMeals);
    localStorage.setItem("nutrilab_logged_meals", JSON.stringify(newMeals));
  };

  // Perform Gemini AI nutrition analysis with language payload
  const handleSearch = async (foodName: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/nutrition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodName, language }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "An unexpected error occurred during analysis.");
      }

      setCurrentNutrition(result);

      // Add to search history list (prevent duplicate adjacent terms)
      const newHistoryItem: FoodSearchHistory = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        query: foodName,
        nutrition: result
      };

      const updatedHistory = [newHistoryItem, ...history.filter(h => h.query.toLowerCase() !== foodName.toLowerCase())].slice(0, 30);
      saveHistory(updatedHistory);
    } catch (err: any) {
      console.error(err);
      setError(err.message || (language === "id" ? "Gagal memproses metrik nutrisi. Periksa kunci API Anda." : "Failed to parse nutritional metrics. Check API keys."));
    } finally {
      setIsLoading(false);
    }
  };

  // Log a meal to today's consumption list
  const handleAddToLog = (nutrition: NutritionData, multiplier: number) => {
    const newMeal = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      foodName: nutrition.foodName,
      calories: Math.round(nutrition.calories * multiplier),
      protein: Math.round(nutrition.protein * multiplier * 10) / 10,
      carbs: Math.round(nutrition.totalCarbs * multiplier * 10) / 10,
      fat: Math.round(nutrition.totalFat * multiplier * 10) / 10,
      portionMultiplier: multiplier,
      servingUnit: nutrition.servingSizeUnit
    };

    saveLoggedMeals([newMeal, ...loggedMeals]);
  };

  // Delete logged meal record
  const handleRemoveLoggedMeal = (id: string) => {
    const updated = loggedMeals.filter(m => m.id !== id);
    saveLoggedMeals(updated);
  };

  // Wipe states
  const handleClearHistory = () => {
    saveHistory([]);
  };

  const handleClearLoggedMeals = () => {
    saveLoggedMeals([]);
  };

  const handleSelectHistory = (historyItem: FoodSearchHistory) => {
    setCurrentNutrition(historyItem.nutrition);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col font-sans" id="app-root-container">
      {/* Header Navigation */}
      <nav className="h-20 border-b border-zinc-200 flex items-center justify-between px-6 md:px-10 bg-white" id="main-nav">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-900 rounded flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white rotate-45"></div>
          </div>
          <div>
            <span className="font-display font-extrabold tracking-tighter text-xl text-zinc-900">NUTRI.LAB</span>
            <span className="text-[9px] block text-emerald-600 font-mono font-bold leading-none -mt-0.5">HIGH_DENSITY</span>
          </div>
        </div>

        {/* Language & Sync Controls */}
        <div className="flex items-center gap-4">
          {/* Stunning Modern Segmented Toggle for Language */}
          <div className="flex border border-zinc-200 rounded-lg p-0.5 bg-zinc-50 font-mono text-[10px]" id="language-switcher">
            <button
              id="lang-selector-en"
              type="button"
              onClick={() => handleLanguageChange("en")}
              className={`px-3 py-1.5 font-bold rounded-md transition-all active:scale-95 cursor-pointer ${
                language === "en" 
                  ? "bg-zinc-900 text-white shadow-xs" 
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              EN
            </button>
            <button
              id="lang-selector-id"
              type="button"
              onClick={() => handleLanguageChange("id")}
              className={`px-3 py-1.5 font-bold rounded-md transition-all active:scale-95 cursor-pointer ${
                language === "id" 
                  ? "bg-zinc-900 text-white shadow-xs" 
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              ID
            </button>
          </div>

          <div className="hidden md:flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold font-mono">{t.databaseStatus}</p>
              <p className="text-xs font-mono font-bold text-emerald-600 flex items-center gap-1">
                <Database className="w-3 h-3" />
                <span>{t.syncStable}</span>
              </p>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Metric Sidebar + Interactive Grid Area */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-6">
        
        {/* Left Hand: Hero Metric Display column */}
        <section className="w-full lg:w-[420px] shrink-0 flex flex-col bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 justify-between relative overflow-hidden" id="hero-metrics-section">
          {currentNutrition ? (
            <div className="flex flex-col h-full justify-between">
              <div>
                <span className="inline-block px-2.5 py-1 bg-zinc-100 text-[10px] text-zinc-600 font-bold uppercase tracking-widest rounded mb-4 font-mono">
                  {language === "id" ? (translations.id as any)[currentNutrition.category] || currentNutrition.category : currentNutrition.category}
                </span>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-extrabold tracking-tighter leading-none mb-2 text-zinc-900 italic uppercase">
                  {currentNutrition.foodName}
                </h1>
                <p className="text-zinc-500 text-sm font-medium">{t.referenceEst}</p>
                <p className="text-zinc-400 text-xs italic mt-0.5">{t.adjPortion}</p>
              </div>

              {/* Huge calorie energy metric readout */}
              <div className="relative py-8 md:py-12 border-y border-zinc-200/60 my-6">
                <div className="absolute -top-2.5 left-2 bg-white px-2 text-[9px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
                  {t.primaryEnergyKcal}
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-7xl md:text-8xl lg:text-9xl font-black leading-none tracking-tighter text-zinc-900 font-display">
                    {Math.round(currentNutrition.calories)}
                  </span>
                  <span className="text-xl md:text-2xl font-bold uppercase tracking-widest text-zinc-400 font-mono">
                    kcal
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2">
                  <div className="h-1.5 flex-1 bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-zinc-900 rounded-full" 
                      style={{ width: `${Math.min((currentNutrition.calories / 2000) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-[10px] font-mono font-bold text-zinc-500 shrink-0">
                    {Math.round((currentNutrition.calories / 2000) * 100)}% {language === "id" ? "AKG" : "DV"}
                  </span>
                </div>
              </div>

              {/* Key breakdown statistics */}
              <div className="grid grid-cols-2 gap-3 mt-auto">
                <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200">
                  <p className="text-[9px] uppercase text-zinc-400 font-bold mb-1 font-mono tracking-widest">{t.macroTargetIndex}</p>
                  <p className="text-sm font-black font-mono text-zinc-800">
                    {((currentNutrition.protein + currentNutrition.totalCarbs + currentNutrition.totalFat) || 0).toFixed(1)}g
                  </p>
                </div>
                <div className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200">
                  <p className="text-[9px] uppercase text-zinc-400 font-bold mb-1 font-mono tracking-widest">{t.healthGradeScore}</p>
                  <p className="text-sm font-black font-mono text-zinc-900 flex items-center gap-1">
                    <span>{currentNutrition.healthScore}</span>
                    <span className="text-[9px] font-bold text-zinc-400">/100</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col justify-center items-center h-full text-center py-12">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100 mb-4">
                <Scale className="w-8 h-8 text-zinc-400 stroke-[1.25]" />
              </div>
              <p className="text-sm font-bold uppercase tracking-wider text-zinc-400 font-mono">{t.metricsLatent}</p>
              <h2 className="text-lg font-display font-semibold text-zinc-800 mt-2">{t.noFoodReady}</h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-[280px] leading-relaxed">
                {t.enterSearchQuery}
              </p>
            </div>
          )}
        </section>

        {/* Right Hand: Action controls + charts & detailed tables */}
        <main className="flex-1 flex flex-col gap-6" id="dashboard-main-area">
          {/* Lookup Input Form component */}
          <FoodSearch 
            onSearch={handleSearch} 
            isLoading={isLoading} 
            error={error} 
            language={language}
          />

          {/* Interactive results or layout guide */}
          {currentNutrition ? (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              {/* Detailed Nutrition label facts */}
              <div className="xl:col-span-7">
                <NutritionDetails 
                  data={currentNutrition} 
                  onAddToLog={handleAddToLog} 
                  language={language}
                />
              </div>

              {/* History index + Daily planner tracking logs */}
              <div className="xl:col-span-5">
                <SearchHistory 
                  history={history}
                  onSelectHistory={handleSelectHistory}
                  onClearHistory={handleClearHistory}
                  loggedMeals={loggedMeals}
                  onRemoveLoggedMeal={handleRemoveLoggedMeal}
                  onClearLoggedMeals={handleClearLoggedMeals}
                  language={language}
                />
              </div>
            </div>
          ) : (
            /* Layout empty state - Show history and logs anyway so user has initial view */
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              <div className="md:col-span-12">
                <SearchHistory 
                  history={history}
                  onSelectHistory={handleSelectHistory}
                  onClearHistory={handleClearHistory}
                  loggedMeals={loggedMeals}
                  onRemoveLoggedMeal={handleRemoveLoggedMeal}
                  onClearLoggedMeals={handleClearLoggedMeals}
                  language={language}
                />
              </div>
            </div>
          )}

          {/* High density system footer */}
          <footer className="flex flex-col sm:flex-row items-center justify-between opacity-50 px-2 pt-2 border-t border-zinc-250/20 text-zinc-500" id="high-density-footer">
            <p className="text-[10px] font-mono">SYSTEM_ID: NUTRILAB-CORE-NODE-32B7</p>
            <p className="text-[10px] font-mono tracking-tight uppercase mt-1 sm:mt-0">
              {language === "id" 
                ? "Akurasi informasi didukung oleh teknologi analisis Google Gemini flash &copy;"
                : "Information precision powered by Google Gemini flash analyzer guides &copy;"}{" "}
              {new Date().getFullYear()}
            </p>
          </footer>
        </main>

      </div>
    </div>
  );
}
