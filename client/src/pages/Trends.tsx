import { useMemo } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Expense, CATEGORIES } from '@/App';

interface TrendsProps {
  expenses: Expense[];
}

export default function Trends({ expenses }: TrendsProps) {
  // Category breakdown for pie chart
  const categoryData = useMemo(() => {
    return CATEGORIES.map(cat => ({
      name: cat.label,
      value: expenses
        .filter(e => e.category === cat.id)
        .reduce((sum, e) => sum + e.amount, 0),
      color: cat.color
    })).filter(item => item.value > 0);
  }, [expenses]);

  // Daily spending trend
  const dailyTrend = useMemo(() => {
    const grouped: { [key: string]: number } = {};
    
    expenses.forEach(e => {
      const date = new Date(e.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      grouped[date] = (grouped[date] || 0) + e.amount;
    });

    return Object.entries(grouped)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [expenses]);

  // Top merchants
  const topMerchants = useMemo(() => {
    const grouped: { [key: string]: number } = {};
    
    expenses.forEach(e => {
      grouped[e.merchant] = (grouped[e.merchant] || 0) + e.amount;
    });

    return Object.entries(grouped)
      .map(([merchant, amount]) => ({ merchant, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [expenses]);

  const COLORS = ['#FF375F', '#AF52DE', '#5E5CE6', '#FF9F0A', '#32D74B'];

  return (
    <div className="animate-fade-in pb-8">
      <h2 className="text-2xl font-bold mb-6 text-white">Analytics & Insights</h2>

      {/* Category Distribution */}
      <div className="bg-[#1C1C1E] rounded-[32px] p-6 border border-white/5 mb-8">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Spending by Category</h3>
        <div className="h-64 flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ₹${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value}`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily Trend */}
      <div className="bg-[#1C1C1E] rounded-[32px] p-6 border border-white/5 mb-8">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Daily Spending Trend</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#2C2C2E', border: '1px solid #444' }}
                formatter={(value) => `₹${value}`}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#AF52DE" 
                strokeWidth={2}
                dot={{ fill: '#AF52DE', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Merchants */}
      <div className="bg-[#1C1C1E] rounded-[32px] p-6 border border-white/5 mb-8">
        <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Top Merchants</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topMerchants}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="merchant" stroke="#666" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#2C2C2E', border: '1px solid #444' }}
                formatter={(value) => `₹${value}`}
              />
              <Bar dataKey="amount" fill="#5E5CE6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-[#1C1C1E] rounded-[24px] p-4 border border-white/5">
          <p className="text-[10px] font-bold text-emerald-500 mb-2 uppercase tracking-wider">Total Spent</p>
          <p className="text-2xl font-bold text-white">₹{expenses.reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-[#1C1C1E] rounded-[24px] p-4 border border-white/5">
          <p className="text-[10px] font-bold text-sky-500 mb-2 uppercase tracking-wider">Transactions</p>
          <p className="text-2xl font-bold text-white">{expenses.length}</p>
        </div>
        <div className="bg-[#1C1C1E] rounded-[24px] p-4 border border-white/5">
          <p className="text-[10px] font-bold text-rose-500 mb-2 uppercase tracking-wider">Avg Transaction</p>
          <p className="text-2xl font-bold text-white">₹{Math.round(expenses.reduce((s, e) => s + e.amount, 0) / expenses.length).toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-[#1C1C1E] rounded-[24px] p-4 border border-white/5">
          <p className="text-[10px] font-bold text-purple-500 mb-2 uppercase tracking-wider">Top Category</p>
          <p className="text-2xl font-bold text-white">
            {categoryData.length > 0 ? categoryData[0].name : 'N/A'}
          </p>
        </div>
      </div>
    </div>
  );
}
