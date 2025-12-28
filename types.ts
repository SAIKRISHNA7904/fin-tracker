export type TransactionType = 'income' | 'expense';
export type AccountType = 'bank' | 'cash' | 'investment' | 'mobile_wallet';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  color?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string;
  accountId: string;
}

export interface SummaryData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  TRANSACTIONS = 'TRANSACTIONS',
  INVESTMENTS = 'INVESTMENTS',
  SETTINGS = 'SETTINGS'
}

export interface CategoryData {
  name: string;
  value: number;
  color: string;
}

export interface CategoryState {
  income: string[];
  expense: string[];
}