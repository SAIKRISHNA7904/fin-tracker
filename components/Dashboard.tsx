import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { Transaction, SummaryData, CategoryData } from '../types';
import { COLORS } from '../constants';
import { ArrowUpCircle, ArrowDownCircle, Wallet } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  summary: SummaryData;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, summary }) => {
  
  const expenseByCategory = useMemo(() => {
    const categories: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });
    
    return Object.keys(categories).map((name, index) => ({
      name,
      value: categories[name],
      color: COLORS[index % COLORS.length]
    }));
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const data: Record<string, { name: string; income: number; expense: number }> = {};
    
    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const name = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      
      if (!data[key]) {
        data[key] = { name, income: 0, expense: 0 };
      }
      
      if (t.type === 'income') {
        data[key].income += t.amount;
      } else {
        data[key].expense += t.amount;
      }
    });

    // Sort by date (key) and take last 6 months
    return Object.keys(data).sort().slice(-6).map(key => data[key]);
  }, [transactions]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Balance</p>
              <h3 className={`text-2xl font-bold mt-1 ${summary.balance >= 0 ? 'text-gray-900 dark:text-white' : 'text-red-500'}`}>
                ₹{summary.balance.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Income</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-600 dark:text-emerald-400">
                +₹{summary.totalIncome.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
              <ArrowUpCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">Total Expenses</p>
              <h3 className="text-2xl font-bold mt-1 text-red-500 dark:text-red-400">
                -₹{summary.totalExpense.toFixed(2)}
              </h3>
            </div>
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
              <ArrowDownCircle className="w-6 h-6 text-red-500 dark:text-red-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense Breakdown */}
        <div className="bg-white dark:bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-96">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expense Breakdown</h3>
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                  formatter={(value: number) => `₹${value.toFixed(2)}`}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              No expense data available
            </div>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="bg-white dark:bg-surface p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-96">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Income vs Expense Trend</h3>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis 
                  stroke="#888888" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`} 
                />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex items-center justify-center text-gray-400">
              No trend data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;