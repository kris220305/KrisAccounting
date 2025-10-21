import { TrendingUp, DollarSign, FileText, Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function HomePage() {
  const [stats, setStats] = useState({
    totalAccounts: 0,
    totalJournalEntries: 0,
    totalDebit: 0,
    totalCredit: 0
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [accountsRes, entriesRes, linesRes] = await Promise.all([
        supabase.from('chart_of_accounts').select('*', { count: 'exact', head: true }),
        supabase.from('journal_entries').select('*', { count: 'exact', head: true }),
        supabase.from('journal_entry_lines').select('debit, credit')
      ]);

      const totalDebit = linesRes.data?.reduce((sum, line) => sum + (Number(line.debit) || 0), 0) || 0;
      const totalCredit = linesRes.data?.reduce((sum, line) => sum + (Number(line.credit) || 0), 0) || 0;

      setStats({
        totalAccounts: accountsRes.count || 0,
        totalJournalEntries: entriesRes.count || 0,
        totalDebit,
        totalCredit
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const statCards = [
    {
      title: 'Total Akun',
      value: stats.totalAccounts,
      icon: FileText,
      color: 'from-blue-400 to-cyan-400',
      suffix: 'akun'
    },
    {
      title: 'Total Transaksi',
      value: stats.totalJournalEntries,
      icon: Activity,
      color: 'from-cyan-400 to-teal-400',
      suffix: 'transaksi'
    },
    {
      title: 'Total Debit',
      value: `Rp ${stats.totalDebit.toLocaleString('id-ID')}`,
      icon: TrendingUp,
      color: 'from-teal-400 to-green-400',
      suffix: ''
    },
    {
      title: 'Total Kredit',
      value: `Rp ${stats.totalCredit.toLocaleString('id-ID')}`,
      icon: DollarSign,
      color: 'from-green-400 to-emerald-400',
      suffix: ''
    }
  ];

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900/40 via-cyan-900/30 to-slate-900/40 rounded-3xl p-8 border border-blue-700/30">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <h2 className="text-4xl font-black text-white mb-3">
            Selamat Datang di{' '}
            <span className="bg-gradient-to-r from-blue-300 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Kris Accounting
            </span>
          </h2>
          <p className="text-blue-200 text-lg max-w-2xl">
            Solusi akuntansi modern yang dirancang khusus untuk Gen Z. Kelola keuangan bisnis kamu dengan cara yang lebih keren dan efisien.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className="group relative overflow-hidden bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl p-6 border border-blue-800/30 hover:border-blue-600/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-900/20"
              style={{
                animation: `fadeInUp 0.6s ease-out ${index * 0.1}s forwards`,
                opacity: 0
              }}>
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-10 rounded-full blur-2xl"
                   style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />

              <div className="relative z-10">
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${card.color} mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <h3 className="text-blue-300 text-sm font-semibold mb-2">{card.title}</h3>
                <p className="text-3xl font-black text-white mb-1">
                  {typeof card.value === 'number' ? card.value : card.value}
                </p>
                {card.suffix && (
                  <p className="text-blue-400/70 text-xs">{card.suffix}</p>
                )}
              </div>

              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl p-6 border border-blue-800/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full" />
            Fitur Utama
          </h3>
          <ul className="space-y-3">
            {[
              'Jurnal Umum - Catat semua transaksi keuangan',
              'Buku Besar - Lihat ringkasan per akun',
              'Laporan Keuangan - Generate laporan otomatis',
              'Export ke Excel & PDF - Download kapan aja'
            ].map((feature, i) => (
              <li key={i} className="flex items-start gap-3 text-blue-200 group hover:text-white transition-colors">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 mt-2 group-hover:scale-150 transition-transform" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/60 rounded-2xl p-6 border border-blue-800/30">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-emerald-400 rounded-full" />
            Panduan Cepat
          </h3>
          <ol className="space-y-3">
            {[
              'Mulai dengan menambah akun di "Daftar Akun"',
              'Catat transaksi harian di "Jurnal Umum"',
              'Cek saldo akun di "Buku Besar"',
              'Generate laporan di "Laporan Keuangan"'
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3 text-blue-200 group hover:text-white transition-colors">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform">
                  {i + 1}
                </div>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
