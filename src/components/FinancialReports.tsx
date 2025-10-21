import { useState, useEffect } from 'react';
import { Download, FileText, DollarSign } from 'lucide-react';
import { supabase, ChartOfAccount } from '../lib/supabase';

interface AccountBalance {
  account: ChartOfAccount;
  balance: number;
}

export default function FinancialReports() {
  const [activeReport, setActiveReport] = useState<'income' | 'balance'>('income');
  const [balances, setBalances] = useState<AccountBalance[]>([]);
  const [period, setPeriod] = useState({
    start: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    loadBalances();
  }, [period]);

  const loadBalances = async () => {
    const { data: accountsData } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .order('code');

    if (accountsData) {
      const balancesData = await Promise.all(
        accountsData.map(async (account) => {
          const { data: linesData } = await supabase
            .from('journal_entry_lines')
            .select(`
              *,
              journal_entries!inner(entry_date)
            `)
            .eq('account_id', account.id)
            .gte('journal_entries.entry_date', period.start)
            .lte('journal_entries.entry_date', period.end);

          let balance = 0;
          if (linesData) {
            if (account.normal_balance === 'Debit') {
              balance = linesData.reduce((sum: number, line: any) =>
                sum + Number(line.debit) - Number(line.credit), 0);
            } else {
              balance = linesData.reduce((sum: number, line: any) =>
                sum + Number(line.credit) - Number(line.debit), 0);
            }
          }

          return { account, balance };
        })
      );

      setBalances(balancesData);
    }
  };

  const getAccountsByType = (type: string) => {
    return balances.filter(b => b.account.type === type && Math.abs(b.balance) > 0.01);
  };

  const getTotalByType = (type: string) => {
    return getAccountsByType(type).reduce((sum, b) => sum + b.balance, 0);
  };

  const revenue = getTotalByType('Pendapatan');
  const expenses = getTotalByType('Beban');
  const netIncome = revenue - expenses;

  const assets = getTotalByType('Aset');
  const liabilities = getTotalByType('Kewajiban');
  const equity = getTotalByType('Modal') + netIncome;

  const exportToCSV = () => {
    let csv = '';
    const reportName = activeReport === 'income' ? 'Laporan Laba Rugi' : 'Neraca';

    csv += `${reportName}\n`;
    csv += `Periode: ${new Date(period.start).toLocaleDateString('id-ID')} - ${new Date(period.end).toLocaleDateString('id-ID')}\n\n`;

    if (activeReport === 'income') {
      csv += 'Pendapatan\n';
      csv += 'Kode,Nama Akun,Jumlah\n';
      getAccountsByType('Pendapatan').forEach(b => {
        csv += `${b.account.code},"${b.account.name}",${b.balance}\n`;
      });
      csv += `,,Total Pendapatan,${revenue}\n\n`;

      csv += 'Beban\n';
      csv += 'Kode,Nama Akun,Jumlah\n';
      getAccountsByType('Beban').forEach(b => {
        csv += `${b.account.code},"${b.account.name}",${b.balance}\n`;
      });
      csv += `,,Total Beban,${expenses}\n\n`;

      csv += `,,Laba/Rugi Bersih,${netIncome}\n`;
    } else {
      csv += 'ASET\n';
      csv += 'Kode,Nama Akun,Jumlah\n';
      getAccountsByType('Aset').forEach(b => {
        csv += `${b.account.code},"${b.account.name}",${b.balance}\n`;
      });
      csv += `,,Total Aset,${assets}\n\n`;

      csv += 'KEWAJIBAN\n';
      csv += 'Kode,Nama Akun,Jumlah\n';
      getAccountsByType('Kewajiban').forEach(b => {
        csv += `${b.account.code},"${b.account.name}",${b.balance}\n`;
      });
      csv += `,,Total Kewajiban,${liabilities}\n\n`;

      csv += 'MODAL\n';
      csv += 'Kode,Nama Akun,Jumlah\n';
      getAccountsByType('Modal').forEach(b => {
        csv += `${b.account.code},"${b.account.name}",${b.balance}\n`;
      });
      csv += `,Laba/Rugi Bersih,${netIncome}\n`;
      csv += `,,Total Modal,${equity}\n\n`;

      csv += `,,Total Kewajiban & Modal,${liabilities + equity}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${reportName}_${period.start}_${period.end}.csv`;
    link.click();
  };

  const exportToPDF = () => {
    const reportName = activeReport === 'income' ? 'Laporan Laba Rugi' : 'Neraca';
    alert(`Fitur export PDF sedang dalam pengembangan. Sementara gunakan export ke Excel/CSV untuk ${reportName}.`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-3xl font-black text-white">Laporan Keuangan</h2>
        <div className="flex gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 text-sm">
            <Download className="w-4 h-4" />
            Excel/CSV
          </button>
          <button
            onClick={exportToPDF}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold hover:scale-105 hover:shadow-lg hover:shadow-red-500/30 transition-all duration-300 text-sm">
            <Download className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      <div className="bg-slate-800/60 rounded-2xl border border-blue-800/30 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-blue-300 text-sm font-semibold mb-2">Tanggal Mulai</label>
            <input
              type="date"
              value={period.start}
              onChange={(e) => setPeriod({ ...period, start: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-blue-800/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <div>
            <label className="block text-blue-300 text-sm font-semibold mb-2">Tanggal Akhir</label>
            <input
              type="date"
              value={period.end}
              onChange={(e) => setPeriod({ ...period, end: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-blue-800/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveReport('income')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
              activeReport === 'income'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg scale-105'
                : 'bg-slate-900/60 text-blue-300 hover:bg-slate-900'
            }`}>
            <FileText className="w-5 h-5" />
            Laporan Laba Rugi
          </button>
          <button
            onClick={() => setActiveReport('balance')}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all duration-300 ${
              activeReport === 'balance'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg scale-105'
                : 'bg-slate-900/60 text-blue-300 hover:bg-slate-900'
            }`}>
            <DollarSign className="w-5 h-5" />
            Neraca
          </button>
        </div>
      </div>

      {activeReport === 'income' ? (
        <div className="bg-slate-800/60 rounded-2xl border border-blue-800/30 overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6">
            <h3 className="text-2xl font-black text-white">Laporan Laba Rugi</h3>
            <p className="text-green-100 text-sm mt-1">
              Periode: {new Date(period.start).toLocaleDateString('id-ID')} - {new Date(period.end).toLocaleDateString('id-ID')}
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-green-400 to-emerald-400 rounded-full" />
                PENDAPATAN
              </h4>
              <div className="bg-slate-900/40 rounded-xl overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-blue-800/20">
                    {getAccountsByType('Pendapatan').map((balance, index) => (
                      <tr key={balance.account.id} className="hover:bg-slate-800/40 transition-colors"
                          style={{
                            animation: `fadeInUp 0.3s ease-out ${index * 0.05}s forwards`,
                            opacity: 0
                          }}>
                        <td className="px-4 py-3 text-blue-300 font-mono text-sm">{balance.account.code}</td>
                        <td className="px-4 py-3 text-blue-200">{balance.account.name}</td>
                        <td className="px-4 py-3 text-right font-mono text-green-300">
                          Rp {balance.balance.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-900/60 font-bold">
                      <td colSpan={2} className="px-4 py-3 text-white">Total Pendapatan</td>
                      <td className="px-4 py-3 text-right font-mono text-green-300">
                        Rp {revenue.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-orange-400 to-red-400 rounded-full" />
                BEBAN
              </h4>
              <div className="bg-slate-900/40 rounded-xl overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-blue-800/20">
                    {getAccountsByType('Beban').map((balance, index) => (
                      <tr key={balance.account.id} className="hover:bg-slate-800/40 transition-colors"
                          style={{
                            animation: `fadeInUp 0.3s ease-out ${index * 0.05}s forwards`,
                            opacity: 0
                          }}>
                        <td className="px-4 py-3 text-blue-300 font-mono text-sm">{balance.account.code}</td>
                        <td className="px-4 py-3 text-blue-200">{balance.account.name}</td>
                        <td className="px-4 py-3 text-right font-mono text-orange-300">
                          Rp {balance.balance.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-900/60 font-bold">
                      <td colSpan={2} className="px-4 py-3 text-white">Total Beban</td>
                      <td className="px-4 py-3 text-right font-mono text-orange-300">
                        Rp {expenses.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-blue-900/40 rounded-2xl p-6 border-2 border-blue-500/30">
              <div className="flex justify-between items-center">
                <h4 className="text-2xl font-black text-white">
                  {netIncome >= 0 ? 'LABA BERSIH' : 'RUGI BERSIH'}
                </h4>
                <p className={`text-3xl font-black font-mono ${netIncome >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  Rp {Math.abs(netIncome).toLocaleString('id-ID')}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/60 rounded-2xl border border-blue-800/30 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
            <h3 className="text-2xl font-black text-white">Neraca</h3>
            <p className="text-blue-100 text-sm mt-1">
              Per {new Date(period.end).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-cyan-400 rounded-full" />
                ASET
              </h4>
              <div className="bg-slate-900/40 rounded-xl overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-blue-800/20">
                    {getAccountsByType('Aset').map((balance, index) => (
                      <tr key={balance.account.id} className="hover:bg-slate-800/40 transition-colors"
                          style={{
                            animation: `fadeInUp 0.3s ease-out ${index * 0.05}s forwards`,
                            opacity: 0
                          }}>
                        <td className="px-4 py-3 text-blue-300 font-mono text-sm">{balance.account.code}</td>
                        <td className="px-4 py-3 text-blue-200">{balance.account.name}</td>
                        <td className="px-4 py-3 text-right font-mono text-blue-300">
                          Rp {balance.balance.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-900/60 font-bold">
                      <td colSpan={2} className="px-4 py-3 text-white">Total Aset</td>
                      <td className="px-4 py-3 text-right font-mono text-blue-300">
                        Rp {assets.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-red-400 to-orange-400 rounded-full" />
                KEWAJIBAN
              </h4>
              <div className="bg-slate-900/40 rounded-xl overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-blue-800/20">
                    {getAccountsByType('Kewajiban').map((balance, index) => (
                      <tr key={balance.account.id} className="hover:bg-slate-800/40 transition-colors"
                          style={{
                            animation: `fadeInUp 0.3s ease-out ${index * 0.05}s forwards`,
                            opacity: 0
                          }}>
                        <td className="px-4 py-3 text-blue-300 font-mono text-sm">{balance.account.code}</td>
                        <td className="px-4 py-3 text-blue-200">{balance.account.name}</td>
                        <td className="px-4 py-3 text-right font-mono text-orange-300">
                          Rp {balance.balance.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-900/60 font-bold">
                      <td colSpan={2} className="px-4 py-3 text-white">Total Kewajiban</td>
                      <td className="px-4 py-3 text-right font-mono text-orange-300">
                        Rp {liabilities.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <div className="w-1 h-6 bg-gradient-to-b from-purple-400 to-pink-400 rounded-full" />
                MODAL
              </h4>
              <div className="bg-slate-900/40 rounded-xl overflow-hidden">
                <table className="w-full">
                  <tbody className="divide-y divide-blue-800/20">
                    {getAccountsByType('Modal').map((balance, index) => (
                      <tr key={balance.account.id} className="hover:bg-slate-800/40 transition-colors"
                          style={{
                            animation: `fadeInUp 0.3s ease-out ${index * 0.05}s forwards`,
                            opacity: 0
                          }}>
                        <td className="px-4 py-3 text-blue-300 font-mono text-sm">{balance.account.code}</td>
                        <td className="px-4 py-3 text-blue-200">{balance.account.name}</td>
                        <td className="px-4 py-3 text-right font-mono text-purple-300">
                          Rp {balance.balance.toLocaleString('id-ID')}
                        </td>
                      </tr>
                    ))}
                    <tr className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 text-blue-300 font-mono text-sm">-</td>
                      <td className="px-4 py-3 text-blue-200">Laba/Rugi Bersih</td>
                      <td className={`px-4 py-3 text-right font-mono ${netIncome >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        Rp {netIncome.toLocaleString('id-ID')}
                      </td>
                    </tr>
                    <tr className="bg-slate-900/60 font-bold">
                      <td colSpan={2} className="px-4 py-3 text-white">Total Modal</td>
                      <td className="px-4 py-3 text-right font-mono text-purple-300">
                        Rp {equity.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-blue-900/40 rounded-2xl p-6 border-2 border-blue-500/30">
              <div className="flex justify-between items-center">
                <h4 className="text-2xl font-black text-white">TOTAL KEWAJIBAN & MODAL</h4>
                <p className="text-3xl font-black font-mono text-cyan-300">
                  Rp {(liabilities + equity).toLocaleString('id-ID')}
                </p>
              </div>
              {Math.abs(assets - (liabilities + equity)) > 0.01 && (
                <p className="text-red-300 text-sm mt-2">
                  ⚠ Perhatian: Neraca tidak seimbang! Selisih: Rp {Math.abs(assets - (liabilities + equity)).toLocaleString('id-ID')}
                </p>
              )}
            </div>
          </div>
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
      `}</style>
    </div>
  );
}
