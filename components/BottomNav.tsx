
import React from 'react';
import { Home, Search, Library } from 'lucide-react';
import { ViewType } from '../types';

interface BottomNavProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const items = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'search', label: 'Search', icon: Search },
    { id: 'library', label: 'Library', icon: Library },
  ];

  return (
    <>
      {/* Soft Fade Overlay for the top edge of the Bottom Nav */}
      <div className="md:hidden fixed bottom-[72px] left-0 right-0 h-12 bg-gradient-to-t from-black to-transparent pointer-events-none z-[55]" />
      
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-[72px] bg-black/90 backdrop-blur-2xl flex items-center justify-around px-2 z-[60] pb-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button 
              key={item.id}
              onClick={() => onNavigate(item.id as ViewType)}
              className={`flex flex-col items-center gap-1.5 transition-all duration-300 w-full relative ${isActive ? 'text-white' : 'text-gray-600 hover:text-gray-400'}`}
            >
              <div className="relative">
                <Icon size={24} className={isActive ? 'scale-110' : ''} strokeWidth={isActive ? 2.5 : 1.5} />
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"></div>
                )}
              </div>
              <span className={`text-[10px] font-black tracking-tighter transition-all ${isActive ? 'opacity-100' : 'opacity-60'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default BottomNav;
