import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, X, Calendar } from 'lucide-react';
import { supabase, ChartOfAccount, JournalEntry, JournalEntryLine } from '../lib/supabase';

export default function JournalEntries() {
  const [entries, setEntries] = useState<(JournalEntry & { lines: (JournalEntryLine & { account?: ChartOfAccount })[] })[]>([]);
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    reference_number: '',
    description: '',
    lines: [
      { account_id: '', debit: 0, credit: 0 },
      { account_id: '', debit: 0, credit: 0 }
    ]
  });

  useEffect(() => {
    loadEntries();
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const { data } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .order('code');
    if (data) setAccounts(data);
  };

  const loadEntries = async () => {
    const { data: entriesData } = await supabase
      .from('journal_entries')
      .select('*')
      .order('entry_date', { ascending: false });

    if (entriesData) {
      const entriesWithLines = await Promise.all(
        entriesData.map(async (entry) => {
          const { data: linesData } = await supabase
            .from('journal_entry_lines')
            .select('*, account:chart_of_accounts(*)')
            .eq('journal_entry_id', entry.id);

          return {
            ...entry,
            lines: linesData || []
          };
        })
      );
      setEntries(entriesWithLines);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const totalDebit = formData.lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
    const totalCredit = formData.lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      alert('Total Debit dan Kredit harus seimbang!');
      return;
    }

    const { data: entryData, error: entryError } = await supabase
      .from('journal_entries')
      .insert([{
        entry_date: formData.entry_date,
        reference_number: formData.reference_number,
        description: formData.description
      }])
      .select()
      .single();

    if (entryError || !entryData) {
      alert('Gagal menyimpan jurnal: ' + entryError?.message);
      return;
    }

    const linesToInsert = formData.lines
      .filter(line => line.account_id && (line.debit > 0 || line.credit > 0))
      .map(line => ({
        journal_entry_id: entryData.id,
        account_id: line.account_id,
        debit: Number(line.debit) || 0,
        credit: Number(line.credit) || 0
      }));

    await supabase.from('journal_entry_lines').insert(linesToInsert);

    loadEntries();
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus jurnal ini?')) {
      await supabase.from('journal_entries').delete().eq('id', id);
      loadEntries();
    }
  };

  const openModal = () => {
    setFormData({
      entry_date: new Date().toISOString().split('T')[0],
      reference_number: `JRN-${Date.now()}`,
      description: '',
      lines: [
        { account_id: '', debit: 0, credit: 0 },
        { account_id: '', debit: 0, credit: 0 }
      ]
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const addLine = () => {
    setFormData({
      ...formData,
      lines: [...formData.lines, { account_id: '', debit: 0, credit: 0 }]
    });
  };

  const removeLine = (index: number) => {
    if (formData.lines.length > 2) {
      setFormData({
        ...formData,
        lines: formData.lines.filter((_, i) => i !== index)
      });
    }
  };

  const updateLine = (index: number, field: string, value: any) => {
    const newLines = [...formData.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setFormData({ ...formData, lines: newLines });
  };

  const filteredEntries = entries.filter(entry =>
    entry.reference_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTotalDebit = () => formData.lines.reduce((sum, line) => sum + (Number(line.debit) || 0), 0);
  const getTotalCredit = () => formData.lines.reduce((sum, line) => sum + (Number(line.credit) || 0), 0);
  const isBalanced = Math.abs(getTotalDebit() - getTotalCredit()) < 0.01;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h2 className="text-3xl font-black text-white">Jurnal Umum</h2>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl font-semibold hover:scale-105 hover:shadow-lg hover:shadow-green-500/30 transition-all duration-300">
          <Plus className="w-5 h-5" />
          Tambah Jurnal
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan nomor referensi atau keterangan..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-slate-800/60 border border-blue-800/30 rounded-xl text-white placeholder-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
        />
      </div>

      <div className="space-y-4">
        {filteredEntries.map((entry, index) => {
          const totalDebit = entry.lines.reduce((sum, line) => sum + Number(line.debit), 0);
          const totalCredit = entry.lines.reduce((sum, line) => sum + Number(line.credit), 0);

          return (
            <div
              key={entry.id}
              className="bg-slate-800/60 rounded-2xl border border-blue-800/30 p-6 hover:border-blue-600/50 transition-all group"
              style={{
                animation: `fadeInUp 0.3s ease-out ${index * 0.05}s forwards`,
                opacity: 0
              }}>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-3 py-1 bg-gradient-to-r from-green-400 to-emerald-400 text-white text-sm font-bold rounded-lg">
                      {entry.reference_number}
                    </span>
                    <span className="flex items-center gap-1 text-blue-300 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(entry.entry_date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <p className="text-white font-medium">{entry.description}</p>
                </div>
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="bg-slate-900/40 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-900/60">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-blue-300">Akun</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-green-300">Debit</th>
                      <th className="px-4 py-3 text-right text-xs font-bold text-orange-300">Kredit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-800/20">
                    {entry.lines.map((line) => (
                      <tr key={line.id}>
                        <td className="px-4 py-3 text-blue-200">
                          {line.account?.code} - {line.account?.name}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-green-300">
                          {line.debit > 0 ? `Rp ${Number(line.debit).toLocaleString('id-ID')}` : '-'}
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-orange-300">
                          {line.credit > 0 ? `Rp ${Number(line.credit).toLocaleString('id-ID')}` : '-'}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-slate-900/60 font-bold">
                      <td className="px-4 py-3 text-white">Total</td>
                      <td className="px-4 py-3 text-right font-mono text-green-300">
                        Rp {totalDebit.toLocaleString('id-ID')}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-orange-300">
                        Rp {totalCredit.toLocaleString('id-ID')}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEntries.length === 0 && (
        <div className="text-center py-12 text-blue-400 bg-slate-800/60 rounded-2xl border border-blue-800/30">
          {searchTerm ? 'Tidak ada jurnal yang sesuai dengan pencarian' : 'Belum ada jurnal. Catat transaksi pertama kamu!'}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-blue-800/30 p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Tambah Jurnal Baru</h3>
              <button onClick={closeModal} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5 text-blue-300" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-blue-300 text-sm font-semibold mb-2">Tanggal</label>
                  <input
                    type="date"
                    required
                    value={formData.entry_date}
                    onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-blue-800/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>

                <div>
                  <label className="block text-blue-300 text-sm font-semibold mb-2">No. Referensi</label>
                  <input
                    type="text"
                    required
                    value={formData.reference_number}
                    onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-800 border border-blue-800/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-blue-300 text-sm font-semibold mb-2">Keterangan</label>
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-blue-800/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[80px]"
                  placeholder="Deskripsi transaksi..."
                />
              </div>

              <div>
                <label className="block text-blue-300 text-sm font-semibold mb-3">Detail Jurnal</label>
                <div className="space-y-3">
                  {formData.lines.map((line, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <select
                        required
                        value={line.account_id}
                        onChange={(e) => updateLine(index, 'account_id', e.target.value)}
                        className="flex-1 px-4 py-3 bg-slate-800 border border-blue-800/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                        <option value="">Pilih Akun</option>
                        {accounts.map(account => (
                          <option key={account.id} value={account.id}>
                            {account.code} - {account.name}
                          </option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Debit"
                        value={line.debit || ''}
                        onChange={(e) => {
                          updateLine(index, 'debit', e.target.value);
                          if (e.target.value) updateLine(index, 'credit', 0);
                        }}
                        className="w-32 px-4 py-3 bg-slate-800 border border-green-800/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-green-500/50"
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Kredit"
                        value={line.credit || ''}
                        onChange={(e) => {
                          updateLine(index, 'credit', e.target.value);
                          if (e.target.value) updateLine(index, 'debit', 0);
                        }}
                        className="w-32 px-4 py-3 bg-slate-800 border border-orange-800/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                      />
                      {formData.lines.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="p-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addLine}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-xl transition-colors">
                  <Plus className="w-4 h-4" />
                  Tambah Baris
                </button>

                <div className="mt-4 p-4 bg-slate-800/60 rounded-xl border border-blue-800/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-300 font-semibold">Total Debit:</span>
                    <span className="text-green-300 font-mono font-bold">Rp {getTotalDebit().toLocaleString('id-ID')}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-blue-300 font-semibold">Total Kredit:</span>
                    <span className="text-orange-300 font-mono font-bold">Rp {getTotalCredit().toLocaleString('id-ID')}</span>
                  </div>
                  <div className={`flex justify-between items-center pt-2 border-t ${isBalanced ? 'border-green-800/30' : 'border-red-800/30'}`}>
                    <span className="text-white font-bold">Status:</span>
                    <span className={`font-bold ${isBalanced ? 'text-green-300' : 'text-red-300'}`}>
                      {isBalanced ? 'Seimbang ✓' : 'Tidak Seimbang ✗'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-slate-800 text-blue-300 rounded-xl font-semibold hover:bg-slate-700 transition-colors">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!isBalanced}
                  className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isBalanced
                      ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:scale-105 hover:shadow-lg hover:shadow-green-500/30'
                      : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}>
                  Simpan Jurnal
                </button>
              </div>
            </form>
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
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
