import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Activity, Radio, Volume2 } from 'lucide-react';
import { LiveSession } from '../services/geminiService';

export const LiveDemo: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [volume, setVolume] = useState(0);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'connected'>('idle');
  const liveSessionRef = useRef<LiveSession | null>(null);
  
  // Visualization bars
  const bars = Array.from({ length: 12 });

  const toggleConnection = async () => {
    if (isConnected) {
      liveSessionRef.current?.disconnect();
      setIsConnected(false);
      setStatus('idle');
      setVolume(0);
    } else {
      setStatus('connecting');
      try {
        liveSessionRef.current = new LiveSession((vol) => {
          setVolume(vol);
        });
        await liveSessionRef.current.connect(() => {});
        setIsConnected(true);
        setStatus('connected');
      } catch (error) {
        console.error("Failed to connect live session", error);
        setStatus('idle');
        alert("Failed to access microphone or connect to Gemini Live. Check console for details.");
      }
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (liveSessionRef.current) {
        liveSessionRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div className="h-full flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Ambient Effect */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isConnected ? 'opacity-100' : 'opacity-0'}`}>
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gemini-500/10 rounded-full blur-[100px] animate-pulse-fast"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-12">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-panel border border-gray-700 text-xs font-medium uppercase tracking-wider text-gemini-400 mb-4">
            <Radio size={14} className={isConnected ? "animate-pulse" : ""} />
            Gemini 2.0 Live API
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
            Real-time Voice
          </h1>
          <p className="text-gray-400 max-w-md mx-auto">
            Experience low-latency conversational AI. Speak naturally to Gemini.
          </p>
        </div>

        {/* Visualizer */}
        <div className="h-24 flex items-center justify-center gap-2">
          {bars.map((_, i) => (
            <div
              key={i}
              className={`w-3 bg-gradient-to-t from-gemini-600 to-gemini-400 rounded-full transition-all duration-75 ease-in-out ${isConnected ? '' : 'opacity-20 h-2'}`}
              style={{
                height: isConnected 
                  ? `${Math.max(8, Math.min(100, volume * 100 * (0.5 + Math.random())))}%` 
                  : '8px'
              }}
            />
          ))}
        </div>

        {/* Main Control Button */}
        <button
          onClick={toggleConnection}
          className={`
            relative group w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300
            ${isConnected 
              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border-2 border-red-500/50' 
              : 'bg-gemini-600 hover:bg-gemini-500 text-white shadow-lg shadow-gemini-500/30'
            }
          `}
        >
          {status === 'connecting' ? (
             <div className="absolute inset-0 border-4 border-t-transparent border-white/30 rounded-full animate-spin"></div>
          ) : null}
          
          {isConnected ? <MicOff size={32} /> : <Mic size={32} />}
          
          {/* Ripple effect when active */}
          {isConnected && (
            <span className="absolute inset-0 rounded-full border border-red-500 animate-ping opacity-20"></span>
          )}
        </button>

        <div className="h-8">
           {status === 'connected' && (
             <p className="text-emerald-400 flex items-center gap-2 text-sm font-medium animate-pulse">
               <Activity size={16} /> Listening...
             </p>
           )}
        </div>
      </div>
      
      {/* Information Cards */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 text-xs text-gray-500">
         <div className="flex items-center gap-2 bg-panel px-3 py-2 rounded-lg border border-gray-800">
            <Volume2 size={14} /> 24kHz Audio Output
         </div>
         <div className="flex items-center gap-2 bg-panel px-3 py-2 rounded-lg border border-gray-800">
            <Mic size={14} /> 16kHz Audio Input
         </div>
      </div>
    </div>
  );
};