
import React, { useState } from 'react';
import { InventoryItem, UserProfile } from '../types';
import { FOOD_METRICS, calculateWasteRisk, getPriorityLevel } from '../constants';

interface InventoryProps {
  items: InventoryItem[];
  userProfile: UserProfile;
  onAddItem: (item: InventoryItem) => void;
  onRemoveItem: (id: string) => void;
}

const Inventory: React.FC<InventoryProps> = ({ items, userProfile, onAddItem, onRemoveItem }) => {
  const [selectedKey, setSelectedKey] = useState<string>(Object.keys(FOOD_METRICS)[0]);
  const [daysRemaining, setDaysRemaining] = useState<number>(3);

  const handleAdd = () => {
    const riskScore = calculateWasteRisk(selectedKey, daysRemaining, userProfile.cooking_score);
    const newItem: InventoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      item_key: selectedKey,
      name: selectedKey.replace(/_/g, ' ').toUpperCase(),
      quantity: 1,
      added_date: new Date().toISOString(),
      expiry_date: new Date(Date.now() + daysRemaining * 24 * 60 * 60 * 1000).toISOString(),
      days_remaining: daysRemaining,
      risk_score: riskScore,
      priority: getPriorityLevel(riskScore),
    };
    onAddItem(newItem);
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center text-lg">
            <i className="fa-solid fa-plus"></i>
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Register Asset</h3>
            <p className="text-xs text-slate-500 font-medium">Add ingredients to the predictive ledger.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Inventory Type</label>
            <select 
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 appearance-none shadow-inner"
            >
              {Object.keys(FOOD_METRICS).map(key => (
                <option key={key} value={key}>{key.replace(/_/g, ' ').toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-1">Shelf Life (Days)</label>
            <input 
              type="number" 
              value={daysRemaining}
              onChange={(e) => setDaysRemaining(parseInt(e.target.value) || 0)}
              className="w-full p-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 font-bold text-slate-700 shadow-inner"
              min="0"
            />
          </div>
          <div className="flex items-end">
            <button 
              onClick={handleAdd}
              className="w-full bg-slate-900 hover:bg-black text-white font-black py-4 px-6 rounded-2xl shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3"
            >
              <i className="fa-solid fa-database"></i> COMMIT TO LEDGER
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Active Stock Ledger</h3>
          <span className="text-[10px] font-bold text-slate-400">{items.length} Assets Tracked</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">
                <th className="px-8 py-5">Ingredient Asset</th>
                <th className="px-8 py-5 text-center">Remaining</th>
                <th className="px-8 py-5">Multivariate Risk</th>
                <th className="px-8 py-5">Logic Status</th>
                <th className="px-8 py-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="flex flex-col items-center opacity-20">
                      <i className="fa-solid fa-box-open text-6xl mb-4"></i>
                      <p className="font-black uppercase tracking-widest text-sm text-slate-900">Ledger Empty</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black shadow-sm ${
                          item.risk_score > 75 ? 'bg-rose-500 text-white shadow-rose-200' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {item.name.substring(0, 2)}
                        </div>
                        <span className="text-sm font-black text-slate-800 tracking-tight">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`text-xs font-bold ${item.days_remaining <= 2 ? 'text-rose-500' : 'text-slate-600'}`}>
                        {item.days_remaining}d
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-grow h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-1000 ${
                              item.risk_score > 75 ? 'bg-gradient-to-r from-rose-500 to-rose-400' : 
                              item.risk_score > 45 ? 'bg-gradient-to-r from-amber-500 to-amber-400' : 
                              'bg-gradient-to-r from-emerald-500 to-emerald-400'
                            }`}
                            style={{ width: `${item.risk_score}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-slate-900 w-8">{Math.round(item.risk_score)}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        {item.risk_score > 75 && <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>}
                        <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg ${
                          item.risk_score > 75 ? 'bg-rose-50 text-rose-600' : 
                          item.risk_score > 45 ? 'bg-amber-50 text-amber-600' : 
                          'bg-emerald-50 text-emerald-600'
                        }`}>
                          {item.risk_score > 75 ? 'Critical' : item.risk_score > 45 ? 'Warning' : 'Stable'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => onRemoveItem(item.id)}
                        className="w-10 h-10 rounded-xl hover:bg-rose-50 text-slate-300 hover:text-rose-500 transition-all flex items-center justify-center mx-auto lg:ml-auto lg:mr-0"
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
