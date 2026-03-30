import { Expense, CATEGORIES } from '@/App';

interface DashboardProps {
  expenses: Expense[];
  total: number;
}

export default function Dashboard({ expenses, total }: DashboardProps) {
  const categoryBreakdown = CATEGORIES.map(cat => ({
    ...cat,
    amount: expenses
      .filter(e => e.category === cat.id)
      .reduce((sum, e) => sum + e.amount, 0)
  }));

  return (
    <div className="animate-fade-in">
      {/* Total Expenditure Card */}
      <div className="bg-[#1C1C1E] rounded-[32px] p-8 mb-8 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-6 opacity-20">
          <svg className="w-10 h-10 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <p className="text-[11px] font-bold text-zinc-500 tracking-widest mb-2 uppercase">Net Expenditure</p>
        <h2 className="text-5xl font-light tracking-tighter mb-6 text-white">₹{total.toLocaleString('en-IN')}</h2>
        
        {/* Category Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          {categoryBreakdown.slice(0, 2).map(cat => (
            <div key={cat.id} className="bg-white/5 rounded-2xl p-4 border border-white/5">
              <p className="text-[10px] font-bold mb-1" style={{color: cat.color}}>
                {cat.label.toUpperCase()}
              </p>
              <p className="text-lg font-bold text-white">₹{cat.amount.toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Live Activity */}
      <h3 className="text-zinc-500 text-xs font-black tracking-widest uppercase mb-4 ml-1">Live Activity</h3>
      <div className="space-y-3">
        {expenses.map(e => {
          const category = CATEGORIES.find(c => c.id === e.category);
          return (
            <div key={e.id} className="bg-[#1C1C1E] p-4 rounded-[24px] flex items-center gap-4 border border-white/[0.02]">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{background: 'rgba(255,255,255,0.05)'}}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{color: category?.color}}>
                  {category?.id === 'transport' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2h-2m-4-4l-4-4m0 0l-4 4m4-4v12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m0 0h6m-6-6l-6 6m0 0l6-6" />
                  )}
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-bold text-[15px] text-white">{e.merchant}</p>
                <p className="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">
                  {new Date(e.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
              <p className="font-bold text-lg text-white">-₹{e.amount}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
