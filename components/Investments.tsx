import React, { useState, useMemo } from 'react';
import { Transaction, Account } from '../types';
import { TrendingUp, Plus, Trash2, PieChart as PieIcon, DollarSign, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { COLORS } from '../constants';

interface InvestmentsProps {
  transactions: Transaction[];
  accounts: Account[];
  onAddAccount: (account: Omit<Account, 'id'>) => void;
  onDeleteAccount: (id: string) => void;
}

const Investments: React.FC<InvestmentsProps> = ({ transactions, accounts, onAddAccount, onDeleteAccount }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccountName, setNewAccountName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');

  const investmentAccounts = accounts.filter(a => a.type === 'investment');

  const getAccountBalance = (account: Account) => {
    const accountTransactions = transactions.filter(t => t.accountId === account.id);
    const income = accountTransactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
    const expense = accountTransactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
    return account.initialBalance + income - expense;
  };

  const totalPortfolioValue = investmentAccounts.reduce((acc, curr) => acc + getAccountBalance(curr), 0);

  const portfolioData = useMemo(() => {
    return investmentAccounts.map((acc, index) => ({
      name: acc.name,
      value: getAccountBalance(acc),
      color: COLORS[index % COLORS.length]
    })).filter(d => d.value > 0);
  }, [investmentAccounts, transactions]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccountName) return;
    
    onAddAccount({
      name: newAccountName,
      type: 'investment',
      initialBalance: parseFloat(initialBalance) || 0,
      color: COLORS[investmentAccounts.length % COLORS.length]
    });
    setNewAccountName('');
    setInitialBalance('');
    setShowAddForm(false);
  };

  // Get recent investment transactions
  const investmentTransactions = transactions
    .filter(t => investmentAccounts.some(acc => acc.id === t.accountId))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-indigo-950 dark:to-purple-950 text-white p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-gray-400 font-medium mb-1">Total Portfolio Value</p>
          <h2 className="text-4xl font-bold">₹{totalPortfolioValue.toFixed(2)}</h2>
          <div className="mt-4 flex gap-2">
             <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium backdrop-blur-sm">
               {investmentAccounts.length} Active Accounts
             </span>
          </div>
        </div>
        <TrendingUp className="absolute right-6 bottom-6 w-32 h-32 text-white/5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Accounts List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Accounts</h3>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm transition-colors"
            >
              <Plus className="w-4 h-4" /> Add Investment
            </button>
          </div>

          {showAddForm && (
            <div className="bg-white dark:bg-surface p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30 animate-in slide-in-from-top-2">
              <form onSubmit={handleAddSubmit} className="flex flex-col md:flex-row gap-3">
                <input 
                  type="text" 
                  placeholder="Account Name (e.g. Robinhood)" 
                  value={newAccountName}
                  onChange={e => setNewAccountName(e.target.value)}
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                  required
                />
                <input 
                  type="number" 
                  placeholder="Initial Balance" 
                  value={initialBalance}
                  onChange={e => setInitialBalance(e.target.value)}
                  className="w-full md:w-40 px-4 py-2 bg-gray-50 dark:bg-black border border-gray-200 dark:border-gray-800 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium">Save</button>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {investmentAccounts.length === 0 && !showAddForm && (
              <div className="col-span-2 p-8 text-center text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
                No investment accounts yet. Add one to start tracking.
              </div>
            )}
            {investmentAccounts.map(acc => (
              <div key={acc.id} className="bg-white dark:bg-surface p-5 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <button 
                    onClick={() => {
                        if(window.confirm('Delete this investment account? Transactions will be preserved but unlinked.')) {
                            onDeleteAccount(acc.id);
                        }
                    }}
                    className="text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{acc.name}</h4>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₹{getAccountBalance(acc).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activity */}
          {investmentTransactions.length > 0 && (
             <div className="mt-8">
               <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Investment Activity</h4>
               <div className="bg-white dark:bg-surface rounded-xl border border-gray-100 dark:border-gray-800 divide-y divide-gray-100 dark:divide-gray-800">
                  {investmentTransactions.map(t => (
                    <div key={t.id} className="p-4 flex justify-between items-center">
                       <div>
                         <div className="font-medium text-gray-900 dark:text-white">{t.description}</div>
                         <div className="text-xs text-gray-500">{new Date(t.date).toLocaleDateString()} • {t.category}</div>
                       </div>
                       <div className={`font-bold ${t.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                          {t.type === 'income' ? '+' : '-'}₹{t.amount.toFixed(2)}
                       </div>
                    </div>
                  ))}
               </div>
             </div>
          )}
        </div>

        {/* Allocation Chart */}
        <div>
           <div className="bg-white dark:bg-surface p-6 rounded-2xl border border-gray-100 dark:border-gray-800 h-80 sticky top-6">
             <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Allocation</h3>
             {portfolioData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={portfolioData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={5}
                     dataKey="value"
                   >
                     {portfolioData.map((entry, index) => (
                       <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                     ))}
                   </Pie>
                   <Tooltip 
                     contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                     itemStyle={{ color: '#fff' }}
                     formatter={(value: number) => `₹${value.toFixed(2)}`}
                   />
                 </PieChart>
               </ResponsiveContainer>
             ) : (
                <div className="h-full flex items-center justify-center text-gray-400 text-sm text-center">
                  Add balances to see allocation
                </div>
             )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default Investments;