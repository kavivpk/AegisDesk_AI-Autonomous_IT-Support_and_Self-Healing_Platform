import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminPanel() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ragStats, setRagStats] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ticketsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/tickets`),
        ]);
        setTickets(ticketsRes.data.tickets || []);

        try {
          const ragRes = await axios.get('http://localhost:8001/stats');
          setRagStats(ragRes.data.stats);
        } catch {
          setRagStats(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusChange = async (ticketId, status) => {
    try {
      await axios.put(`${import.meta.env.VITE_API_URL}/tickets/${ticketId}`, { status });
      setTickets(prev => prev.map(t => t._id === ticketId ? { ...t, status } : t));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-4xl animate-pulse">⚙️</div>
    </div>
  );

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">⚙️ Admin Panel</h2>

      {/* System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-white">Backend API</span>
          </div>
          <p className="text-green-400 text-sm">Running on port 5000</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-white">MongoDB</span>
          </div>
          <p className="text-green-400 text-sm">Connected</p>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${ragStats ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-sm font-medium text-white">RAG Service</span>
          </div>
          {ragStats ? (
            <p className="text-green-400 text-sm">{ragStats.total_chunks} chunks indexed</p>
          ) : (
            <p className="text-red-400 text-sm">Not running (port 8001)</p>
          )}
        </div>
      </div>

      {/* Ticket Management */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-gray-800">
          <h3 className="font-semibold text-white">All Tickets Management</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 bg-gray-800/50">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody>
              {tickets.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-600">No tickets found</td></tr>
              ) : tickets.map(ticket => (
                <tr key={ticket._id} className="border-b border-gray-800 hover:bg-gray-800/30 transition">
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{ticket.ticketId}</td>
                  <td className="px-4 py-3 text-sm text-white max-w-xs truncate">{ticket.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{ticket.createdBy?.name || 'Unknown'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full
                      ${ticket.priority === 'Critical' ? 'bg-red-900/30 text-red-400' :
                        ticket.priority === 'High' ? 'bg-orange-900/30 text-orange-400' :
                        ticket.priority === 'Medium' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-green-900/30 text-green-400'}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full
                      ${ticket.status === 'Open' ? 'bg-blue-900/30 text-blue-400' :
                        ticket.status === 'Resolved' ? 'bg-green-900/30 text-green-400' :
                        ticket.status === 'Escalated' ? 'bg-red-900/30 text-red-400' :
                        'bg-gray-700 text-gray-400'}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={ticket.status}
                      onChange={e => handleStatusChange(ticket._id, e.target.value)}
                      className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500">
                      {['Open', 'In Progress', 'Resolved', 'Escalated', 'Closed'].map(s =>
                        <option key={s} value={s}>{s}</option>
                      )}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}