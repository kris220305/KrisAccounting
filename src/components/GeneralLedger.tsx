import { useState, useEffect } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase, ChartOfAccount, JournalEntryLine } from '../lib/supabase';

interface LedgerAccount extends ChartOfAccount {
  transactions: (JournalEntryLine & {
    entry_date: string;
    reference_number: string;
    description: string;
  })[];
  balance: number;
}

export default function GeneralLedger() {
  const [accounts, setAccounts] = useState<LedgerAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadLedger();
  }, []);

  const loadLedger = async () => {
    const { data: accountsData } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .order('code');

    if (accountsData) {
      const ledgerAccounts = await Promise.all(
        accountsData.map(async (account) => {
          const { data: linesData } = await supabase
            .from('journal_entry_lines')
            .select(`
              *,
              journal_entries!inner(entry_date, reference_number, description)
            `)
            .eq('account_id', account.id)
            .order('created_at');

          const transactions = (linesData || []).map((line: any) => ({
            ...line,
            entry_date: line.journal_entries.entry_date,
            reference_number: line.journal_entries.reference_number,
            description: line.journal_entries.description
          }));

          let balance = 0;
          if (account.normal_balance === 'Debit') {
            balance = transactions.reduce((sum, t) => sum + Number(t.debit) - Number(t.credit), 0);
          } else {
            balance = transactions.reduce((sum, t) => sum + Number(t.credit) - Number(t.debit), 0);
          }

          return {
            ...account,
            transactions,
            balance
          };
        })
      );

      setAccounts(ledgerAccounts.filter(acc => acc.transactions.length > 0 || acc.balance !== 0));
    }
  };

  const toggleAccount = (accountId: string) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedAccounts(newExpanded);
  };

  const filteredAccounts = accounts.filter(account =>
    account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'Aset': 'from-blue-400 to-cyan-400',
      'Kewajiban': 'from-red-400 to-orange-400',
      'Modal': 'from-purple-400 to-pink-400',
      'Pendapatan': 'from-green-400 to-emerald-400',
      'Beban': 'from-yellow-400 to-orange-400'
    };
    return colors[type] || 'from-gray-400 to-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-3xl font-black text-white">Buku Besar</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
        <input
          type="text"
          placeholder="Cari akun berdasarkan kode atau nama..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-slate-800/60 border border-blue-800/30 rounded-xl text-white placeholder-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
        />
      </div>

      <div className="space-y-4">
        {filteredAccounts.map((account, index) => {
          const isExpanded = expandedAccounts.has(account.id);
          let runningBalance = 0;

          return (
            <div
              key={account.id}
              className="bg-slate-800/60 rounded-2xl border border-blue-800/30 overflow-hidden hover:border-blue-600/50 transition-all"
              style={{
                animation: `fadeInUp 0.3s ease-out ${index * 0.05}s forwards`,
                opacity: 0
              }}>
              <button
                onClick={() => toggleAccount(account.id)}
                className="w-full p-6 flex items-center justify-between hover:bg-slate-700/40 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`px-4 py-2 bg-gradient-to-r ${getTypeColor(account.type)} rounded-xl`}>
                    <span className="text-white font-bold text-sm">{account.code}</span>
                  </div>
                  <div className="text-left">
                    <h3 className="text-white font-bold text-lg">{account.name}</h3>
                    <p className="text-blue-300 text-sm">{account.type} - {account.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-blue-300 text-sm mb-1">Saldo</p>
                    <p className={`text-xl font-bold font-mono ${
                      account.balance >= 0 ? 'text-green-300' : 'text-red-300'
                    }`}>
                      Rp {Math.abs(account.balance).toLocaleString('id-ID')}
                    </p>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-6 h-6 text-blue-400" />
                  ) : (
                    <ChevronDown className="w-6 h-6 text-blue-400" />
                  )}
                </div>
              </button>

              {isExpanded && account.transactions.length > 0 && (
                <div className="border-t border-blue-800/30 bg-slate-900/40 p-6 animate-expand">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-blue-800/30">
                          <th className="px-4 py-3 text-left text-xs font-bold text-blue-300">Tanggal</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-blue-300">Ref</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-blue-300">Keterangan</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-green-300">Debit</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-orange-300">Kredit</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-blue-300">Saldo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-blue-800/20">
                        <tr>
                          <td colSpan={5} className="px-4 py-2 text-blue-300 text-sm italic">Saldo Awal</td>
                          <td className="px-4 py-2 text-right font-mono text-blue-200">
                            Rp 0
                          </td>
                        </tr>
                        {account.transactions.map((transaction) => {
                          if (account.normal_balance === 'Debit') {
                            runningBalance += Number(transaction.debit) - Number(transaction.credit);
                          } else {
                            runningBalance += Number(transaction.credit) - Number(transaction.debit);
                          }

                          return (
                            <tr key={transaction.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="px-4 py-3 text-blue-200 text-sm">
                                {new Date(transaction.entry_date).toLocaleDateString('id-ID', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: 'numeric'
                                })}
                              </td>
                              <td className="px-4 py-3 text-blue-300 text-sm font-mono">
                                {transaction.reference_number}
                              </td>
                              <td className="px-4 py-3 text-blue-200 text-sm">
                                {transaction.description}
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-green-300">
                                {transaction.debit > 0 ? `Rp ${Number(transaction.debit).toLocaleString('id-ID')}` : '-'}
                              </td>
                              <td className="px-4 py-3 text-right font-mono text-orange-300">
                                {transaction.credit > 0 ? `Rp ${Number(transaction.credit).toLocaleString('id-ID')}` : '-'}
                              </td>
                              <td className={`px-4 py-3 text-right font-mono font-semibold ${
                                runningBalance >= 0 ? 'text-green-300' : 'text-red-300'
                              }`}>
                                Rp {Math.abs(runningBalance).toLocaleString('id-ID')}
                              </td>
                            </tr>
                          );
                        })}
                        <tr className="bg-slate-900/60 font-bold">
                          <td colSpan={3} className="px-4 py-3 text-white">Saldo Akhir</td>
                          <td className="px-4 py-3 text-right font-mono text-green-300">
                            Rp {account.transactions.reduce((sum, t) => sum + Number(t.debit), 0).toLocaleString('id-ID')}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-orange-300">
                            Rp {account.transactions.reduce((sum, t) => sum + Number(t.credit), 0).toLocaleString('id-ID')}
                          </td>
                          <td className={`px-4 py-3 text-right font-mono ${
                            account.balance >= 0 ? 'text-green-300' : 'text-red-300'
                          }`}>
                            Rp {Math.abs(account.balance).toLocaleString('id-ID')}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredAccounts.length === 0 && (
        <div className="text-center py-12 text-blue-400 bg-slate-800/60 rounded-2xl border border-blue-800/30">
          {searchTerm ? 'Tidak ada akun yang sesuai dengan pencarian' : 'Belum ada transaksi di buku besar'}
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes expand {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 2000px;
          }
        }
        .animate-expand {
          animation: expand 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
