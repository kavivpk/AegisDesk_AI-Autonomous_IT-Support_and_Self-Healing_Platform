import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'employee', department: 'IT'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { loginWithEmail, registerWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        await loginWithEmail(form.email, form.password);
      } else {
        await registerWithEmail(form.name, form.email, form.password, form.role, form.department);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || (isLogin ? 'Invalid credentials' : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/dashboard');
    } catch {
      setError('Google login failed');
    }
  };

  const features = [
    { icon: '🤖', title: 'AI Triage', desc: 'Auto-categorize & prioritize tickets instantly' },
    { icon: '🔍', title: 'RAG Search', desc: 'Intelligent knowledge base retrieval' },
    { icon: '🔄', title: 'Self-Healing', desc: 'Auto-retry & escalation workflows' },
    { icon: '📊', title: 'Analytics', desc: 'Real-time insights & performance reports' },
  ];

  return (
    <div className="min-h-screen flex bg-gray-950">

      {/* Left — Feature Showcase */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-800 to-gray-900 flex-col justify-between p-12">
        {/* Background circles */}
        <div className="absolute top-[-80px] left-[-80px] w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-60px] right-[-60px] w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>

        {/* Top */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-xl">🛡️</div>
            <span className="text-white font-bold text-lg">AegisDesk AI</span>
          </div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Autonomous IT Support & Self-Healing Platform
          </h1>
          <p className="text-indigo-200 text-lg">
            Resolve IT issues faster with AI-powered triage, smart search, and automated workflows.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="relative z-10 grid grid-cols-2 gap-4 my-10">
          {features.map((f, i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-5 hover:bg-white/15 transition">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold text-sm mb-1">{f.title}</h3>
              <p className="text-indigo-200 text-xs">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="relative z-10 flex items-center gap-8">
          {[
            { value: '99%', label: 'Uptime' },
            { value: '3x', label: 'Faster Resolution' },
            { value: '100%', label: 'Free & Open Source' },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-3xl font-bold text-white">{s.value}</p>
              <p className="text-indigo-300 text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">

          {/* Toggle */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-1 flex mb-8">
            <button onClick={() => { setIsLogin(true); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${isLogin ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white'}`}>
              Sign In
            </button>
            <button onClick={() => { setIsLogin(false); setError(''); }}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${!isLogin ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-white'}`}>
              Register
            </button>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">
              {isLogin ? 'Welcome back! 👋' : 'Create Account 🚀'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              {isLogin ? 'Sign in to your IT support account' : 'Join AegisDesk AI Platform'}
            </p>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-xl mb-5 text-sm flex items-center gap-2">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name — Register only */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
                <input name="name" type="text" value={form.name} onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition"
                  placeholder="John Doe" required />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500 transition"
                placeholder="you@company.com" required />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Password</label>
              <div className="relative">
                <input name="password" type={showPassword ? 'text' : 'password'} value={form.password}
                  onChange={handleChange}
                  className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 pr-12 focus:outline-none focus:border-indigo-500 transition"
                  placeholder="••••••••" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Role & Department — Register only */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Role</label>
                  <select name="role" value={form.role} onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500">
                    <option value="employee">Employee</option>
                    <option value="it_engineer">IT Engineer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Department</label>
                  <select name="department" value={form.department} onChange={handleChange}
                    className="w-full bg-gray-900 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500">
                    {['IT','HR','Finance','Operations','Sales','Marketing','Other'].map(d =>
                      <option key={d} value={d}>{d}</option>
                    )}
                  </select>
                </div>
              </div>
            )}

            {/* Forgot password — Login only */}
            {isLogin && (
              <div className="flex justify-end">
                <button type="button" className="text-sm text-indigo-400 hover:text-indigo-300">Forgot password?</button>
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition disabled:opacity-50 text-sm">
              {loading ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-800"></div></div>
            <div className="relative flex justify-center text-xs"><span className="bg-gray-950 px-3 text-gray-600">or continue with</span></div>
          </div>

          <button onClick={handleGoogle}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-xl border border-gray-700 transition flex items-center justify-center gap-3 text-sm">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

        </div>
      </div>
    </div>
  );
}