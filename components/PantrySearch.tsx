
import React, { useState, useEffect } from 'react';
import { UserProfile, Recipe } from '../types';
import { searchRecipesByPantry } from '../services/geminiService';

interface PantrySearchProps {
  userProfile: UserProfile;
}

const loadingMessages = [
  "Connecting to global recipe nodes...",
  "Filtering by Allergy Guard protocols...",
  "Optimizing for your diet...",
  "Compiling culinary logic...",
  "Finalizing ingredients..."
];

const PantrySearch: React.FC<PantrySearchProps> = ({ userProfile }) => {
  const [ingredientInput, setIngredientInput] = useState('');
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep(s => (s + 1) % loadingMessages.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleSearch = async () => {
    const ingredients = ingredientInput.split(',').map(i => i.trim()).filter(i => i.length > 0);
    if (ingredients.length === 0) {
      setError("Please input at least one ingredient to initialize the search.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const results = await searchRecipesByPantry(ingredients, userProfile);
      setRecipes(results);
    } catch (err: any) {
      console.error(err);
      setError(`Search Failure: ${err.message || 'The Engine is currently offline.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12 pb-32">
      {/* High-Impact Hero Section */}
      <div className="bg-slate-900 rounded-[4rem] p-12 lg:p-16 border border-slate-200 relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&q=80&w=2070" 
            alt="Pantry hero" 
            className="w-full h-full object-cover opacity-30 mix-blend-luminosity scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent"></div>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-grow space-y-6 max-w-2xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-500/30">
                <i className="fa-solid fa-magnifying-glass-chart text-xl"></i>
              </div>
              <p className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.4em] font-heading">Pantry Finder</p>
            </div>
            <h3 className="text-5xl font-black text-white tracking-tighter font-heading italic">What's in your <br/> kitchen?</h3>
            <p className="text-slate-300 font-medium text-lg leading-relaxed">
              Unlock the hidden potential of your current stock. Enter your ingredients below and let the <span className="text-emerald-400 font-bold">AI Rescue Engine</span> craft a masterpiece.
            </p>
            
            <div className="relative group mt-10">
              <input 
                className="w-full p-8 pl-10 bg-white/10 backdrop-blur-xl border border-white/20 rounded-[2.5rem] focus:ring-4 focus:ring-emerald-500/40 focus:border-emerald-500 font-bold text-white shadow-2xl transition-all text-xl outline-none placeholder:text-slate-500"
                placeholder="Spinach, eggs, feta, pasta..."
                value={ingredientInput}
                onChange={(e) => setIngredientInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-emerald-500 rounded-full group-focus-within:h-12 transition-all"></div>
            </div>
            
            <button 
              onClick={handleSearch}
              disabled={loading}
              className="mt-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-7 px-16 rounded-[2.5rem] shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all transform active:scale-95 text-xl flex items-center gap-4 group"
            >
              {loading ? <i className="fa-solid fa-sync fa-spin"></i> : <i className="fa-solid fa-bolt-lightning group-hover:scale-125 transition-transform"></i>}
              FIND MEALS
            </button>
          </div>
          
          <div className="hidden lg:block w-80 h-80 bg-white/5 backdrop-blur-md rounded-[3rem] border border-white/10 p-8 rotate-3 shadow-2xl">
            <div className="space-y-6">
              <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Active Scan</p>
              <div className="space-y-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500/50 animate-ping"></div>
                    <div className="h-2 bg-white/10 rounded-full flex-grow"></div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 font-medium leading-relaxed italic mt-12">
                "Mapping local ingredient clusters to global flavor profiles."
              </p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-8 bg-rose-500/10 text-rose-500 rounded-[2.5rem] border border-rose-500/20 animate-in fade-in flex items-center gap-6 shadow-lg">
          <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg">
            <i className="fa-solid fa-triangle-exclamation"></i>
          </div>
          <span className="font-black tracking-tight text-lg">{error}</span>
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-32 space-y-10">
          <div className="relative">
            <div className="w-24 h-24 border-8 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
              <i className="fa-solid fa-microchip text-2xl animate-pulse"></i>
            </div>
          </div>
          <p className="text-xl font-black text-slate-900 tracking-tighter animate-pulse uppercase font-heading italic">
            {loadingMessages[loadingStep]}
          </p>
        </div>
      )}

      {!loading && recipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
          {recipes.map((recipe, idx) => (
            <div key={idx} className="bg-white rounded-[4rem] border border-slate-200 shadow-xl overflow-hidden flex flex-col hover:shadow-2xl transition-all duration-500 group relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700"></div>
              
              <div className="p-12 pb-0 relative z-10">
                <div className="w-16 h-16 bg-emerald-50 rounded-[1.5rem] flex items-center justify-center text-emerald-600 mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-lg ring-4 ring-white">
                  <i className="fa-solid fa-utensils text-2xl"></i>
                </div>
                <h4 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 font-heading italic leading-tight">{recipe.recipe_name}</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed mb-8">
                  {recipe.description}
                </p>
              </div>

              <div className="p-12 flex-grow bg-slate-50/50 space-y-10">
                <div>
                  <div className="flex items-center gap-2 mb-6">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Supplementary Store Items</p>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {recipe.missing_ingredients.map((ing, i) => (
                      <span key={i} className="text-[10px] font-black bg-white text-slate-800 px-4 py-3 rounded-2xl border border-slate-200 shadow-sm uppercase tracking-wider">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Rescue Protocol</p>
                  <div className="space-y-6">
                    {recipe.instructions.slice(0, 3).map((step, i) => (
                      <div key={i} className="flex gap-5">
                        <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 text-xs flex items-center justify-center font-black shadow-sm">
                          {i + 1}
                        </span>
                        <p className="text-xs text-slate-600 font-bold leading-relaxed">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-12 pt-0">
                <div className="bg-slate-950 p-7 rounded-[2.5rem] text-white flex items-start gap-5 shadow-2xl relative overflow-hidden group/safety">
                  <div className="absolute top-0 left-0 w-full h-full bg-emerald-500/5 group-hover/safety:bg-emerald-500/10 transition-all"></div>
                  <i className="fa-solid fa-shield-halved text-emerald-400 text-2xl mt-1 relative z-10"></i>
                  <div className="relative z-10">
                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Safety Lock</p>
                    <p className="text-[11px] font-bold text-slate-300 leading-tight">
                      {recipe.safety_confirmation}
                    </p>
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

export default PantrySearch;
