import React, { useEffect, useRef, useState } from 'react';
import { liveClient } from '../services/live/liveClient';
import { Mic, MicOff, PhoneOff, Activity, Zap, Radio, Cpu, Wifi } from 'lucide-react';

interface LiveVoiceInterfaceProps {
  onClose: () => void;
}

const LiveVoiceInterface: React.FC<LiveVoiceInterfaceProps> = ({ onClose }) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [isMicOn, setIsMicOn] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const particlesRef = useRef<any[]>([]);

  useEffect(() => {
    // Initialize Client
    liveClient.onConnect = () => setStatus('connected');
    liveClient.onDisconnect = () => {
        setStatus('connecting');
        onClose();
    };
    liveClient.onError = (err) => {
        console.error("Live Error", err);
        setStatus('error');
    };

    liveClient.connect();

    return () => {
      liveClient.disconnect();
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [onClose]);

  // Advanced Visualization Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize particles
    for(let i=0; i<50; i++) {
        particlesRef.current.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2,
            alpha: Math.random() * 0.5
        });
    }

    let time = 0;

    const draw = () => {
      time += 0.01;
      
      // Clear with fade effect for trails
      ctx.fillStyle = 'rgba(2, 6, 23, 0.15)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // --- Background Particles ---
      ctx.fillStyle = '#94a3b8';
      particlesRef.current.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          
          // Wrap around
          if(p.x < 0) p.x = canvas.width;
          if(p.x > canvas.width) p.x = 0;
          if(p.y < 0) p.y = canvas.height;
          if(p.y > canvas.height) p.y = 0;

          ctx.globalAlpha = p.alpha;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      // --- Central Core ---
      const baseRadius = 60;
      const pulse = Math.sin(time * 3) * 5;
      const radius = baseRadius + pulse;

      // Core Glow
      const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.2, centerX, centerY, radius * 2.5);
      if (status === 'connected') {
          gradient.addColorStop(0, 'rgba(34, 211, 238, 0.8)'); // Cyan Core
          gradient.addColorStop(0.4, 'rgba(168, 85, 247, 0.2)'); // Purple Mid
          gradient.addColorStop(1, 'rgba(34, 211, 238, 0)');
      } else if (status === 'error') {
          gradient.addColorStop(0, 'rgba(239, 68, 68, 0.8)');
          gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
      } else {
          gradient.addColorStop(0, 'rgba(148, 163, 184, 0.5)');
          gradient.addColorStop(1, 'rgba(148, 163, 184, 0)');
      }

      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // --- Rotating Rings ---
      if (status === 'connected') {
          // Ring 1
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.6)';
          ctx.lineWidth = 2;
          ctx.ellipse(centerX, centerY, radius * 1.5, radius * 1.5, time, 0, Math.PI * 2);
          ctx.stroke();

          // Ring 2 (Offset)
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
          ctx.lineWidth = 2;
          ctx.ellipse(centerX, centerY, radius * 1.8, radius * 1.8, -time * 0.5, 0, Math.PI * 2);
          ctx.stroke();
          
          // Ring 3 (Dashed)
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.3)';
          ctx.setLineDash([5, 15]);
          ctx.ellipse(centerX, centerY, radius * 2.2, radius * 2.2, time * 0.2, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
      }

      // --- Waveform Simulation ---
      if (status === 'connected') {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(34, 211, 238, 0.8)';
          ctx.lineWidth = 3;
          
          const waveCount = 8;
          for (let w = 0; w < waveCount; w++) {
              const angle = (Math.PI * 2 * w) / waveCount + time;
              const waveR = radius + Math.sin(time * 5 + w) * 10;
              const x = centerX + Math.cos(angle) * waveR;
              const y = centerY + Math.sin(angle) * waveR;
              
              // Draw "electron" dots
              ctx.beginPath();
              ctx.fillStyle = '#fff';
              ctx.arc(x, y, 3, 0, Math.PI * 2);
              ctx.fill();
          }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    // Resize handling
    const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Re-init particles on resize to cover new area
        particlesRef.current = [];
        for(let i=0; i<100; i++) {
            particlesRef.current.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                size: Math.random() * 2,
                alpha: Math.random() * 0.5
            });
        }
    };
    resize();
    window.addEventListener('resize', resize);

    draw();

    return () => window.removeEventListener('resize', resize);
  }, [status]);

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center animate-in fade-in duration-500">
      
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Header Info */}
      <div className="absolute top-0 left-0 right-0 p-8 flex justify-between items-start z-10">
         <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' : 'bg-slate-500'} animate-pulse`}></div>
            <div className="flex flex-col">
                <span className="text-xs font-mono text-slate-400 tracking-[0.2em] uppercase">System Status</span>
                <span className={`text-sm font-bold font-mono ${status === 'connected' ? 'text-cyan-400' : 'text-slate-300'}`}>
                    {status === 'connecting' && 'INITIALIZING UPLINK...'}
                    {status === 'connected' && 'NEURAL BRIDGE ACTIVE'}
                    {status === 'error' && 'CONNECTION SEVERED'}
                </span>
            </div>
         </div>

         <div className="flex items-center gap-4 text-slate-500 font-mono text-xs">
            <div className="flex items-center gap-2">
                <Wifi size={14} />
                <span>{status === 'connected' ? '12ms' : '--'}</span>
            </div>
            <div className="flex items-center gap-2">
                <Cpu size={14} />
                <span>CORE_ACTIVE</span>
            </div>
         </div>
      </div>

      {/* Central Status Text (Optional, for when not speaking) */}
      <div className="relative z-10 mt-64 text-center pointer-events-none">
         {status === 'connecting' && (
             <div className="text-cyan-500/50 font-mono text-sm animate-pulse tracking-widest">
                 ESTABLISHING SECURE HANDSHAKE
             </div>
         )}
      </div>

      {/* Bottom Controls */}
      <div className="absolute bottom-12 flex items-center gap-8 z-20">
        
        <button 
            onClick={() => setIsMicOn(!isMicOn)}
            className={`
                p-6 rounded-full transition-all duration-300 backdrop-blur-md border 
                ${isMicOn 
                    ? 'bg-slate-900/50 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400/50 shadow-[0_0_20px_-5px_rgba(34,211,238,0.3)]' 
                    : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
                }
            `}
            title={isMicOn ? "Mute Microphone" : "Unmute Microphone"}
        >
            {isMicOn ? <Mic size={28} /> : <MicOff size={28} />}
        </button>

        <button 
            onClick={onClose}
            aria-label="End Live Session"
            className="group p-8 rounded-full bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/30 transition-all duration-300 hover:scale-105 hover:shadow-red-500/50 active:scale-95 border-4 border-slate-950"
        >
            <PhoneOff size={32} className="group-hover:animate-pulse" />
        </button>

        <button 
            className="p-6 rounded-full bg-slate-900/50 border border-slate-700/50 text-slate-400 hover:text-purple-400 hover:border-purple-500/30 transition-all duration-300 backdrop-blur-md"
            title="Switch Mode (Coming Soon)"
        >
            <Radio size={28} />
        </button>

      </div>
    </div>
  );
};

export default LiveVoiceInterface;
