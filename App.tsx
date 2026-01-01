
import React, { useState, useRef, useEffect } from 'react';
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
import { Song, ViewType } from './types';
import { searchAIsongs } from './services/geminiService';
import { supabase } from './services/supabase';

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
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

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

  const toggleLike = (songId: string) => {
    if (!session) {
      setIsAuthOpen(true);
      return;
    }
    setSongs(prevSongs => prevSongs.map(s => 
      s.id === songId ? { ...s, isLiked: !s.isLiked } : s
    ));
    if (currentSong && currentSong.id === songId) {
      setCurrentSong({ ...currentSong, isLiked: !currentSong.isLiked });
    }
  };

  const handlePlay = (song: Song) => {
    if (currentSong?.id === song.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentSong(song);
      setIsPlaying(true);
      setRecentlyPlayed(prev => {
        const filtered = prev.filter(s => s.id !== song.id);
        return [song, ...filtered].slice(0, 10);
      });
    }
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
    if (songs.length === 0 || !currentSong) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    handlePlay(songs[nextIndex]);
  };

  const handlePrev = () => {
    if (songs.length === 0 || !currentSong) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong.id);
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
            recentlyPlayed={recentlyPlayed} 
            onPlay={handlePlay} 
            onToggleLike={toggleLike} 
            onFindMusicClick={() => setCurrentView('search')} 
            currentSongId={currentSong?.id}
            userId={session?.user?.id}
            onEdit={openEditModal}
            onDelete={handleDeleteSong}
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
          />
        )}
      </main>
      <BottomNav currentView={currentView} onNavigate={setCurrentView} />
      
      {isUploadModalOpen && <UploadModal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onUpload={handleUploadSong} />}
      
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
        <SongDetailView song={currentSong} isPlaying={isPlaying} progress={currentTime} duration={duration} volume={volume} onClose={closeSongDetail} onTogglePlay={() => setIsPlaying(!isPlaying)} onNext={handleNext} onPrev={handlePrev} onSeek={onSeek} onVolumeChange={setVolume} onToggleLike={toggleLike} />
      )}
      <audio ref={audioRef} src={currentSong?.audioUrl} onTimeUpdate={onTimeUpdate} onLoadedMetadata={onTimeUpdate} onEnded={handleNext} />
    </div>
  );
};

export default App;
