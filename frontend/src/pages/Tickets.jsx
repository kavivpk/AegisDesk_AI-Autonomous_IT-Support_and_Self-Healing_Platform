import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const priorityColor = {
  Critical: 'bg-red-900/30 text-red-400',
  High: 'bg-orange-900/30 text-orange-400',
  Medium: 'bg-yellow-900/30 text-yellow-400',
  Low: 'bg-green-900/30 text-green-400'
};

const statusColor = {
  Open: 'bg-blue-900/30 text-blue-400',
  'In Progress': 'bg-purple-900/30 text-purple-400',
  Resolved: 'bg-green-900/30 text-green-400',
  Escalated: 'bg-red-900/30 text-red-400',
  Closed: 'bg-gray-700 text-gray-400'
};

export default function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', priority: '', category: '' });

  const fetchTickets = useCallback(async () => {
    try {
      const params = new URLSearchParams(filters).toString();
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/tickets?${params}`);
      setTickets(res.data.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">All Tickets</h2>
        <Link to="/create-ticket"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          ➕ New Ticket
        </Link>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex gap-3 flex-wrap">
        {[
          { key: 'status', options: ['', 'Open', 'In Progress', 'Resolved', 'Escalated', 'Closed'] },
          { key: 'priority', options: ['', 'Low', 'Medium', 'High', 'Critical'] },
          { key: 'category', options: ['', 'Network', 'Software', 'Hardware', 'Security', 'Email', 'VPN', 'Server'] }
        ].map(({ key, options }) => (
          <select key={key} value={filters[key]}
            onChange={e => setFilters(prev => ({ ...prev, [key]: e.target.value }))}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500">
            {options.map(o => <option key={o} value={o}>{o || `All ${key}s`}</option>)}
          </select>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">🎫</p>
            <p className="text-gray-400">No tickets found</p>
            <Link to="/create-ticket" className="text-indigo-400 text-sm mt-2 block">Create one →</Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">ID</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket._id} className="border-b border-gray-800 hover:bg-gray-800 transition">
                  <td className="px-4 py-3 text-xs font-mono text-gray-500">{ticket.ticketId}</td>
                  <td className="px-4 py-3">
                    <Link to={`/tickets/${ticket._id}`} className="text-white hover:text-indigo-400 text-sm font-medium">
                      {ticket.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">{ticket.category}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${priorityColor[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-1 rounded-full ${statusColor[ticket.status]}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}