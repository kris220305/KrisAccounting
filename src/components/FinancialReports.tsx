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

  const getAccountsByCategory = (category: string) => {
    return balances.filter(b => b.account.category === category && Math.abs(b.balance) > 0.01);
  };

  const getAccountsByType = (type: string) => {
    return balances.filter(b => b.account.type === type && Math.abs(b.balance) > 0.01);
  };

  const getTotalByCategory = (category: string) => {
    return getAccountsByCategory(category).reduce((sum, b) => sum + b.balance, 0);
  };

  const getTotalByType = (type: string) => {
    return getAccountsByType(type).reduce((sum, b) => sum + b.balance, 0);
  };

  const revenue = getTotalByType('Pendapatan');
  const hppAccounts = balances.filter(b => b.account.category === 'Harga Pokok Penjualan');
  const hpp = hppAccounts.reduce((sum, b) => {
    if (b.account.normal_balance === 'Debit') {
      return sum + b.balance;
    } else {
      return sum - b.balance;
    }
  }, 0);

  const grossProfit = revenue - hpp;
  const operatingExpenses = getTotalByCategory('Beban Operasional') + getTotalByCategory('Beban Penyusutan');
  const operatingIncome = grossProfit - operatingExpenses;
  const nonOperatingExpenses = getTotalByCategory('Beban Non-Operasional');
  const netIncome = operatingIncome - nonOperatingExpenses;

  const currentAssets = getTotalByCategory('Aset Lancar');
  const longTermInvestment = getTotalByCategory('Investasi Jangka Panjang');
  const fixedAssets = getTotalByCategory('Aset Tetap');
  const intangibleAssets = getTotalByCategory('Aset Tidak Berwujud');
  const totalAssets = currentAssets + longTermInvestment + fixedAssets + intangibleAssets;

  const currentLiabilities = getTotalByCategory('Kewajiban Lancar');
  const longTermLiabilities = getTotalByCategory('Kewajiban Jangka Panjang');
  const totalLiabilities = currentLiabilities + longTermLiabilities;

  const equity = getTotalByType('Modal') + netIncome;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const exportToCSV = () => {
    let csv = '';
    const companyName = 'KRIS ACCOUNTING';
    const reportName = activeReport === 'income' ? 'LAPORAN LABA RUGI' : 'NERACA';

    csv += `${companyName}\n`;
    csv += `${reportName}\n`;
    if (activeReport === 'income') {
      csv += `Untuk Periode ${new Date(period.start).toLocaleDateString('id-ID')} s/d ${new Date(period.end).toLocaleDateString('id-ID')}\n`;
    } else {
      csv += `Per ${new Date(period.end).toLocaleDateString('id-ID')}\n`;
    }
    csv += `(Disajikan dalam Rupiah kecuali dinyatakan lain)\n\n`;

    if (activeReport === 'income') {
      csv += 'PENDAPATAN USAHA\n';
      csv += 'Kode,Nama Akun,Jumlah (Rp)\n';
      getAccountsByType('Pendapatan').forEach(b => {
        csv += `${b.account.code},"${b.account.name}",${b.balance.toFixed(2)}\n`;
      });
      csv += `,"Total Pendapatan Usaha",${revenue.toFixed(2)}\n\n`;

      csv += 'HARGA POKOK PENJUALAN\n';
      csv += 'Kode,Nama Akun,Jumlah (Rp)\n';
      hppAccounts.forEach(b => {
        const amount = b.account.normal_balance === 'Debit' ? b.balance : -b.balance;
        csv += `${b.account.code},"${b.account.name}",${amount.toFixed(2)}\n`;
      });
      csv += `,"Total Harga Pokok Penjualan",(${hpp.toFixed(2)})\n`;
      csv += `,"LABA KOTOR",${grossProfit.toFixed(2)}\n\n`;

      csv += 'BEBAN USAHA\n';
      csv += 'Beban Operasional\n';
      csv += 'Kode,Nama Akun,Jumlah (Rp)\n';
      getAccountsByCategory('Beban Operasional').forEach(b => {
        csv += `${b.account.code},"${b.account.name}",${b.balance.toFixed(2)}\n`;
      });
      csv += '\nBeban Penyusutan\n';
      csv += 'Kode,Nama Akun,Jumlah (Rp)\n';
      getAccountsByCategory('Beban Penyusutan').forEach(b => {
        csv += `${b.account.code},"${b.account.name}",${b.balance.toFixed(2)}\n`;
      });
      csv += `,"Total Beban Usaha",(${operatingExpenses.toFixed(2)})\n`;
      csv += `,"LABA USAHA",${operatingIncome.toFixed(2)}\n\n`;

      if (nonOperatingExpenses > 0) {
        csv += 'BEBAN LAIN-LAIN\n';
        csv += 'Kode,Nama Akun,Jumlah (Rp)\n';
        getAccountsByCategory('Beban Non-Operasional').forEach(b => {
          csv += `${b.account.code},"${b.account.name}",${b.balance.toFixed(2)}\n`;
        });
        csv += `,"Total Beban Lain-Lain",(${nonOperatingExpenses.toFixed(2)})\n\n`;
      }

      csv += `,"LABA BERSIH SEBELUM PAJAK",${netIncome.toFixed(2)}\n`;
    } else {
      csv += 'ASET\n\n';
      csv += 'ASET LANCAR\n';
      csv += 'Kode,Nama Akun,Jumlah (Rp)\n';
      getAccountsByCategory('Aset Lancar').forEach(b => {
        csv += `${b.account.code},"${b.account.name}",${b.balance.toFixed(2)}\n`;
      });
      csv += `,"Total Aset Lancar",${currentAssets.toFixed(2)}\n\n`;

      if (longTermInvestment > 0) {
        csv += 'INVESTASI JANGKA PANJANG\n';
        csv += 'Kode,Nama Akun,Jumlah (Rp)\n';
        getAccountsByCategory('Investasi Jangka Panjang').forEach(b => {
          csv += `${b.account.code},"${b.account.name}",${b.balance.toFixed(2)}\n`;
        });
        csv += `,"Total Investasi Jangka Panjang",${longTermInvestment.toFixed(2)}\n\n`;
      }

      csv += 'ASET TETAP\n';
      csv += 'Kode,Nama Akun,Jumlah (Rp)\n';
      getAccountsByCategory('Aset Tetap').forEach(b => {
        csv += `${b.account.code},"${b.account.name}",${b.balance.toFixed(2)}\n`;
      });
      csv += `,"Total Aset Tetap",${fixedAssets.toFixed(2)}\n\n`;

      if (intangibleAssets > 0) {
        csv += 'ASET TIDAK BERWUJUD\n';
        csv += 'Kode,Nama Akun,Jumlah (Rp)\n';
        getAccountsByCategory('Aset Tidak Berwujud').forEach(b => {
          csv += `${b.account.code},"${b.account.name}",${b.balance.toFixed(2)}\n`;
        });
        csv += `,"Total Aset Tidak Berwujud",${intangibleAssets.toFixed(2)}\n\n`;
      }

      csv += `,"TOTAL ASET",${totalAssets.toFixed(2)}\n\n\n`;

      csv += 'KEWAJIBAN DAN EKUITAS\n\n';
      csv += 'KEWAJIBAN LANCAR\n';
      csv += 'Kode,Nama Akun,Jumlah (Rp)\n';
      getAccountsByCategory('Kewajiban Lancar').forEach(b => {
        csv += `${b.account.code},"${b.account.name}",${b.balance.toFixed(2)}\n`;
      });
      csv += `,"Total Kewajiban Lancar",${currentLiabilities.toFixed(2)}\n\n`;

      if (longTermLiabilities > 0) {
        csv += 'KEWAJIBAN JANGKA PANJANG\n';
        csv += 'Kode,Nama Akun,Jumlah (Rp)\n';
        getAccountsByCategory('Kewajiban Jangka Panjang').forEach(b => {
          csv += `${b.account.code},"${b.account.name}",${b.balance.toFixed(2)}\n`;
        });
        csv += `,"Total Kewajiban Jangka Panjang",${longTermLiabilities.toFixed(2)}\n\n`;
      }

      csv += `,"TOTAL KEWAJIBAN",${totalLiabilities.toFixed(2)}\n\n`;

      csv += 'EKUITAS\n';
      csv += 'Kode,Nama Akun,Jumlah (Rp)\n';
      getAccountsByType('Modal').forEach(b => {
        csv += `${b.account.code},"${b.account.name}",${b.balance.toFixed(2)}\n`;
      });
      csv += `,"Laba/Rugi Tahun Berjalan",${netIncome.toFixed(2)}\n`;
      csv += `,"Total Ekuitas",${equity.toFixed(2)}\n\n`;

      csv += `,"TOTAL KEWAJIBAN DAN EKUITAS",${(totalLiabilities + equity).toFixed(2)}\n`;
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${reportName.replace(/\s/g, '_')}_${period.start}_${period.end}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-3xl font-black text-white">Laporan Keuangan</h2>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300 text-sm">
          <Download className="w-4 h-4" />
          Export Excel
        </button>
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
            <h3 className="text-2xl font-black text-white text-center">KRIS ACCOUNTING</h3>
            <h4 className="text-xl font-bold text-white text-center mt-2">LAPORAN LABA RUGI</h4>
            <p className="text-green-100 text-sm text-center mt-1">
              Untuk Periode {new Date(period.start).toLocaleDateString('id-ID')} s/d {new Date(period.end).toLocaleDateString('id-ID')}
            </p>
            <p className="text-green-100 text-xs text-center mt-1">(Disajikan dalam Rupiah kecuali dinyatakan lain)</p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-base font-bold text-white mb-3 uppercase">Pendapatan Usaha</h4>
              <div className="bg-slate-900/40 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-blue-800/20">
                    {getAccountsByType('Pendapatan').map((balance) => (
                      <tr key={balance.account.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-2 text-blue-300 font-mono w-20">{balance.account.code}</td>
                        <td className="px-4 py-2 text-blue-200">{balance.account.name}</td>
                        <td className="px-4 py-2 text-right font-mono text-white w-48">
                          {formatCurrency(balance.balance)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-900/80 font-bold">
                      <td colSpan={2} className="px-4 py-3 text-white">Total Pendapatan Usaha</td>
                      <td className="px-4 py-3 text-right font-mono text-green-300">
                        {formatCurrency(revenue)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="text-base font-bold text-white mb-3 uppercase">Harga Pokok Penjualan</h4>
              <div className="bg-slate-900/40 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-blue-800/20">
                    {hppAccounts.map((balance) => {
                      const amount = balance.account.normal_balance === 'Debit' ? balance.balance : -balance.balance;
                      return (
                        <tr key={balance.account.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-2 text-blue-300 font-mono w-20">{balance.account.code}</td>
                          <td className="px-4 py-2 text-blue-200">{balance.account.name}</td>
                          <td className="px-4 py-2 text-right font-mono text-white w-48">
                            {formatCurrency(amount)}
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-slate-900/80 font-bold">
                      <td colSpan={2} className="px-4 py-3 text-white">Total Harga Pokok Penjualan</td>
                      <td className="px-4 py-3 text-right font-mono text-orange-300">
                        ({formatCurrency(hpp)})
                      </td>
                    </tr>
                    <tr className="bg-gradient-to-r from-blue-900/60 to-cyan-900/60 font-bold text-lg">
                      <td colSpan={2} className="px-4 py-4 text-white uppercase">Laba Kotor</td>
                      <td className="px-4 py-4 text-right font-mono text-cyan-300">
                        {formatCurrency(grossProfit)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h4 className="text-base font-bold text-white mb-3 uppercase">Beban Usaha</h4>
              <div className="bg-slate-900/40 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-blue-800/20">
                    <tr className="bg-slate-900/60">
                      <td colSpan={3} className="px-4 py-2 text-blue-200 font-semibold">Beban Operasional</td>
                    </tr>
                    {getAccountsByCategory('Beban Operasional').map((balance) => (
                      <tr key={balance.account.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-2 text-blue-300 font-mono w-20 pl-8">{balance.account.code}</td>
                        <td className="px-4 py-2 text-blue-200">{balance.account.name}</td>
                        <td className="px-4 py-2 text-right font-mono text-white w-48">
                          {formatCurrency(balance.balance)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-900/60">
                      <td colSpan={3} className="px-4 py-2 text-blue-200 font-semibold">Beban Penyusutan</td>
                    </tr>
                    {getAccountsByCategory('Beban Penyusutan').map((balance) => (
                      <tr key={balance.account.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-2 text-blue-300 font-mono w-20 pl-8">{balance.account.code}</td>
                        <td className="px-4 py-2 text-blue-200">{balance.account.name}</td>
                        <td className="px-4 py-2 text-right font-mono text-white w-48">
                          {formatCurrency(balance.balance)}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-900/80 font-bold">
                      <td colSpan={2} className="px-4 py-3 text-white">Total Beban Usaha</td>
                      <td className="px-4 py-3 text-right font-mono text-orange-300">
                        ({formatCurrency(operatingExpenses)})
                      </td>
                    </tr>
                    <tr className="bg-gradient-to-r from-blue-900/60 to-cyan-900/60 font-bold text-lg">
                      <td colSpan={2} className="px-4 py-4 text-white uppercase">Laba Usaha</td>
                      <td className="px-4 py-4 text-right font-mono text-cyan-300">
                        {formatCurrency(operatingIncome)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {nonOperatingExpenses > 0 && (
              <div>
                <h4 className="text-base font-bold text-white mb-3 uppercase">Beban Lain-Lain</h4>
                <div className="bg-slate-900/40 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody className="divide-y divide-blue-800/20">
                      {getAccountsByCategory('Beban Non-Operasional').map((balance) => (
                        <tr key={balance.account.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-2 text-blue-300 font-mono w-20">{balance.account.code}</td>
                          <td className="px-4 py-2 text-blue-200">{balance.account.name}</td>
                          <td className="px-4 py-2 text-right font-mono text-white w-48">
                            {formatCurrency(balance.balance)}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-slate-900/80 font-bold">
                        <td colSpan={2} className="px-4 py-3 text-white">Total Beban Lain-Lain</td>
                        <td className="px-4 py-3 text-right font-mono text-orange-300">
                          ({formatCurrency(nonOperatingExpenses)})
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-slate-900 to-emerald-900/40 rounded-2xl p-6 border-2 border-emerald-500/50 shadow-lg shadow-emerald-500/20">
              <div className="flex justify-between items-center">
                <h4 className="text-2xl font-black text-white uppercase">
                  {netIncome >= 0 ? 'Laba Bersih Sebelum Pajak' : 'Rugi Bersih'}
                </h4>
                <p className={`text-3xl font-black font-mono ${netIncome >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {formatCurrency(Math.abs(netIncome))}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/60 rounded-2xl border border-blue-800/30 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6">
            <h3 className="text-2xl font-black text-white text-center">KRIS ACCOUNTING</h3>
            <h4 className="text-xl font-bold text-white text-center mt-2">NERACA</h4>
            <p className="text-blue-100 text-sm text-center mt-1">
              Per {new Date(period.end).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="text-blue-100 text-xs text-center mt-1">(Disajikan dalam Rupiah kecuali dinyatakan lain)</p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h4 className="text-lg font-black text-white mb-4 uppercase bg-gradient-to-r from-blue-900/40 to-cyan-900/40 px-4 py-2 rounded-lg">
                Aset
              </h4>

              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-bold text-blue-300 mb-2 uppercase px-4">Aset Lancar</h5>
                  <div className="bg-slate-900/40 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-blue-800/20">
                        {getAccountsByCategory('Aset Lancar').map((balance) => (
                          <tr key={balance.account.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-4 py-2 text-blue-300 font-mono w-20 pl-8">{balance.account.code}</td>
                            <td className="px-4 py-2 text-blue-200">{balance.account.name}</td>
                            <td className="px-4 py-2 text-right font-mono text-white w-48">
                              {formatCurrency(balance.balance)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-900/60 font-bold">
                          <td colSpan={2} className="px-4 py-3 text-white">Total Aset Lancar</td>
                          <td className="px-4 py-3 text-right font-mono text-cyan-300">
                            {formatCurrency(currentAssets)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {longTermInvestment > 0 && (
                  <div>
                    <h5 className="text-sm font-bold text-blue-300 mb-2 uppercase px-4">Investasi Jangka Panjang</h5>
                    <div className="bg-slate-900/40 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-blue-800/20">
                          {getAccountsByCategory('Investasi Jangka Panjang').map((balance) => (
                            <tr key={balance.account.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="px-4 py-2 text-blue-300 font-mono w-20 pl-8">{balance.account.code}</td>
                              <td className="px-4 py-2 text-blue-200">{balance.account.name}</td>
                              <td className="px-4 py-2 text-right font-mono text-white w-48">
                                {formatCurrency(balance.balance)}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-slate-900/60 font-bold">
                            <td colSpan={2} className="px-4 py-3 text-white">Total Investasi Jangka Panjang</td>
                            <td className="px-4 py-3 text-right font-mono text-cyan-300">
                              {formatCurrency(longTermInvestment)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div>
                  <h5 className="text-sm font-bold text-blue-300 mb-2 uppercase px-4">Aset Tetap</h5>
                  <div className="bg-slate-900/40 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-blue-800/20">
                        {getAccountsByCategory('Aset Tetap').map((balance) => (
                          <tr key={balance.account.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-4 py-2 text-blue-300 font-mono w-20 pl-8">{balance.account.code}</td>
                            <td className="px-4 py-2 text-blue-200">{balance.account.name}</td>
                            <td className="px-4 py-2 text-right font-mono text-white w-48">
                              {formatCurrency(balance.balance)}
                            </td>
                          </tr>
                        ))}
                        <tr className="bg-slate-900/60 font-bold">
                          <td colSpan={2} className="px-4 py-3 text-white">Total Aset Tetap</td>
                          <td className="px-4 py-3 text-right font-mono text-cyan-300">
                            {formatCurrency(fixedAssets)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {intangibleAssets > 0 && (
                  <div>
                    <h5 className="text-sm font-bold text-blue-300 mb-2 uppercase px-4">Aset Tidak Berwujud</h5>
                    <div className="bg-slate-900/40 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-blue-800/20">
                          {getAccountsByCategory('Aset Tidak Berwujud').map((balance) => (
                            <tr key={balance.account.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="px-4 py-2 text-blue-300 font-mono w-20 pl-8">{balance.account.code}</td>
                              <td className="px-4 py-2 text-blue-200">{balance.account.name}</td>
                              <td className="px-4 py-2 text-right font-mono text-white w-48">
                                {formatCurrency(balance.balance)}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-slate-900/60 font-bold">
                            <td colSpan={2} className="px-4 py-3 text-white">Total Aset Tidak Berwujud</td>
                            <td className="px-4 py-3 text-right font-mono text-cyan-300">
                              {formatCurrency(intangibleAssets)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-r from-blue-900/60 to-cyan-900/60 rounded-xl p-4 font-bold text-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-white uppercase">Total Aset</span>
                    <span className="font-mono text-cyan-300">{formatCurrency(totalAssets)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-black text-white mb-4 uppercase bg-gradient-to-r from-orange-900/40 to-red-900/40 px-4 py-2 rounded-lg">
                Kewajiban dan Ekuitas
              </h4>

              <div className="space-y-4">
                <div>
                  <h5 className="text-sm font-bold text-orange-300 mb-2 uppercase px-4">Kewajiban Lancar</h5>
                  <div className="bg-slate-900/40 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-blue-800/20">
                        {getAccountsByCategory('Kewajiban Lancar').length > 0 ? (
                          <>
                            {getAccountsByCategory('Kewajiban Lancar').map((balance) => (
                              <tr key={balance.account.id} className="hover:bg-slate-800/40 transition-colors">
                                <td className="px-4 py-2 text-blue-300 font-mono w-20 pl-8">{balance.account.code}</td>
                                <td className="px-4 py-2 text-blue-200">{balance.account.name}</td>
                                <td className="px-4 py-2 text-right font-mono text-white w-48">
                                  {formatCurrency(balance.balance)}
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-slate-900/60 font-bold">
                              <td colSpan={2} className="px-4 py-3 text-white">Total Kewajiban Lancar</td>
                              <td className="px-4 py-3 text-right font-mono text-orange-300">
                                {formatCurrency(currentLiabilities)}
                              </td>
                            </tr>
                          </>
                        ) : (
                          <tr>
                            <td colSpan={3} className="px-4 py-3 text-center text-blue-400 italic">Tidak ada data</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {longTermLiabilities > 0 && (
                  <div>
                    <h5 className="text-sm font-bold text-orange-300 mb-2 uppercase px-4">Kewajiban Jangka Panjang</h5>
                    <div className="bg-slate-900/40 rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-blue-800/20">
                          {getAccountsByCategory('Kewajiban Jangka Panjang').map((balance) => (
                            <tr key={balance.account.id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="px-4 py-2 text-blue-300 font-mono w-20 pl-8">{balance.account.code}</td>
                              <td className="px-4 py-2 text-blue-200">{balance.account.name}</td>
                              <td className="px-4 py-2 text-right font-mono text-white w-48">
                                {formatCurrency(balance.balance)}
                              </td>
                            </tr>
                          ))}
                          <tr className="bg-slate-900/60 font-bold">
                            <td colSpan={2} className="px-4 py-3 text-white">Total Kewajiban Jangka Panjang</td>
                            <td className="px-4 py-3 text-right font-mono text-orange-300">
                              {formatCurrency(longTermLiabilities)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="bg-gradient-to-r from-orange-900/60 to-red-900/60 rounded-xl p-4 font-bold text-base">
                  <div className="flex justify-between items-center">
                    <span className="text-white uppercase">Total Kewajiban</span>
                    <span className="font-mono text-orange-300">{formatCurrency(totalLiabilities)}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <h5 className="text-sm font-bold text-purple-300 mb-2 uppercase px-4">Ekuitas</h5>
                  <div className="bg-slate-900/40 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-blue-800/20">
                        {getAccountsByType('Modal').map((balance) => (
                          <tr key={balance.account.id} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-4 py-2 text-blue-300 font-mono w-20 pl-8">{balance.account.code}</td>
                            <td className="px-4 py-2 text-blue-200">{balance.account.name}</td>
                            <td className="px-4 py-2 text-right font-mono text-white w-48">
                              {formatCurrency(balance.balance)}
                            </td>
                          </tr>
                        ))}
                        <tr className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-2 text-blue-300 font-mono w-20 pl-8">-</td>
                          <td className="px-4 py-2 text-blue-200">Laba/Rugi Tahun Berjalan</td>
                          <td className={`px-4 py-2 text-right font-mono w-48 ${netIncome >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                            {formatCurrency(netIncome)}
                          </td>
                        </tr>
                        <tr className="bg-slate-900/60 font-bold">
                          <td colSpan={2} className="px-4 py-3 text-white">Total Ekuitas</td>
                          <td className="px-4 py-3 text-right font-mono text-purple-300">
                            {formatCurrency(equity)}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-blue-900/40 rounded-2xl p-6 border-2 border-cyan-500/50 shadow-lg shadow-cyan-500/20">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-2xl font-black text-white uppercase">Total Kewajiban dan Ekuitas</h4>
                    <p className="text-3xl font-black font-mono text-cyan-300">
                      {formatCurrency(totalLiabilities + equity)}
                    </p>
                  </div>
                  {Math.abs(totalAssets - (totalLiabilities + equity)) > 0.01 && (
                    <p className="text-red-300 text-sm mt-2">
                      ⚠ Perhatian: Neraca tidak seimbang! Selisih: {formatCurrency(Math.abs(totalAssets - (totalLiabilities + equity)))}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
