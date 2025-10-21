/*
  # Skema Database Sistem Akuntansi Kris Accounting

  ## Tabel Baru
  
  ### 1. `chart_of_accounts` (Daftar Akun)
  - `id` (uuid, primary key)
  - `code` (text, kode akun unik)
  - `name` (text, nama akun)
  - `type` (text, jenis: Aset, Kewajiban, Modal, Pendapatan, Beban)
  - `category` (text, kategori akun)
  - `normal_balance` (text, debit/kredit)
  - `created_at` (timestamp)

  ### 2. `journal_entries` (Jurnal Umum)
  - `id` (uuid, primary key)
  - `entry_date` (date, tanggal transaksi)
  - `reference_number` (text, nomor referensi)
  - `description` (text, keterangan)
  - `created_at` (timestamp)
  
  ### 3. `journal_entry_lines` (Detail Jurnal)
  - `id` (uuid, primary key)
  - `journal_entry_id` (uuid, foreign key)
  - `account_id` (uuid, foreign key)
  - `debit` (decimal, jumlah debit)
  - `credit` (decimal, jumlah kredit)
  - `created_at` (timestamp)

  ## Keamanan
  - Enable RLS pada semua tabel
  - Policy untuk operasi CRUD publik (untuk demo, bisa diubah sesuai kebutuhan auth)
*/

-- Tabel Daftar Akun
CREATE TABLE IF NOT EXISTS chart_of_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('Aset', 'Kewajiban', 'Modal', 'Pendapatan', 'Beban')),
  category text NOT NULL,
  normal_balance text NOT NULL CHECK (normal_balance IN ('Debit', 'Kredit')),
  created_at timestamptz DEFAULT now()
);

-- Tabel Jurnal Umum
CREATE TABLE IF NOT EXISTS journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entry_date date NOT NULL DEFAULT CURRENT_DATE,
  reference_number text UNIQUE NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Tabel Detail Jurnal
CREATE TABLE IF NOT EXISTS journal_entry_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id uuid NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES chart_of_accounts(id),
  debit decimal(15,2) DEFAULT 0 CHECK (debit >= 0),
  credit decimal(15,2) DEFAULT 0 CHECK (credit >= 0),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT debit_or_credit_check CHECK (
    (debit > 0 AND credit = 0) OR (credit > 0 AND debit = 0)
  )
);

-- Enable RLS
ALTER TABLE chart_of_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entry_lines ENABLE ROW LEVEL SECURITY;

-- Policies untuk akses publik (demo mode)
CREATE POLICY "Public can read chart of accounts"
  ON chart_of_accounts FOR SELECT
  USING (true);

CREATE POLICY "Public can insert chart of accounts"
  ON chart_of_accounts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update chart of accounts"
  ON chart_of_accounts FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete chart of accounts"
  ON chart_of_accounts FOR DELETE
  USING (true);

CREATE POLICY "Public can read journal entries"
  ON journal_entries FOR SELECT
  USING (true);

CREATE POLICY "Public can insert journal entries"
  ON journal_entries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update journal entries"
  ON journal_entries FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete journal entries"
  ON journal_entries FOR DELETE
  USING (true);

CREATE POLICY "Public can read journal entry lines"
  ON journal_entry_lines FOR SELECT
  USING (true);

CREATE POLICY "Public can insert journal entry lines"
  ON journal_entry_lines FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public can update journal entry lines"
  ON journal_entry_lines FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Public can delete journal entry lines"
  ON journal_entry_lines FOR DELETE
  USING (true);

-- Insert default chart of accounts
INSERT INTO chart_of_accounts (code, name, type, category, normal_balance) VALUES
  -- Aset
  ('1-1001', 'Kas', 'Aset', 'Aset Lancar', 'Debit'),
  ('1-1002', 'Bank', 'Aset', 'Aset Lancar', 'Debit'),
  ('1-1003', 'Piutang Usaha', 'Aset', 'Aset Lancar', 'Debit'),
  ('1-1004', 'Persediaan Barang', 'Aset', 'Aset Lancar', 'Debit'),
  ('1-2001', 'Peralatan', 'Aset', 'Aset Tetap', 'Debit'),
  ('1-2002', 'Kendaraan', 'Aset', 'Aset Tetap', 'Debit'),
  ('1-2003', 'Akumulasi Penyusutan', 'Aset', 'Aset Tetap', 'Kredit'),
  
  -- Kewajiban
  ('2-1001', 'Utang Usaha', 'Kewajiban', 'Kewajiban Lancar', 'Kredit'),
  ('2-1002', 'Utang Gaji', 'Kewajiban', 'Kewajiban Lancar', 'Kredit'),
  ('2-2001', 'Utang Bank', 'Kewajiban', 'Kewajiban Jangka Panjang', 'Kredit'),
  
  -- Modal
  ('3-1001', 'Modal Pemilik', 'Modal', 'Modal', 'Kredit'),
  ('3-1002', 'Prive', 'Modal', 'Modal', 'Debit'),
  ('3-1003', 'Laba Ditahan', 'Modal', 'Modal', 'Kredit'),
  
  -- Pendapatan
  ('4-1001', 'Pendapatan Jasa', 'Pendapatan', 'Pendapatan Operasional', 'Kredit'),
  ('4-1002', 'Pendapatan Penjualan', 'Pendapatan', 'Pendapatan Operasional', 'Kredit'),
  ('4-2001', 'Pendapatan Lain-lain', 'Pendapatan', 'Pendapatan Non-Operasional', 'Kredit'),
  
  -- Beban
  ('5-1001', 'Beban Gaji', 'Beban', 'Beban Operasional', 'Debit'),
  ('5-1002', 'Beban Sewa', 'Beban', 'Beban Operasional', 'Debit'),
  ('5-1003', 'Beban Listrik', 'Beban', 'Beban Operasional', 'Debit'),
  ('5-1004', 'Beban Perlengkapan', 'Beban', 'Beban Operasional', 'Debit'),
  ('5-1005', 'Beban Penyusutan', 'Beban', 'Beban Operasional', 'Debit'),
  ('5-2001', 'Beban Bunga', 'Beban', 'Beban Non-Operasional', 'Debit')
ON CONFLICT (code) DO NOTHING;