import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import axios from 'axios';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // Token change ஆனதும் axios header update
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Firebase auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/firebase`, {
            firebaseUid: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName,
            avatar: firebaseUser.photoURL
          });
          const newToken = res.data.token;
          setToken(newToken);
          setUser(res.data.user);
          localStorage.setItem('token', newToken);
        } catch (err) {
          console.error(err);
        }
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  // Page refresh-ல் token இருந்தா user fetch பண்ணு
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken && !user) {
      axios.get(`${import.meta.env.VITE_API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${savedToken}` }
      }).then(res => {
        setUser(res.data.user);
        setToken(savedToken);
      }).catch(() => {
        localStorage.removeItem('token');
        setToken(null);
      }).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginWithEmail = async (email, password) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, { email, password });
    const newToken = res.data.token;
    setToken(newToken);
    setUser(res.data.user);
    localStorage.setItem('token', newToken);
    return res.data;
  };

  const registerWithEmail = async (name, email, password, role, department) => {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
      name, email, password, role, department
    });
    const newToken = res.data.token;
    setToken(newToken);
    setUser(res.data.user);
    localStorage.setItem('token', newToken);
    return res.data;
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, loginWithEmail, registerWithEmail, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};