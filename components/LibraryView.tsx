
import React from 'react';
import { Heart, Clock, ListMusic, Plus, Play } from 'lucide-react';
import { Song, Playlist } from '../types';
import SongCard from './SongCard';
import { DEFAULT_COVER_IMAGE } from '../constants';

interface LibraryViewProps {
  likedSongs: Song[];
  recentlyPlayed: Song[];
  onPlay: (song: Song) => void;
  onToggleLike: (id: string) => void;
  onFindMusicClick: () => void;
  currentSongId?: string;
  userId?: string;
  onEdit?: (song: Song) => void;
  onDelete?: (id: string) => void;
  playlists: Playlist[];
  onShowDetail: (song: Song) => void;
  focusPlaylists?: boolean;
  onFocusedPlaylists?: () => void;
  onOpenPlaylistDetail: (playlist: Playlist) => void;
}

const LibraryView: React.FC<LibraryViewProps> = ({ 
  likedSongs, 
  recentlyPlayed, 
  onPlay, 
  onToggleLike, 
  onFindMusicClick,
  currentSongId,
  userId,
  onEdit,
  onDelete,
  playlists,
  onShowDetail,
  focusPlaylists,
  onFocusedPlaylists,
  onOpenPlaylistDetail
}) => {
  const playlistRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (focusPlaylists && playlistRef.current) {
      playlistRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      onFocusedPlaylists?.();
    }
  }, [focusPlaylists, onFocusedPlaylists]);

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-2">Library</h1>
        <p className="text-gray-500 text-sm md:text-base font-medium">Your collection, curated by you.</p>
      </header>

      {/* Liked Songs Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
            <Heart size={20} fill="currentColor" />
          </div>
          <h2 className="text-xl md:text-2xl font-bold">Liked Songs</h2>
          <span className="text-sm text-gray-500 font-medium ml-auto">{likedSongs.length} songs</span>
        </div>
        
        {likedSongs.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {likedSongs.map(song => (
              <SongCard 
                key={song.id} 
                song={song} 
                isActive={currentSongId === song.id} 
                isOwner={userId === song.userId}
                onPlay={onPlay} 
                onToggleLike={onToggleLike}
                onShowDetail={onShowDetail}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          <div className="bg-[#121212] border border-[#222] rounded-2xl p-8 text-center">
            <p className="text-gray-500 mb-4 font-medium">Songs you like will appear here.</p>
            <button 
              onClick={onFindMusicClick}
              className="px-6 py-2 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition-transform active:scale-95"
            >
              Find music
            </button>
          </div>
        )}
      </section>

      {/* Recently Played Section */}
      <section>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
            <Clock size={20} />
          </div>
          <h2 className="text-xl md:text-2xl font-bold">Recently Played</h2>
        </div>
        
        {recentlyPlayed.length > 0 ? (
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {recentlyPlayed.map(song => (
              <div 
                key={song.id}
                className="flex-shrink-0 w-32 md:w-40 group cursor-pointer"
                onClick={() => onPlay(song)}
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-2">
                  <img src={song.coverUrl || DEFAULT_COVER_IMAGE} alt={song.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className={`absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ${currentSongId === song.id ? 'opacity-100' : ''}`}>
                    <div className="p-3 bg-green-500 rounded-full text-black shadow-lg shadow-green-500/20">
                      <Play size={20} fill="currentColor" />
                    </div>
                  </div>
                </div>
                <h4 className={`text-sm font-bold truncate ${currentSongId === song.id ? 'text-green-500' : 'text-white'}`}>{song.title}</h4>
                <p className="text-xs text-gray-500 truncate">{song.artist}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm italic">Play some songs to see your history!</p>
        )}
      </section>

      {/* Playlists Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg">
              <ListMusic size={20} />
            </div>
            <h2 className="text-xl md:text-2xl font-bold">Playlists</h2>
          </div>
          <button className="p-2 hover:bg-[#121212] rounded-full transition-colors group">
            <Plus className="text-gray-400 group-hover:text-white" size={24} />
          </button>
        </div>

        <div ref={playlistRef} className={`${focusPlaylists ? 'ring-2 ring-green-500/70 rounded-2xl' : ''} transition-all`}>
          
          {playlists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
            {playlists.map(playlist => {
              return (
                <button
                  key={playlist.id}
                  onClick={() => onOpenPlaylistDetail(playlist)}
                  className="group bg-[#121212] border border-[#1a1a1a] p-4 rounded-2xl hover:bg-[#1a1a1a] transition-all cursor-pointer relative overflow-hidden text-left"
                >
                  <div className={`absolute inset-0 ${focusPlaylists ? 'bg-gradient-to-br from-purple-600/60 via-purple-700/50 to-black' : 'bg-gradient-to-br from-purple-900/60 via-purple-800/40 to-black'}`} />
                  <div className="flex flex-col h-full relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 shadow-xl">
                        <ListMusic size={20} />
                      </div>
                      <span className="text-xs text-gray-400">{playlist.trackCount} lagu</span>
                    </div>
                    <h3 className="font-bold text-lg mb-1 group-hover:text-green-500 transition-colors">{playlist.name}</h3>
                    <p className="text-gray-500 text-xs line-clamp-2">{playlist.description || 'Playlist kosong'}</p>
                  </div>
                </button>
              );
            })}
            <button className="border-2 border-dashed border-[#222] rounded-2xl p-4 flex flex-col items-center justify-center gap-3 text-gray-500 hover:border-green-500/50 hover:text-green-500 transition-all min-h-[160px]">
              <Plus size={32} />
              <span className="font-bold text-sm">Create Playlist</span>
            </button>
          </div>
        ) : (
          <div className="bg-[#121212] border border-[#222] rounded-2xl p-8 text-center">
            <p className="text-gray-500 mb-4 font-medium">Belum ada playlist. Buat satu untuk menyimpan lagu favoritmu.</p>
            <button className="px-6 py-2 bg-white text-black rounded-full font-bold text-sm hover:scale-105 transition-transform active:scale-95">
              Create Playlist
            </button>
          </div>
        )}
        </div>
      </section>
    </div>
  );
};

export default LibraryView;
