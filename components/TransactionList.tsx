import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType, CategoryState, Account } from '../types';
import { Trash2, TrendingUp, TrendingDown, Search, Filter } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
  categories: CategoryState;
  accounts: Account[];
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onDelete, onEdit, categories, accounts }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const availableCategories = useMemo(() => {
    if (filterType === 'all') {
      return Array.from(new Set([...categories.income, ...categories.expense])).sort();
    }
    return categories[filterType];
  }, [filterType, categories]);

  const handleTypeChange = (type: 'all' | TransactionType) => {
    setFilterType(type);
    setFilterCategory('all');
  };

  const filteredTransactions = transactions
    .filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      const matchesCategory = filterCategory === 'all' || t.category === filterCategory;
      
      return matchesSearch && matchesType && matchesCategory;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const getAccountName = (id: string) => {
    return accounts.find(a => a.id === id)?.name || 'Unknown Account';
  };

  return (
    <div className="space-y-4 animate-fade-in">
      
      {/* Filters & Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Type Filter Segmented Control */}
        <div className="flex bg-gray-100 dark:bg-black/40 p-1 rounded-xl shrink-0">
           {['all', 'income', 'expense'].map((type) => (
             <button
               key={type}
               onClick={() => handleTypeChange(type as any)}
               className={`flex-1 sm:flex-none px-6 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                 filterType === type 
                   ? 'bg-white dark:bg-surface text-gray-900 dark:text-white shadow-sm' 
                   : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
               }`}
             >
               {type}
             </button>
           ))}
        </div>

        {/* Category Filter Dropdown */}
        <div className="flex-1 relative min-w-[200px]">
           <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
           <select
             value={filterCategory}
             onChange={(e) => setFilterCategory(e.target.value)}
             className="w-full pl-10 pr-10 py-3 bg-white dark:bg-surface border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white appearance-none cursor-pointer text-sm"
           >
             <option value="all">All Categories</option>
             {availableCategories.map(cat => (
               <option key={cat} value={cat}>{cat}</option>
             ))}
           </select>
           <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
             <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
           </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input 
          type="text" 
          placeholder="Search transactions..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-surface border border-gray-100 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all dark:text-white text-sm"
        />
      </div>

      {/* List */}
      <div className="bg-white dark:bg-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center text-gray-500 dark:text-gray-400">
             <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-gray-300 dark:text-gray-600" />
             </div>
             <p className="text-lg font-medium">No transactions found</p>
             <p className="text-sm mt-1 opacity-70">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredTransactions.map((t) => (
              <div 
                key={t.id} 
                onClick={() => onEdit(t)}
                className="p-4 hover:bg-gray-50 dark:hover:bg-black/20 transition-colors flex items-center justify-between group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    t.type === 'income' 
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400' 
                      : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {t.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100">{t.description}</h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">{t.category}</span>
                      <span className="px-2 py-0.5 border border-gray-200 dark:border-gray-700 rounded-full text-gray-400">{getAccountName(t.accountId)}</span>
                      <span>{new Date(t.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className={`font-bold ${
                    t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {t.type === 'income' ? '+' : '-'}₹{t.amount.toFixed(2)}
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(t.id); }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Transaction"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionList;