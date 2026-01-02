
export interface Song {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  audioUrl: string;
  plays: number;
  duration: number;
  isLiked?: boolean;
  userId?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string | null;
  coverUrl: string;
  userId: string;
  createdAt: string;
  updatedAt?: string | null;
  trackCount: number;
}

export type RepeatMode = 'none' | 'all' | 'one';

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  queue: Song[];
}

export type ViewType = 'home' | 'search' | 'library' | 'profile' | 'feed' | 'upgrade' | 'song-detail';
