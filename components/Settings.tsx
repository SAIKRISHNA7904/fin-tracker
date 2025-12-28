import React, { useRef, useState } from 'react';
import { Transaction, CategoryState, TransactionType, Account } from '../types';
import { Download, Upload, AlertTriangle, CheckCircle2, Moon, Sun, Plus, X, Tag, Landmark } from 'lucide-react';

interface SettingsProps {
  transactions: Transaction[];
  onRestore: (transactions: Transaction[]) => void;
  onReset: () => void;
  categories: CategoryState;
  onAddCategory: (type: TransactionType, category: string) => void;
  onDeleteCategory: (type: TransactionType, category: string) => void;
  darkMode: boolean;
  toggleTheme: () => void;
  accounts: Account[];
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onDeleteAccount: (id: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  transactions, 
  onRestore, 
  onReset, 
  categories, 
  onAddCategory, 
  onDeleteCategory,
  darkMode,
  toggleTheme,
  accounts,
  onAddAccount,
  onDeleteAccount
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  // Category Management State
  const [categoryType, setCategoryType] = useState<TransactionType>('expense');
  const [newCategory, setNewCategory] = useState('');

  // Account Management State
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountType, setNewAccountType] = useState<'bank' | 'cash' | 'mobile_wallet'>('bank');

  const handleBackup = () => {
    const dataStr = JSON.stringify(transactions, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `fintrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setMsg({ type: 'success', text: 'Backup downloaded successfully.' });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = event.target?.result as string;
        const parsed = JSON.parse(json);
        
        if (Array.isArray(parsed)) {
          // Basic validation
          const isValid = parsed.every(t => t.id && t.amount && t.type && t.date);
          if (isValid) {
            onRestore(parsed);
            setMsg({ type: 'success', text: 'Data restored successfully.' });
          } else {
            throw new Error('Invalid format');
          }
        } else {
          throw new Error('Invalid format');
        }
      } catch (err) {
        setMsg({ type: 'error', text: 'Failed to restore: Invalid JSON file.' });
      }
    };
    reader.readAsText(file);
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => setMsg(null), 3000);
  };

  const handleAddCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCategory.trim();
    if (!trimmed) return;
    
    if (categories[categoryType].some(c => c.toLowerCase() === trimmed.toLowerCase())) {
        setMsg({ type: 'error', text: 'Category already exists.' });
        setTimeout(() => setMsg(null), 3000);
        return;
    }

    onAddCategory(categoryType, trimmed);
    setNewCategory('');
    setMsg({ type: 'success', text: 'Category added successfully.' });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleAddAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName.trim()) return;

    onAddAccount({
      name: newAccountName,
      type: newAccountType,
      initialBalance: 0
    });
    setNewAccountName('');
    setMsg({ type: 'success', text: 'Account added successfully.' });
    setTimeout(() => setMsg(null), 3000);
  };

  const bankAccounts = accounts.filter(a => a.type !== 'investment');

  return (
    <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
      
      {msg && (
          <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 fixed top-4 right-4 z-50 shadow-lg animate-in slide-in-from-top-2 ${
            msg.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/90 dark:text-emerald-100 dark:border-emerald-800' 
              : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/90 dark:text-red-100 dark:border-red-800'
          }`}>
            {msg.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            <p className="font-medium">{msg.text}</p>
          </div>
        )}

