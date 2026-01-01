
import React, { useState, useRef, useEffect } from 'react';
import { X, Save, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Song } from '../types';
import { supabase } from '../services/supabase';

interface EditSongModalProps {
  song: Song;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedSong: Song) => void;
}

const EditSongModal: React.FC<EditSongModalProps> = ({ song, isOpen, onClose, onUpdate }) => {
  const [title, setTitle] = useState(song.title);
  const [artist, setArtist] = useState(song.artist);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>(song.coverUrl === 'default-vinyl' ? '' : song.coverUrl);
  const [isSaving, setIsSaving] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTitle(song.title);
    setArtist(song.artist);
    setCoverPreview(song.coverUrl === 'default-vinyl' ? '' : song.coverUrl);
  }, [song]);

  if (!isOpen) return null;

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setCoverPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !artist) return;

    setIsSaving(true);
    try {
      let coverUrl = song.coverUrl;

      // 1. Upload new cover if changed
      if (coverFile) {
        const coverFileName = `${Date.now()}_${coverFile.name}`;
        const { error: coverError } = await supabase.storage
          .from('covers')
          .upload(coverFileName, coverFile);
        if (coverError) throw coverError;
        coverUrl = supabase.storage.from('covers').getPublicUrl(coverFileName).data.publicUrl;
      }

      // 2. Update Database
      const { error: dbError } = await supabase
        .from('songs')
        .update({ title, artist, cover_url: coverUrl })
        .eq('id', song.id);

      if (dbError) throw dbError;

      onUpdate({
        ...song,
        title,
        artist,
        coverUrl
      });
      onClose();
    } catch (err: any) {
      alert(`Gagal update: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#121212] border border-[#222] rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black tracking-tight">Edit Lagu</h2>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-colors">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Judul Lagu</label>
                  <input 
                    type="text" 
                    required 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    className="w-full bg-[#1a1a1a] border border-[#222] rounded-2xl py-4 px-5 text-sm font-bold focus:border-green-500 outline-none transition-colors" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest px-1">Nama Artis</label>
                  <input 
                    type="text" 
                    required 
                    value={artist} 
                    onChange={(e) => setArtist(e.target.value)} 
                    className="w-full bg-[#1a1a1a] border border-[#222] rounded-2xl py-4 px-5 text-sm font-bold focus:border-green-500 outline-none transition-colors" 
                  />
                </div>
              </div>

              <div className="w-full md:w-32 space-y-2">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center block">Cover Art</label>
                <input type="file" ref={coverInputRef} onChange={handleCoverChange} accept="image/*" className="hidden" />
                <div 
                  onClick={() => coverInputRef.current?.click()} 
                  className="relative aspect-square rounded-2xl border-2 border-dashed border-[#222] bg-[#1a1a1a] flex items-center justify-center cursor-pointer overflow-hidden group hover:border-green-500/50 transition-colors"
                >
                  {coverPreview ? (
                    <img src={coverPreview} className="w-full h-full object-cover group-hover:opacity-50 transition-opacity" />
                  ) : (
                    <ImageIcon size={32} className="text-gray-700 group-hover:text-green-500 transition-colors" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[8px] font-black uppercase text-white">Ganti Cover</span>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isSaving} 
              className="w-full py-4 bg-green-500 text-black font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-green-400 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditSongModal;
