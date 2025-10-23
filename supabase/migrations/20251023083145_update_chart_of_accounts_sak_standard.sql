/*
  # Update Chart of Accounts - Standar SAK & IDX

  ## Perubahan
  - Hapus data akun lama
  - Tambahkan daftar akun lengkap sesuai standar SAK dan IDX
  - Penomoran sistematis:
    * 1xxx - Aset (Harta)
    * 2xxx - Liabilities (Kewajiban)
    * 3xxx - Equity (Modal)
    * 4xxx - Revenue (Pendapatan)
    * 5xxx - Expense (Beban)
    * 6xxx - Cost of Goods Sold (Harga Pokok Penjualan)
*/

-- Hapus data lama
DELETE FROM chart_of_accounts;

-- ASET (HARTA) - 1xxx
INSERT INTO chart_of_accounts (code, name, type, category, normal_balance) VALUES
  -- Aset Lancar (Current Assets) - 11xx
  ('1101', 'Kas di Bank', 'Aset', 'Aset Lancar', 'Debit'),
  ('1102', 'Kas Kecil', 'Aset', 'Aset Lancar', 'Debit'),
  ('1103', 'Piutang Dagang', 'Aset', 'Aset Lancar', 'Debit'),
  ('1104', 'Penyisihan Kerugian Piutang', 'Aset', 'Aset Lancar', 'Kredit'),
  ('1105', 'Piutang Bunga', 'Aset', 'Aset Lancar', 'Debit'),
  ('1106', 'Piutang Wesel', 'Aset', 'Aset Lancar', 'Debit'),
  ('1107', 'Persediaan Barang Dagangan', 'Aset', 'Aset Lancar', 'Debit'),
  ('1108', 'Surat-Surat Berharga', 'Aset', 'Aset Lancar', 'Debit'),
  ('1109', 'Perlengkapan', 'Aset', 'Aset Lancar', 'Debit'),
  ('1110', 'Perlengkapan Toko', 'Aset', 'Aset Lancar', 'Debit'),
  ('1111', 'Perlengkapan Kantor', 'Aset', 'Aset Lancar', 'Debit'),
  ('1112', 'Iklan Dibayar Dimuka', 'Aset', 'Aset Lancar', 'Debit'),
  ('1113', 'Biaya Dibayar Dimuka', 'Aset', 'Aset Lancar', 'Debit'),
  ('1114', 'Asuransi Dibayar Dimuka', 'Aset', 'Aset Lancar', 'Debit'),
  ('1115', 'Sewa Dibayar Dimuka', 'Aset', 'Aset Lancar', 'Debit'),
  ('1116', 'Investasi Jangka Pendek', 'Aset', 'Aset Lancar', 'Debit'),
  ('1117', 'PPN Masukan', 'Aset', 'Aset Lancar', 'Debit'),
  
  -- Investasi Jangka Panjang - 12xx
  ('1201', 'Investasi Jangka Panjang', 'Aset', 'Investasi Jangka Panjang', 'Debit'),
  
  -- Aset Tetap (Fixed Assets) - 13xx
  ('1301', 'Tanah', 'Aset', 'Aset Tetap', 'Debit'),
  ('1302', 'Gedung', 'Aset', 'Aset Tetap', 'Debit'),
  ('1303', 'Akumulasi Penyusutan Gedung', 'Aset', 'Aset Tetap', 'Kredit'),
  ('1304', 'Mesin', 'Aset', 'Aset Tetap', 'Debit'),
  ('1305', 'Akumulasi Penyusutan Mesin', 'Aset', 'Aset Tetap', 'Kredit'),
  ('1306', 'Kendaraan', 'Aset', 'Aset Tetap', 'Debit'),
  ('1307', 'Akumulasi Penyusutan Kendaraan', 'Aset', 'Aset Tetap', 'Kredit'),
  ('1308', 'Peralatan', 'Aset', 'Aset Tetap', 'Debit'),
  ('1309', 'Akumulasi Penyusutan Peralatan', 'Aset', 'Aset Tetap', 'Kredit'),
  ('1310', 'Peralatan Toko', 'Aset', 'Aset Tetap', 'Debit'),
  ('1311', 'Akumulasi Penyusutan Peralatan Toko', 'Aset', 'Aset Tetap', 'Kredit'),
  ('1312', 'Peralatan Kantor', 'Aset', 'Aset Tetap', 'Debit'),
  ('1313', 'Akumulasi Penyusutan Peralatan Kantor', 'Aset', 'Aset Tetap', 'Kredit'),
  ('1314', 'Perabot & Inventaris', 'Aset', 'Aset Tetap', 'Debit'),
  ('1315', 'Akumulasi Penyusutan Perabot & Inventaris', 'Aset', 'Aset Tetap', 'Kredit'),
  
  -- Aset Tidak Berwujud (Intangible Assets) - 14xx
  ('1401', 'Nama Baik (Goodwill)', 'Aset', 'Aset Tidak Berwujud', 'Debit'),
  ('1402', 'Merek Dagang', 'Aset', 'Aset Tidak Berwujud', 'Debit'),
  ('1403', 'Hak Sewa', 'Aset', 'Aset Tidak Berwujud', 'Debit'),
  ('1404', 'Hak Cipta', 'Aset', 'Aset Tidak Berwujud', 'Debit'),
  ('1405', 'Hak Paten', 'Aset', 'Aset Tidak Berwujud', 'Debit'),
  ('1406', 'Hak Istimewa (Franchise)', 'Aset', 'Aset Tidak Berwujud', 'Debit');

