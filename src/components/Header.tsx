import { Instagram } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 border-b border-blue-800/50 backdrop-blur-lg shadow-lg shadow-blue-900/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 rounded-2xl rotate-45 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:rotate-[225deg] transition-transform duration-500">
                <div className="text-2xl font-black text-white -rotate-45 group-hover:rotate-[-225deg] transition-transform duration-500">K</div>
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black">
                <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
                  Kris
                </span>
                {' '}
                <span className="text-white">Accounting</span>
              </h1>
              <p className="text-xs text-blue-300">Akuntansi Modern Gen Z</p>
            </div>
          </div>

          <a
            href="https://instagram.com/krisnaawahyu_"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full text-sm font-semibold hover:scale-105 hover:shadow-lg hover:shadow-pink-500/30 transition-all duration-300">
            <Instagram className="w-4 h-4" />
            <span className="hidden sm:inline">@krisnaawahyu_</span>
          </a>
        </div>
      </div>
    </header>
  );
}
