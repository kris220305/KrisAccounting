import { useEffect, useState } from 'react';
import { Instagram } from 'lucide-react';

interface OpeningScreenProps {
  onComplete: () => void;
}

export default function OpeningScreen({ onComplete }: OpeningScreenProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(onComplete, 300);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-blue-500/20 rounded-full blur-3xl animate-pulse"
             style={{ animationDuration: '3s' }} />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-cyan-500/20 rounded-full blur-3xl animate-pulse"
             style={{ animationDuration: '4s', animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 text-center space-y-8 px-6">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 blur-2xl opacity-50 animate-pulse" />
          <div className="relative transform transition-all duration-700"
               style={{
                 transform: `scale(${0.5 + (progress / 200)}) rotate(${progress * 3.6}deg)`,
                 opacity: progress > 20 ? 1 : 0
               }}>
            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-400 via-cyan-400 to-blue-500 rounded-3xl rotate-45 flex items-center justify-center shadow-2xl shadow-blue-500/50">
              <div className="text-6xl font-black text-white -rotate-45">K</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-6xl md:text-7xl font-black text-white tracking-tight"
              style={{
                opacity: progress > 30 ? 1 : 0,
                transform: `translateY(${progress > 30 ? 0 : 20}px)`,
                transition: 'all 0.6s ease-out'
              }}>
            <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Kris
            </span>
            {' '}
            <span className="text-white">Accounting</span>
          </h1>

          <p className="text-xl md:text-2xl text-blue-200 font-light"
             style={{
               opacity: progress > 50 ? 1 : 0,
               transform: `translateY(${progress > 50 ? 0 : 20}px)`,
               transition: 'all 0.6s ease-out 0.2s'
             }}>
            Akuntansi Modern untuk Gen Z
          </p>
        </div>

        <div className="w-64 h-2 mx-auto bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm"
             style={{
               opacity: progress > 40 ? 1 : 0,
               transition: 'opacity 0.4s ease-out'
             }}>
          <div
            className="h-full bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 rounded-full transition-all duration-300 ease-out shadow-lg shadow-blue-500/50"
            style={{ width: `${progress}%` }}
          />
        </div>

        <a
          href="https://instagram.com/krisnaawahyu_"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full font-semibold hover:scale-105 transition-transform duration-300 shadow-lg shadow-pink-500/30"
          style={{
            opacity: progress > 70 ? 1 : 0,
            transform: `translateY(${progress > 70 ? 0 : 20}px)`,
            transition: 'all 0.6s ease-out 0.4s'
          }}>
          <Instagram className="w-5 h-5" />
          @krisnaawahyu_
        </a>
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full animate-ping"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
              opacity: 0.3
            }}
          />
        ))}
      </div>
    </div>
  );
}
