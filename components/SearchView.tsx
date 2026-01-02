
import React from 'react';
import { Search as SearchIcon } from 'lucide-react';
import { Song } from '../types';
import SongCard from './SongCard';

interface SearchViewProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAiSearch: () => void;
  isSearching: boolean;
  aiSuggestions: { keywords: string[]; recommendation: string } | null;
  filteredSongs: Song[];
  onPlay: (song: Song) => void;
  onToggleLike: (id: string) => void;
  currentSongId?: string;
  userId?: string;
  onEdit?: (song: Song) => void;
  onDelete?: (id: string) => void;
  onShowDetail: (song: Song) => void;
}

const SearchView: React.FC<SearchViewProps> = ({
  searchQuery,
  setSearchQuery,
  onAiSearch,
  isSearching,
  filteredSongs,
  onPlay,
  onToggleLike,
  currentSongId,
  userId,
  onEdit,
  onDelete,
  onShowDetail
}) => {
  return (
    <div className="flex flex-col gap-6 md:gap-8 animate-in fade-in duration-500">
      <div className="relative w-full max-w-3xl">
        <h1 className="text-3xl md:text-4xl font-black mb-6 md:mb-8 tracking-tight">Search</h1>
        <div className="relative group">
          <SearchIcon className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={24} />
          <input
            type="text"
            placeholder="What do you want to listen to?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAiSearch()}
            className="w-full bg-[#121212] border border-[#222] rounded-xl md:rounded-2xl py-3.5 md:py-5 pl-11 md:pl-14 pr-12 md:pr-16 focus:outline-none focus:border-green-500/50 transition-all text-sm md:text-lg font-medium placeholder:text-gray-600"
          />
        </div>
      </div>

      {searchQuery ? (
        <div className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div>
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Search Results</h2>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredSongs.map(song => (
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
            {filteredSongs.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-500 text-lg">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SearchView;
