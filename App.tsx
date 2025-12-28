import React, { useState, useEffect } from 'react';
import { Transaction, SummaryData, ViewState, CategoryState, TransactionType, Account } from './types';
import { DEFAULT_CATEGORIES, DEFAULT_ACCOUNTS } from './constants';
import Dashboard from './components/Dashboard';
import TransactionList from './components/TransactionList';
import TransactionForm from './components/TransactionForm';
import Settings from './components/Settings';
import AIAdvisor from './components/AIAdvisor';
import Investments from './components/Investments';
import { LayoutDashboard, List, Settings as SettingsIcon, Moon, Sun, Plus, BrainCircuit, TrendingUp } from 'lucide-react';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<CategoryState>(DEFAULT_CATEGORIES);
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Load data on mount
  useEffect(() => {
    const savedTransactions = localStorage.getItem('fintrack_transactions');
    const savedAccounts = localStorage.getItem('fintrack_accounts');
    
    // Load Accounts first or default
    let loadedAccounts = DEFAULT_ACCOUNTS;
    if (savedAccounts) {
      loadedAccounts = JSON.parse(savedAccounts);
      setAccounts(loadedAccounts);
    }

    if (savedTransactions) {
      const parsedTransactions: Transaction[] = JSON.parse(savedTransactions);
      
      // Migration: If transactions don't have accountId, assign to first account
      const migratedTransactions = parsedTransactions.map(t => ({
        ...t,
        accountId: t.accountId || loadedAccounts[0].id
      }));
      
      setTransactions(migratedTransactions);
    }

    const savedCategories = localStorage.getItem('fintrack_categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    }

    const savedTheme = localStorage.getItem('fintrack_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Save data on change
  useEffect(() => {
    localStorage.setItem('fintrack_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('fintrack_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('fintrack_accounts', JSON.stringify(accounts));
  }, [accounts]);

  // Handle Theme
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('fintrack_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('fintrack_theme', 'light');
    }
  };

  const addTransaction = (t: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...t, id: crypto.randomUUID() };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const updateTransaction = (updated: Transaction) => {
    setTransactions(prev => prev.map(t => t.id === updated.id ? updated : t));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addCategory = (type: TransactionType, category: string) => {
    setCategories(prev => ({
      ...prev,
      [type]: [...prev[type], category]
    }));
  };

  const deleteCategory = (type: TransactionType, category: string) => {
    setCategories(prev => ({
      ...prev,
      [type]: prev[type].filter(c => c !== category)
    }));
  };

  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount = { ...account, id: crypto.randomUUID() };
    setAccounts(prev => [...prev, newAccount]);
  };

  const deleteAccount = (id: string) => {
    // Prevent deleting last account
    if (accounts.length <= 1) {
      alert("You must have at least one account.");
      return;
    }
    setAccounts(prev => prev.filter(a => a.id !== id));
    // Note: Transactions linked to this account will become orphaned or need handling.
    // For now, we'll keep them but they might show 'Unknown Account'
  };

  const calculateSummary = (): SummaryData => {
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense
    };
  };

  const handleRestore = (data: Transaction[]) => {
    setTransactions(data);
  };

  const handleReset = () => {
    setTransactions([]);
    setCategories(DEFAULT_CATEGORIES);
    setAccounts(DEFAULT_ACCOUNTS);
    localStorage.removeItem('fintrack_transactions');
    localStorage.removeItem('fintrack_categories');
    localStorage.removeItem('fintrack_accounts');
  };

  const handleAddNew = () => {
    setEditingTransaction(null);
    setShowForm(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background transition-colors duration-300 flex">
      
      {/* Sidebar Navigation (Desktop) */}
      <aside className="w-64 bg-white dark:bg-surface border-r border-gray-100 dark:border-gray-800 hidden md:flex flex-col fixed h-full z-20">
        <div className="p-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">FinTrack.ai</h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <button 
            onClick={() => setView(ViewState.DASHBOARD)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${view === ViewState.DASHBOARD ? 'bg-blue-50 text-primary dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          
          <button 
            onClick={() => setView(ViewState.TRANSACTIONS)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${view === ViewState.TRANSACTIONS ? 'bg-blue-50 text-primary dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <List className="w-5 h-5" />
            Transactions
          </button>

          <button 
            onClick={() => setView(ViewState.INVESTMENTS)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${view === ViewState.INVESTMENTS ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <TrendingUp className="w-5 h-5" />
            Investments
          </button>

          <button 
            onClick={() => setView(ViewState.ADVISOR)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${view === ViewState.ADVISOR ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <BrainCircuit className="w-5 h-5" />
            AI Advisor
          </button>
          
          <button 
            onClick={() => setView(ViewState.SETTINGS)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${view === ViewState.SETTINGS ? 'bg-blue-50 text-primary dark:bg-blue-900/20 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <SettingsIcon className="w-5 h-5" />
            Settings
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:opacity-80 transition-opacity"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="text-sm font-medium">{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">FinTrack</h1>
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full bg-white dark:bg-surface shadow-sm border border-gray-100 dark:border-gray-800"
          >
            {darkMode ? <Sun className="w-5 h-5 dark:text-white" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {view === ViewState.DASHBOARD && 'Dashboard'}
              {view === ViewState.TRANSACTIONS && 'Transactions'}
              {view === ViewState.INVESTMENTS && 'Investment Portfolio'}
              {view === ViewState.ADVISOR && 'Financial AI'}
              {view === ViewState.SETTINGS && 'Settings'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
              {view === ViewState.DASHBOARD && 'Overview of your financial health'}
              {view === ViewState.TRANSACTIONS && 'Manage your income and expenses'}
              {view === ViewState.INVESTMENTS && 'Track your assets and growth'}
              {view === ViewState.ADVISOR && 'Get insights powered by Gemini'}
              {view === ViewState.SETTINGS && 'Manage your data and preferences'}
            </p>
          </div>
          
          <button
            onClick={handleAddNew}
            className="hidden md:flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-5 h-5" />
            <span>Add New</span>
          </button>
        </div>

        {/* View Rendering */}
        <div className="relative">
          {view === ViewState.DASHBOARD && (
            <Dashboard transactions={transactions} summary={calculateSummary()} />
          )}
          {view === ViewState.TRANSACTIONS && (
            <TransactionList 
              transactions={transactions} 
              onDelete={deleteTransaction}
              onEdit={handleEdit}
              categories={categories}
              accounts={accounts}
            />
          )}
          {view === ViewState.INVESTMENTS && (
            <Investments 
              transactions={transactions} 
              accounts={accounts} 
              onAddAccount={addAccount}
              onDeleteAccount={deleteAccount}
            />
          )}
          {view === ViewState.ADVISOR && (
            <AIAdvisor transactions={transactions} />
          )}
          {view === ViewState.SETTINGS && (
            <Settings 
              transactions={transactions} 
              onRestore={handleRestore} 
              onReset={handleReset}
              categories={categories}
              onAddCategory={addCategory}
              onDeleteCategory={deleteCategory}
              darkMode={darkMode}
              toggleTheme={toggleTheme}
              accounts={accounts}
              onAddAccount={addAccount}
              onDeleteAccount={deleteAccount}
            />
          )}
        </div>
      </main>

      {/* Floating Action Button (Mobile) */}
      <button
        onClick={handleAddNew}
        className="md:hidden fixed right-4 bottom-20 w-14 h-14 bg-primary text-white rounded-full shadow-xl shadow-blue-500/30 flex items-center justify-center z-30"
      >
        <Plus className="w-8 h-8" />
      </button>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-surface border-t border-gray-100 dark:border-gray-800 px-6 py-3 flex justify-between z-30 safe-area-bottom">
        <button onClick={() => setView(ViewState.DASHBOARD)} className={`flex flex-col items-center ${view === ViewState.DASHBOARD ? 'text-primary' : 'text-gray-400'}`}>
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] mt-1">Home</span>
        </button>
        <button onClick={() => setView(ViewState.TRANSACTIONS)} className={`flex flex-col items-center ${view === ViewState.TRANSACTIONS ? 'text-primary' : 'text-gray-400'}`}>
          <List className="w-6 h-6" />
          <span className="text-[10px] mt-1">List</span>
        </button>
        <button onClick={() => setView(ViewState.INVESTMENTS)} className={`flex flex-col items-center ${view === ViewState.INVESTMENTS ? 'text-purple-500' : 'text-gray-400'}`}>
          <TrendingUp className="w-6 h-6" />
          <span className="text-[10px] mt-1">Invest</span>
        </button>
        <button onClick={() => setView(ViewState.SETTINGS)} className={`flex flex-col items-center ${view === ViewState.SETTINGS ? 'text-primary' : 'text-gray-400'}`}>
          <SettingsIcon className="w-6 h-6" />
          <span className="text-[10px] mt-1">Set</span>
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <TransactionForm 
          onAdd={addTransaction} 
          onUpdate={updateTransaction}
          onClose={() => setShowForm(false)} 
          initialData={editingTransaction || undefined}
          categories={categories}
          accounts={accounts}
        />
      )}
    </div>
  );
};

export default App;