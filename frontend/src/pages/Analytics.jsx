import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/stats`);
      setStats(res.data.stats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-pulse">📊</div>
        <p className="text-gray-400">Loading analytics...</p>
      </div>
    </div>
  );

  const categoryData = stats?.categoryBreakdown?.map(c => ({ name: c._id || 'Other', value: c.count })) || [];
  const priorityData = stats?.priorityBreakdown?.map(p => ({ name: p._id || 'Unknown', count: p.count })) || [];
  const trendData = stats?.last7Days?.map(d => ({ date: d._id?.slice(5), tickets: d.count })) || [];

  const statCards = [
    { label: 'Total Tickets', value: stats?.totalTickets || 0, icon: '🎫', color: 'text-indigo-400', bg: 'bg-indigo-900/20' },
    { label: 'Open', value: stats?.openTickets || 0, icon: '🔓', color: 'text-yellow-400', bg: 'bg-yellow-900/20' },
    { label: 'In Progress', value: stats?.inProgressTickets || 0, icon: '⚙️', color: 'text-blue-400', bg: 'bg-blue-900/20' },
    { label: 'Resolved', value: stats?.resolvedTickets || 0, icon: '✅', color: 'text-green-400', bg: 'bg-green-900/20' },
    { label: 'Escalated', value: stats?.escalatedTickets || 0, icon: '🚨', color: 'text-red-400', bg: 'bg-red-900/20' },
    { label: 'Resolution Rate', value: `${stats?.resolutionRate || 0}%`, icon: '📈', color: 'text-purple-400', bg: 'bg-purple-900/20' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Analytics Overview</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className={`${card.bg} border border-gray-800 rounded-xl p-5`}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{card.icon}</span>
              <p className="text-sm text-gray-400">{card.label}</p>
            </div>
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Resolution Rate Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">Overall Resolution Rate</h3>
          <span className="text-2xl font-bold text-green-400">{stats?.resolutionRate || 0}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-4">
          <div className="h-4 rounded-full bg-gradient-to-r from-green-600 to-green-400 transition-all duration-700"
            style={{ width: `${stats?.resolutionRate || 0}%` }}></div>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>0%</span><span>50%</span><span>100%</span>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Pie */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Tickets by Category</h3>
          {categoryData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                    {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-600">No data yet</div>
          )}
        </div>

        {/* Priority Bar */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Tickets by Priority</h3>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-600">No data yet</div>
          )}
        </div>
      </div>

      {/* Trend Line */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-4">Ticket Volume — Last 7 Days</h3>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Line type="monotone" dataKey="tickets" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-48 flex items-center justify-center text-gray-600">No data yet</div>
        )}
      </div>
    </div>
  );
}