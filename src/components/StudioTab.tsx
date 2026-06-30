import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, Send, Loader2, ScanLine, Download, AlertCircle, Copy, Check } from 'lucide-react';

interface StudioTabProps {
  theme: 'dark' | 'light';
}

export default function StudioTab({ theme }: StudioTabProps) {
  const isLight = theme === 'light';

  // Sub-tabs within Studio
  const [activeMode, setActiveMode] = useState<'audit' | 'marketing'>('marketing');

  // Marketing Image State
  const [adPrompt, setAdPrompt] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);
  
  // Kitchen Audit State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [auditResult, setAuditResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const ASPECT_RATIOS = ['1:1', '2:3', '3:2', '3:4', '4:3', '9:16', '16:9', '21:9'];

  const handleGenerateAd = async () => {
    if (!adPrompt.trim()) return;
    setIsGenerating(true);
    setGeneratedImage(null);
    setErrorMsg(null);
    try {
      const response = await fetch('/api/gemini/generate-marketing-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: adPrompt, aspectRatio })
      });
      const data = await response.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        setErrorMsg(data.error || "Failed to generate image. Please try adjusting the prompt.");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Network error contacting AI Studio API.");
    } finally {
      setIsGenerating(false);
    }
  };

  
  const processFile = (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setPreviewImage(base64);
      setAuditResult(null);
      setIsAnalyzing(true);
      setErrorMsg(null);
      
      try {
        const response = await fetch('/api/gemini/analyze-dish-photo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64, mimeType: file.type })
        });
        const data = await response.json();
        setAuditResult(data.analysis || "No analysis available.");
      } catch (err) {
        console.error(err);
        setAuditResult("Error communicating with AI auditor. Please try again.");
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-4xl mx-auto space-y-6 pt-6 pb-12">
      {/* HEADER */}
      <div className={`p-8 rounded-3xl text-center shadow-sm ${isLight ? 'bg-zinc-50 border border-zinc-200' : 'bg-gradient-to-br from-zinc-900 to-zinc-950 backdrop-blur-xl border-white/5 shadow-2xl border border-zinc-800'}`}>
        <h1 className={`text-4xl font-extrabold mb-2 ${isLight ? 'text-zinc-900' : 'text-3d-gold drop-shadow-md'}`}>
          AI Operations Studio
        </h1>
        <p className={`text-lg font-medium ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>
          Advanced machine intelligence for your quality and marketing operations.
        </p>

        <div className="flex justify-center gap-4 mt-8">
          <button 
            onClick={() => setActiveMode('marketing')}
            className={`px-8 py-3 rounded-full font-bold transition-all border ${activeMode === 'marketing' ? 'bg-yellow-500 text-white border-yellow-600 shadow-md' : isLight ? 'bg-white/95 backdrop-blur-md shadow-lg text-zinc-600 border-zinc-200  hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:bg-zinc-100' : 'bg-gradient-to-br from-zinc-800 to-zinc-900/90 backdrop-blur-md border-white/10 shadow-xl text-zinc-400 border-zinc-700 hover:bg-zinc-700'}`}
          >
            Ad Generator
          </button>
          <button 
            onClick={() => setActiveMode('audit')}
            className={`px-8 py-3 rounded-full font-bold transition-all border ${activeMode === 'audit' ? 'bg-yellow-500 text-white border-yellow-600 shadow-md' : isLight ? 'bg-white/95 backdrop-blur-md shadow-lg text-zinc-600 border-zinc-200  hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:bg-zinc-100' : 'bg-gradient-to-br from-zinc-800 to-zinc-900/90 backdrop-blur-md border-white/10 shadow-xl text-zinc-400 border-zinc-700 hover:bg-zinc-700'}`}
          >
            Quality Auditor
          </button>
        </div>
      </div>

      {activeMode === 'marketing' && (
        <div className={`p-8 rounded-3xl shadow-sm ${isLight ? 'bg-white/95 backdrop-blur-md shadow-lg border border-zinc-200' : 'bg-gradient-to-br from-zinc-900 to-zinc-950 backdrop-blur-xl border-white/5 shadow-2xl border border-zinc-800'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl"><ImageIcon size={24} /></div>
            <h2 className={`text-2xl font-bold ${isLight ? 'text-zinc-800' : 'text-zinc-100'}`}>Advertisement Banner Studio</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>Prompt</label>
              <textarea 
                value={adPrompt}
                onChange={(e) => setAdPrompt(e.target.value)}
                placeholder="Describe your delicious food advert..."
                className={`w-full p-4 rounded-2xl resize-none outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 focus:shadow-[0_0_12px_rgba(234,179,8,0.4)] transition-all ${isLight ? 'bg-zinc-50 border border-zinc-200 text-zinc-900' : 'bg-zinc-950 border border-zinc-800 text-zinc-100'}`}
                rows={4}
              />
            </div>

            <div>
              <label className={`flex items-center gap-2 text-sm font-bold uppercase tracking-wider mb-3 ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>
                 Aspect Ratio
              </label>
              <div className="flex flex-wrap gap-3">
                {ASPECT_RATIOS.map(ratio => (
                  <button
                    key={ratio}
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-4 py-2 rounded-xl font-bold font-mono tracking-wider transition-all border ${ aspectRatio === ratio ? 'bg-amber-500 text-white border-amber-600 shadow-md transform -translate-y-0.5' : isLight ? 'bg-zinc-50 border-zinc-200 text-zinc-500  hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:bg-zinc-100 hover:text-zinc-700' : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:bg-gradient-to-br from-zinc-800 to-zinc-900/90 backdrop-blur-md border-white/10 shadow-xl hover:text-zinc-200' }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGenerateAd}
              disabled={isGenerating || !adPrompt.trim()}
              className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all disabled:opacity-50 active:scale-[0.98] hover:-translate-y-0.5"
            >
              {isGenerating ? <><Loader2 size={24} className="animate-spin" /> Generating Image...</> : <><Send size={24} /> Generate Production Asset</>}
            </button>
            {errorMsg && (
              <div className="flex items-center gap-2 p-4 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20">
                <AlertCircle size={20} />
                <span className="font-medium text-sm">{errorMsg}</span>
              </div>
            )}
          </div>

          {isGenerating && !generatedImage && (
            <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center p-12">
               <Loader2 size={40} className="animate-spin text-amber-500 mb-4" />
               <p className={`font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>AI is crafting your marketing asset...</p>
            </div>
          )}

          {generatedImage && (
            <div className="mt-8 pt-8 border-t border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold ${isLight ? 'text-zinc-800' : 'text-zinc-200'}`}>Output Result</h3>
                <a 
                  href={generatedImage} 
                  download="marketing-asset.jpg"
                  target="_blank"
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-br from-zinc-800 to-zinc-900/90 backdrop-blur-md border-white/10 shadow-xl  hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:bg-zinc-700 text-zinc-100 rounded-lg text-sm font-bold font-mono uppercase tracking-wider transition-all"
                >
                  <Download size={16} /> Download Asset
                </a>
              </div>
              <div className="relative rounded-2xl overflow-hidden border border-zinc-800 shadow-xl group">
                <img src={generatedImage} alt="Generated Ad" className="w-full h-auto object-cover" referrerPolicy="no-referrer" />
              </div>
            </div>
          )}
        </div>
      )}

      {activeMode === 'audit' && (
        <div className={`p-8 rounded-3xl shadow-sm ${isLight ? 'bg-white/95 backdrop-blur-md shadow-lg border border-zinc-200' : 'bg-gradient-to-br from-zinc-900 to-zinc-950 backdrop-blur-xl border-white/5 shadow-2xl border border-zinc-800'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-rose-500/10 text-rose-500 rounded-xl"><ScanLine size={24} /></div>
            <h2 className={`text-2xl font-bold ${isLight ? 'text-zinc-800' : 'text-zinc-100'}`}>Plating & Quality Dish Auditor</h2>
          </div>

          <div className="flex flex-col items-center">
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              className="hidden" 
            />
            
            {!previewImage && !isAnalyzing ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`w-full max-w-lg mb-8 aspect-video rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all  hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:bg-zinc-50 dark:hover:bg-zinc-800/50 ${isDragging ? (isLight ? 'border-rose-500 bg-rose-50' : 'border-rose-500 bg-rose-500/10') : (isLight ? 'border-zinc-300 text-zinc-400' : 'border-zinc-700 text-zinc-500')}`}
              >
                <div className="p-4 bg-zinc-100 dark:bg-gradient-to-br from-zinc-800 to-zinc-900/90 backdrop-blur-md border-white/10 shadow-xl rounded-full mb-4">
                  <Camera size={48} className={isLight ? 'text-zinc-400' : 'text-zinc-500'} />
                </div>
                <p className="text-xl font-bold mb-2">Upload Dish Photo</p>
                <p className="text-sm font-medium">Click to select or drag and drop image</p>
              </div>
            ) : null}

            {previewImage && (
              <div className="w-full mb-8 flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <h3 className={`text-lg font-bold mb-4 uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>Source Image</h3>
                  <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-md">
                    <img src={previewImage} alt="Preview" className="w-full h-auto object-cover" />
                  </div>
                  <button 
                    onClick={() => { setPreviewImage(null); setAuditResult(null); }}
                    className={`mt-4 px-6 py-2 rounded-xl font-bold border transition-all ${isLight ? 'bg-white/95 backdrop-blur-md shadow-lg text-zinc-600 border-zinc-200  hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:bg-zinc-50' : 'bg-gradient-to-br from-zinc-900 to-zinc-950 backdrop-blur-xl border-white/5 shadow-2xl border-zinc-800 text-zinc-300 hover:bg-gradient-to-br from-zinc-800 to-zinc-900/90 backdrop-blur-md border-white/10 shadow-xl'}`}
                  >
                    Upload Another Photo
                  </button>
                </div>
                <div className="flex-[1.5]">
                  <h3 className={`text-lg font-bold mb-4 uppercase tracking-wider ${isLight ? 'text-zinc-500' : 'text-zinc-400'}`}>AI Quality Auditor Log</h3>
                  {isAnalyzing ? (
                    <div className={`flex flex-col items-center justify-center p-12 rounded-2xl border border-dashed ${isLight ? 'bg-zinc-50 border-zinc-300' : 'bg-zinc-950 border-zinc-800'}`}>
                      <Loader2 size={40} className="animate-spin text-rose-500 mb-4" />
                      <p className={`font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>Scanning multi-spectral dish parameters...</p>
                    </div>
                  ) : auditResult ? (
                    <div className={`p-6 rounded-2xl shadow-inner whitespace-pre-wrap leading-relaxed ${isLight ? 'bg-zinc-50 text-zinc-800 border border-zinc-200' : 'bg-zinc-950 text-zinc-200 border border-zinc-800'}`}>
                      <div className="text-base font-medium">{auditResult}</div>
                      <div className="mt-4 flex justify-end">
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(auditResult);
                            setCopied(true);
                            setTimeout(() => setCopied(false), 2000);
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all ${isLight ? 'bg-zinc-200 text-zinc-700  hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98] hover:bg-zinc-300' : 'bg-gradient-to-br from-zinc-800 to-zinc-900/90 backdrop-blur-md border-white/10 shadow-xl text-zinc-300 hover:bg-zinc-700'}`}
                        >
                          {copied ? <><Check size={14} className="text-emerald-500" /> Copied</> : <><Copy size={14} /> Copy Log</>}
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
