
import React, { useState, useEffect, useRef } from 'react';
import { processPdf } from './services/pdfService';
import { ReplacementOptions, ProcessingResult, ReplacementPair } from './types';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => 
    window.matchMedia('(prefers-color-scheme: dark)').matches
  );

  const [options, setOptions] = useState<ReplacementOptions>({
    pairs: [{ id: '1', findText: '', replaceText: '' }],
    caseSensitive: false,
    wholeWord: false,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        alert('Please upload a PDF.');
        return;
      }
      setFile(selectedFile);
      setFilePreviewUrl(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const addPair = () => {
    setOptions({
      ...options,
      pairs: [...options.pairs, { id: Math.random().toString(36).substr(2, 9), findText: '', replaceText: '' }]
    });
  };

  const removePair = (id: string) => {
    if (options.pairs.length === 1) return;
    setOptions({
      ...options,
      pairs: options.pairs.filter(p => p.id !== id)
    });
  };

  const updatePair = (id: string, field: 'findText' | 'replaceText', value: string) => {
    setOptions({
      ...options,
      pairs: options.pairs.map(p => p.id === id ? { ...p, [field]: value } : p)
    });
  };

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || options.pairs.every(p => !p.findText)) return;

    setLoading(true);
    const processingResult = await processPdf(file, options);
    setResult(processingResult);
    if (processingResult.updatedPdfUrl) {
      setFilePreviewUrl(processingResult.updatedPdfUrl);
    }
    setLoading(false);
  };

  const reset = () => {
    setFile(null);
    setFilePreviewUrl(null);
    setResult(null);
    setOptions({
      pairs: [{ id: '1', findText: '', replaceText: '' }],
      caseSensitive: false,
      wholeWord: false,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-lg text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
            </div>
            <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">WORDSWAP <span className="text-blue-600 font-light">PRO</span></span>
          </div>
          
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors"
          >
            {isDarkMode ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M16.95 16.95l.707.707M7.636 7.636l.707-.707M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            )}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 lg:p-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Controls Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Configuration</h2>
              
              {!file ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-all group"
                >
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="application/pdf" />
                  <div className="bg-slate-100 dark:bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">Select a PDF to start</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Options */}
                  <div className="flex gap-4 p-1 bg-slate-50 dark:bg-slate-800 rounded-xl mb-4">
                    <button 
                      onClick={() => setOptions({...options, caseSensitive: !options.caseSensitive})}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${options.caseSensitive ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      CASE SENSITIVE
                    </button>
                    <button 
                      onClick={() => setOptions({...options, wholeWord: !options.wholeWord})}
                      className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${options.wholeWord ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400'}`}
                    >
                      WHOLE WORD
                    </button>
                  </div>

                  {/* Pairs */}
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {options.pairs.map((pair, index) => (
                      <div key={pair.id} className="relative group bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">RULE #{index + 1}</span>
                          {options.pairs.length > 1 && (
                            <button onClick={() => removePair(pair.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l18 18" /></svg>
                            </button>
                          )}
                        </div>
                        <div className="space-y-3">
                          <input 
                            placeholder="Find..." 
                            value={pair.findText}
                            onChange={(e) => updatePair(pair.id, 'findText', e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                          />
                          <input 
                            placeholder="Replace with..." 
                            value={pair.replaceText}
                            onChange={(e) => updatePair(pair.id, 'replaceText', e.target.value)}
                            className="w-full bg-white dark:bg-slate-900 px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={addPair}
                    className="w-full py-3 flex items-center justify-center space-x-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-all text-sm font-bold"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                    <span>Add Another Rule</span>
                  </button>

                  <div className="pt-4 space-y-3">
                    <button 
                      onClick={handleProcess}
                      disabled={loading}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 dark:shadow-none transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Run Replacement'}
                    </button>
                    <button onClick={reset} className="w-full py-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm font-medium transition-colors">
                      Start Over
                    </button>
                  </div>
                </div>
              )}
            </div>

            {result && (
              <div className="bg-green-500 dark:bg-green-900/30 p-6 rounded-3xl text-white animate-fade-in shadow-xl shadow-green-200 dark:shadow-none border border-green-400/20">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <h4 className="font-bold">Process Complete</h4>
                </div>
                <p className="text-sm text-green-50 mb-6">Successfully identified and logged {result.replacementsMade} occurrences across the document.</p>
                <a 
                  href={result.updatedPdfUrl!} 
                  download={result.fileName}
                  className="w-full py-3 bg-white text-green-600 rounded-xl font-bold text-center block shadow-md hover:bg-green-50 transition-colors"
                >
                  Download Updated PDF
                </a>
              </div>
            )}
          </div>

          {/* Preview Main Area */}
          <div className="lg:col-span-7 h-[700px] lg:h-auto min-h-[500px]">
            <div className="h-full bg-slate-200 dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-2xl relative">
              {filePreviewUrl ? (
                <iframe 
                  src={filePreviewUrl} 
                  className="w-full h-full" 
                  title="PDF Preview"
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 p-12 text-center">
                  <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-600 dark:text-slate-300">Live Document Preview</h3>
                  <p className="mt-2 text-sm max-w-xs">Upload a document to view it here in real-time. Changes will reflect after processing.</p>
                </div>
              )}

              {loading && (
                <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-900 dark:text-white font-bold tracking-tight">ANALYZING DOCUMENT</p>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default App;
