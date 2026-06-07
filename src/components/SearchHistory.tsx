import React, { useState } from "react";
import { FoodSearchHistory } from "../types";
import { History, Trash2, Calendar, Coffee } from "lucide-react";
import { translations } from "../utils/translations";

interface SearchHistoryProps {
  history: FoodSearchHistory[];
  onSelectHistory: (item: FoodSearchHistory) => void;
  onClearHistory: () => void;
  loggedMeals: Array<{
    id: string;
    timestamp: number;
    foodName: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    portionMultiplier: number;
    servingUnit: string;
  }>;
  onRemoveLoggedMeal: (id: string) => void;
  onClearLoggedMeals: () => void;
  dailyGoalCalories?: number;
  language: "en" | "id";
}

export default function SearchHistory({
  history,
  onSelectHistory,
  onClearHistory,
  loggedMeals,
  onRemoveLoggedMeal,
  onClearLoggedMeals,
  dailyGoalCalories = 2000,
  language
}: SearchHistoryProps) {
  const [activeTab, setActiveTab] = useState<"tracker" | "history">("tracker");
  const [goalCalories, setGoalCalories] = useState(dailyGoalCalories);
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const t = translations[language];

  // Totals calculations
  const totalCalories = loggedMeals.reduce((acc, m) => acc + m.calories, 0);
  const totalProtein = loggedMeals.reduce((acc, m) => acc + m.protein, 0);
  const totalCarbs = loggedMeals.reduce((acc, m) => acc + m.carbs, 0);
  const totalFat = loggedMeals.reduce((acc, m) => acc + m.fat, 0);

  const calPercentage = Math.min(Math.round((totalCalories / goalCalories) * 100), 100);

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-6" id="history-tracker-panel">
      {/* Tab Selectors */}
      <div className="flex border-b border-zinc-200 pb-3 mb-5 gap-4">
        <button
          type="button"
          id="tab-btn-tracker"
          onClick={() => setActiveTab("tracker")}
          className={`flex items-center gap-1.5 pb-2 text-xs uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "tracker" 
              ? "border-zinc-900 text-zinc-900" 
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>{t.dailyTracker}</span>
          {loggedMeals.length > 0 && (
            <span className="text-[9px] bg-zinc-900 text-white font-mono font-bold px-1.5 py-0.5 rounded">
              {loggedMeals.length}
            </span>
          )}
        </button>
        <button
          type="button"
          id="tab-btn-history"
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-1.5 pb-2 text-xs uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "history" 
              ? "border-zinc-900 text-zinc-900" 
              : "border-transparent text-zinc-400 hover:text-zinc-600"
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>{t.analysisLogs}</span>
          {history.length > 0 && (
            <span className="text-[9px] bg-zinc-500 text-white font-mono font-bold px-1.5 py-0.5 rounded">
              {history.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "tracker" ? (
        <div id="tracker-pane">
          {/* Calorie Budget Indicator */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-xl p-5 mb-5 relative overflow-hidden">
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">{t.dailyEnergyScale}</span>
              
              <div className="flex items-center gap-1.5">
                {isEditingGoal ? (
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={goalCalories}
                      onChange={(e) => setGoalCalories(Math.max(100, parseInt(e.target.value) || 0))}
                      onBlur={() => setIsEditingGoal(false)}
                      className="w-16 text-center text-xs font-bold bg-white border border-zinc-300 rounded p-0.5 font-mono"
                      autoFocus
                    />
                    <span className="text-[9px] text-zinc-500 font-mono">kcal</span>
                  </div>
                ) : (
                  <button 
                    type="button"
                    onClick={() => setIsEditingGoal(true)}
                    className="text-[10px] text-zinc-400 hover:text-zinc-900 font-mono font-bold cursor-pointer uppercase tracking-wider"
                  >
                    {t.refGoal}: {goalCalories} kcal
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-baseline justify-between mb-3">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-display font-black text-zinc-900">{totalCalories.toFixed(0)}</span>
                <span className="text-xs text-zinc-400 font-bold font-mono">/ {goalCalories} {t.refGoalSuff}</span>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-900 bg-zinc-200/60 px-2 py-0.5 rounded">
                {calPercentage}%
              </span>
            </div>

            {/* Total progress bar */}
            <div className="w-full bg-zinc-200 h-2.5 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${totalCalories > goalCalories ? "bg-rose-600" : "bg-zinc-900"}`}
                style={{ width: `${calPercentage}%` }}
              ></div>
            </div>

            {/* Macros target list */}
            <div className="grid grid-cols-3 gap-2.5 mt-5 pt-4 border-t border-zinc-200/60">
              <div className="text-center bg-white border border-zinc-200 p-2.5 rounded-xl">
                <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider font-mono">{t.protein}</span>
                <p className="text-sm font-bold text-zinc-800 mt-1 font-mono">{totalProtein.toFixed(1)}g</p>
                <span className="text-[9px] text-zinc-500 font-bold font-mono uppercase bg-zinc-100 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                  {t.refSuffix} 75g
                </span>
              </div>
              <div className="text-center bg-white border border-zinc-200 p-2.5 rounded-xl">
                <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider font-mono">{t.carbs}</span>
                <p className="text-sm font-bold text-zinc-800 mt-1 font-mono">{totalCarbs.toFixed(1)}g</p>
                <span className="text-[9px] text-zinc-500 font-bold font-mono uppercase bg-zinc-100 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                  {t.refSuffix} 250g
                </span>
              </div>
              <div className="text-center bg-white border border-zinc-200 p-2.5 rounded-xl">
                <span className="text-[9px] text-zinc-400 uppercase font-bold tracking-wider font-mono">{t.fat}</span>
                <p className="text-sm font-bold text-zinc-800 mt-1 font-mono">{totalFat.toFixed(1)}g</p>
                <span className="text-[9px] text-zinc-500 font-bold font-mono uppercase bg-zinc-100 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                  {t.refSuffix} 65g
                </span>
              </div>
            </div>
          </div>

          {/* Logged items listing */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">{t.dailyLogMatrix}</span>
              {loggedMeals.length > 0 && (
                <button
                  type="button"
                  id="clear-logs-btn"
                  onClick={onClearLoggedMeals}
                  className="text-[10px] text-rose-600 hover:text-rose-800 font-bold font-mono uppercase cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  {t.resetLog}
                </button>
              )}
            </div>

            {loggedMeals.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-zinc-250/50 rounded-xl bg-zinc-50/50">
                <Coffee className="w-6 h-6 text-zinc-350 mx-auto opacity-70 stroke-[1.5]" />
                <p className="text-xs text-zinc-500 font-bold uppercase mt-2 font-mono">{t.noFoodLogs}</p>
                <p className="text-[11px] text-zinc-400 mt-1 px-4 leading-relaxed font-sans">
                  {t.noFoodLogsDesc}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {loggedMeals.map((meal) => (
                  <div 
                    key={meal.id} 
                    className="flex justify-between items-center p-3 bg-white border border-zinc-200 rounded-lg hover:border-zinc-350 transition-all shadow-2xs"
                    id={`logged-meal-${meal.id}`}
                  >
                    <div className="min-w-0 pr-2">
                       <p className="text-xs font-bold text-zinc-800 truncate" title={meal.foodName}>
                        {meal.foodName}
                      </p>
                      <p className="text-[9px] font-bold text-zinc-400 font-mono mt-0.5">
                        {t.standardVal}: {meal.portionMultiplier.toFixed(1)}x • P:{meal.protein.toFixed(0)}g | C:{meal.carbs.toFixed(0)}g | F:{meal.fat.toFixed(0)}g
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] font-mono font-black text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">
                        +{meal.calories.toFixed(0)} kcal
                      </span>
                      <button
                        type="button"
                        id={`delete-meal-btn-${meal.id}`}
                        onClick={() => onRemoveLoggedMeal(meal.id)}
                        className="p-1 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                        title="Delete meal log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div id="history-pane">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">{t.cachedSpecs}</span>
            {history.length > 0 && (
              <button
                type="button"
                id="clear-history-btn"
                onClick={onClearHistory}
                className="text-[10px] text-zinc-400 hover:text-zinc-600 font-bold font-mono uppercase cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                {t.clearAll}
              </button>
            )}
          </div>

          {history.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-zinc-250/50 rounded-xl bg-zinc-50/50">
              <History className="w-6 h-6 text-zinc-350 mx-auto opacity-70 stroke-[1.5]" />
              <p className="text-xs text-zinc-500 font-bold uppercase mt-2 font-mono">{t.cacheEmpty}</p>
              <p className="text-[11px] text-zinc-400 mt-1 px-4 leading-relaxed font-sans">
                {t.cacheEmptyDesc}
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {history.map((item) => (
                <button
                  key={item.id}
                  id={`history-item-btn-${item.id}`}
                  onClick={() => onSelectHistory(item)}
                  className="w-full text-left p-3 bg-white border border-zinc-200 rounded-lg hover:border-zinc-800 transition-all flex items-center justify-between group cursor-pointer"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-[8px] text-zinc-400 font-mono font-bold tracking-widest uppercase mb-0.5">
                      {language === "id" ? (translations.id as any)[item.nutrition.category] || item.nutrition.category : item.nutrition.category}
                    </p>
                    <p className="text-xs font-bold text-zinc-800 truncate">
                      {item.nutrition.foodName}
                    </p>
                    <p className="text-[10px] text-zinc-400 max-w-full truncate font-mono">
                      "{item.query}"
                    </p>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-xs font-mono font-black text-zinc-900 bg-zinc-50 px-2 py-0.5 border border-zinc-100 rounded">
                        {item.nutrition.calories} kcal
                      </p>
                      <p className="text-[9px] text-zinc-400 font-bold font-mono mt-0.5">
                        SCORE: {item.nutrition.healthScore}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
