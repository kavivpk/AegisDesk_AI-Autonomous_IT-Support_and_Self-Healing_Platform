import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-2xl">{icon}</span>
      <span className={`text-xs px-2 py-1 rounded-full ${color}`}>Live</span>
    </div>
    <p className="text-3xl font-bold text-white">{value}</p>
    <p className="text-sm text-gray-400 mt-1">{label}</p>
  </div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentTickets, setRecentTickets] = useState([]);

 const fetchData = async () => {
  try {
    const ticketsRes = await axios.get(`${import.meta.env.VITE_API_URL}/tickets?limit=5`);
    setRecentTickets(ticketsRes.data.tickets || []);

    // Analytics — admin/it_engineer மட்டும்
    try {
      const statsRes = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/stats`);
      setStats(statsRes.data.stats);
    } catch {
      // Employee-க்கு default stats
      setStats({
        totalTickets: 0, openTickets: 0, resolvedTickets: 0,
        escalatedTickets: 0, resolutionRate: 0,
        categoryBreakdown: [], last7Days: []
      });
    }
  } catch (err) {
    console.error(err);
    setStats({ totalTickets: 0, openTickets: 0, resolvedTickets: 0, escalatedTickets: 0, resolutionRate: 0, categoryBreakdown: [], last7Days: [] });
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  const load = async () => { await fetchData(); };
  load();
}, []); 

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-pulse">🛡️</div>
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    </div>
  );

  const categoryData = stats?.categoryBreakdown?.map(c => ({ name: c._id || 'Other', value: c.count })) || [];
  const trendData = stats?.last7Days?.map(d => ({ date: d._id?.slice(5), tickets: d.count })) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon="🎫" label="Total Tickets" value={stats?.totalTickets || 0} color="bg-indigo-900/30 text-indigo-400" />
        <StatCard icon="🔓" label="Open Tickets" value={stats?.openTickets || 0} color="bg-yellow-900/30 text-yellow-400" />
        <StatCard icon="✅" label="Resolved" value={stats?.resolvedTickets || 0} color="bg-green-900/30 text-green-400" />
        <StatCard icon="🚨" label="Escalated" value={stats?.escalatedTickets || 0} color="bg-red-900/30 text-red-400" />
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-white">Resolution Rate</h3>
          <span className="text-2xl font-bold text-green-400">{stats?.resolutionRate || 0}%</span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-3">
          <div className="bg-green-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${stats?.resolutionRate || 0}%` }}></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Tickets by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-600">No data yet</div>
          )}
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Ticket Trend (Last 7 Days)</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }} />
                <Line type="monotone" dataKey="tickets" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-600">No data yet</div>
          )}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-white">Recent Tickets</h3>
          <Link to="/tickets" className="text-indigo-400 hover:text-indigo-300 text-sm">View all →</Link>
        </div>
        {recentTickets.length > 0 ? (
          <div className="space-y-3">
            {recentTickets.map(ticket => (
              <Link to={`/tickets/${ticket._id}`} key={ticket._id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 transition">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono text-gray-500">{ticket.ticketId}</span>
                  <span className="text-sm text-white truncate max-w-xs">{ticket.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full
                    ${ticket.priority === 'Critical' ? 'bg-red-900/30 text-red-400' :
                      ticket.priority === 'High' ? 'bg-orange-900/30 text-orange-400' :
                      ticket.priority === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-green-900/30 text-green-400'}`}>
                    {ticket.priority}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full
                    ${ticket.status === 'Open' ? 'bg-blue-900/30 text-blue-400' :
                      ticket.status === 'Resolved' ? 'bg-green-900/30 text-green-400' :
                      'bg-gray-700 text-gray-400'}`}>
                    {ticket.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            <p className="text-4xl mb-2">🎫</p>
            <p>No tickets yet</p>
            <Link to="/create-ticket" className="text-indigo-400 text-sm mt-2 block">Create first ticket →</Link>
          </div>
        )}
      </div>
    </div>
  );
}