import { Account } from './types';

export const DEFAULT_CATEGORIES = {
  income: [
    'Salary',
    'Freelance',
    'Investments',
    'Gift',
    'Other'
  ],
  expense: [
    'Food',
    'Rent',
    'Utilities',
    'Transportation',
    'Entertainment',
    'Health',
    'Shopping',
    'Education',
    'Other'
  ]
};

export const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'acc_1', name: 'Main Bank Account', type: 'bank', initialBalance: 0, color: '#3b82f6' },
  { id: 'acc_2', name: 'Cash', type: 'cash', initialBalance: 0, color: '#10b981' },
];

export const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#f97316', // orange
];