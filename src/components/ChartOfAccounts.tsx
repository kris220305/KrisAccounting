import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';
import { supabase, ChartOfAccount } from '../lib/supabase';

const accountTypes = ['Aset', 'Kewajiban', 'Modal', 'Pendapatan', 'Beban'];
const normalBalances = ['Debit', 'Kredit'];

export default function ChartOfAccounts() {
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<ChartOfAccount | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'Aset' as ChartOfAccount['type'],
    category: '',
    normal_balance: 'Debit' as ChartOfAccount['normal_balance']
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const { data, error } = await supabase
      .from('chart_of_accounts')
      .select('*')
      .order('code');

    if (!error && data) {
      setAccounts(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAccount) {
      await supabase
        .from('chart_of_accounts')
        .update(formData)
        .eq('id', editingAccount.id);
    } else {
      await supabase
        .from('chart_of_accounts')
        .insert([formData]);
    }

    loadAccounts();
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Yakin ingin menghapus akun ini?')) {
      await supabase
        .from('chart_of_accounts')
        .delete()
        .eq('id', id);
      loadAccounts();
    }
  };

  const openModal = (account?: ChartOfAccount) => {
    if (account) {
      setEditingAccount(account);
      setFormData({
        code: account.code,
        name: account.name,
        type: account.type,
        category: account.category,
        normal_balance: account.normal_balance
      });
    } else {
      setEditingAccount(null);
      setFormData({
        code: '',
        name: '',
        type: 'Aset',
        category: '',
        normal_balance: 'Debit'
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAccount(null);
  };

  const filteredAccounts = accounts.filter(account =>
    account.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    account.type.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h2 className="text-3xl font-black text-white">Daftar Akun</h2>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300">
          <Plus className="w-5 h-5" />
          Tambah Akun
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
        <input
          type="text"
          placeholder="Cari berdasarkan kode, nama, atau jenis akun..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-4 bg-slate-800/60 border border-blue-800/30 rounded-xl text-white placeholder-blue-400/50 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
        />
      </div>

      <div className="bg-slate-800/60 rounded-2xl border border-blue-800/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/60">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-bold text-blue-300">Kode</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-blue-300">Nama Akun</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-blue-300">Jenis</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-blue-300">Kategori</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-blue-300">Saldo Normal</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-blue-300">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-800/20">
              {filteredAccounts.map((account, index) => (
                <tr
                  key={account.id}
                  className="group hover:bg-slate-700/40 transition-colors"
                  style={{
                    animation: `fadeInUp 0.3s ease-out ${index * 0.05}s forwards`,
                    opacity: 0
                  }}>
                  <td className="px-6 py-4 text-blue-200 font-mono text-sm">{account.code}</td>
                  <td className="px-6 py-4 text-white font-medium">{account.name}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-white text-sm font-semibold bg-gradient-to-r ${getTypeColor(account.type)}`}>
                      {account.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-blue-200">{account.category}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-lg text-sm font-semibold ${
                      account.normal_balance === 'Debit'
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-orange-500/20 text-orange-300'
                    }`}>
                      {account.normal_balance}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openModal(account)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAccounts.length === 0 && (
          <div className="text-center py-12 text-blue-400">
            {searchTerm ? 'Tidak ada akun yang sesuai dengan pencarian' : 'Belum ada akun. Tambahkan akun pertama kamu!'}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-blue-800/30 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">
                {editingAccount ? 'Edit Akun' : 'Tambah Akun Baru'}
              </h3>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                <X className="w-5 h-5 text-blue-300" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-blue-300 text-sm font-semibold mb-2">Kode Akun</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-blue-800/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="1-1001"
                />
              </div>

              <div>
                <label className="block text-blue-300 text-sm font-semibold mb-2">Nama Akun</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-blue-800/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Kas"
                />
              </div>

              <div>
                <label className="block text-blue-300 text-sm font-semibold mb-2">Jenis</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as ChartOfAccount['type'] })}
                  className="w-full px-4 py-3 bg-slate-800 border border-blue-800/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                  {accountTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-blue-300 text-sm font-semibold mb-2">Kategori</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-800 border border-blue-800/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  placeholder="Aset Lancar"
                />
              </div>

              <div>
                <label className="block text-blue-300 text-sm font-semibold mb-2">Saldo Normal</label>
                <select
                  required
                  value={formData.normal_balance}
                  onChange={(e) => setFormData({ ...formData, normal_balance: e.target.value as ChartOfAccount['normal_balance'] })}
                  className="w-full px-4 py-3 bg-slate-800 border border-blue-800/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50">
                  {normalBalances.map(balance => (
                    <option key={balance} value={balance}>{balance}</option>
                  ))}
                </select>
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-semibold hover:scale-105 hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300">
                  {editingAccount ? 'Simpan' : 'Tambah'}
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
