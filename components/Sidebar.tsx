
import React from 'react';
import { Home, Search, Library, User, Plus, LogOut, LogIn } from 'lucide-react';

interface SidebarProps {
  currentView: 'home' | 'search' | 'library' | 'profile';
  onNavigate: (view: 'home' | 'search' | 'library' | 'profile') => void;
  onUploadClick: () => void;
  onLogout: () => void;
  user?: any;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, onUploadClick, onLogout, user }) => {
  const navItems = [
    { icon: <Home size={20} />, label: 'Home', view: 'home' as const },
    { icon: <Search size={20} />, label: 'Search', view: 'search' as const },
    { icon: <Library size={20} />, label: 'Library', view: 'library' as const },
    { icon: <User size={20} />, label: 'Profile', view: 'profile' as const },
  ];

  return (
    <aside className="hidden md:flex w-64 flex-col h-full bg-[#000] border-r border-[#1a1a1a] p-6 z-50">
      <div className="mb-12">
        <h1 
          className="text-3xl font-bold tracking-tighter text-white cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => onNavigate('home')}
        >
          Rampfor
        </h1>
      </div>

      <nav className="flex-1">
        <ul className="space-y-6">
          {navItems.map((item, idx) => (
            <li key={idx}>
              <button 
                onClick={() => onNavigate(item.view)}
                className={`flex items-center gap-4 w-full text-left transition-all group ${
                  currentView === item.view ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'
                }`}
              >
                <div className={`${currentView === item.view ? 'text-green-500' : 'group-hover:text-green-400'} transition-colors`}>
                  {item.icon}
                </div>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        {/* Hanya tampilkan tombol Upload jika sudah login */}
        {user && (
          <div className="mt-12">
            <button 
              onClick={onUploadClick}
              className="flex items-center gap-2 px-4 py-3 bg-[#121212] border border-[#222] rounded-xl text-white hover:bg-[#1a1a1a] transition-all w-full group shadow-lg active:scale-95"
            >
              <div className="p-1 bg-green-500 rounded-md text-black shadow-md group-hover:scale-110 transition-transform">
                <Plus size={16} />
              </div>
              <span className="font-bold text-sm tracking-tight">Upload Lagu</span>
            </button>
          </div>
        )}
      </nav>

      {/* Bagian Footer Sidebar: Hanya muncul jika user login */}
      {user && (
        <div className="mt-auto pt-6 border-t border-[#1a1a1a]">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Account</p>
              <p className="text-sm font-medium text-gray-200 truncate">
                {user.user_metadata?.full_name || user.email}
              </p>
            </div>
            <button 
              onClick={onLogout}
              className="text-gray-500 hover:text-red-500 transition-colors p-2"
            >
               <LogOut size={18} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
