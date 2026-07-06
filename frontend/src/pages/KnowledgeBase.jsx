import { useState } from 'react';
import axios from 'axios';

export default function KnowledgeBase() {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('General');
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', category);
      const res = await axios.post('http://localhost:8001/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(`✅ "${file.name}" uploaded successfully! ${res.data.chunks} chunks indexed.`);
      setFile(null);
    } catch {
      setMessage('❌ Upload failed. Make sure RAG service is running on port 8001.');
    } finally {
      setUploading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await axios.post('http://localhost:8001/search', {
        query: searchQuery, top_k: 5
      });
      setSearchResults(res.data.results || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-xl font-bold text-white">📚 Knowledge Base</h2>

      {/* Upload Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="font-semibold text-white mb-4">Upload Document</h3>
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-gray-700 rounded-xl p-8 text-center hover:border-indigo-500 transition cursor-pointer"
            onClick={() => document.getElementById('fileInput').click()}>
            <input id="fileInput" type="file" accept=".pdf,.docx,.txt" className="hidden"
              onChange={e => setFile(e.target.files[0])} />
            <div className="text-4xl mb-3">📄</div>
            {file ? (
              <p className="text-indigo-400 font-medium">{file.name}</p>
            ) : (
              <>
                <p className="text-white font-medium">Click to upload or drag & drop</p>
                <p className="text-gray-500 text-sm mt-1">PDF, DOCX, TXT supported</p>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500">
              {['General', 'Network', 'Software', 'Hardware', 'Security', 'Email', 'VPN', 'Server'].map(c =>
                <option key={c} value={c}>{c}</option>
              )}
            </select>
          </div>

          {message && (
            <div className={`px-4 py-3 rounded-lg text-sm ${message.startsWith('✅') ? 'bg-green-900/30 text-green-400 border border-green-800' : 'bg-red-900/30 text-red-400 border border-red-800'}`}>
              {message}
            </div>
          )}

          <button type="submit" disabled={!file || uploading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition disabled:opacity-50">
            {uploading ? 'Uploading...' : '📤 Upload & Index'}
          </button>
        </form>
      </div>

      {/* Search Section */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h3 className="font-semibold text-white mb-4">🔍 Search Knowledge Base</h3>
        <form onSubmit={handleSearch} className="flex gap-3">
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
            placeholder="Search IT documentation..." />
          <button type="submit" disabled={searching}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition disabled:opacity-50">
            {searching ? '...' : 'Search'}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div className="mt-4 space-y-3">
            {searchResults.map((result, i) => (
              <div key={i} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-indigo-400 font-medium">
                    {result.metadata?.filename || 'Unknown source'}
                  </span>
                  <span className="text-xs text-gray-500">
                    Score: {(result.final_score * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="text-sm text-gray-300 line-clamp-3">{result.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}