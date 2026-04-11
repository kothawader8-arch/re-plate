
import React, { useState, useEffect } from 'react';
import pptxgen from 'pptxgenjs';

interface PitchDeckProps {
  onExit: () => void;
}

const slides = [
  {
    title: "EcoPulse",
    subtitle: "A Systems Reboot for Domestic Food Management",
    content: "Transforming the reactive kitchen into a predictive, community-linked supply chain node.",
    icon: "fa-plate-wheat",
    bg: "bg-emerald-500",
    points: [
      "Multivariate Risk Calculation",
      "AI-Driven Resource Optimization",
      "Community Mesh Infrastructure"
    ]
  },
  {
    title: "The Problem",
    subtitle: "Reactive Waste & Supply Chain Isolation",
    content: "Average households waste £700/year because they cook based on desire, not inventory risk.",
    icon: "fa-triangle-exclamation",
    bg: "bg-rose-500",
    points: [
      "Fragmented data in fridge/pantry",
      "Ignored financial 'Rescue Value'",
      "Isolated waste nodes (No community backup)"
    ]
  },
  {
    title: "Core Logic",
    subtitle: "Multivariate Risk Scoring Engine",
    content: "We don't just track dates. We track the 'Value at Risk'.",
    icon: "fa-microchip",
    bg: "bg-indigo-500",
    points: [
      "Expiry Risk (50%): Geometric decay of shelf life",
      "Financial Risk (25%): High-cost (£) ingredient priority",
      "Behavioral Risk (25%): Historical cooking frequency"
    ]
  },
  {
    title: "AI Engine",
    subtitle: "Gemini 3.0: The Resource Optimizer",
    content: "Our AI treats your kitchen as a logistics puzzle, identifying the 'Missing Link' to maximize rescue.",
    icon: "fa-brain",
    bg: "bg-emerald-600",
    points: [
      "Mandatory Ingredient Constraint Logic",
      "Safety Guard (Real-time Allergy Cross-ref)",
      "Impact Bragging (CO2 & GBP Calculation)"
    ]
  },
  {
    title: "Community Mesh",
    subtitle: "Neighbor-to-Neighbor Trust Ledger",
    content: "Isolated kitchens become a secure local network via Mesh Access Keys.",
    icon: "fa-network-wired",
    bg: "bg-slate-900",
    points: [
      "Secure Node Entry via Access Keys",
      "Vicinity Hazard Tracking for Allergy Safety",
      "Solana-inspired Trust Ledger Logic"
    ]
  },
  {
    title: "Impact & Scaling",
    subtitle: "The Future of Regenerative Consumption",
    content: "Scaling from a ledger to a full circular economy node.",
    icon: "fa-leaf",
    bg: "bg-emerald-400",
    points: [
      "Real-time CO2e Offset tracking",
      "Referral Mesh Growth (RT Token Economy)",
      "Seamless Map Integration for Asset Retrieval"
    ]
  }
];

