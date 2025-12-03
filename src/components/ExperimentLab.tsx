import React, { useState, useEffect } from 'react';
import { generateReflexResponseStream } from '../services/gemini';
import { Message, AIRole } from '../types';
import { FlaskConical, Plus, Trash2, Play, Save, X, MessageSquare, ThumbsUp, ThumbsDown } from 'lucide-react';

interface Persona {
  id: string;
  name: string;
  systemPrompt: string;
}

interface ExperimentResult {
  personaId: string;
  personaName: string;
  output: string;
  latency: number;
  rating?: 'up' | 'down';
}

interface ExperimentLabProps {
  onClose: () => void;
}

const DEFAULT_PERSONAS: Persona[] = [
  {
    id: 'default-reflex',
    name: 'Default Reflex',
    systemPrompt: 'You are the Reflex Core, a fast, tactical AI assistant.'
  },
  {
    id: 'sarcastic-bot',
    name: 'Sarcastic Bot',
    systemPrompt: 'You are a helpful assistant, but you are extremely sarcastic and dry in your responses.'
  },
  {
    id: 'eli5-bot',
    name: 'ELI5 Bot',
    systemPrompt: 'Explain everything as if the user is 5 years old. Use simple analogies.'
  }
];

const ExperimentLab: React.FC<ExperimentLabProps> = ({ onClose }) => {
  const [personas, setPersonas] = useState<Persona[]>(() => {
    const saved = localStorage.getItem('zync_experiment_personas');
    return saved ? JSON.parse(saved) : DEFAULT_PERSONAS;
  });

  const [selectedPersonas, setSelectedPersonas] = useState<Set<string>>(new Set(['default-reflex']));
  const [prompt, setPrompt] = useState('');
  const [results, setResults] = useState<ExperimentResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [editingPersona, setEditingPersona] = useState<Persona | null>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('zync_experiment_personas', JSON.stringify(personas));
  }, [personas]);

  const togglePersonaSelection = (id: string) => {
    const newSet = new Set(selectedPersonas);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedPersonas(newSet);
  };

  const handleRunExperiment = async () => {
    if (!prompt.trim() || selectedPersonas.size === 0) return;
    
    setIsRunning(true);
    setResults([]);
    
    const targets = personas.filter(p => selectedPersonas.has(p.id));
    const newResults: ExperimentResult[] = targets.map(p => ({
      personaId: p.id,
      personaName: p.name,
      output: '',
      latency: 0
    }));
    
    setResults(newResults);

    // Run in parallel
    const promises = targets.map(async (persona, index) => {
      const startTime = Date.now();
      try {
        const stream = generateReflexResponseStream(
          prompt, 
          [], // No history for isolated experiments
          null, 
          null, 
          persona.systemPrompt
        );

        for await (const update of stream) {
          setResults(prev => {
            const next = [...prev];
            next[index] = {
              ...next[index],
              output: update.fullText,
              latency: Date.now() - startTime
            };
            return next;
          });
        }
      } catch (e: any) {
        setResults(prev => {
            const next = [...prev];
            next[index] = {
              ...next[index],
              output: `Error: ${e.message}`,
              latency: Date.now() - startTime
            };
            return next;
          });
      }
    });

    await Promise.all(promises);
    setIsRunning(false);
  };

  const savePersona = (p: Persona) => {
    if (personas.find(existing => existing.id === p.id)) {
      setPersonas(personas.map(existing => existing.id === p.id ? p : existing));
    } else {
      setPersonas([...personas, p]);
    }
    setEditingPersona(null);
  };

  const deletePersona = (id: string) => {
    if (confirm('Delete this persona?')) {
      setPersonas(personas.filter(p => p.id !== id));
      const newSelected = new Set(selectedPersonas);
      newSelected.delete(id);
      setSelectedPersonas(newSelected);
    }
  };

  const handleRateResult = (personaId: string, rating: 'up' | 'down') => {
    setResults(prev => prev.map(r => {
        if (r.personaId === personaId) {
            return { ...r, rating: r.rating === rating ? undefined : rating };
        }
        return r;
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-7xl h-[90vh] glass-panel rounded-xl shadow-2xl flex overflow-hidden relative">
        
        {/* Sidebar: Personas */}
        <div className="w-1/4 border-r border-white/10 flex flex-col bg-black/20">
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
            <h2 className="text-sm font-mono font-bold text-fuchsia-400 flex items-center gap-2 tracking-wider">
              <FlaskConical size={16} /> EXPERIMENT_LAB
            </h2>
            <button 
              onClick={() => setEditingPersona({ id: `p-${Date.now()}`, name: 'New Persona', systemPrompt: '' })}
              className="text-slate-400 hover:text-fuchsia-400 transition-colors p-1 hover:bg-white/5 rounded"
              title="Add Persona"
            >
              <Plus size={18} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {personas.map(p => (
              <div 
                key={p.id}
                className={`p-3 rounded-lg border transition-all duration-200 cursor-pointer group ${
                  selectedPersonas.has(p.id) 
                    ? 'bg-fuchsia-500/10 border-fuchsia-500/30 shadow-[0_0_15px_rgba(217,70,239,0.1)]' 
                    : 'bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10'
                }`}
                onClick={() => togglePersonaSelection(p.id)}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className={`text-xs font-bold transition-colors ${selectedPersonas.has(p.id) ? 'text-fuchsia-300' : 'text-slate-300 group-hover:text-slate-200'}`}>
                    {p.name}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingPersona(p); }}
                      className="text-slate-500 hover:text-cyan-400 p-1 hover:bg-white/10 rounded"
                      title="Edit Persona"
                    >
                      <MessageSquare size={12} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); deletePersona(p.id); }}
                      className="text-slate-500 hover:text-red-400 p-1 hover:bg-white/10 rounded"
                      title="Delete Persona"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 line-clamp-2 font-mono leading-relaxed">{p.systemPrompt}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex flex-col bg-transparent relative">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-900/5 via-transparent to-cyan-900/5 pointer-events-none" />

          {/* Header & Controls */}
          <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md z-10">
            <div className="flex-1 mr-4">
               <input 
                type="text" 
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="Enter test prompt here..."
                className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-slate-200 focus:border-fuchsia-500/50 focus:bg-black/40 focus:shadow-[0_0_15px_rgba(217,70,239,0.1)] outline-none font-mono transition-all placeholder:text-slate-600"
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleRunExperiment()}
               />
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={handleRunExperiment}
                    disabled={isRunning || !prompt.trim() || selectedPersonas.size === 0}
                    className="px-5 py-2.5 bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-mono flex items-center gap-2 shadow-lg shadow-fuchsia-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    {isRunning ? <ActivityIcon /> : <Play size={16} />} RUN_TEST
                </button>
                <button 
                    onClick={onClose} 
                    className="p-2.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                    title="Close Experiment Lab"
                >
                    <X size={20} />
                </button>
            </div>
          </div>

          {/* Results Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 z-0">
            {results.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-600">
                    <div className="p-6 rounded-full bg-white/5 mb-4 border border-white/5">
                        <FlaskConical size={48} className="opacity-40 text-fuchsia-500" />
                    </div>
                    <p className="font-mono text-sm tracking-wide">SELECT PERSONAS AND RUN A PROMPT</p>
                </div>
            ) : (
                <div className={`grid gap-6 ${results.length === 1 ? 'grid-cols-1' : results.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                    {results.map(r => (
                        <div key={r.personaId} className="glass-panel bg-black/40 border-white/5 rounded-xl flex flex-col h-[60vh] overflow-hidden hover:border-white/10 transition-colors">
                            <div className="p-3 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                <span className="text-xs font-bold text-fuchsia-400 font-mono">{r.personaName}</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-mono text-slate-500">{r.latency}ms</span>
                                    <div className="flex gap-1 pl-3 border-l border-white/10">
                                        <button 
                                            onClick={() => handleRateResult(r.personaId, 'up')}
                                            className={`p-1.5 rounded hover:bg-white/10 transition-colors ${r.rating === 'up' ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:text-emerald-300'}`}
                                            title="Rate Good"
                                            aria-label="Rate Good"
                                        >
                                            <ThumbsUp size={12} />
                                        </button>
                                        <button 
                                            onClick={() => handleRateResult(r.personaId, 'down')}
                                            className={`p-1.5 rounded hover:bg-white/10 transition-colors ${r.rating === 'down' ? 'text-red-400 bg-red-500/10' : 'text-slate-500 hover:text-red-300'}`}
                                            title="Rate Bad"
                                            aria-label="Rate Bad"
                                        >
                                            <ThumbsDown size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 p-4 overflow-y-auto custom-scrollbar text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed selection:bg-fuchsia-500/30">
                                {r.output || (
                                    <div className="flex items-center gap-2 text-slate-500 animate-pulse">
                                        <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500"></span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animation-delay-200"></span>
                                        <span className="w-1.5 h-1.5 rounded-full bg-fuchsia-500 animation-delay-400"></span>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>

        {/* Edit Modal */}
        {editingPersona && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-in fade-in duration-200">
                <div className="glass-panel bg-[#0f0720] border-white/10 rounded-xl p-6 w-full max-w-lg shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                    <h3 className="text-sm font-mono font-bold text-slate-200 mb-6 flex items-center gap-2">
                        <MessageSquare size={16} className="text-cyan-400" /> EDIT_PERSONA
                    </h3>
                    
                    <div className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-mono text-slate-500 mb-1.5 uppercase tracking-wider">Name</label>
                            <input 
                                type="text" 
                                value={editingPersona.name}
                                onChange={e => setEditingPersona({...editingPersona, name: e.target.value})}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-sm text-slate-200 focus:border-cyan-500/50 focus:bg-black/40 outline-none transition-all"
                                aria-label="Persona Name"
                                placeholder="Enter persona name"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-mono text-slate-500 mb-1.5 uppercase tracking-wider">System Prompt</label>
                            <textarea 
                                value={editingPersona.systemPrompt}
                                onChange={e => setEditingPersona({...editingPersona, systemPrompt: e.target.value})}
                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2.5 text-sm text-slate-200 focus:border-cyan-500/50 focus:bg-black/40 outline-none h-40 font-mono text-xs resize-none custom-scrollbar transition-all"
                                aria-label="System Prompt"
                                placeholder="Enter system prompt"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button 
                            onClick={() => setEditingPersona(null)}
                            className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors"
                        >
                            CANCEL
                        </button>
                        <button 
                            onClick={() => savePersona(editingPersona)}
                            className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-mono flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
                        >
                            <Save size={14} /> SAVE_CHANGES
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

const ActivityIcon = () => (
    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
);

export default ExperimentLab;
