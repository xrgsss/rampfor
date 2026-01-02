
import React from 'react';
import { 
  ChevronLeft, 
  ListMusic, 
  Heart, 
  SkipBack, 
  Play, 
  Pause, 
  SkipForward, 
  Repeat,
  Share
} from 'lucide-react';
import { Song, RepeatMode } from '../types';

interface SongDetailViewProps {
  song: Song;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  onClose: () => void;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  onSeek: (val: number) => void;
  onVolumeChange: (val: number) => void;
  onToggleLike: (id: string) => void;
  repeatMode: RepeatMode;
  onToggleRepeat: () => void;
  onShare: (song: Song) => void;
  onOpenPlaylists: (song?: Song) => void;
}

const SongDetailView: React.FC<SongDetailViewProps> = ({
  song,
  isPlaying,
  progress,
  duration,
  volume,
  onClose,
  onTogglePlay,
  onNext,
  onPrev,
  onSeek,
  onVolumeChange,
  onToggleLike,
  repeatMode,
  onToggleRepeat,
  onShare,
  onOpenPlaylists
}) => {
  const progressPercent = (progress / (duration || 1)) * 100;
  
  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#000] overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-500 font-sans">
      {/* Subtle Background Glow - Very minimal to stay "Black" */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-10 blur-[120px]"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${song.isLiked ? '#ef4444' : '#22d3ee'} 0%, transparent 60%)`
          }}
        />
      </div>

      <style>{`
        @keyframes vinyl-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .vinyl-rotate {
          animation: vinyl-spin 12s linear infinite;
        }
        .vinyl-paused {
          animation-play-state: paused;
        }
      `}</style>

      {/* Header - Minimalist */}
      <header className="relative z-10 flex items-center justify-between px-6 py-6">
        <button onClick={onClose} className="text-white/40 hover:text-white transition-colors p-1">
          <ChevronLeft size={22} strokeWidth={2.5} />
        </button>
        <h4 className="text-[9px] font-black uppercase tracking-[0.5em] text-white/30">Playing Now</h4>
        <button onClick={() => onOpenPlaylists(song)} className="text-white/40 hover:text-white transition-colors p-1">
          <ListMusic size={20} />
        </button>
      </header>

      {/* Main Content Area - Ultra Compact Layout */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-10 max-w-sm mx-auto w-full pb-10">
        
        {/* Artwork Container - Shrunk from 260px to 210px */}
        <div className="w-full max-w-[210px] aspect-square rounded-[36px] bg-[#0a0a0a] shadow-[0_25px_50px_-12px_rgba(0,0,0,1)] border border-white/[0.03] flex items-center justify-center mb-10 relative overflow-hidden">
          {/* Vinyl Record - Shrunk to 180px */}
          <div className={`relative w-[85%] aspect-square rounded-full bg-[#111] shadow-2xl flex items-center justify-center overflow-hidden ${isPlaying ? 'vinyl-rotate' : 'vinyl-paused'}`}>
            <div className="absolute inset-0 opacity-20 bg-[repeating-radial-gradient(circle_at_center,_transparent_0,_transparent_2px,_rgba(255,255,255,0.05)_3px,_transparent_4px)]" />
            
            {/* Album Label */}
            <div className="relative z-10 w-[38%] h-[38%] rounded-full overflow-hidden border-[2px] border-black shadow-inner">
               <img src={song.coverUrl} alt="" className="w-full h-full object-cover" />
            </div>
            
            {/* Center Hole */}
            <div className="absolute z-20 w-2 h-2 bg-black rounded-full border border-white/10 shadow-inner"></div>
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent -rotate-45 pointer-events-none" />
          </div>
        </div>

        {/* Typography - Bold, Uppercase, Precise */}
        <div className="text-center space-y-1 mb-10">
          <h1 className="text-lg font-black text-white tracking-tight px-4 leading-tight uppercase">
            {song.title}
          </h1>
          <p className="text-[10px] font-bold text-white/20 tracking-[0.25em] uppercase">
            {song.artist}
          </p>
        </div>

        {/* Progress System - Thinner & Tighter */}
        <div className="w-full space-y-3 mb-10">
          <div className="flex justify-between text-[9px] font-bold text-white/20 tracking-widest px-0.5">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="relative h-0.5 w-full group cursor-pointer bg-white/5 rounded-full">
            <input 
              type="range"
              min="0"
              max={duration || 100}
              value={progress}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer"
            />
            <div 
              className="h-full bg-cyan-400 rounded-full relative transition-all"
              style={{ width: `${progressPercent}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transform scale-100 group-hover:scale-125 transition-transform"></div>
            </div>
          </div>
        </div>

        {/* Playback Controls Hub - Jewel-like sizes */}
        <div className="w-full flex items-center justify-between gap-2 px-2">
          <button 
            onClick={() => onToggleLike(song.id)}
            className={`transition-all active:scale-75 p-2 ${song.isLiked ? 'text-red-500' : 'text-white/15 hover:text-white/40'}`}
          >
            <Heart size={18} fill={song.isLiked ? 'currentColor' : 'none'} strokeWidth={2.5} />
          </button>

          <div className="flex items-center gap-6">
            <button onClick={onPrev} className="text-white/30 hover:text-white transition-all active:scale-90 p-2">
              <SkipBack size={22} fill="currentColor" />
            </button>

            {/* Premium Metallic Play Button - Shrunk to w-14 */}
            <button 
              onClick={onTogglePlay}
              className="w-14 h-14 rounded-full flex items-center justify-center relative group active:scale-95 transition-transform"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#f8fafc] via-[#94a3b8] to-[#475569] shadow-[0_8px_20px_rgba(0,0,0,0.6)]" />
              <div className="absolute inset-[1.5px] rounded-full bg-gradient-to-tr from-[#ffffff] via-[#cbd5e1] to-[#94a3b8] flex items-center justify-center">
                 {isPlaying ? (
                   <Pause size={22} className="text-[#1e293b]" fill="currentColor" />
                 ) : (
                   <Play size={22} className="text-[#1e293b] ml-1" fill="currentColor" />
                 )}
              </div>
            </button>

            <button onClick={onNext} className="text-white/30 hover:text-white transition-all active:scale-90 p-2">
              <SkipForward size={22} fill="currentColor" />
            </button>
          </div>

          <button 
            onClick={onToggleRepeat}
            className={`text-white/15 hover:text-white transition-all p-2 relative ${repeatMode === 'none' ? '' : 'text-green-400'}`}
          >
            <Repeat size={18} />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 text-[8px] font-black bg-green-500 text-black rounded-full px-1">
                1
              </span>
            )}
          </button>
        </div>

        <div className="w-full flex items-center gap-3 mt-6">
          <span className="text-[10px] font-bold text-white/40 tracking-[0.5em] uppercase">Volume</span>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume} 
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="flex-1 h-1 rounded-full bg-white/20 accent-white cursor-pointer"
          />
          <button
            onClick={() => onShare(song)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all"
          >
            <Share size={18} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SongDetailView;
