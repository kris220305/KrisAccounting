import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: 'Aset' | 'Kewajiban' | 'Modal' | 'Pendapatan' | 'Beban';
  category: string;
  normal_balance: 'Debit' | 'Kredit';
  created_at: string;
}

export interface JournalEntry {
  id: string;
  entry_date: string;
  reference_number: string;
  description: string;
  created_at: string;
}

export interface JournalEntryLine {
  id: string;
  journal_entry_id: string;
  account_id: string;
  debit: number;
  credit: number;
  created_at: string;
  account?: ChartOfAccount;
}

export interface JournalEntryWithLines extends JournalEntry {
  lines: JournalEntryLine[];
}
