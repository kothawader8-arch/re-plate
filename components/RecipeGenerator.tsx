
import React, { useState, useEffect } from 'react';
import { InventoryItem, UserProfile, Recipe } from '../types';
import { generateRescueRecipes } from '../services/geminiService';

interface RecipeGeneratorProps {
  inventory: InventoryItem[];
  userProfile: UserProfile;
}

const loadingMessages = [
  "Auditing pantry risk scores...",
  "Cross-referencing Allergy Guard protocols...",
  "Optimizing supply chain for GBP savings...",
  "Calculating environmental CO2 offset...",
  "Generating predictive rescue meals...",
  "Finalizing safety verification..."
];

const RecipeGenerator: React.FC<RecipeGeneratorProps> = ({ inventory, userProfile }) => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const criticalIds = inventory.filter(i => i.risk_score > 75).map(i => i.id);
    setSelectedIds(prev => Array.from(new Set([...prev, ...criticalIds])));
  }, [inventory]);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(s => (s + 1) % loadingMessages.length);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const toggleItem = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectedItems = inventory.filter(item => selectedIds.includes(item.id));

  const handleGenerate = async () => {
    if (selectedItems.length === 0) {
      setError("Asset missing. EcoPulse requires at least one high-risk ingredient to initialize optimization.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const results = await generateRescueRecipes(selectedItems, userProfile);
      setRecipes(results);
    } catch (err: any) {
      console.error(err);
      setError(`Systems Failure: ${err.message || 'The EcoPulse Engine is currently offline.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-32">
      {/* Engine Header */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden ring-1 ring-white/10">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px]"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-600/10 rounded-full blur-[100px]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-12">
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.4em]">EcoPulse Engine v2.1</span>
            </div>
            <h2 className="text-5xl font-black mb-6 tracking-tighter">Kitchen Resource Optimizer</h2>
            <p className="text-slate-400 text-lg leading-relaxed font-medium">
              Rebooting domestic food management. Our AI identifies the <span className="text-emerald-400 font-bold">Missing Link</span> to rescue your high-risk assets.
            </p>
          </div>
          
          <button 
            onClick={handleGenerate}
            disabled={loading || selectedItems.length === 0}
            className={`flex items-center justify-center gap-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:opacity-50 text-slate-950 font-black py-6 px-12 rounded-[2rem] shadow-[0_20px_40px_rgba(16,185,129,0.3)] transition-all transform active:scale-95 group text-lg relative overflow-hidden`}
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <i className="fa-solid fa-sync fa-spin"></i> 
                <span className="animate-pulse">REBOOTING...</span>
              </div>
            ) : (
              <><i className="fa-solid fa-microchip text-xl group-hover:scale-125 transition-transform"></i> INITIALIZE RESCUE</>
            )}
          </button>
        </div>

        <div className="mt-12 pt-12 border-t border-white/5">
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Mandatory Optimization Targets</p>
          <div className="flex flex-wrap gap-3">
            {inventory.length === 0 ? (
              <p className="text-slate-600 italic text-sm">Ledger is empty. No assets identified for rescue.</p>
            ) : (
              inventory.map(item => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`flex items-center gap-3 px-6 py-3 rounded-2xl border transition-all text-xs font-black tracking-tight ${
                    selectedIds.includes(item.id) 
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                      : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/20'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${item.risk_score > 75 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-slate-600'}`}></span>
                  {item.name}
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Loading & Error States */}
      {error && (
        <div className="p-6 bg-rose-500/10 text-rose-500 rounded-3xl border border-rose-500/20 animate-in fade-in slide-in-from-top-4 flex items-center gap-4">
          <i className="fa-solid fa-triangle-exclamation text-xl"></i>
          <span className="font-bold tracking-tight">{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-24 space-y-6">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xl font-black text-slate-900 tracking-tighter animate-pulse uppercase">
            {loadingMessages[loadingStep]}
          </p>
        </div>
      )}

      {/* Recipe Grid */}
      {recipes.length > 0 && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-10 duration-700">
          {recipes.map((recipe, idx) => (
            <div key={idx} className="group bg-white rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col hover:-translate-y-2">
              <div className="p-10 pb-0">
                <div className="flex justify-between items-start mb-6">
                  <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <i className="fa-solid fa-wand-magic-sparkles text-lg"></i>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rescue Value</p>
                    <p className="text-2xl font-black text-emerald-600">£{recipe.impact.gbp_saved}</p>
                  </div>
                </div>
                
                <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-tight mb-4">{recipe.recipe_name}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-6 italic border-l-4 border-emerald-500 pl-4">
                  "{recipe.description}"
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  <span className="text-[9px] uppercase font-black bg-slate-900 text-white px-3 py-1.5 rounded-full tracking-wider">
                    {recipe.nutrition.calories} KCAL
                  </span>
                  <span className="text-[9px] uppercase font-black bg-indigo-500 text-white px-3 py-1.5 rounded-full tracking-wider">
                    {recipe.impact.co2_saved_kg}kg CO2e Offset
                  </span>
                </div>
              </div>
              
              <div className="p-10 flex-grow space-y-8 bg-slate-50/30">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-link-slash text-rose-500 text-[10px]"></i>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">The Missing Links</h4>
                    </div>
                    <span className="text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded">
                      + £{recipe.missing_ingredients_cost_gbp}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recipe.missing_ingredients.map((ing, i) => (
                      <div key={i} className="text-[10px] font-bold bg-white text-slate-700 px-3 py-2 rounded-xl border border-slate-200 shadow-sm">
                        {ing}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-list-check text-indigo-500 text-[10px]"></i>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Rescue Protocol</h4>
                  </div>
                  <div className="space-y-4">
                    {recipe.instructions.map((step, i) => (
                      <div key={i} className="flex gap-4">
                        <span className="flex-shrink-0 w-6 h-6 rounded-lg bg-indigo-100 text-indigo-600 text-[10px] flex items-center justify-center font-black">
                          {i + 1}
                        </span>
                        <p className="text-xs text-slate-600 font-bold leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-10 pt-0">
                <div className="bg-slate-900 p-6 rounded-[2rem] text-white ring-1 ring-white/10">
                  <div className="flex items-start gap-4">
                    <i className="fa-solid fa-shield-halved text-emerald-400 text-lg mt-1"></i>
                    <div>
                      <p className="text-[9px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-1">Safety Confirmation</p>
                      <p className="text-[11px] font-bold text-slate-300 leading-tight">
                        {recipe.safety_confirmation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeGenerator;
