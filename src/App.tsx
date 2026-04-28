/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { SnakeGame } from './components/SnakeGame';
import { MusicPlayer } from './components/MusicPlayer';

// SoundHelix provides high-quality AI-generated royalty-free music 
const TRACKS = [
  { title: 'Synthwave Matrix', artist: 'AI generated (SoundHelix)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { title: 'Neon Highway', artist: 'AI generated (SoundHelix)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { title: 'Cybernetic Pulse', artist: 'AI generated (SoundHelix)', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
];

export default function App() {
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);

  const handleScoreChange = (newScore: number) => {
    setScore(newScore);
    if (newScore > highScore) setHighScore(newScore);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#050505] text-white font-sans select-none">
      <header className="p-8 flex justify-between items-baseline border-b border-white/10 shrink-0">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter neon-cyan italic">SYNTH-SNAKE</h1>
        <div className="flex flex-col items-end">
          <span className="text-xs uppercase tracking-[0.3em] opacity-50">System Status</span>
          <span className="text-sm font-mono neon-magenta">SYNCHRONIZED_AUDIO_STREAM</span>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <aside className="w-80 border-r border-white/10 bg-panel flex flex-col shrink-0">
          <MusicPlayer tracks={TRACKS} />
        </aside>

        <section className="flex-1 relative flex items-center justify-center p-8 bg-[#050505]">
          {/* Background grid */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-50"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '25px 25px'
            }}
          />

          <div className="absolute top-12 left-12 text-left z-10 hidden md:block">
            <p className="text-xs uppercase tracking-[0.5em] opacity-30">High Score</p>
            <p className="text-4xl lg:text-5xl font-black text-white/10">{highScore.toString().padStart(6, '0')}</p>
          </div>
          <div className="absolute top-12 right-12 text-right z-10 hidden md:block">
            <p className="text-xs uppercase tracking-[0.5em] opacity-50">Current Score</p>
            <p className="text-5xl lg:text-6xl font-black neon-magenta">{score.toString().padStart(6, '0')}</p>
          </div>
          
          <div className="md:hidden absolute top-8 left-1/2 -translate-x-1/2 text-center z-10 w-full px-4 flex justify-between">
            <div>
               <p className="text-[10px] uppercase tracking-[0.2em] opacity-30">HI</p>
               <p className="text-2xl font-black text-white/20">{highScore.toString().padStart(6, '0')}</p>
            </div>
            <div>
               <p className="text-[10px] uppercase tracking-[0.2em] opacity-50">SCORE</p>
               <p className="text-3xl font-black neon-magenta">{score.toString().padStart(6, '0')}</p>
            </div>
          </div>

          <div className="neon-border rounded-sm z-10 shadow-[0_0_15px_rgba(0,243,255,0.1)] bg-transparent">
            <SnakeGame onScoreChange={handleScoreChange} />
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-10">
            <div className="px-4 py-1 border border-white/10 rounded text-[10px] font-mono opacity-40">WASD: MOVE</div>
            <div className="px-4 py-1 border border-white/10 rounded text-[10px] font-mono opacity-40">SPACE: START</div>
          </div>
        </section>
      </main>
    </div>
  );

}
