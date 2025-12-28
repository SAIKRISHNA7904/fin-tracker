import React, { useState } from 'react';
import { Transaction } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import { Sparkles, Send, Bot, Loader2 } from 'lucide-react';

interface AIAdvisorProps {
  transactions: Transaction[];
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({ transactions }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse('');
    
    // Simulate thinking time if API is too fast, creates better UX
    const startTime = Date.now();
    const result = await getFinancialAdvice(transactions, query);
    const elapsedTime = Date.now() - startTime;
    
    if (elapsedTime < 800) {
        await new Promise(resolve => setTimeout(resolve, 800 - elapsedTime));
    }

    setResponse(result);
    setLoading(false);
  };

  const suggestions = [
    "How much did I spend on food this month?",
    "Am I spending more than I earn?",
    "Give me 3 tips to save money based on my data.",
    "What is my biggest expense category?"
  ];

  return (
    <div className="h-full flex flex-col max-w-4xl mx-auto animate-fade-in">
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-8 mb-6 text-white shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
            <Sparkles className="w-8 h-8 text-yellow-300" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">AI Financial Advisor</h2>
            <p className="text-indigo-100 mt-2 max-w-xl">
              Powered by Google Gemini. Ask questions about your spending habits, trends, or request budgeting advice based on your actual transaction history.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-surface rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden min-h-[500px]">
        {/* Chat Area */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {response ? (
             <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
                  <Bot className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="space-y-2">
                  <div className="font-semibold text-gray-900 dark:text-white">FinTrack AI</div>
                  <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                    {response}
                  </div>
                </div>
             </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-60">
               <Bot className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
               <p className="text-lg text-gray-500 dark:text-gray-400">Ask me anything about your finances!</p>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {!response && !loading && (
          <div className="px-6 pb-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Suggested Questions</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(s)}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm text-gray-600 dark:text-gray-300 rounded-full transition-colors border border-gray-200 dark:border-gray-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-black/20">
          <form onSubmit={handleAsk} className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ex: How much did I spend on Utilities?"
              className="w-full pl-6 pr-14 py-4 bg-white dark:bg-black border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white shadow-sm"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AIAdvisor;