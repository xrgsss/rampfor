
import React, { useState, useRef } from 'react';
import { X, Upload, Music, User, Image as ImageIcon, FileAudio, CheckCircle2 } from 'lucide-react';
import { Song } from '../types';
import { supabase } from '../services/supabase';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (song: Song) => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onUpload }) => {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  const coverInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

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

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !artist || !audioFile) return;

    setIsUploading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      
      if (!userId) {
        throw new Error("Sesi berakhir. Silakan login kembali untuk mengunggah.");
      }

      // 1. Upload Audio
      const audioFileName = `${Date.now()}_${audioFile.name}`;
      const { data: audioData, error: audioError } = await supabase.storage
        .from('music')
        .upload(audioFileName, audioFile);
      if (audioError) throw audioError;

      const audioUrl = supabase.storage.from('music').getPublicUrl(audioFileName).data.publicUrl;

      // 2. Upload Cover (Optional)
      let coverUrl = 'default-vinyl';
      if (coverFile) {
        const coverFileName = `${Date.now()}_${coverFile.name}`;
        const { error: coverError } = await supabase.storage
          .from('covers')
          .upload(coverFileName, coverFile);
        if (coverError) throw coverError;
        coverUrl = supabase.storage.from('covers').getPublicUrl(coverFileName).data.publicUrl;
      }

      // 3. Save to Database
      const { data: songData, error: dbError } = await supabase.from('songs').insert([
        { 
          title, 
          artist, 
          audio_url: audioUrl, 
          cover_url: coverUrl,
          user_id: userId,
          plays: 0
        }
      ]).select();

      if (dbError) throw dbError;

      if (songData && songData[0]) {
        onUpload({
          id: songData[0].id.toString(),
          title: songData[0].title,
          artist: songData[0].artist,
          coverUrl: songData[0].cover_url,
          audioUrl: songData[0].audio_url,
          plays: 0,
          duration: 180
        });
      }

      onClose();
    } catch (err: any) {
      alert(`Upload gagal: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm animate-in fade-in" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#121212] border border-[#222] rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-500 rounded-xl text-black">
                <Upload size={20} />
              </div>
              <h2 className="text-2xl font-black tracking-tight">Upload Lagu</h2>
            </div>
            <button onClick={onClose} className="p-2 text-gray-500 hover:text-white"><X size={24} /></button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase px-1">Judul Lagu</label>
                  <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#222] rounded-xl py-3.5 px-4 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase px-1">Nama Artis</label>
                  <input type="text" required value={artist} onChange={(e) => setArtist(e.target.value)} className="w-full bg-[#1a1a1a] border border-[#222] rounded-xl py-3.5 px-4 text-sm" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase px-1">File Lagu</label>
                  <input type="file" ref={audioInputRef} onChange={handleAudioChange} accept="audio/*" className="hidden" />
                  <button type="button" onClick={() => audioInputRef.current?.click()} className="w-full flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-[#222] bg-[#1a1a1a] text-gray-400">
                    <FileAudio size={20} />
                    <span className="text-sm font-bold truncate">{audioFile ? audioFile.name : 'Pilih Audio'}</span>
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase text-center block">Cover Art</label>
                <input type="file" ref={coverInputRef} onChange={handleCoverChange} accept="image/*" className="hidden" />
                <div onClick={() => coverInputRef.current?.click()} className="relative aspect-square rounded-2xl border-2 border-dashed border-[#222] bg-[#1a1a1a] flex items-center justify-center cursor-pointer overflow-hidden">
                  {coverPreview ? <img src={coverPreview} className="w-full h-full object-cover" /> : <ImageIcon size={32} className="text-gray-700" />}
                </div>
              </div>
            </div>
            <button type="submit" disabled={isUploading || !audioFile} className="w-full py-4 bg-green-500 text-black font-black rounded-2xl disabled:opacity-50">
              {isUploading ? 'Mengunggah...' : 'Simpan & Upload'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
