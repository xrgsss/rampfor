
import React from 'react';
import { Flame, Music2, Play, Shuffle } from 'lucide-react';
import { Song } from '../types';
import SongCard from './SongCard';

interface HomeViewProps {
  songs: Song[];
  onPlay: (song: Song) => void;
  currentSongId?: string;
  userId?: string;
  onEdit?: (song: Song) => void;
  onDelete?: (id: string) => void;
  onToggleLike: (id: string) => void;
  onToggleShuffle: () => void;
  isShuffle: boolean;
}

const HomeView: React.FC<HomeViewProps> = ({ songs, onPlay, currentSongId, userId, onEdit, onDelete, onToggleLike, onToggleShuffle, isShuffle }) => {
  if (songs.length === 0) {
    return (
      <div className="flex flex-col gap-6 md:gap-10 pb-20 animate-in fade-in duration-700">
        <div className="md:hidden relative w-full h-40 rounded-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-700 to-black"></div>
          <div className="relative h-full flex flex-col items-center justify-center text-center p-6">
            <h3 className="text-2xl font-black text-white tracking-tighter leading-tight drop-shadow-xl">
              Happy New Year 2026
            </h3>
            <p className="mt-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/60">Ready to start your journey?</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center py-20 text-center gap-6">
          <div className="w-20 h-20 bg-[#121212] border border-[#222] rounded-full flex items-center justify-center text-gray-600">
            <Music2 size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-black mb-2">Belum ada lagu</h2>
            <p className="text-gray-500 max-w-xs mx-auto text-sm">
              Mulai koleksi musikmu dengan mengunggah lagu favoritmu sekarang.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const featuredSong = songs[0];
  const gridSongs = songs.slice(0, 4);

  return (
    <div className="flex flex-col gap-6 md:gap-10 pb-20 animate-in fade-in duration-700">
      <div className="hidden md:flex items-center justify-between mb-2">
        <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white">Discover</h2>
      </div>

      <div className="md:hidden relative w-full h-40 rounded-2xl overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-700 to-black"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
        <div className="relative h-full flex flex-col items-center justify-center text-center p-6">
          <h3 className="text-2xl font-black text-white tracking-tighter leading-tight drop-shadow-xl">
            Happy New Year 2026
          </h3>
          <p className="mt-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/60">Dengarkan & bagikan musikmu ke siapa aja</p>
        </div>
        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-500/20 blur-3xl rounded-full"></div>
      </div>

      <div className="md:hidden flex flex-col gap-4">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#2a1a15] to-[#121212] rounded-2xl p-5 border border-[#2a1a15] group">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
               <div className="relative w-12 h-12 flex items-center justify-center">
                  <div className="absolute -left-1 w-full h-full border-2 border-orange-600/40 rounded-lg -rotate-12 translate-y-1"></div>
                  <div className="absolute w-full h-full bg-orange-600 rounded-lg flex items-center justify-center shadow-lg">
                    <Flame size={24} className="text-black" fill="currentColor" />
                  </div>
               </div>
               <span className="text-lg font-bold">Your likes</span>
            </div>
          <button
            onClick={onToggleShuffle}
            className={`relative p-2.5 bg-[#1a1a1a] rounded-xl transition-all active:scale-95 ${isShuffle ? 'text-green-400 border border-green-500/40' : 'text-gray-400 hover:text-white'}`}
          >
            <Shuffle size={20} />
          </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {gridSongs.map(song => (
            <button 
              key={song.id}
              onClick={() => onPlay(song)}
              className="flex items-center gap-3 bg-[#181818] p-2 rounded-xl text-left hover:bg-[#222] transition-all active:scale-[0.98] border border-white/5"
            >
              <img src={song.coverUrl === 'default-vinyl' ? 'https://picsum.photos/seed/music/100/100' : song.coverUrl} className="w-10 h-10 rounded-lg object-cover" alt="" />
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-white truncate leading-tight">{song.title}</p>
                <p className="text-[9px] text-gray-500 truncate">{song.artist}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-baseline gap-2">
          <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Today's Pick</h4>
        </div>
        <h3 className="text-xl md:text-2xl font-black flex items-center gap-2 px-1">
          Hot For You <span className="text-orange-500">🔥</span>
        </h3>
        
        <div className="relative bg-gradient-to-br from-[#4b4642] to-[#2b2826] rounded-[24px] p-5 md:p-8 overflow-hidden group border border-white/5 shadow-2xl">
          <div className="relative flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
              <div className="relative flex-shrink-0">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 w-20 h-20 md:w-24 md:h-24 bg-black rounded-full border border-white/5 shadow-xl -z-10 group-hover:translate-x-2 transition-transform duration-700">
                  <div className="absolute inset-0 bg-[repeating-radial-gradient(circle_at_center,_transparent_0,_transparent_1px,_rgba(255,255,255,0.05)_2px)]"></div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#222] rounded-full border border-white/10"></div>
                </div>
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden shadow-2xl relative z-10 bg-white/10">
                  <img 
                    src={featuredSong.coverUrl === 'default-vinyl' ? 'https://picsum.photos/seed/album/400/400' : featuredSong.coverUrl} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                    alt="" 
                  />
                </div>
              </div>

              <div className="min-w-0 flex flex-col justify-center">
                <h2 className="text-sm md:text-lg font-bold text-white truncate leading-tight mb-0.5 uppercase">
                  {featuredSong.title}
                </h2>
                <p className="text-[10px] md:text-sm text-white/60 font-medium mb-1">
                  Featured track
                </p>
                <p className="text-[10px] md:text-sm text-white/40 font-medium truncate uppercase">
                  {featuredSong.artist}
                </p>
              </div>
            </div>

            <button 
              onClick={() => onPlay(featuredSong)}
              className="w-12 h-12 md:w-16 md:h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 active:scale-90 transition-all shadow-2xl flex-shrink-0"
            >
              <Play size={20} className="md:w-7 md:h-7 ml-1" fill="currentColor" />
            </button>
          </div>

          <div className="mt-8 md:mt-10 flex items-center gap-2 text-white/60">
            <Music2 size={16} className="md:w-5 md:h-5" />
            <span className="text-[10px] md:text-xs font-bold tracking-tight">Just dropped</span>
          </div>
        </div>
      </div>

        <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8 mt-4">
        {songs.map(song => (
          <SongCard 
            key={song.id} 
            song={song} 
            isActive={currentSongId === song.id}
            isOwner={userId === song.userId}
            onPlay={onPlay}
            onToggleLike={onToggleLike}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default HomeView;
