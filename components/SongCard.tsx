
import React, { useState, useRef, useEffect } from 'react';
import { Play, Heart, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import { Song } from '../types';
import { DEFAULT_COVER_IMAGE } from '../constants';

interface SongCardProps {
  song: Song;
  isActive: boolean;
  isOwner?: boolean;
  onPlay: (song: Song) => void;
  onToggleLike?: (id: string) => void;
  onEdit?: (song: Song) => void;
  onDelete?: (id: string) => void;
  onShowDetail?: (song: Song) => void;
}

const DefaultVinyl = () => (
  <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#1a1a1a] shadow-2xl bg-[#000]">
    <img src={DEFAULT_COVER_IMAGE} alt="Default vinyl cover" className="w-full h-full object-cover" />
  </div>
);

const SongCard: React.FC<SongCardProps> = ({ song, isActive, isOwner, onPlay, onToggleLike, onEdit, onDelete, onShowDetail }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const hasCover = Boolean(song.coverUrl);
  const coverSrc = song.coverUrl || DEFAULT_COVER_IMAGE;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div 
    className={`group relative bg-[#121212] border ${isActive ? 'border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'border-[#1a1a1a]'} rounded-xl md:rounded-2xl p-2 md:p-4 transition-all duration-300 hover:bg-[#1a1a1a] overflow-hidden w-full mx-auto max-w-[240px] sm:max-w-[260px] md:max-w-none`}
    >
      <div className="relative aspect-square mb-3 md:mb-4 flex items-center justify-center overflow-hidden rounded-lg md:rounded-xl bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_40%,_black_100%)] opacity-40 z-10"></div>
        <div className="relative z-20 w-full h-full p-2 group-hover:rotate-12 transition-transform duration-700 ease-in-out">
            {hasCover ? (
              <div className="relative w-full h-full rounded-full overflow-hidden border-2 md:border-4 border-[#1a1a1a] shadow-2xl">
                <img 
                  src={coverSrc} 
                  alt={song.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 md:w-8 md:h-8 bg-black rounded-full border border-[#222]"></div>
              </div>
            ) : (
              <DefaultVinyl />
            )}
        </div>

        {/* Owner Menu */}
        {isOwner && (
          <div className="absolute top-2 right-2 z-40" ref={menuRef}>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-white/60 hover:text-white transition-colors"
            >
              <MoreVertical size={16} />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-[#181818] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(song);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-2 text-xs font-bold text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(song.id);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 flex items-center gap-2 text-xs font-bold text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/5"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}

        <div className="hidden md:block absolute top-4 left-4 z-30">
          <span className={`text-[8px] font-bold tracking-widest uppercase ${isActive ? 'text-green-500' : 'text-gray-600'}`}>
            {isActive ? 'Playing' : 'Rampfor'}
          </span>
        </div>
        <div className="absolute bottom-2 left-2 md:bottom-4 md:left-4 z-30 text-gray-500 text-[8px] font-bold">
          {song.plays.toLocaleString()} PLAYS
        </div>
      </div>

        <div className="space-y-0.5">
          <h3 
            onClick={() => onShowDetail?.(song)}
            className="font-bold text-sm md:text-lg truncate text-white group-hover:text-green-500 transition-colors cursor-pointer"
          >
            {song.title}
          </h3>
          <p className="text-gray-500 text-[10px] md:text-sm">{song.artist}</p>
        </div>

      <div className="mt-3 md:mt-4 flex items-center gap-2">
        <button 
          onClick={() => onPlay(song)}
          className={`flex-1 py-1.5 md:py-2.5 font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all active:scale-95 text-xs md:text-base ${
            isActive ? 'bg-green-500 text-black' : 'bg-[#1a1a1a] hover:bg-[#222] border border-[#222] text-white'
          }`}
        >
          <Play size={12} className="md:w-4 md:h-4" fill="currentColor" />
          {isActive ? 'Playing' : 'Play'}
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleLike?.(song.id);
          }}
          className={`p-1.5 md:p-2.5 bg-[#1a1a1a] hover:bg-[#222] border border-[#222] rounded-lg transition-colors ${song.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-white'}`}
        >
          <Heart size={14} className="md:w-[18px] md:h-[18px]" fill={song.isLiked ? 'currentColor' : 'none'} />
        </button>
      </div>
    </div>
  );
};

export default SongCard;
