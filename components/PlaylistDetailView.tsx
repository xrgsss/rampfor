import React from 'react';
import { ChevronLeft, Music, Trash2 } from 'lucide-react';
import { Playlist, Song } from '../types';
import SongCard from './SongCard';

interface PlaylistDetailViewProps {
  playlist: Playlist;
  songs: Song[];
  onBack: () => void;
  onPlay: (song: Song) => void;
  onToggleLike: (id: string) => void;
  onShowDetail: (song: Song) => void;
  onRemoveSong: (song: Song) => Promise<void>;
  currentSongId?: string;
  isLoading: boolean;
  error?: string | null;
}

const PlaylistDetailView: React.FC<PlaylistDetailViewProps> = ({
  playlist,
  songs,
  onBack,
  onPlay,
  onToggleLike,
  onShowDetail,
  onRemoveSong,
  currentSongId,
  isLoading,
  error
}) => {
  const total = songs.length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="text-white/60 hover:text-white transition-colors p-2 bg-white/5 rounded-full"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-gray-500">Playlist</p>
          <h1 className="text-3xl font-black">{playlist.name}</h1>
          <p className="text-sm text-gray-400">{playlist.description || 'Playlist pribadi'}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 p-6 bg-[#0a0a0a]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-700 to-purple-400 flex items-center justify-center">
              <Music size={28} />
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.5em] text-gray-500">Tracks</p>
              <p className="text-lg font-bold">{total} {total === 1 ? 'song' : 'songs'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <p className="text-gray-400">Memuat...</p>
          ) : error ? (
            <p className="text-red-400">Gagal memuat playlist: {error}</p>
          ) : songs.length === 0 ? (
            <p className="text-gray-500">Belum ada lagu dalam playlist ini.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {songs.map(song => (
                <div key={song.id} className="space-y-2">
                  <SongCard
                    song={song}
                    isActive={currentSongId === song.id}
                    onPlay={onPlay}
                    onToggleLike={onToggleLike}
                    onShowDetail={onShowDetail}
                  />
                  <button
                    onClick={() => onRemoveSong(song)}
                    className="w-full text-center px-3 py-2 border border-red-500 text-red-500 rounded-lg text-xs uppercase tracking-widest hover:bg-red-500/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Trash2 size={14} />
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistDetailView;
