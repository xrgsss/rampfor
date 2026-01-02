
import React, { useState, useRef, useEffect } from 'react';
import { Bell, LogIn } from 'lucide-react';

interface TopBarProps {
  user: any;
  onProfileClick: () => void;
  currentView: string;
  onLoginClick?: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ user, onProfileClick, currentView, onLoginClick }) => {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };
    if (isNotificationsOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isNotificationsOpen]);

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-black/60 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 border-b border-white/[0.03]">
      <div className="absolute -bottom-8 left-0 right-0 h-8 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

      <div className="flex items-center gap-2 relative z-10">
        <h1 className="md:hidden text-xl font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Rampfor</h1>
      </div>
      
      <div className="flex items-center gap-1 md:gap-4 relative z-10">
        {user ? (
          <>
            <div ref={notificationRef} className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`p-2 transition-colors relative ${isNotificationsOpen ? 'text-white' : 'text-gray-400 hover:text-white'}`}
              >
                <Bell size={22} className="md:w-5 md:h-5" />
                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-green-500 rounded-full border-2 border-black"></span>
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-[280px] md:w-[320px] bg-[#0d0d0d] border border-[#222] rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-bold text-white tracking-tight">Notifications</h3>
                      <button className="text-[11px] font-bold text-gray-300 hover:text-white transition-colors">Settings</button>
                    </div>
                    <div className="py-8 text-center">
                      <p className="text-sm font-medium text-gray-500">No notifications</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button 
              onClick={onProfileClick}
              className={`flex items-center gap-2 p-1 pr-1.5 md:pr-4 rounded-full border transition-all ${
                currentView === 'profile' ? 'bg-[#1a1a1a] border-green-500/50' : 'bg-[#0d0d0d] border-[#1a1a1a] hover:border-[#333] hover:bg-[#121212]'
              }`}
            >
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-green-500 flex items-center justify-center text-black font-black text-[9px] md:text-xs shadow-[0_0_10px_rgba(34,197,94,0.3)]">
                {getInitials(displayName)}
              </div>
              <span className="hidden sm:block text-xs md:text-sm font-bold tracking-tight text-white/90 truncate max-w-[100px]">
                {displayName}
              </span>
            </button>
          </>
        ) : (
          <button 
            onClick={onLoginClick}
            className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-full font-black text-xs md:text-sm uppercase tracking-widest hover:bg-gray-200 transition-all active:scale-95"
          >
            <LogIn size={16} />
            <span>Login</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default TopBar;
