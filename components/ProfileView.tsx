
import React, { useState } from 'react';
import { ShieldCheck, Mail, LogOut, Plus, Edit2, Check, X, Loader2, UserCircle, Music4, Sparkles } from 'lucide-react';
import { supabase } from '../services/supabase';
import { Song } from '../types';
import SongCard from './SongCard';

interface ProfileViewProps {
  user: any;
  userSongs: Song[];
  availableSongs: Song[];
  currentSongId?: string;
  onPlay: (song: Song) => void;
  onToggleLike: (id: string) => void;
  onUploadClick: () => void;
  onLogout: () => void;
  onLoginClick: () => void;
  onShowDetail: (song: Song) => void;
  onEdit?: (song: Song) => void;
  onDelete?: (id: string) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  userSongs,
  currentSongId,
  onPlay,
  onToggleLike,
  onUploadClick,
  onLogout,
  onLoginClick,
  onShowDetail,
  onEdit,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tempName, setTempName] = useState('');

  const getNameFromEmail = (email?: string) => {
    if (!email) return undefined;
    return email.split('@')[0];
  };

  const displayName =
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    getNameFromEmail(user?.email) ||
    'User';
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // State "Belum Login"
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-gradient-to-br from-[#121212] to-black border border-white/5 rounded-[40px] p-8 md:p-16 text-center relative overflow-hidden shadow-2xl">
          {/* Decorative Glows */}
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-green-500/10 blur-[120px] rounded-full -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-cyan-500/10 blur-[120px] rounded-full translate-y-1/2"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-24 h-24 bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] rounded-3xl flex items-center justify-center text-gray-500 mb-8 border border-white/10 shadow-xl group">
              <UserCircle size={48} strokeWidth={1.5} className="group-hover:text-white transition-colors duration-500" />
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white mb-4 leading-tight">
              Satu Langkah Lagi <br /> Untuk <span className="text-green-500">Profilmu</span>
            </h1>
            
            <p className="text-gray-400 text-sm md:text-lg max-w-md mx-auto mb-10 font-medium">
              Masuk untuk menyimpan lagu favorit, mengunggah musikmu sendiri.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
              <button 
                onClick={onLoginClick}
                className="flex-1 py-4 bg-white text-black rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-[1.02] transition-all active:scale-95 shadow-xl shadow-white/5"
              >
                Log In
              </button>
              <button 
                onClick={onLoginClick}
                className="flex-1 py-4 bg-[#1a1a1a] border border-white/10 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-[#222] transition-all active:scale-95"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleStartEdit = () => {
    setTempName(displayName);
    setIsEditing(true);
  };

  const handleUpdateProfile = async () => {
    if (!tempName.trim() || tempName === displayName) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: tempName }
      });

      if (error) throw error;
      setIsEditing(false);
    } catch (err: any) {
      alert(`Gagal memperbarui profil: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-4 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {/* Profile Header */}
      <div className="relative mb-16">
        <div className="h-48 w-full bg-gradient-to-r from-green-900/30 via-[#0d0d0d] to-black rounded-3xl overflow-hidden border border-[#1a1a1a]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,_rgba(34,197,94,0.08),_transparent)]"></div>
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.8)_100%)]"></div>
        </div>
        
        <div className="absolute -bottom-12 left-8 flex items-end gap-6 w-full pr-16">
          <div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-green-500/20 to-transparent p-1.5 shadow-2xl relative flex-shrink-0">
            <div className="w-full h-full rounded-full bg-green-500 flex items-center justify-center relative overflow-hidden shadow-inner border-4 border-[#000]">
               <span className="text-4xl md:text-5xl font-black text-black tracking-tighter">
                 {getInitials(displayName)}
               </span>
            </div>
            <div className="absolute bottom-2 right-2 p-2 bg-green-500 text-black rounded-full border-4 border-black shadow-lg">
              <ShieldCheck size={18} />
            </div>
          </div>
          
          <div className="pb-4 flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              {isEditing ? (
                <div className="flex items-center gap-2 w-full max-w-sm">
                  <input 
                    autoFocus
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="bg-black/40 border border-green-500/30 rounded-lg px-3 py-1 text-2xl md:text-4xl font-black tracking-tighter text-white focus:outline-none focus:border-green-500 w-full"
                  />
                  <button 
                    onClick={handleUpdateProfile}
                    disabled={isSaving}
                    className="p-2 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-all disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                  </button>
                  <button 
                    onClick={() => setIsEditing(false)}
                    disabled={isSaving}
                    className="p-2 bg-white/5 text-gray-400 rounded-lg hover:text-white transition-all"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 group">
                  <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-white truncate">
                    {displayName}
                  </h1>
                  <button 
                    onClick={handleStartEdit}
                    className="p-2 text-gray-600 hover:text-green-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <Edit2 size={18} />
                  </button>
                  <span className="px-2.5 py-1 bg-green-500/10 text-green-500 text-[10px] font-black rounded-lg border border-green-500/20 uppercase tracking-widest hidden sm:inline-block">
                    {user?.user_metadata?.is_pro ? 'Pro' : 'Free'}
                  </span>
                </div>
              )}
            </div>
            <p className="text-gray-500 flex items-center gap-2 text-sm md:text-base font-medium">
              <Mail size={16} className="text-green-500" /> {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="px-2 space-y-4">
        <button 
          onClick={onUploadClick}
          className="w-full flex items-center justify-center gap-3 p-6 bg-green-500 text-black rounded-3xl font-black transition-all active:scale-[0.98] text-sm uppercase tracking-widest shadow-lg shadow-green-500/20"
        >
          <div className="p-1 bg-black/10 rounded-md">
            <Plus size={20} />
          </div>
          Upload Lagu
        </button>

        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-3 p-6 bg-[#0a0a0a] border border-red-500/20 text-red-500 hover:bg-red-500/5 hover:border-red-500/40 rounded-3xl font-black transition-all active:scale-[0.98] text-sm uppercase tracking-widest"
        >
          <LogOut size={20} />
          Sign Out of Rampfor
        </button>
      </div>
      
      <section className="mt-10 px-2 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-gray-500 mb-1">My Music</p>
            <h2 className="text-2xl font-black text-white tracking-tight">{userSongs.length} {userSongs.length === 1 ? 'track' : 'tracks'}</h2>
          </div>
        </div>
        {userSongs.length === 0 ? (
          <>
            <p className="text-gray-400 text-sm italic">Kamu belum mengunggah musik apa pun. Berikut koleksi yang tersedia sekarang.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {availableSongs.map(song => (
                <SongCard
                  key={song.id}
                  song={song}
                  isActive={currentSongId === song.id}
                  onPlay={onPlay}
                  onToggleLike={onToggleLike}
                  onShowDetail={onShowDetail}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userSongs.map(song => (
              <SongCard 
                key={song.id}
                song={song}
                isActive={currentSongId === song.id}
                isOwner
                onPlay={onPlay}
                onToggleLike={onToggleLike}
                onShowDetail={onShowDetail}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProfileView;
