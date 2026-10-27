import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, Lock, Mail, AlertCircle } from 'lucide-react';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import useAuth from '../hooks/useAuth';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || null;

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(formData);
      if (from) {
        navigate(from, { replace: true });
      } else {
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'er') navigate('/er/dashboard');
        else navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-sage/20 border border-sage/40 flex items-center justify-center text-deep-green mx-auto mb-3">
          <Heart className="w-6 h-6 fill-sage/30 text-deep-green" />
        </div>
        <h1 className="text-2xl font-bold text-dark-brown">Welcome Back</h1>
        <p className="text-xs text-dark-brown/70 mt-1">
          Sign in to your student, responder, or administrator account.
        </p>
      </div>

      <Card className="bg-white/95">
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 rounded-2xl bg-terracotta/10 border border-terracotta/30 text-terracotta text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-dark-brown mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-sage" />
              Institutional Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. example6@sst.scaler.com"
              className="w-full px-4 py-2.5 text-sm bg-cream/50 border border-warm-brown/20 focus:border-sage rounded-2xl focus:outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark-brown mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-sage" />
              Password
            </label>
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2.5 text-sm bg-cream/50 border border-warm-brown/20 focus:border-sage rounded-2xl focus:outline-none transition-colors"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-5 text-center text-xs text-dark-brown/70 pt-4 border-t border-warm-brown/10">
          New to the platform?{' '}
          <Link to="/signup" className="font-bold text-deep-green hover:underline">
            Create an anonymous student profile
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Login;
