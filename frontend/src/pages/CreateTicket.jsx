import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CreateTicket() {
  const [form, setForm] = useState({
    title: '', description: '', category: 'Software',
    priority: 'Medium', department: 'IT'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/tickets`, form);
      navigate(`/tickets/${res.data.ticket._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
        <h2 className="text-xl font-bold text-white mb-6">🎫 Create New Ticket</h2>

        {error && (
          <div className="bg-red-900/30 border border-red-700 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Title *</label>
            <input name="title" value={form.title} onChange={handleChange}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500"
              placeholder="Brief description of the issue" required />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={5}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 resize-none"
              placeholder="Detailed description of the issue..." required />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
              <select name="category" value={form.category} onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500">
                {['Network','Software','Hardware','Security','Email','VPN','Server','Other'].map(c =>
                  <option key={c} value={c}>{c}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
              <select name="priority" value={form.priority} onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500">
                {['Low','Medium','High','Critical'].map(p =>
                  <option key={p} value={p}>{p}</option>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Department</label>
              <select name="department" value={form.department} onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500">
                {['IT','HR','Finance','Operations','Sales','Marketing','Other'].map(d =>
                  <option key={d} value={d}>{d}</option>
                )}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50">
              {loading ? 'Creating...' : '🚀 Submit Ticket'}
            </button>
            <button type="button" onClick={() => navigate('/tickets')}
              className="px-6 bg-gray-800 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}