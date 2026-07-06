import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const priorityColor = {
  Critical: 'bg-red-900/30 text-red-400 border-red-800',
  High: 'bg-orange-900/30 text-orange-400 border-orange-800',
  Medium: 'bg-yellow-900/30 text-yellow-400 border-yellow-800',
  Low: 'bg-green-900/30 text-green-400 border-green-800'
};

const statusColor = {
  Open: 'bg-blue-900/30 text-blue-400',
  'In Progress': 'bg-purple-900/30 text-purple-400',
  Resolved: 'bg-green-900/30 text-green-400',
  Escalated: 'bg-red-900/30 text-red-400',
  Closed: 'bg-gray-700 text-gray-400'
};

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/tickets/${id}`);
        setTicket(res.data.ticket);
        setHistory(res.data.history || []);
        setNewStatus(res.data.ticket.status);
      } catch {
        navigate('/tickets');
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id, navigate]);

  const handleStatusUpdate = async () => {
    if (newStatus === ticket.status) return;
    setUpdating(true);
    try {
      const res = await axios.put(`${import.meta.env.VITE_API_URL}/tickets/${id}`, { status: newStatus });
      setTicket(res.data.ticket);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleAITriage = async () => {
    setAiLoading(true);
    try {
      const res = await axios.post('http://localhost:8001/triage', {
        title: ticket.title,
        description: ticket.description
      });
      setAiResult(res.data.triage);
    } catch {
      setAiResult({ error: 'RAG service not running. Start: python main.py in rag-service folder.' });
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-4xl animate-pulse">🎫</div>
    </div>
  );

  if (!ticket) return null;

  return (
    <div className="max-w-4xl space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => navigate('/tickets')} className="text-gray-500 hover:text-white text-sm mb-2 flex items-center gap-1">
            ← Back to tickets
          </button>
          <h2 className="text-xl font-bold text-white">{ticket.title}</h2>
          <p className="text-gray-500 text-sm mt-1 font-mono">{ticket.ticketId}</p>
        </div>
        <div className="flex gap-2">
          <span className={`text-xs px-3 py-1 rounded-full border ${priorityColor[ticket.priority]}`}>{ticket.priority}</span>
          <span className={`text-xs px-3 py-1 rounded-full ${statusColor[ticket.status]}`}>{ticket.status}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Description */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-3">Description</h3>
            <p className="text-gray-300 text-sm leading-relaxed">{ticket.description}</p>
          </div>

          {/* AI Triage */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">🤖 AI Analysis</h3>
              <button onClick={handleAITriage} disabled={aiLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50">
                {aiLoading ? 'Analyzing...' : 'Run AI Triage'}
              </button>
            </div>
            {aiResult && (
              <div className="space-y-3">
                {aiResult.error ? (
                  <p className="text-red-400 text-sm">{aiResult.error}</p>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">Category</p>
                        <p className="text-white font-medium text-sm">{aiResult.category}</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">Priority</p>
                        <p className="text-white font-medium text-sm">{aiResult.priority}</p>
                      </div>
                      <div className="bg-gray-800 rounded-lg p-3 text-center">
                        <p className="text-xs text-gray-500 mb-1">Confidence</p>
                        <p className="text-green-400 font-medium text-sm">{(aiResult.confidence * 100).toFixed(0)}%</p>
                      </div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">AI Summary</p>
                      <p className="text-gray-300 text-sm">{aiResult.summary}</p>
                    </div>
                    {aiResult.suggested_solutions?.length > 0 && (
                      <div className="bg-gray-800 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-2">Suggested Solutions</p>
                        {aiResult.suggested_solutions.map((sol, i) => (
                          <p key={i} className="text-gray-300 text-sm mb-1">• {sol}</p>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            {!aiResult && <p className="text-gray-600 text-sm">Click "Run AI Triage" to analyze this ticket with AI.</p>}
          </div>

          {/* Timeline */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-4">Timeline</h3>
            {history.length > 0 ? (
              <div className="space-y-4">
                {history.map((h, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-1.5"></div>
                      {i < history.length - 1 && <div className="w-px flex-1 bg-gray-800 mt-1"></div>}
                    </div>
                    <div className="pb-4">
                      <p className="text-white text-sm font-medium capitalize">{h.action.replace('_', ' ')}</p>
                      {h.comment && <p className="text-gray-500 text-xs mt-0.5">{h.comment}</p>}
                      {h.changes && (
                        <p className="text-gray-500 text-xs mt-0.5">
                          {h.changes.field}: {h.changes.oldValue} → {h.changes.newValue}
                        </p>
                      )}
                      <p className="text-gray-600 text-xs mt-1">
                        {h.performedBy?.name} · {new Date(h.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-sm">No history yet.</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Ticket Info */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="font-semibold text-white mb-4">Details</h3>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Category', value: ticket.category },
                { label: 'Department', value: ticket.department },
                { label: 'Created by', value: ticket.createdBy?.name },
                { label: 'Assigned to', value: ticket.assignedTo?.name || 'Unassigned' },
                { label: 'Created', value: new Date(ticket.createdAt).toLocaleDateString() },
              ].map((item, i) => (
                <div key={i} className="flex justify-between">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="text-white font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Status Update */}
          {(user?.role === 'admin' || user?.role === 'it_engineer') && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
              <h3 className="font-semibold text-white mb-4">Update Status</h3>
              <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 mb-3">
                {['Open', 'In Progress', 'Resolved', 'Escalated', 'Closed'].map(s =>
                  <option key={s} value={s}>{s}</option>
                )}
              </select>
              <button onClick={handleStatusUpdate} disabled={updating || newStatus === ticket.status}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition disabled:opacity-50 text-sm">
                {updating ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}