-- KEWAJIBAN (LIABILITIES) - 2xxx
INSERT INTO chart_of_accounts (code, name, type, category, normal_balance) VALUES
  -- Kewajiban Lancar - 21xx
  ('2101', 'Utang Dagang', 'Kewajiban', 'Kewajiban Lancar', 'Kredit'),
  ('2102', 'Utang Bank', 'Kewajiban', 'Kewajiban Lancar', 'Kredit'),
  ('2103', 'Utang Bunga', 'Kewajiban', 'Kewajiban Lancar', 'Kredit'),
  ('2104', 'Utang Wesel', 'Kewajiban', 'Kewajiban Lancar', 'Kredit'),
  ('2105', 'Utang Gaji', 'Kewajiban', 'Kewajiban Lancar', 'Kredit'),
  ('2106', 'Utang Pajak', 'Kewajiban', 'Kewajiban Lancar', 'Kredit'),
  ('2107', 'Utang Biaya', 'Kewajiban', 'Kewajiban Lancar', 'Kredit'),
  ('2108', 'Sewa Diterima Dimuka', 'Kewajiban', 'Kewajiban Lancar', 'Kredit'),
  ('2109', 'Pendapatan Diterima Dimuka', 'Kewajiban', 'Kewajiban Lancar', 'Kredit'),
  ('2110', 'PPN Keluaran', 'Kewajiban', 'Kewajiban Lancar', 'Kredit'),
  
  -- Kewajiban Jangka Panjang - 22xx
  ('2201', 'Utang Obligasi', 'Kewajiban', 'Kewajiban Jangka Panjang', 'Kredit'),
  ('2202', 'Utang Hipotek', 'Kewajiban', 'Kewajiban Jangka Panjang', 'Kredit'),
  ('2203', 'Utang Bank Jangka Panjang', 'Kewajiban', 'Kewajiban Jangka Panjang', 'Kredit');

-- MODAL (EQUITY) - 3xxx
INSERT INTO chart_of_accounts (code, name, type, category, normal_balance) VALUES
  ('3101', 'Setoran Modal', 'Modal', 'Modal', 'Kredit'),
  ('3102', 'Saham Biasa', 'Modal', 'Modal', 'Kredit'),
  ('3103', 'Saham Preferen', 'Modal', 'Modal', 'Kredit'),
  ('3104', 'Laba Ditahan', 'Modal', 'Modal', 'Kredit'),
  ('3105', 'Pengambilan Pribadi (Prive)', 'Modal', 'Modal', 'Debit'),
  ('3106', 'Pengambilan Saham (Dividen)', 'Modal', 'Modal', 'Debit'),
  ('3107', 'Ikhtisar Laba Rugi', 'Modal', 'Modal', 'Kredit');

-- PENDAPATAN (REVENUE) - 4xxx
INSERT INTO chart_of_accounts (code, name, type, category, normal_balance) VALUES
  ('4101', 'Penjualan', 'Pendapatan', 'Pendapatan Operasional', 'Kredit'),
  ('4102', 'Pengembalian Penjualan', 'Pendapatan', 'Pendapatan Operasional', 'Debit'),
  ('4103', 'Potongan Penjualan', 'Pendapatan', 'Pendapatan Operasional', 'Debit'),
  ('4104', 'Pendapatan Jasa', 'Pendapatan', 'Pendapatan Operasional', 'Kredit'),
  ('4105', 'Honor', 'Pendapatan', 'Pendapatan Operasional', 'Kredit'),
  ('4201', 'Pendapatan Sewa', 'Pendapatan', 'Pendapatan Non-Operasional', 'Kredit'),
  ('4202', 'Pendapatan Bunga', 'Pendapatan', 'Pendapatan Non-Operasional', 'Kredit'),
  ('4203', 'Pendapatan Dari Komisi', 'Pendapatan', 'Pendapatan Non-Operasional', 'Kredit'),
  ('4204', 'Pendapatan Dari Konsinyasi', 'Pendapatan', 'Pendapatan Non-Operasional', 'Kredit'),
  ('4205', 'Pendapatan Dari Angkutan', 'Pendapatan', 'Pendapatan Non-Operasional', 'Kredit'),
  ('4206', 'Pendapatan Dari Usaha Patungan', 'Pendapatan', 'Pendapatan Non-Operasional', 'Kredit'),
  ('4207', 'Pendapatan Diterima Kembali', 'Pendapatan', 'Pendapatan Non-Operasional', 'Kredit'),
  ('4208', 'Pendapatan Lain-Lain', 'Pendapatan', 'Pendapatan Non-Operasional', 'Kredit');

