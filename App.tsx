
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import PlayerBar from './components/PlayerBar';
import HomeView from './components/HomeView';
import SearchView from './components/SearchView';
import LibraryView from './components/LibraryView';
import ProfileView from './components/ProfileView';
import TopBar from './components/TopBar';
import UploadModal from './components/UploadModal';
import EditSongModal from './components/EditSongModal';
import SongDetailView from './components/SongDetailView';
import AuthView from './components/AuthView';
import { Song, ViewType, Playlist, RepeatMode } from './types';
import { searchAIsongs } from './services/geminiService';
import { supabase } from './services/supabase';

interface RecentlyPlayedEntry {
  songId: string;
  playedAt: string;
}

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null);
  const [currentView, setCurrentView] = useState<ViewType>('home');
  const [prevView, setPrevView] = useState<ViewType>('home');
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<{keywords: string[], recommendation: string} | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [likedSongIds, setLikedSongIds] = useState<string[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [recentlyPlayedEntries, setRecentlyPlayedEntries] = useState<RecentlyPlayedEntry[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('none');
  const [isShuffle, setIsShuffle] = useState(false);
  
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recentlyPlayedSongs = useMemo(() => {
    const songMap = new Map(songs.map(song => [song.id, song]));
    return recentlyPlayedEntries
      .map(entry => songMap.get(entry.songId))
      .filter((song): song is Song => Boolean(song));
  }, [recentlyPlayedEntries, songs]);

  // Sync Supabase Auth
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) setIsAuthOpen(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch Real Songs from Supabase
  useEffect(() => {
    const fetchSongs = async () => {
      const { data, error } = await supabase
        .from('songs')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (data && !error) {
        const formattedSongs: Song[] = data.map(item => ({
          id: item.id.toString(),
          title: item.title,
          artist: item.artist,
          coverUrl: item.cover_url || 'default-vinyl',
          audioUrl: item.audio_url,
          plays: item.plays || 0,
          duration: item.duration || 180,
          isLiked: false,
          userId: item.user_id
        }));
        setSongs(formattedSongs);
      }
    };
    fetchSongs();
  }, []);

  useEffect(() => {
    if (audioRef.current && currentSong) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = volume;
    }
  }, [volume]);

  const songsLength = songs.length;

  useEffect(() => {
    if (songsLength === 0) return;
    setSongs(prevSongs => prevSongs.map(song => ({
      ...song,
      isLiked: likedSongIds.includes(song.id),
    })));
  }, [likedSongIds, songsLength]);

  useEffect(() => {
    if (!session?.user?.id) {
      setLikedSongIds([]);
      setPlaylists([]);
      setRecentlyPlayedEntries([]);
      return;
    }

    let isMounted = true;
    const userId = session.user.id;

    const fetchUserData = async () => {
      try {
        const { data: likes } = await supabase
          .from('song_likes')
          .select('song_id')
          .eq('user_id', userId);
        if (!isMounted) return;
        setLikedSongIds(likes?.map(entry => entry.song_id) ?? []);
      } catch (error) {
        console.error('Gagal memuat liked songs:', error);
      }

      try {
        const { data: playlistData } = await supabase
          .from('playlists')
          .select('id, name, description, cover_url, created_at, updated_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        const playlistIds = playlistData?.map(item => item.id) ?? [];
        let trackCounts: Record<string, number> = {};

        if (playlistIds.length > 0) {
          const { data: playlistTracks } = await supabase
            .from('playlist_tracks')
            .select('playlist_id')
            .in('playlist_id', playlistIds);
          if (playlistTracks) {
            trackCounts = playlistTracks.reduce<Record<string, number>>((acc, row) => {
              acc[row.playlist_id] = (acc[row.playlist_id] || 0) + 1;
              return acc;
            }, {});
          }
        }

        if (!isMounted) return;
        setPlaylists((playlistData ?? []).map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          coverUrl: item.cover_url || 'default-vinyl',
          userId,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          trackCount: trackCounts[item.id] ?? 0
        })));
      } catch (error) {
        console.error('Gagal memuat playlist:', error);
      }

      try {
        const { data: recentData } = await supabase
          .from('recently_played')
          .select('song_id, played_at')
          .eq('user_id', userId)
          .order('played_at', { ascending: false })
          .limit(20);

        if (!isMounted) return;
        setRecentlyPlayedEntries(() => {
          const seen = new Set<string>();
          const uniqueEntries: RecentlyPlayedEntry[] = [];
          (recentData ?? []).forEach(entry => {
            if (seen.has(entry.song_id)) return;
            seen.add(entry.song_id);
            uniqueEntries.push({ songId: entry.song_id, playedAt: entry.played_at });
          });
          return uniqueEntries;
        });
      } catch (error) {
        console.error('Gagal memuat recently played:', error);
      }
    };

    fetchUserData();

    return () => {
      isMounted = false;
    };
  }, [session]);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => !prev);
  }, []);

  const shareSong = useCallback((song: Song) => {
    if (typeof window === 'undefined') return;
    const origin = window.location.origin;
    const shareUrl = `${origin}/?song=${song.id}`;
    const shareText = `Dengarkan "${song.title}" dari ${song.artist} di Rampfor Music`;

    const handleFallback = () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareUrl).catch(() => {
          // ignore, we'll still show the prompt below
        });
      }
      window.prompt('Salin link ini:', shareUrl);
    };

    if (navigator.share) {
      navigator.share({
        title: song.title,
        text: shareText,
        url: shareUrl,
      }).catch(() => {
        handleFallback();
      });
    } else {
      handleFallback();
    }
  }, []);

  const pickRandomSong = useCallback((excludeId?: string) => {
    if (songs.length === 0) return null;
    const filtered = excludeId ? songs.filter(song => song.id !== excludeId) : songs;
    const pool = filtered.length > 0 ? filtered : songs;
    return pool[Math.floor(Math.random() * pool.length)];
  }, [songs]);

  const toggleLike = async (songId: string) => {
    if (!session?.user?.id) {
      setIsAuthOpen(true);
      return;
    }
    const userId = session.user.id;
    const alreadyLiked = likedSongIds.includes(songId);

    if (alreadyLiked) {
      const { error } = await supabase
        .from('song_likes')
        .delete()
        .eq('user_id', userId)
        .eq('song_id', songId);

      if (error) {
        alert(`Gagal membatalkan like: ${error.message}`);
        return;
      }

      setLikedSongIds(prev => prev.filter(id => id !== songId));
    } else {
      const { error } = await supabase
        .from('song_likes')
        .insert({ user_id: userId, song_id: songId });

      if (error) {
        alert(`Gagal menyimpan like: ${error.message}`);
        return;
      }

      setLikedSongIds(prev => [...prev, songId]);
    }

    setSongs(prevSongs => prevSongs.map(song => 
      song.id === songId ? { ...song, isLiked: !alreadyLiked } : song
    ));
    if (currentSong?.id === songId) {
      setCurrentSong({ ...currentSong, isLiked: !alreadyLiked });
    }
  };

  const recordRecentlyPlayed = useCallback(async (songId: string) => {
    if (!session?.user?.id) return;
    const { error } = await supabase
      .from('recently_played')
      .insert({ user_id: session.user.id, song_id: songId });
    if (error) {
      console.error('Gagal merekam recently played:', error);
      return;
    }
    setRecentlyPlayedEntries(prev => {
      const filtered = prev.filter(entry => entry.songId !== songId);
      return [{ songId, playedAt: new Date().toISOString() }, ...filtered].slice(0, 10);
    });
  }, [session]);

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      void recordRecentlyPlayed(song.id);
    }
  };

  const toggleRepeatMode = () => {
    setRepeatMode(prev => prev === 'none' ? 'all' : prev === 'all' ? 'one' : 'none');
  };

  const handleUploadSong = (newSong: Song) => {
    setSongs(prev => [newSong, ...prev]);
    if (!currentSong) setCurrentSong(newSong);
  };

  const handleUpdateSong = (updatedSong: Song) => {
    setSongs(prev => prev.map(s => s.id === updatedSong.id ? updatedSong : s));
    if (currentSong?.id === updatedSong.id) {
      setCurrentSong(updatedSong);
    }
  };

  const handleDeleteSong = async (songId: string) => {
    if (!window.confirm('Hapus lagu ini secara permanen?')) return;
    
    try {
      const { error } = await supabase.from('songs').delete().eq('id', songId);
      if (error) throw error;
      
      setSongs(prev => prev.filter(s => s.id !== songId));
      if (currentSong?.id === songId) {
        setCurrentSong(null);
        setIsPlaying(false);
      }
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`);
    }
  };

  const openEditModal = (song: Song) => {
    setEditingSong(song);
    setIsEditModalOpen(true);
  };

  const onTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration);
    }
  };

  const onSeek = (val: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = val;
      setCurrentTime(val);
    }
  };

  const handleNext = () => {
    if (!currentSong) return;
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
      setIsPlaying(true);
      return;
    }
    if (isShuffle) {
      const randomSong = pickRandomSong(currentSong.id);
      if (randomSong) {
        handlePlay(randomSong);
        return;
      }
    }
    if (songs.length === 0) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    if (currentIndex === -1) return;
    const atEnd = currentIndex === songs.length - 1;
    if (repeatMode === 'none' && atEnd) {
      setIsPlaying(false);
      return;
    }
    const nextIndex = (currentIndex + 1) % songs.length;
    handlePlay(songs[nextIndex]);
  };

  const handlePrev = () => {
    if (!currentSong) return;
    if (repeatMode === 'one') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => setIsPlaying(false));
      }
      setIsPlaying(true);
      return;
    }
    if (isShuffle) {
      const randomSong = pickRandomSong(currentSong.id);
      if (randomSong) {
        handlePlay(randomSong);
        return;
      }
    }
    if (songs.length === 0) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    handlePlay(songs[prevIndex]);
  };

  const handleAiSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const result = await searchAIsongs(searchQuery);
      if (result) {
        setAiSuggestions(result);
      }
    } catch (error) {
      console.error("AI Search Error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const openSongDetail = () => {
    if (!currentSong) return;
    if (currentView !== 'song-detail') {
      setPrevView(currentView);
    }
    setCurrentView('song-detail');
  };

  const closeSongDetail = () => {
    setCurrentView(prevView);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setCurrentView('home');
  };

  const filteredSongs = songs.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.artist.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    switch (currentView) {
      case 'home':
        return (
          <HomeView 
            songs={songs} 
            onPlay={handlePlay} 
            currentSongId={currentSong?.id}
            userId={session?.user?.id}
            onEdit={openEditModal}
            onDelete={handleDeleteSong}
            onToggleLike={toggleLike}
            onToggleShuffle={toggleShuffle}
            isShuffle={isShuffle}
          />
        );
      case 'search':
        return (
          <SearchView 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onAiSearch={handleAiSearch}
            isSearching={isSearching}
            aiSuggestions={aiSuggestions}
            filteredSongs={filteredSongs}
            onPlay={handlePlay}
            onToggleLike={toggleLike}
            currentSongId={currentSong?.id}
            userId={session?.user?.id}
            onEdit={openEditModal}
            onDelete={handleDeleteSong}
          />
        );
      case 'library':
        return (
          <LibraryView 
            likedSongs={songs.filter(s => s.isLiked)} 
            recentlyPlayed={recentlyPlayedSongs} 
            onPlay={handlePlay} 
            onToggleLike={toggleLike} 
            onFindMusicClick={() => setCurrentView('search')} 
            currentSongId={currentSong?.id}
            userId={session?.user?.id}
            onEdit={openEditModal}
            onDelete={handleDeleteSong}
            playlists={playlists}
          />
        );
      case 'profile':
        return (
          <ProfileView 
            user={session?.user} 
            likedCount={songs.filter(s => s.isLiked).length}
            onUploadClick={() => session ? setIsUploadModalOpen(true) : setIsAuthOpen(true)} 
            onLogout={handleLogout}
            onLoginClick={() => setIsAuthOpen(true)}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#000] text-white selection:bg-green-500/30 overflow-hidden font-sans">
      <Sidebar 
        currentView={currentView as any} 
        onNavigate={setCurrentView as any} 
        onUploadClick={() => session ? setIsUploadModalOpen(true) : setIsAuthOpen(true)} 
        onLogout={handleLogout}
        user={session?.user}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopBar 
          user={session?.user}
          onProfileClick={() => setCurrentView('profile')} 
          currentView={currentView}
          onLoginClick={() => setIsAuthOpen(true)}
        />
        <div className={`flex-1 overflow-y-auto px-4 md:px-8 py-6 md:py-8 custom-scrollbar ${currentSong ? 'pb-48 md:pb-32' : 'pb-24 md:pb-8'}`}>
          {renderContent()}
        </div>
        
        {currentSong && (
          <PlayerBar 
            currentSong={currentSong} 
            isPlaying={isPlaying} 
            onTogglePlay={() => setIsPlaying(!isPlaying)} 
            onNext={handleNext} 
            onPrev={handlePrev} 
            progress={currentTime} 
            duration={duration} 
            onSeek={onSeek} 
            volume={volume} 
            onVolumeChange={setVolume} 
            onToggleLike={toggleLike} 
            onOpenDetail={openSongDetail} 
            repeatMode={repeatMode}
            isShuffle={isShuffle}
            onToggleShuffle={toggleShuffle}
            onToggleRepeat={toggleRepeatMode}
            onShare={shareSong}
          />
        )}
      </main>
      <BottomNav currentView={currentView} onNavigate={setCurrentView} />
      
      {isUploadModalOpen && <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={handleUploadSong} userId={session?.user?.id} />}
      
      {isEditModalOpen && editingSong && (
        <EditSongModal 
          isOpen={isEditModalOpen} 
          song={editingSong} 
          onClose={() => setIsEditModalOpen(false)} 
          onUpdate={handleUpdateSong} 
        />
      )}
      
      {isAuthOpen && (
        <AuthView 
          onLogin={() => setIsAuthOpen(false)} 
          onBack={() => setIsAuthOpen(false)} 
        />
      )}

      {currentView === 'song-detail' && currentSong && (
        <SongDetailView 
          song={currentSong} 
          isPlaying={isPlaying} 
          progress={currentTime} 
          duration={duration} 
          volume={volume} 
          onClose={closeSongDetail} 
          onTogglePlay={() => setIsPlaying(!isPlaying)} 
          onNext={handleNext} 
          onPrev={handlePrev} 
          onSeek={onSeek} 
          onVolumeChange={setVolume} 
          onToggleLike={toggleLike}
          repeatMode={repeatMode}
          onToggleRepeat={toggleRepeatMode}
          onShare={shareSong}
        />
      )}
      <audio ref={audioRef} src={currentSong?.audioUrl} onTimeUpdate={onTimeUpdate} onLoadedMetadata={onTimeUpdate} onEnded={handleNext} />
    </div>
  );
};

export default App;
