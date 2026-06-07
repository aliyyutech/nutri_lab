import React, { useState } from "react";
import { NutritionData } from "../types";
import { 
  Plus, Check, AlertTriangle, Info, ShieldCheck, 
  Flame, ChevronDown, ChevronUp, Scale, Sparkles
} from "lucide-react";
import { translations } from "../utils/translations";

interface NutritionDetailsProps {
  data: NutritionData;
  onAddToLog: (nutritionOverride: NutritionData, multiplier: number) => void;
  language: "en" | "id";
}

export default function NutritionDetails({ data, onAddToLog, language }: NutritionDetailsProps) {
  const [multiplier, setMultiplier] = useState(1);
  const [isLogged, setIsLogged] = useState(false);
  const [showMicros, setShowMicros] = useState(true);
  const t = translations[language];

  // Dynamic portion conversion helper
  const multiply = (val: number | undefined) => {
    if (val === undefined) return 0;
    return Math.round((val * multiplier) * 10) / 10;
  };

  const handleLogClick = () => {
    onAddToLog(data, multiplier);
    setIsLogged(true);
    setTimeout(() => setIsLogged(false), 2000);
  };

  // Safe macro energy breakdown ratios
  const proteinKcal = data.protein * 4;
  const carbKcal = data.totalCarbs * 4;
  const fatKcal = data.totalFat * 9;
  const totalMacroKcal = proteinKcal + carbKcal + fatKcal || 1;

  const proteinPct = Math.round((proteinKcal / totalMacroKcal) * 100);
  const carbPct = Math.round((carbKcal / totalMacroKcal) * 100);
  const fatPct = Math.round((fatKcal / totalMacroKcal) * 100);

  // Health score colors
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-500 bg-emerald-50 border-emerald-100";
    if (score >= 50) return "text-amber-500 bg-amber-50 border-amber-100";
    return "text-rose-500 bg-rose-50 border-rose-100";
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 50) return "bg-amber-500";
    return "bg-rose-500";
  };

  // Render check badge
  const renderDietClassification = () => {
    const cls = data.dietClassification;
    const diets = [
      { key: "isVegan", label: language === "id" ? "Vegan" : "Vegan" },
      { key: "isVegetarian", label: language === "id" ? "Vegetarian" : "Vegetarian" },
      { key: "isGlutenFree", label: language === "id" ? "Bebas Gluten" : "Gluten-Free" },
      { key: "isKetoFriendly", label: language === "id" ? "Ramah Keto" : "Keto Friendly" },
      { key: "isLowCarb", label: language === "id" ? "Rendah Karbohidrat" : "Low Carb" }
    ];

    const activeDiets = diets.filter(d => cls[d.key as keyof typeof cls]);

    if (activeDiets.length === 0) return null;

    return (
      <div className="flex flex-wrap gap-1.5 mt-3">
        {activeDiets.map((diet, idx) => (
          <span 
            key={idx} 
            className="inline-flex items-center gap-1 text-xs px-2.5 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 font-medium rounded-full"
          >
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            {diet.label}
          </span>
        ))}
      </div>
    );
  };

  // Filter out empty or standard allergy messages
  const displayAllergens = data.allergens && data.allergens.length > 0 
    ? data.allergens.filter(a => a && a.toLowerCase() !== "none" && a.toLowerCase() !== "no allergens")
    : [];

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden" id="nutrition-details-card">
      
      {/* Top Header Card */}
      <div className="bg-zinc-900 text-white p-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-32 h-32 bg-zinc-700/10 blur-2xl rounded-full translate-x-12 -translate-y-12"></div>
        
        <div className="flex flex-wrap justify-between items-start gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#fdfdfd] font-mono bg-zinc-800 px-2.5 py-1 rounded">
              {language === "id" ? (translations.id as any)[data.category] || data.category : data.category}
            </span>
            <h1 className="text-2xl md:text-3xl font-display font-extrabold text-white mt-2.5 tracking-tight uppercase italic leading-none">
              {data.foodName}
            </h1>
            <p className="text-xs text-zinc-350 mt-1.5 flex items-center gap-1 font-mono uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              SPEC: {data.servingDescription}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold font-mono">EST_ENERGY_VALUE</span>
            <div className="flex items-baseline justify-end gap-1 text-white">
              <Flame className="w-4 h-4 text-amber-500 shrink-0 self-center" />
              <span className="text-4xl font-display font-black tracking-tighter" id="detail-calories">
                {multiply(data.calories)}
              </span>
              <span className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest">kcal</span>
            </div>
          </div>
        </div>

        {/* Portion sizing slider */}
        <div className="mt-6 border-t border-zinc-800 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <label className="text-[10px] uppercase tracking-widest font-bold text-zinc-400 block mb-1 font-mono">{t.portionAdjusterScale}</label>
            <div className="flex items-center gap-2">
              <input 
                type="range" 
                min="0.1" 
                max="5" 
                step="0.1" 
                value={multiplier}
                onChange={(e) => setMultiplier(parseFloat(e.target.value))}
                className="w-32 md:w-44 accent-white cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
              <span className="text-xs font-mono font-bold bg-zinc-800 px-2 py-0.5 rounded text-zinc-200">
                × {multiplier.toFixed(1)}
              </span>
            </div>
          </div>

          <button
            id="add-to-daily-log-btn"
            onClick={handleLogClick}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-lg font-bold font-mono text-xs uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 shadow-xs ${
              isLogged 
                ? "bg-zinc-700 text-white cursor-default" 
                : "bg-white hover:bg-zinc-200 text-zinc-950 active:scale-95"
            }`}
          >
            {isLogged ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{t.mealRecorded}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>{t.logToTracker}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Primary Analytics Section */}
      <div className="p-6">
        
        {/* Diet badges & score row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center border-b border-zinc-200 pb-5 mb-5">
          <div className="md:col-span-8">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">{t.dietaryClass}</span>
            {renderDietClassification() || <p className="text-xs text-zinc-400 font-mono mt-2 uppercase tracking-wide">{t.stdDietarySpec}</p>}
          </div>

          {/* Health index dials */}
          <div className="md:col-span-4 flex items-center gap-3">
            <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex flex-col justify-center items-center text-center w-full">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-400">{t.nutritionalDensity}</span>
              <span className="text-2xl font-display font-black mt-1 text-zinc-900">{data.healthScore}<span className="text-xs font-normal text-zinc-400">/100</span></span>
              <div className="w-full bg-zinc-200 h-1 rounded-full mt-2 overflow-hidden">
                <div 
                  className="h-full bg-zinc-900 rounded-full"
                  style={{ width: `${data.healthScore}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Energy breakdown ratios */}
        <div className="mb-6 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
          <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono block mb-3">{t.macroEnergyDist}</span>
          <div className="flex h-3.5 rounded overflow-hidden w-full bg-zinc-200">
            <div style={{ width: `${proteinPct}%` }} className="bg-zinc-805 bg-gray-600 h-full hover:opacity-90 transition-opacity" title={`Protein: ${proteinPct}%`}></div>
            <div style={{ width: `${carbPct}%` }} className="bg-zinc-450 bg-gray-400 h-full hover:opacity-90 transition-opacity" title={`Carbs: ${carbPct}%`}></div>
            <div style={{ width: `${fatPct}%` }} className="bg-zinc-900 bg-black h-full hover:opacity-90 transition-opacity" title={`Fat: ${fatPct}%`}></div>
          </div>

          <div className="flex justify-between items-center mt-3 text-xs font-bold font-mono text-zinc-650 px-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-gray-600 rounded-xs"></span>
              <span>{t.protein} {proteinPct}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-gray-400 rounded-xs"></span>
              <span>{t.carbs} {carbPct}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 bg-black rounded-xs"></span>
              <span>{t.fat} {fatPct}%</span>
            </div>
          </div>
        </div>

        {/* Nutritional Summary Callout */}
        <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl mb-6">
          <div className="flex gap-2.5 items-start">
            <Sparkles className="w-4 h-4 text-zinc-900 shrink-0 mt-0.5" />
            <p className="text-xs text-zinc-700 leading-relaxed font-sans font-medium">{data.nutritionSummary}</p>
          </div>
          {data.healthWarningOrTip && (
            <div className="flex gap-2.5 items-start border-t border-zinc-200/60 mt-3 pt-3">
              <Info className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-zinc-500 leading-relaxed font-sans italic">
                <span className="font-bold text-zinc-700 uppercase tracking-wider font-mono mr-1">{t.labNote}:</span> {data.healthWarningOrTip}
              </p>
            </div>
          )}
        </div>

        {/* Allergen Warning Box */}
        {displayAllergens.length > 0 && (
          <div className="p-4 bg-zinc-900 text-white rounded-xl mb-6 flex gap-2.5 items-start">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest font-mono">{t.allergensDetected}</span>
              <p className="text-xs mt-1 text-zinc-250 font-mono font-bold uppercase tracking-wider">
                {t.containsIngredients}: {displayAllergens.join(", ")}
              </p>
            </div>
          </div>
        )}

        {/* Traditional Nutrition Facts Label layout */}
        <div className="border-[6px] border-zinc-900 rounded-none p-4 md:p-6 mb-6 font-sans select-none text-zinc-950">
          <h2 className="text-3xl font-black uppercase text-center tracking-tight border-b-8 border-zinc-900 pb-1">{t.nutritionFacts}</h2>
          
          <div className="text-xs py-1.5 border-b border-zinc-400 flex justify-between font-mono uppercase font-bold text-zinc-650">
            <span>{t.servingSpec}</span>
            <span>{data.servingDescription}</span>
          </div>

          <div className="text-xs py-1.5 border-b-8 border-zinc-900 flex justify-between items-baseline font-black font-mono">
            <span>{t.amountPerServing}</span>
            <span>{t.scaleMul} × {multiplier.toFixed(1)}</span>
          </div>

          <div className="py-2.5 border-b-[5px] border-zinc-900 flex justify-between items-baseline">
            <span className="text-2xl font-black uppercase tracking-tight">{t.caloriesLabel}</span>
            <span className="text-4xl font-black tracking-tight" id="nutrition-label-calories">{multiply(data.calories)}</span>
          </div>

          <div className="text-right text-[10px] font-black font-mono py-1 border-b border-zinc-300 uppercase tracking-widest">{t.percentDailyValue}</div>

          {/* Fat Segment */}
          <div className="border-b border-zinc-300 py-1.5">
            <div className="flex justify-between text-sm">
              <div>
                <span className="font-bold">{t.totalFat}</span> <span className="font-semibold">{multiply(data.totalFat)}g</span>
              </div>
              <span className="font-bold font-mono text-xs">{Math.round((multiply(data.totalFat) / 65) * 100)}%</span>
            </div>
            
            {/* Sub Fat */}
            {data.saturatedFat !== undefined && (
              <div className="flex justify-between text-xs pl-4 py-0.5 text-zinc-800">
                <span>{t.satFat} {multiply(data.saturatedFat)}g</span>
                <span className="font-bold font-mono">{Math.round((multiply(data.saturatedFat) / 20) * 100)}%</span>
              </div>
            )}
            
            {data.transFat !== undefined && data.transFat > 0 && (
              <div className="flex justify-between text-xs pl-4 py-0.5 text-zinc-500">
                <span>{t.transFat} {multiply(data.transFat)}g</span>
                <span>-</span>
              </div>
            )}

            {data.monounsaturatedFat !== undefined && data.monounsaturatedFat > 0 && (
              <div className="flex justify-between text-xs pl-4 py-0.5 text-zinc-500">
                <span>{t.monoFat} {multiply(data.monounsaturatedFat)}g</span>
                <span>-</span>
              </div>
            )}

            {data.polyunsaturatedFat !== undefined && data.polyunsaturatedFat > 0 && (
              <div className="flex justify-between text-xs pl-4 py-0.5 text-zinc-500">
                <span>{t.polyFat} {multiply(data.polyunsaturatedFat)}g</span>
                <span>-</span>
              </div>
            )}
          </div>

          {/* Cholesterol */}
          <div className="border-b border-zinc-300 py-1.5 flex justify-between text-sm">
            <div>
              <span className="font-bold">{t.cholesterol}</span> <span className="font-semibold">{multiply(data.cholesterol)}mg</span>
            </div>
            <span className="font-bold font-mono text-xs">{Math.round((multiply(data.cholesterol) / 300) * 100)}%</span>
          </div>

          {/* Sodium */}
          <div className="border-b border-zinc-300 py-1.5 flex justify-between text-sm">
            <div>
              <span className="font-bold">{t.sodium}</span> <span className="font-semibold">{multiply(data.sodium)}mg</span>
            </div>
            <span className="font-bold font-mono text-xs">{Math.round((multiply(data.sodium) / 2400) * 100)}%</span>
          </div>

          {/* Carbs Segment */}
          <div className="border-b border-zinc-300 py-1.5">
            <div className="flex justify-between text-sm">
              <div>
                <span className="font-bold">{t.totalCarb}</span> <span className="font-semibold">{multiply(data.totalCarbs)}g</span>
              </div>
              <span className="font-bold font-mono text-xs">{Math.round((multiply(data.totalCarbs) / 300) * 100)}%</span>
            </div>

            {/* Sub Carbs */}
            {data.fiber !== undefined && (
              <div className="flex justify-between text-xs pl-4 py-0.5 text-zinc-800">
                <span>{t.fiber} {multiply(data.fiber)}g</span>
                <span className="font-bold font-mono">{Math.round((multiply(data.fiber) / 25) * 100)}%</span>
              </div>
            )}

            {data.sugar !== undefined && (
              <div className="flex justify-between text-xs pl-4 py-0.5 text-zinc-800">
                <span>{t.sugar} {multiply(data.sugar)}g</span>
                <span>-</span>
              </div>
            )}

            {data.addedSugar !== undefined && data.addedSugar > 0 && (
              <div className="flex justify-between text-xs pl-8 py-0.5 text-zinc-550">
                <span>{t.addedSugar} {multiply(data.addedSugar)}g</span>
                <span className="font-bold font-mono">{Math.round((multiply(data.addedSugar) / 50) * 100)}%</span>
              </div>
            )}
          </div>

          {/* Protein */}
          <div className="border-b-4 border-zinc-900 py-1.5 flex justify-between text-sm">
            <div>
              <span className="font-bold">{t.protein}</span> <span className="font-semibold">{multiply(data.protein)}g</span>
            </div>
            <span className="font-bold font-mono text-xs">{Math.round((multiply(data.protein) / 50) * 100)}%</span>
          </div>

          {/* Micronutrient grid toggle */}
          <button 
            type="button"
            onClick={() => setShowMicros(!showMicros)}
            className="w-full flex items-center justify-between text-[10px] font-black font-mono uppercase py-3 border-b border-zinc-300 text-zinc-800 hover:bg-zinc-50 transition-colors tracking-wider"
          >
            <span>{t.microSpecMatrix}</span>
            {showMicros ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showMicros && (
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 pt-3 text-xs border-b border-zinc-400 pb-3 font-mono">
              <div className="flex justify-between py-0.5 border-b border-dashed border-zinc-200">
                <span className="text-zinc-500 font-bold">Vitamin A</span>
                <span className="font-bold text-zinc-800">{multiply(data.vitaminA)} mcg ({Math.round((multiply(data.vitaminA) / 900) * 100)}%)</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-dashed border-zinc-200">
                <span className="text-zinc-500 font-bold">Vitamin C</span>
                <span className="font-bold text-zinc-800">{multiply(data.vitaminC)} mg ({Math.round((multiply(data.vitaminC) / 90) * 100)}%)</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-dashed border-zinc-200">
                <span className="text-zinc-500 font-bold">Calcium</span>
                <span className="font-bold text-zinc-800">{multiply(data.calcium)} mg ({Math.round((multiply(data.calcium) / 1300) * 100)}%)</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-dashed border-zinc-200">
                <span className="text-zinc-500 font-bold">Iron</span>
                <span className="font-bold text-zinc-800">{multiply(data.iron)} mg ({Math.round((multiply(data.iron) / 18) * 100)}%)</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-dashed border-zinc-200">
                <span className="text-zinc-500 font-bold">Potassium</span>
                <span className="font-bold text-zinc-800">{multiply(data.potassium)} mg ({Math.round((multiply(data.potassium) / 4700) * 100)}%)</span>
              </div>
              <div className="flex justify-between py-0.5 border-b border-dashed border-zinc-200">
                <span className="text-zinc-500 font-bold">Glycemic Index</span>
                <span className="font-bold text-zinc-850">{data.glycemicIndex ? `${data.glycemicIndex} (Est.)` : "Low"}</span>
              </div>
            </div>
          )}

          <p className="text-[9px] font-mono text-zinc-400 mt-2.5 leading-tight uppercase">
            {t.dvNote}
          </p>
        </div>

      </div>

    </div>
  );
}
