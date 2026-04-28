import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';

interface Track {
  title: string;
  artist: string;
  url: string;
}

interface MusicPlayerProps {
  tracks: Track[];
}

export function MusicPlayer({ tracks }: MusicPlayerProps) {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [eqHeights, setEqHeights] = useState([20, 20, 20, 20]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(e => console.error("Playback prevented:", e));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrackIndex]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      interval = setInterval(() => {
        setEqHeights([
          Math.random() * 80 + 20,
          Math.random() * 80 + 20,
          Math.random() * 80 + 20,
          Math.random() * 80 + 20,
        ]);
      }, 150);
    } else {
      setEqHeights([20, 20, 20, 20]);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const playNext = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % tracks.length);
    setIsPlaying(true);
  };
  
  const playPrev = () => {
    setCurrentTrackIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
    setIsPlaying(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const p = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setProgress(isNaN(p) ? 0 : p);
    }
  };

  const handleEnded = () => {
    playNext();
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  const formatTime = (time: number) => {
    if (isNaN(time)) return "00:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-8 flex flex-col gap-8 w-full h-full overflow-hidden text-white">
      <audio 
        ref={audioRef} 
        src={currentTrack.url} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
      />
      
      <section>
        <h2 className="text-xs uppercase tracking-widest opacity-40 mb-4 font-sans">Now Playing</h2>
        <div className="p-4 neon-border rounded-lg bg-black/40">
          <div className="w-full aspect-square bg-white/5 mb-4 flex items-center justify-center rounded overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-[#00f3ff]/20 to-[#ff00ff]/20" />
            <div className="w-12 h-12 border-2 border-white/20 rounded-full flex items-center justify-center z-10 backdrop-blur-sm shadow-[0_0_15px_rgba(255,0,255,0.2)]">
               {isPlaying ? (
                  <div className="flex gap-1 h-4 items-center">
                    {eqHeights.map((h, i) => (
                      <div key={i} className="w-[3px] bg-[#00f3ff] rounded-sm transition-all" style={{height: `${h}%`, boxShadow: '0 0 5px #00f3ff'}} />
                    ))}
                  </div>
               ) : (
                  <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-white border-b-[8px] border-b-transparent ml-1"></div>
               )}
            </div>
          </div>
          <p className="font-bold text-lg leading-tight font-sans text-white">{currentTrack.title}</p>
          <p className="text-xs opacity-50 font-mono text-white mt-1 truncate">{currentTrack.artist}</p>
        </div>
      </section>

      {/* Controls & Progress */}
      <section className="flex flex-col gap-4">
         <div className="flex justify-between text-[10px] font-mono opacity-50">
           <span>{formatTime((audioRef.current?.currentTime) || 0)}</span>
           <span>{formatTime((audioRef.current?.duration) || 0)}</span>
         </div>
         <div 
           className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden cursor-pointer group relative"
           onClick={(e) => {
             if (audioRef.current) {
               const rect = e.currentTarget.getBoundingClientRect();
               const percent = (e.clientX - rect.left) / rect.width;
               audioRef.current.currentTime = percent * audioRef.current.duration;
               setProgress(percent * 100);
             }
           }}
         >
           <div 
             className="h-full bg-[#00f3ff] shadow-[0_0_8px_#00f3ff] pointer-events-none"
             style={{ width: `${progress}%` }}
           />
         </div>

         <div className="flex items-center justify-between mt-2 px-2">
            <button onClick={toggleMute} className="opacity-50 hover:opacity-100 transition-opacity">
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <div className="flex gap-4 items-center">
               <button onClick={playPrev} className="opacity-50 hover:opacity-100 transition-opacity">
                 <SkipBack size={20} />
               </button>
               <button 
                 onClick={togglePlay} 
                 className="w-12 h-12 rounded-full border border-white flex items-center justify-center hover:bg-white/10 transition-colors"
               >
                 {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-1" />}
               </button>
               <button onClick={playNext} className="opacity-50 hover:opacity-100 transition-opacity">
                 <SkipForward size={20} />
               </button>
            </div>
            <div className="w-[18px]"></div>
         </div>
      </section>
      
      <section className="flex-1 overflow-y-auto pr-2 mt-4">
        <h2 className="text-xs uppercase tracking-widest opacity-40 mb-4 font-sans">Playlist</h2>
        <div className="space-y-4 font-mono text-sm">
          {tracks.map((track, i) => {
            const isActive = i === currentTrackIndex;
            return (
              <div 
                key={i} 
                className={`flex justify-between cursor-pointer group transition-colors ${isActive ? 'neon-cyan' : 'text-white opacity-50 hover:opacity-100'}`}
                onClick={() => {
                  setCurrentTrackIndex(i);
                  setIsPlaying(true);
                }}
              >
                <div className="flex gap-4 items-center truncate w-full pr-2">
                  <span className={`${isActive ? 'opacity-100' : 'opacity-50 group-hover:opacity-100'} text-xs shrink-0 pl-1`}>
                     {(i+1).toString().padStart(2, '0')}
                  </span> 
                  <span className="truncate">{track.title}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
