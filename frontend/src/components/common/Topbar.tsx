import { Menu, Bell, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TopbarProps { onMenuClick: () => void; title?: string; }

export default function Topbar({ onMenuClick, title }: TopbarProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 lg:px-6 h-16 flex items-center gap-4">
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-gray-100">
        <Menu size={20} className="text-gray-500" />
      </button>

      {title && <h1 className="font-bold text-gray-900 text-lg hidden sm:block">{title}</h1>}

      <div className="hidden md:flex flex-1 max-w-md">
        <div className="relative w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search candidates, jobs..."
            className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 placeholder-gray-400" />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <button className="flex items-center gap-1.5 text-gray-600 hover:text-primary-600 text-sm font-medium px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors">
          <Search size={15} /><span className="hidden sm:block">AI Search</span>
        </button>
        <button className="relative p-2.5 rounded-xl hover:bg-gray-50 transition-colors">
          <Bell size={18} className="text-gray-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full" />
        </button>
        <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white font-bold text-sm cursor-pointer">
          {user?.full_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
        </div>
      </div>
    </header>
  );
}
