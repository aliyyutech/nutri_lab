import React, { useState } from "react";
import { Search, Loader2, Apple, ChevronRight, Zap } from "lucide-react";
import { translations } from "../utils/translations";

interface FoodSearchProps {
  onSearch: (foodName: string) => void;
  isLoading: boolean;
  error: string | null;
  language: "en" | "id";
}

const PRESETS_EN = [
  { name: "Avocado", label: "🥑 Avocado (1 medium)", query: "1 medium avocado" },
  { name: "Scrambled Eggs", label: "🍳 2 Scrambled Eggs", query: "2 scrambled eggs with a teaspoon of butter" },
  { name: "Giga Salmon Bowl", label: "🐟 Baked Salmon Bowl", query: "150g baked salmon with 1 cup cooked brown rice and broccoli" },
  { name: "Greek Yogurt", label: "🥛 Greek Yogurt Bowl", query: "1 cup Greek yogurt with honey and mixed berries" },
  { name: "Cheeseburger", label: "🍔 Traditional Cheeseburger", query: "1 classic double cheeseburger" }
];

const PRESETS_ID = [
  { name: "Alpukat", label: "🥑 1 Buah Alpukat Sedang", query: "1 alpukat sedang" },
  { name: "Telur Orak-arik", label: "🍳 2 Telur Orak-Arik", query: "2 telur orak-arik dengan satu sendok teh mentega" },
  { name: "Nasi Salmon Bakar", label: "🐟 Mangkok Salmon Panggang", query: "150g salmon panggang dengan 1 mangkok nasi merah dan brokoli" },
  { name: "Yoghurt Bowl", label: "🥛 Mangkok Yoghurt Yunani", query: "1 cangkir yoghurt Yunani dengan madu dan campuran buah beri" },
  { name: "Satai Ayam", label: "🍢 Sate Ayam Bumbu Kacang", query: "5 tusuk sate ayam dengan bumbu kacang" }
];

export default function FoodSearch({ onSearch, isLoading, error, language }: FoodSearchProps) {
  const [input, setInput] = useState("");
  const t = translations[language];
  const presets = language === "id" ? PRESETS_ID : PRESETS_EN;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSearch(input.trim());
    }
  };

  const handlePresetClick = (queryToSearch: string) => {
    setInput(queryToSearch);
    onSearch(queryToSearch);
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs p-6" id="search-container">
      <div className="mb-4">
        <h2 className="text-xl font-display font-bold text-zinc-900 tracking-tight flex items-center gap-2">
          <Search className="w-5 h-5 text-zinc-900" />
          {t.nutritionalLabAnalysis}
        </h2>
        <p className="text-xs font-mono uppercase tracking-wider text-zinc-400 mt-1">
          {t.estimateInstantly}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="relative mt-4">
        <div className="relative flex items-center">
          <input
            id="food-search-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={t.placeholderSearch}
            className="w-full pl-4 pr-32 py-3.5 bg-zinc-50 border border-zinc-200 rounded-xl font-sans text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-900 transition-all text-sm md:text-base disabled:opacity-75 font-medium"
          />
          <button
            id="food-search-submit"
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 top-2 bg-zinc-950 hover:bg-emerald-600 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white font-bold font-mono text-xs uppercase px-5 py-2.5 rounded-lg transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">{t.analyzing}</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>{t.analyze}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex gap-2 items-start" id="search-error">
          <Apple className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold font-mono uppercase tracking-wider">{t.analysisFailed}</p>
            <p className="mt-0.5 leading-relaxed font-sans">{error}</p>
          </div>
        </div>
      )}

      <div className="mt-6 border-t border-zinc-100 pt-5">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono block mb-3">{t.popularQueries}</span>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, index) => (
            <button
              key={index}
              type="button"
              id={`preset-btn-${index}`}
              onClick={() => handlePresetClick(preset.query)}
              disabled={isLoading}
              className="text-xs bg-zinc-50 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 rounded-lg px-3 py-1.5 transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 font-medium text-zinc-600"
            >
              <span>{preset.label}</span>
              <ChevronRight className="w-3 h-3 opacity-40" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
