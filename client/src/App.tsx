import { useState, useMemo } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from '@/pages/Dashboard';
import Trends from '@/pages/Trends';
import Sync from '@/pages/Sync';
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";

export interface Expense {
  id: string;
  merchant: string;
  amount: number;
  category: 'food' | 'shopping' | 'transport' | 'entertainment' | 'bills';
  date: string;
}

export const CATEGORIES = [
  { id: 'food', label: 'Dining', icon: 'Utensils', color: '#FF375F' },
  { id: 'shopping', label: 'Retail', icon: 'ShoppingBag', color: '#AF52DE' },
  { id: 'transport', label: 'Transit', icon: 'Car', color: '#5E5CE6' },
  { id: 'entertainment', label: 'Leisure', icon: 'Ticket', color: '#FF9F0A' },
  { id: 'bills', label: 'Fixed', icon: 'Wallet', color: '#32D74B' },
];

function AppContent() {
  const [tab, setTab] = useState<'dashboard' | 'trends' | 'sync'>('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', merchant: 'Swiggy', amount: 480, category: 'food', date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
    { id: '2', merchant: 'Rapido Auto', amount: 145, category: 'transport', date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() },
    { id: '3', merchant: 'The Bistro', amount: 1250, category: 'food', date: new Date(Date.now() - 30 * 60 * 1000).toISOString() },
    { id: '4', merchant: 'Amazon', amount: 2500, category: 'shopping', date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
    { id: '5', merchant: 'Movie Tickets', amount: 600, category: 'entertainment', date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
    { id: '6', merchant: 'Electricity Bill', amount: 3200, category: 'bills', date: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString() },
  ]);

  const triggerHaptic = () => {
    if (window.navigator.vibrate) window.navigator.vibrate(12);
  };

  const total = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);

  const handleManualSync = (text: string) => {
    triggerHaptic();
    setIsSyncing(true);
    setTimeout(() => {
      const isRapido = /rapido/i.test(text);
      const isFood = /swiggy|zomato|bistro|food/i.test(text);
      
      const newEntry: Expense = {
        id: Date.now().toString(),
        merchant: isRapido ? 'Rapido' : (isFood ? 'Swiggy/Food' : 'Other Acquisition'),
        amount: Math.floor(Math.random() * 600) + 150,
        category: isRapido ? 'transport' : (isFood ? 'food' : 'shopping'),
        date: new Date().toISOString()
      };
      setExpenses(prev => [newEntry, ...prev]);
      setIsSyncing(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen flex flex-col bg-black overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 flex justify-between items-end safe-area-top">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Solaris</h1>
          <div className="flex items-center gap-2 mt-1">
            <div 
              className={`w-2 h-2 rounded-full transition-all ${isSyncing ? 'bg-indigo-500 animate-pulse' : 'bg-emerald-500'}`}
              style={{boxShadow: isSyncing ? '0 0 10px #5E5CE6' : '0 0 10px #32D74B'}}
            />
            <span className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">
              {isSyncing ? 'Neural Syncing...' : 'Real-Time Ready'}
            </span>
          </div>
        </div>
        <div className="w-12 h-12 bg-[#1C1C1E] rounded-2xl border border-white/10 flex items-center justify-center">
          <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m5.506 0C15.991 17.799 17 14.517 17 11m-6-10c1.657 0 3.156.335 4.506.993M5.497 10.5c1.35-.66 2.849-.993 4.503-.993m0 0C9.884 3.46 11.24 1.5 13 1.5m-8 8.5h.008v.008H5.5V10.5m0 0c-.165-2.992-.303-6.022 1.226-7.654m0 0h-.003m.003 0h.006" />
          </svg>
        </div>
      </header>

      {/* Content Scroll Area */}
      <main className="flex-1 overflow-y-auto px-6 pt-4 pb-32">
        {tab === 'dashboard' && (
          <Dashboard expenses={expenses} total={total} />
        )}
        {tab === 'trends' && (
          <Trends expenses={expenses} />
        )}
        {tab === 'sync' && (
          <Sync isSyncing={isSyncing} onSync={handleManualSync} />
        )}
      </main>

      {/* iOS Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 h-[90px] flex justify-around items-center px-4 bg-black/80 backdrop-blur-xl border-t border-white/5 safe-area-bottom">
        <button 
          onClick={() => {triggerHaptic(); setTab('dashboard');}} 
          className={`flex flex-col items-center gap-1.5 flex-1 transition-colors ${tab === 'dashboard' ? 'text-violet-400' : 'text-zinc-600'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-[10px] font-black tracking-widest">PULSE</span>
        </button>
        <button 
          onClick={() => {triggerHaptic(); setTab('trends');}} 
          className={`flex flex-col items-center gap-1.5 flex-1 transition-colors ${tab === 'trends' ? 'text-violet-400' : 'text-zinc-600'}`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <span className="text-[10px] font-black tracking-widest">VOLUME</span>
        </button>
        <button 
          onClick={() => {triggerHaptic(); setTab('sync');}} 
          className={`flex flex-col items-center gap-1.5 flex-1 transition-colors ${tab === 'sync' ? 'text-indigo-400' : 'text-zinc-600'}`}
        >
          <svg className={`w-6 h-6 transition-transform ${isSyncing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-[10px] font-black tracking-widest">BRIDGE</span>
        </button>
      </nav>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <AppContent />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
