import React, { useState } from "react";
import { motion } from "motion/react";
import { BrainCircuit, Lightbulb, Sparkles, Send, Loader2, RefreshCw, AlertCircle } from "lucide-react";

interface AdvisorTabProps {
  theme: "light" | "dark";
}

export default function AdvisorTab({ theme }: AdvisorTabProps) {
  const isLight = theme === "light";
  const [strategicPrompt, setStrategicPrompt] = useState(
    "Synthesize an optimization plan for premium Sushi production to reduce Tazaki and Sysco transport delays by 12% while keeping active kitchen seafood waste indexes below 3% under Dublin humid weather."
  );
  const [advisorResponse, setAdvisorResponse] = useState<string>("");
  const [thinkingProcess, setThinkingProcess] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const STRATEGIC_PRESETS = [
    {
      title: "🍣 Sushi Chain Optimization",
      desc: "Streamline raw cold-chain supplies and decrease daily sushi waste indexes.",
      prompt: "Synthesize an optimization plan for premium Sushi production to reduce Tazaki and Sysco transport delays by 12% while keeping active kitchen seafood waste indexes below 3% under Dublin humid weather."
    },
    {
      title: "🍟 Staff & COG Margin Recovery",
      desc: "Balance kitchen shifts during peak weekend traffic to secure operating margin.",
      prompt: "Provide a detailed shift labor and food ingredient scheduling framework for Food Penguin's premium branches to curb 5% weekend COG margin slippage and eliminate staff fatigue bottlenecks."
    },
    {
      title: "🌱 Green ESG Compliance",
      desc: "Implement modern carbon offsets and localized packaging targets.",
      prompt: "Draft an environmental ESG operational roadmap for Food Penguin's Cork and Mahon outlets, reducing single-use plastics by 25% and using smart compost systems to process organic rice waste."
    }
  ];

  const handleAskAdvisor = async () => {
    if (!strategicPrompt.trim()) return;
    setLoading(true);
    setErrorMsg(null);
    setAdvisorResponse("");
    setThinkingProcess("");
    try {
      const res = await fetch("/api/gemini/strategic-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: strategicPrompt }),
      });
      const data = await res.json();
      if (data.error) {
        setErrorMsg(data.error);
      } else {
        setAdvisorResponse(data.text);
        if (data.thinking) {
          setThinkingProcess(data.thinking);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
      {/* Top Header Card */}
      <div className={`p-8 rounded-3xl border ${isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'} relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3.5 mb-2">
              <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl">
                <BrainCircuit size={28} className="animate-pulse text-yellow-500" />
              </div>
              <div>
                <h1 className={`text-2xl font-black tracking-tight ${isLight ? 'text-zinc-900' : 'text-zinc-100'}`}>
                  Deep Strategic Advisor
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                  State-of-the-art corporate intelligence utilizing deep chain-of-thought strategic reasoning.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider ${
              isLight ? 'bg-zinc-100 text-zinc-600 border border-zinc-200' : 'bg-zinc-950 text-zinc-400 border border-zinc-800'
            }`}>
              Powered by gemini-3.1-pro-preview
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-amber-500 text-zinc-950 text-xs font-extrabold tracking-wider uppercase animate-pulse">
              Thinking Level: HIGH
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Input & Configuration Board: 7 Cols */}
        <div className={`xl:col-span-7 p-6 rounded-3xl border space-y-6 ${isLight ? 'bg-white border-zinc-200 shadow-sm' : 'bg-zinc-900 border-zinc-800'}`}>
          
          {/* Quick Recommend Presets */}
          <div>
            <span className={`block text-xs font-black uppercase tracking-wider mb-3 ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
              ✨ Strategic Presets
            </span>
            <div className="grid grid-cols-1 gap-3">
              {STRATEGIC_PRESETS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setStrategicPrompt(preset.prompt)}
                  className={`p-4 rounded-2xl border text-left transition-all hover:-translate-y-0.5 active:scale-[0.98] group cursor-pointer ${
                    strategicPrompt === preset.prompt
                      ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_15px_rgba(234,179,8,0.15)]'
                      : isLight
                        ? 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100/80'
                        : 'bg-zinc-950 border-zinc-850 hover:bg-zinc-900/40'
                  }`}
                >
                  <span className="block font-black text-xs text-zinc-800 dark:text-zinc-100 group-hover:text-amber-500 transition-colors">
                    {preset.title}
                  </span>
                  <span className="block text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {preset.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Text Box */}
          <div className="space-y-2">
            <label className={`block text-xs font-black uppercase tracking-wider ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
              Operational Complications / Strategic Goal
            </label>
            <textarea
              value={strategicPrompt}
              onChange={(e) => setStrategicPrompt(e.target.value)}
              className={`w-full h-44 p-4 border focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_15px_rgba(234,179,8,0.25)] rounded-2xl font-sans transition-all resize-none text-sm leading-relaxed ${
                isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-900' : 'bg-zinc-950 border-zinc-850 text-zinc-100'
              }`}
              placeholder="Introduce logistics, supply chain issues, target metrics, or staff composition constraints..."
            />
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => setStrategicPrompt("")}
              className={`px-4 py-3 rounded-2xl text-xs font-bold border flex items-center gap-2 transition-all hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer ${
                isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100' : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:bg-zinc-900'
              }`}
            >
              <RefreshCw size={14} /> Reset Prompt
            </button>
            <button
              onClick={handleAskAdvisor}
              disabled={loading || !strategicPrompt.trim()}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-zinc-950 rounded-2xl font-black text-xs shadow-lg flex items-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98] hover:-translate-y-0.5 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin text-zinc-950" />
                  Generating High Thinking Report...
                </>
              ) : (
                <>
                  <Send size={16} /> Compute Strategic Assessment
                </>
              )}
            </button>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20">
              <AlertCircle size={18} className="shrink-0" />
              <span className="text-xs font-semibold">{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right Output & Reasoning Pathway Board: 5 Cols */}
        <div className="xl:col-span-5 space-y-6">
          {/* Output placeholder or results */}
          {!thinkingProcess && !advisorResponse && !loading && (
            <div className={`p-8 rounded-3xl border text-center py-20 ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900/50 border-zinc-850'}`}>
              <BrainCircuit className="w-12 h-12 text-zinc-400 mx-auto mb-4 animate-pulse" />
              <h3 className={`text-base font-bold ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>Awaiting Strategic Query</h3>
              <p className="text-xs text-zinc-500 mt-2 max-w-sm mx-auto">
                Select one of the presets on the left or type your custom operations challenge, then compute an assessment to formulate an executive strategy.
              </p>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className={`p-8 rounded-3xl border space-y-4 py-16 text-center ${isLight ? 'bg-zinc-50 border-zinc-200' : 'bg-zinc-900 border-zinc-800'}`}>
              <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
              <p className={`text-xs font-black tracking-widest uppercase ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                Executing AI Cognitive Path Finder...
              </p>
              <div className="max-w-xs mx-auto space-y-2 mt-2">
                <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 animate-[pulse_1.5s_infinite] w-full" />
                </div>
                <p className="text-xs text-zinc-500 font-mono">Exploring Dublin microclimate variables, transportation routes, and branch performance limits.</p>
              </div>
            </div>
          )}

          {/* Thinking process pathway display */}
          {thinkingProcess && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-5 rounded-3xl border space-y-3 font-sans ${
                isLight ? 'bg-orange-50/50 border-orange-200/60' : 'bg-orange-950/15 border border-orange-900/40'
              }`}
            >
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-orange-500" />
                <span className={`text-xs uppercase font-mono tracking-wider font-extrabold block ${isLight ? 'text-orange-700' : 'text-orange-400'}`}>
                  🧠 Reasoning Pathway (Thought Process Summary):
                </span>
              </div>
              <p className={`text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto pr-1 custom-scrollbar ${isLight ? 'text-zinc-600' : 'text-orange-200'}`}>
                {thinkingProcess}
              </p>
            </motion.div>
          )}

          {/* Corporate Strategy response display */}
          {advisorResponse && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-6 rounded-3xl border shadow-md space-y-4 ${
                isLight ? 'bg-white border-zinc-200' : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <div className="flex items-center gap-2 pb-2.5 border-b border-zinc-200 dark:border-zinc-800">
                <Lightbulb className="w-5 h-5 text-emerald-500" />
                <span className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-zinc-800' : 'text-amber-400'}`}>
                  Formulated Corporate Strategy
                </span>
              </div>
              <div className={`text-xs font-sans leading-relaxed whitespace-pre-wrap space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar ${isLight ? 'text-zinc-700' : 'text-zinc-300'}`}>
                {advisorResponse}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
