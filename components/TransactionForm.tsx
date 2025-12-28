import React, { useState } from 'react';
import { Transaction, TransactionType, CategoryState, Account } from '../types';
import { Plus, X, Save } from 'lucide-react';

interface TransactionFormProps {
  onAdd: (transaction: Omit<Transaction, 'id'>) => void;
  onUpdate?: (transaction: Transaction) => void;
  onClose: () => void;
  initialData?: Transaction;
  categories: CategoryState;
  accounts: Account[];
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onAdd, onUpdate, onClose, initialData, categories, accounts }) => {
  const [type, setType] = useState<TransactionType>(initialData?.type || 'expense');
  const [amount, setAmount] = useState(initialData?.amount.toString() || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || categories[initialData?.type || 'expense'][0]);
  const [date, setDate] = useState(initialData?.date || new Date().toISOString().split('T')[0]);
  const [accountId, setAccountId] = useState(initialData?.accountId || accounts[0]?.id || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description || !accountId) return;

    const transactionData = {
      type,
      amount: parseFloat(amount),
      description,
      category,
      date,
      accountId
    };

    if (initialData && onUpdate) {
      onUpdate({ ...transactionData, id: initialData.id });
    } else {
      onAdd(transactionData);
    }
    onClose();
  };

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (!categories[newType].includes(category)) {
      setCategory(categories[newType][0] || '');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-surface w-full max-w-md rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 animate-in fade-in zoom-in duration-200">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialData ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 dark:bg-black rounded-lg">
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-sm font-medium rounded-md transition-all ${
                type === 'income' 
                  ? 'bg-emerald-500 text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Income
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-sm font-medium rounded-md transition-all ${
                type === 'expense' 
                  ? 'bg-red-500 text-white shadow-md' 
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              }`}
            >
              Expense
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
              className="w-full px-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white appearance-none"
            >
              <optgroup label="Banking & Cash">
                {accounts.filter(a => a.type !== 'investment').map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </optgroup>
              <optgroup label="Investments">
                {accounts.filter(a => a.type === 'investment').map(acc => (
                   <option key={acc.id} value={acc.id}>{acc.name}</option>
                ))}
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
              placeholder="e.g. Grocery shopping"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white appearance-none"
              >
                {categories[type].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-primary hover:bg-blue-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 mt-2"
          >
            {initialData ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {initialData ? 'Update Transaction' : 'Add Transaction'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;