import { BookOpen, FileText, TrendingUp, Calculator, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface DashboardProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  { id: 'home', label: 'Beranda', icon: Menu, color: 'from-blue-400 to-cyan-400' },
  { id: 'chart', label: 'Daftar Akun', icon: BookOpen, color: 'from-cyan-400 to-teal-400' },
  { id: 'journal', label: 'Jurnal Umum', icon: FileText, color: 'from-teal-400 to-green-400' },
  { id: 'ledger', label: 'Buku Besar', icon: Calculator, color: 'from-green-400 to-emerald-400' },
  { id: 'reports', label: 'Laporan Keuangan', icon: TrendingUp, color: 'from-emerald-400 to-cyan-400' },
];

export default function Dashboard({ activeView, onViewChange }: DashboardProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-full shadow-xl shadow-blue-500/40 flex items-center justify-center hover:scale-110 transition-transform duration-300">
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen z-40
        bg-gradient-to-b from-slate-900 via-slate-900 to-blue-950
        border-r border-blue-800/30
        transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full p-6 w-72">
          <div className="space-y-2 flex-1">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onViewChange(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`
                    w-full group relative overflow-hidden rounded-2xl p-4
                    transition-all duration-300
                    ${isActive
                      ? 'bg-gradient-to-r ' + item.color + ' shadow-lg scale-105'
                      : 'bg-slate-800/40 hover:bg-slate-800/60 hover:scale-102'
                    }
                  `}
                  style={{
                    animationDelay: `${index * 0.1}s`,
                    animation: 'slideIn 0.5s ease-out forwards',
                    opacity: 0
                  }}>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`
                      p-2 rounded-xl transition-all duration-300
                      ${isActive
                        ? 'bg-white/20 shadow-lg'
                        : 'bg-blue-500/20 group-hover:bg-blue-500/30'
                      }
                    `}>
                      <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-blue-300'}`} />
                    </div>
                    <span className={`
                      font-semibold text-base
                      ${isActive ? 'text-white' : 'text-blue-100 group-hover:text-white'}
                    `}>
                      {item.label}
                    </span>
                  </div>

                  {!isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-6 border-t border-blue-800/30">
            <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/40 rounded-2xl p-4 border border-blue-700/30">
              <p className="text-blue-200 text-sm font-medium mb-2">Tips Cepat:</p>
              <p className="text-blue-300/70 text-xs leading-relaxed">
                Gunakan tombol export untuk mengunduh laporan dalam format Excel atau PDF
              </p>
            </div>
          </div>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