      {/* Appearance Settings */}
      <div className="bg-white dark:bg-surface p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Moon className="w-5 h-5" /> Appearance
        </h2>
        <div className="flex items-center justify-between">
            <div>
                <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
            </div>
            <button 
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${darkMode ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
            >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
        </div>
      </div>

       {/* Accounts Management */}
       <div className="bg-white dark:bg-surface p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Landmark className="w-5 h-5" /> Accounts
        </h2>
        
        <form onSubmit={handleAddAccountSubmit} className="flex flex-col sm:flex-row gap-2 mb-6">
            <input 
                type="text" 
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
                placeholder="Bank Name (e.g., Chase)"
                className="flex-[2] px-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
            />
            <select
               value={newAccountType}
               onChange={(e) => setNewAccountType(e.target.value as any)}
               className="flex-1 px-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white cursor-pointer"
            >
              <option value="bank">Bank</option>
              <option value="cash">Cash</option>
              <option value="mobile_wallet">Wallet</option>
            </select>
            <button 
                type="submit"
                disabled={!newAccountName.trim()}
                className="px-4 py-2 bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Add
            </button>
        </form>

        <div className="space-y-2">
            {bankAccounts.map(acc => (
                <div key={acc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${acc.type === 'cash' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                           {acc.type === 'cash' ? <span className="text-xs font-bold">₹</span> : <Landmark className="w-4 h-4" />}
                        </div>
                        <div>
                           <p className="font-medium text-gray-900 dark:text-white text-sm">{acc.name}</p>
                           <p className="text-xs text-gray-500 capitalize">{acc.type.replace('_', ' ')}</p>
                        </div>
                    </div>
                    {bankAccounts.length > 1 && (
                      <button 
                          onClick={() => {
                              if(window.confirm('Delete this account?')) onDeleteAccount(acc.id);
                          }}
                          className="text-gray-400 hover:text-red-500 transition-colors p-2"
                      >
                          <X className="w-4 h-4" />
                      </button>
                    )}
                </div>
            ))}
        </div>
        <p className="text-xs text-gray-400 mt-4">Manage Investment accounts in the Investments tab.</p>
      </div>

      {/* Category Management */}
      <div className="bg-white dark:bg-surface p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Tag className="w-5 h-5" /> Categories
        </h2>
        
        {/* Toggle Income/Expense */}
        <div className="flex bg-gray-100 dark:bg-black/40 p-1 rounded-xl mb-6">
            <button
                onClick={() => setCategoryType('expense')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${categoryType === 'expense' ? 'bg-white dark:bg-surface shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
            >
                Expense
            </button>
            <button
                onClick={() => setCategoryType('income')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${categoryType === 'income' ? 'bg-white dark:bg-surface shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
            >
                Income
            </button>
        </div>

        {/* Add Category Input */}
        <form onSubmit={handleAddCategorySubmit} className="flex gap-2 mb-6">
            <input 
                type="text" 
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder={`New ${categoryType} category...`}
                className="flex-1 px-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white"
            />
            <button 
                type="submit"
                disabled={!newCategory.trim()}
                className="px-4 py-2 bg-primary hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center gap-2"
            >
                <Plus className="w-5 h-5" />
                Add
            </button>
        </form>

        {/* Categories List */}
        <div className="flex flex-wrap gap-2">
            {categories[categoryType].map(cat => (
                <div key={cat} className="group flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full text-sm text-gray-700 dark:text-gray-300">
                    <span>{cat}</span>
                    <button 
                        onClick={() => onDeleteCategory(categoryType, cat)}
                        className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        title="Delete category"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white dark:bg-surface p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
             <Download className="w-5 h-5" /> Data Backup
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm">
          Securely backup your financial data or restore from a previous backup.
          Your data is stored locally on your device.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleBackup}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:border-primary hover:bg-blue-50 dark:hover:bg-blue-900/10 dark:hover:border-blue-500 transition-all group"
          >
            <div className="p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full mb-3 group-hover:scale-110 transition-transform">
              <Download className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Export Data</h3>
            <p className="text-xs text-gray-500 text-center mt-1">Download JSON backup</p>
          </button>

          <button
            onClick={handleRestoreClick}
            className="flex flex-col items-center justify-center p-6 border-2 border-gray-100 dark:border-gray-700 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 dark:hover:border-emerald-500 transition-all group"
          >
            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Import Data</h3>
            <p className="text-xs text-gray-500 text-center mt-1">Restore from JSON file</p>
          </button>
          <input 
            type="file" 
            accept=".json" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange}
          />
        </div>

        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
           <button 
             onClick={() => {
               if(window.confirm('Are you sure you want to delete all data? This cannot be undone.')) {
                 onReset();
                 setMsg({ type: 'success', text: 'All data has been cleared.' });
               }
             }}
             className="text-red-500 text-sm hover:underline"
           >
             Clear all data (Reset App)
           </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;