-- BEBAN (EXPENSE) - 5xxx
INSERT INTO chart_of_accounts (code, name, type, category, normal_balance) VALUES
  -- Beban Operasional - 51xx
  ('5101', 'Beban Gaji Kantor', 'Beban', 'Beban Operasional', 'Debit'),
  ('5102', 'Beban Gaji Toko', 'Beban', 'Beban Operasional', 'Debit'),
  ('5103', 'Beban Gaji Bagian Penjualan', 'Beban', 'Beban Operasional', 'Debit'),
  ('5104', 'Beban Upah dan Gaji', 'Beban', 'Beban Operasional', 'Debit'),
  ('5105', 'Beban Iklan', 'Beban', 'Beban Operasional', 'Debit'),
  ('5106', 'Beban Telepon dan Listrik', 'Beban', 'Beban Operasional', 'Debit'),
  ('5107', 'Beban Sewa', 'Beban', 'Beban Operasional', 'Debit'),
  ('5108', 'Beban Asuransi', 'Beban', 'Beban Operasional', 'Debit'),
  ('5109', 'Beban Perlengkapan Toko', 'Beban', 'Beban Operasional', 'Debit'),
  ('5110', 'Beban Perlengkapan Kantor', 'Beban', 'Beban Operasional', 'Debit'),
  ('5111', 'Beban Kerugian Piutang', 'Beban', 'Beban Operasional', 'Debit'),
  ('5112', 'Beban Administrasi', 'Beban', 'Beban Operasional', 'Debit'),
  ('5113', 'Beban Administrasi Bank', 'Beban', 'Beban Operasional', 'Debit'),
  ('5114', 'Beban Kendaraan', 'Beban', 'Beban Operasional', 'Debit'),
  ('5115', 'Beban Prasarana', 'Beban', 'Beban Operasional', 'Debit'),
  ('5116', 'Beban Rupa-Rupa', 'Beban', 'Beban Operasional', 'Debit'),
  ('5117', 'Beban Operasi Lainnya', 'Beban', 'Beban Operasional', 'Debit'),
  
  -- Beban Penyusutan - 52xx
  ('5201', 'Beban Penyusutan Gedung', 'Beban', 'Beban Penyusutan', 'Debit'),
  ('5202', 'Beban Penyusutan Mesin', 'Beban', 'Beban Penyusutan', 'Debit'),
  ('5203', 'Beban Penyusutan Kendaraan', 'Beban', 'Beban Penyusutan', 'Debit'),
  ('5204', 'Beban Penyusutan Peralatan', 'Beban', 'Beban Penyusutan', 'Debit'),
  ('5205', 'Beban Penyusutan Peralatan Toko', 'Beban', 'Beban Penyusutan', 'Debit'),
  ('5206', 'Beban Penyusutan Peralatan Kantor', 'Beban', 'Beban Penyusutan', 'Debit'),
  ('5207', 'Beban Penyusutan Perabot & Inventaris', 'Beban', 'Beban Penyusutan', 'Debit'),
  
  -- Beban Non-Operasional - 53xx
  ('5301', 'Beban Bunga', 'Beban', 'Beban Non-Operasional', 'Debit'),
  ('5302', 'Beban Pajak Penghasilan', 'Beban', 'Beban Non-Operasional', 'Debit');

-- HARGA POKOK PENJUALAN (COST OF GOODS SOLD) - 6xxx
INSERT INTO chart_of_accounts (code, name, type, category, normal_balance) VALUES
  ('6101', 'Pembelian', 'Beban', 'Harga Pokok Penjualan', 'Debit'),
  ('6102', 'Pengembalian Pembelian', 'Beban', 'Harga Pokok Penjualan', 'Kredit'),
  ('6103', 'Potongan Pembelian', 'Beban', 'Harga Pokok Penjualan', 'Kredit'),
  ('6104', 'Ongkos Angkut Pembelian', 'Beban', 'Harga Pokok Penjualan', 'Debit'),
  ('6105', 'Ongkos Angkut Penjualan', 'Beban', 'Harga Pokok Penjualan', 'Debit'),
  ('6201', 'Harga Pokok Penjualan', 'Beban', 'Harga Pokok Penjualan', 'Debit')
ON CONFLICT (code) DO NOTHING;
