import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Heart, Flame, Zap, TrendingUp, Wallet } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface HealthMetric {
  metricType: string;
  value: number;
  unit: string;
  recordedAt: Date;
}

interface Expense {
  id: number;
  merchant: string;
  amount: string;
  category: string;
  transactionDate: Date;
}

export default function Dashboard() {
  const [healthData, setHealthData] = useState<Record<string, number>>({
    steps: 8234,
    heartRate: 72,
    calories: 2150,
    activeMinutes: 45,
  });

  const [spendingData, setSpendingData] = useState<Record<string, number>>({
    food: 1230,
    shopping: 2500,
    transport: 450,
    entertainment: 600,
    bills: 3200,
  });

  // Fetch health metrics
  const { data: healthMetrics } = trpc.health.getMetrics.useQuery({
    hours: 24,
  });

  // Fetch expenses
  const { data: expenses } = trpc.expenses.list.useQuery({
    days: 30,
  });

  // Fetch spending summary
  const { data: spendingSummary } = trpc.expenses.getSummaryByCategory.useQuery({
    days: 30,
  });

  // Update spending data when summary changes
  useEffect(() => {
    if (spendingSummary) {
      setSpendingData(spendingSummary);
    }
  }, [spendingSummary]);

  // Process health metrics for charts
  const healthChartData = [
    { name: 'Steps', value: healthData.steps, target: 10000, icon: Activity },
    { name: 'Heart Rate', value: healthData.heartRate, target: 100, icon: Heart },
    { name: 'Calories', value: healthData.calories, target: 2500, icon: Flame },
    { name: 'Active Min', value: healthData.activeMinutes, target: 60, icon: Zap },
  ];

  const spendingChartData = Object.entries(spendingData).map(([category, amount]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: amount,
  }));

  const COLORS = ['#FF375F', '#AF52DE', '#5E5CE6', '#FF9F0A', '#32D74B'];

  const totalSpending = Object.values(spendingData).reduce((a, b) => a + b, 0);
  const totalHealth = Object.values(healthData).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Unified Dashboard</h1>
        <p className="text-zinc-400">Real-time health & spending insights</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {healthChartData.map((metric) => (
          <Card key={metric.name} className="bg-[#1C1C1E] border-white/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                <metric.icon className="w-4 h-4" />
                {metric.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{metric.value.toLocaleString()}</div>
              <p className="text-xs text-zinc-500 mt-1">Target: {metric.target.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Charts Section */}
      <Tabs defaultValue="health" className="w-full">
        <TabsList className="bg-[#1C1C1E] border-white/10">
          <TabsTrigger value="health" className="data-[state=active]:bg-purple-600">
            Health Metrics
          </TabsTrigger>
          <TabsTrigger value="spending" className="data-[state=active]:bg-purple-600">
            Spending Analysis
          </TabsTrigger>
          <TabsTrigger value="combined" className="data-[state=active]:bg-purple-600">
            Combined View
          </TabsTrigger>
        </TabsList>

        {/* Health Metrics Tab */}
        <TabsContent value="health" className="space-y-6">
          <Card className="bg-[#1C1C1E] border-white/10">
            <CardHeader>
              <CardTitle>Health Metrics Trend</CardTitle>
              <CardDescription>24-hour activity overview</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={healthChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#2C2C2E', border: '1px solid rgba(255,255,255,0.1)' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#AF52DE" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-[#1C1C1E] border-white/10">
            <CardHeader>
              <CardTitle>Progress vs Targets</CardTitle>
              <CardDescription>Daily goals achievement</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={healthChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#2C2C2E', border: '1px solid rgba(255,255,255,0.1)' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#5E5CE6" name="Current" />
                  <Bar dataKey="target" fill="#32D74B" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Spending Analysis Tab */}
        <TabsContent value="spending" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-[#1C1C1E] border-white/10">
              <CardHeader>
                <CardTitle>Spending by Category</CardTitle>
                <CardDescription>Last 30 days breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={spendingChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {spendingChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#2C2C2E', border: '1px solid rgba(255,255,255,0.1)' }}
                      labelStyle={{ color: '#fff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-[#1C1C1E] border-white/10">
              <CardHeader>
                <CardTitle>Category Summary</CardTitle>
                <CardDescription>Total: ₹{totalSpending.toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {spendingChartData.map((category, idx) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                        />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <span className="font-semibold">₹{category.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Combined View Tab */}
        <TabsContent value="combined" className="space-y-6">
          <Card className="bg-[#1C1C1E] border-white/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Health & Spending Correlation
              </CardTitle>
              <CardDescription>Wellness metrics vs spending patterns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#2C2C2E] rounded-lg p-4">
                  <div className="text-sm text-zinc-400 mb-1">Total Activity Score</div>
                  <div className="text-3xl font-bold text-green-400">{totalHealth.toLocaleString()}</div>
                </div>
                <div className="bg-[#2C2C2E] rounded-lg p-4">
                  <div className="text-sm text-zinc-400 mb-1 flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Total Spending
                  </div>
                  <div className="text-3xl font-bold text-red-400">₹{totalSpending.toLocaleString()}</div>
                </div>
              </div>

              <div className="bg-[#2C2C2E] rounded-lg p-4">
                <p className="text-sm text-zinc-400 mb-3">Insights</p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    <span>You're on track with your daily activity goals</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-yellow-400 mt-1">!</span>
                    <span>Food spending is the highest category - consider meal planning</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">→</span>
                    <span>Active lifestyle correlates with higher food expenses</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Transactions */}
      <Card className="bg-[#1C1C1E] border-white/10">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Latest spending activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {expenses && expenses.length > 0 ? (
              expenses.slice(0, 5).map((expense: Expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 bg-[#2C2C2E] rounded-lg">
                  <div>
                    <p className="font-medium">{expense.merchant}</p>
                    <p className="text-xs text-zinc-500 capitalize">{expense.category}</p>
                  </div>
                  <p className="font-semibold text-red-400">-₹{parseFloat(expense.amount).toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-center py-4">No transactions yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
