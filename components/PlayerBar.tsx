
import React from 'react';
import { 
  SkipBack, 
  SkipForward, 
  Play, 
  Pause, 
  Volume2, 
  Shuffle, 
  Repeat, 
  Heart, 
  Share,
  ListMusic,
  MonitorSpeaker
} from 'lucide-react';
import { Song, RepeatMode } from '../types';

interface PlayerBarProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onNext: () => void;
  onPrev: () => void;
  progress: number;
  duration: number;
  onSeek: (value: number) => void;
  volume: number;
  onVolumeChange: (value: number) => void;
  onToggleLike: (id: string) => void;
  onOpenDetail?: (song: Song) => void;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onShare: (song: Song) => void;
}

const PlayerBar: React.FC<PlayerBarProps> = ({ 
  currentSong, 
  isPlaying, 
  onTogglePlay, 
  onNext, 
  onPrev, 
  progress, 
  duration, 
  onSeek,
  volume,
  onVolumeChange,
  onToggleLike,
  onOpenDetail,
  repeatMode,
  isShuffle,
  onToggleShuffle,
  onToggleRepeat,
  onShare
}) => {

  const isLiked = currentSong?.isLiked || false;
  const progressPercent = (progress / (duration || 1)) * 100;

  return (
    <div className="fixed bottom-[92px] left-4 right-4 md:bottom-0 md:left-0 md:right-0 md:relative h-[68px] md:h-24 bg-[#0a0a0a] md:bg-[#0d0d0d]/95 backdrop-blur-3xl md:backdrop-blur-xl border border-white/10 md:border-t md:border-[#1a1a1a] rounded-full md:rounded-none px-2.5 md:px-8 flex items-center z-[80] shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all">
      
      {/* Custom Spin Animation Style */}
      <style>{`
        @keyframes slow-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-slow-spin {
          animation: slow-spin 8s linear infinite;
        }
        .animation-paused {
          animation-play-state: paused;
        }
      `}</style>

      {/* Desktop Seek Bar (Absolute Top) */}
      <div className="hidden md:block absolute top-0 left-0 right-0 h-1.5 -translate-y-1/2 group cursor-pointer">
        <input 
          type="range" 
          min="0" 
          max={duration || 100}
          value={progress}
          onChange={(e) => onSeek(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full bg-transparent opacity-0 cursor-pointer z-20"
        />
        <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-[2px] md:h-1 bg-[#1a1a1a]"></div>
        <div 
            className="absolute top-1/2 -translate-y-1/2 left-0 h-[2px] md:h-1 bg-white transition-all"
            style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full scale-0 md:group-hover:scale-100 transition-transform shadow-lg"></div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 w-full h-full">
        
        {/* Left: Playback & Info */}
        <div 
          onClick={() => currentSong && onOpenDetail?.(currentSong)}
          className="flex items-center gap-3.5 flex-1 min-w-0 cursor-pointer group/info"
        >
          {/* Mobile Play Button with Rotating Cover - Icon stays Static */}
          <div className="md:hidden relative w-12 h-12 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform">
            <div className="absolute inset-0 rounded-full bg-black shadow-lg"></div>
            <div className={`absolute inset-0.5 rounded-full overflow-hidden border border-white/10 ${isPlaying ? 'animate-slow-spin' : 'animation-paused'}`}>
              <img 
                src={currentSong?.coverUrl || 'https://picsum.photos/seed/music/100/100'} 
                alt="Cover" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute inset-0.5 rounded-full bg-black/30 flex items-center justify-center pointer-events-none group-hover/info:bg-black/50 transition-colors">
                {isPlaying ? (
                  <Pause size={18} fill="white" stroke="none" />
                ) : (
                  <Play size={18} fill="white" stroke="none" className="ml-0.5" />
                )}
            </div>
          </div>

          {/* Desktop Album Art (Small) */}
          <div className="hidden md:block w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border border-white/10 group-hover/info:scale-105 transition-transform">
            <img 
              src={currentSong?.coverUrl || 'https://picsum.photos/seed/music/100/100'} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          </div>

          {/* Text Info */}
          <div className="min-w-0 flex flex-col justify-center">
            <h4 className="font-black text-white text-[14px] md:text-base truncate leading-none tracking-tight uppercase group-hover/info:text-green-500 transition-colors">
              {currentSong?.title || 'No Song'}
            </h4>
            <p className="text-gray-500 text-[12px] md:text-sm truncate font-medium mt-1">
              {currentSong?.artist || 'Unknown Artist'}
            </p>
          </div>
        </div>

        {/* Center: Desktop Controls Only */}
        <div className="hidden md:flex flex-1 items-center justify-center gap-6">
          <button onClick={onToggleShuffle} className={`p-2 transition-colors ${isShuffle ? 'text-white' : 'text-gray-500 hover:text-white'}`}>
            <Shuffle size={18} />
          </button>
          <button onClick={onPrev} className="p-2 text-white hover:text-white/70 transition-colors">
            <SkipBack size={24} fill="currentColor" />
          </button>
          <button onClick={onTogglePlay} className="p-4 bg-white text-black rounded-full hover:scale-105 active:scale-90 transition-all shadow-lg flex items-center justify-center">
            {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
          </button>
          <button onClick={onNext} className="p-2 text-white hover:text-white/70 transition-colors">
            <SkipForward size={24} fill="currentColor" />
          </button>
          <button onClick={onToggleRepeat} className={`p-2 transition-colors relative ${repeatMode === 'none' ? 'text-gray-500 hover:text-white' : 'text-white'}`}>
            <Repeat size={18} />
            {repeatMode === 'one' && <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold mt-0.5 text-black">1</span>}
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 md:gap-4 flex-shrink-0 pr-2">
          <button className="text-gray-400 hover:text-white md:hidden active:scale-90 transition-all p-1">
            <MonitorSpeaker size={22} strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => currentSong && onToggleLike(currentSong.id)}
            className={`p-1 transition-all active:scale-75 ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
          >
            <Heart size={22} fill={isLiked ? 'currentColor' : 'none'} strokeWidth={1.5} />
          </button>
          <button 
            onClick={() => currentSong && onShare(currentSong)}
            className="p-1 transition-all active:scale-75 text-gray-400 hover:text-white"
          >
            <Share size={20} strokeWidth={1.5} />
          </button>
          
          {/* Desktop Volume Slider */}
          <div className="hidden md:flex items-center gap-4 ml-2">
            <button className="text-gray-500 hover:text-white transition-colors"><ListMusic size={20} /></button>
            <div className="flex items-center gap-2 group/vol w-24">
              <Volume2 size={18} className="text-gray-500 group-hover/vol:text-white" />
              <input type="range" min="0" max="1" step="0.01" value={volume} onChange={(e) => onVolumeChange(parseFloat(e.target.value))} className="w-full h-1 bg-[#222] rounded-full appearance-none accent-white cursor-pointer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlayerBar;