const PitchDeck: React.FC<PitchDeckProps> = ({ onExit }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const downloadPresentation = async () => {
    const pptx = new pptxgen();
    pptx.layout = 'LAYOUT_WIDE';
    pptx.defineSlideMaster({
      title: "ECOPULSE_MASTER",
      background: { fill: "0F172A" },
      objects: [
        { text: { text: "EcoPulse: Systems Reboot", options: { x: 0.5, y: 7.0, color: "10B981", fontSize: 10, bold: true } } }
      ]
    });

    slides.forEach((s) => {
      const slide = pptx.addSlide({ masterName: "ECOPULSE_MASTER" });
      
      const bgMap: Record<string, string> = {
        "bg-emerald-500": "10B981",
        "bg-rose-500": "F43F5E",
        "bg-indigo-500": "6366F1",
        "bg-emerald-600": "059669",
        "bg-slate-900": "0F172A",
        "bg-emerald-400": "34D399"
      };

      const slideColor = bgMap[s.bg] || "0F172A";
      slide.background = { fill: slideColor };

      // Subtitle Accent
      slide.addText(s.subtitle.toUpperCase(), {
        x: 0.5, y: 1.0, w: "90%", h: 0.3,
        fontSize: 12, color: "FFFFFF", bold: true, charSpacing: 4, fontFace: "Arial"
      });

      // Main Title
      slide.addText(s.title, {
        x: 0.5, y: 1.4, w: "90%", h: 1.0,
        fontSize: 54, color: "FFFFFF", bold: true, italic: true, fontFace: "Arial"
      });

      // Content Description
      slide.addText(s.content, {
        x: 0.5, y: 2.8, w: "60%", h: 1.5,
        fontSize: 20, color: "F1F5F9", fontFace: "Arial"
      });

      // Key Points
      s.points.forEach((p, idx) => {
        slide.addText(`${idx + 1}. ${p}`, {
          x: 8.5, y: 2.5 + (idx * 0.8), w: "4.0", h: 0.6,
          fontSize: 14, color: "FFFFFF", bold: true, 
          fill: { color: "FFFFFF", transparency: 90 },
          margin: [10, 10, 10, 10],
          fontFace: "Arial"
        });
      });
    });

    pptx.writeFile({ fileName: 'EcoPulse_Project_Presentation.pptx' });
  };

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 text-white flex flex-col items-center justify-center overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className={`absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[150px] opacity-20 transition-all duration-1000 ${slide.bg}`}></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-slate-800 rounded-full blur-[150px] opacity-10"></div>
        <div className="absolute inset-0 opacity-10 food-pattern"></div>
      </div>

      {/* Top Header / HUD */}
      <header className="absolute top-0 left-0 w-full p-10 flex justify-between items-center z-20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-500/20">
            <i className="fa-solid fa-plate-wheat"></i>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter italic font-heading">EcoPulse Pitch Deck</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Confidential Build v1.2</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={downloadPresentation}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-full shadow-xl transition-all text-xs font-black uppercase tracking-widest flex items-center gap-2"
          >
            <i className="fa-solid fa-file-powerpoint"></i> Download Pitch (.pptx)
          </button>
          <button 
            onClick={onExit}
            className="bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white px-6 py-3 rounded-full border border-white/5 transition-all text-xs font-bold uppercase tracking-widest"
          >
            Exit (Esc)
          </button>
        </div>
      </header>

      {/* Slide Content */}
      <div className="relative z-10 w-full max-w-6xl px-12 flex flex-col lg:flex-row gap-16 items-center animate-in fade-in zoom-in-95 duration-700">
        <div className="flex-1 space-y-8">
          <div className={`w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl shadow-2xl transition-all duration-700 ${slide.bg}`}>
            <i className={`fa-solid ${slide.icon}`}></i>
          </div>
          <div>
            <h2 className="text-[11px] font-black text-emerald-400 uppercase tracking-[0.5em] mb-4 font-heading">{slide.subtitle}</h2>
            <h3 className="text-7xl font-black tracking-tighter mb-6 font-heading italic">{slide.title}</h3>
            <p className="text-2xl text-slate-400 font-medium leading-relaxed">
              {slide.content}
            </p>
          </div>
        </div>

        <div className="w-full lg:w-[450px] space-y-4">
          {slide.points.map((point, i) => (
            <div 
              key={i} 
              className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl flex items-center gap-5 transition-all hover:bg-white/10 hover:-translate-x-2"
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-black">
                {i + 1}
              </div>
              <p className="text-sm font-bold text-slate-200 uppercase tracking-widest">{point}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <footer className="absolute bottom-0 left-0 w-full p-10 flex justify-between items-center z-20">
        <div className="flex gap-2">
          {slides.map((_, i) => (
            <div key={i} className={`h-1.5 transition-all duration-500 rounded-full ${i === currentSlide ? 'w-12 bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'w-3 bg-slate-800'}`}></div>
          ))}
        </div>
        
        <div className="flex gap-4">
          <button 
            onClick={prevSlide}
            className="w-14 h-14 bg-slate-900 border border-white/5 rounded-2xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
          >
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <button 
            onClick={nextSlide}
            className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-slate-950 hover:bg-emerald-400 transition-all shadow-xl shadow-emerald-500/20"
          >
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>
      </footer>

      {/* System Status HUD */}
      <div className="absolute right-10 bottom-32 flex flex-col items-end gap-2 text-right">
        <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em]">Node Connection Strength</p>
        <div className="flex gap-1">
          {[1,2,3,4,5].map(i => <div key={i} className={`w-1.5 h-4 rounded-full ${i <= 4 ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>)}
        </div>
      </div>
    </div>
  );
};

export default PitchDeck;
