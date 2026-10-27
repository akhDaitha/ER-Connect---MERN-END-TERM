import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Lock, Mail, GraduationCap, ShieldCheck, AlertCircle } from 'lucide-react';
import Card from '../components/shared/Card';
import Button from '../components/shared/Button';
import useAuth from '../hooks/useAuth';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    gender: 'female',
    batch: 2030
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'batch' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signup(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Signup failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <div className="text-center mb-6">
        <div className="w-12 h-12 rounded-2xl bg-sage/20 border border-sage/40 flex items-center justify-center text-deep-green mx-auto mb-3">
          <Heart className="w-6 h-6 fill-sage/30 text-deep-green" />
        </div>
        <h1 className="text-2xl font-bold text-dark-brown">Join Anonymous Peer Support</h1>
        <p className="text-xs text-dark-brown/70 mt-1">
          Your identity stays completely hidden from senior responders.
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
              SST Scaler Institutional Email
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={(e) => {
                const val = e.target.value;
                // Auto-detect batch from roll number like 25bcs -> 2029
                const match = val.match(/\.([0-9]{2})[a-zA-Z]+/);
                if (match) {
                  const joinYear = 2000 + parseInt(match[1], 10);
                  const gradYear = joinYear + 4;
                  setFormData(prev => ({ ...prev, email: val, batch: gradYear }));
                } else {
                  setFormData(prev => ({ ...prev, email: val }));
                }
              }}
              placeholder="e.g. example@sst.scaler.com"
              className="w-full px-4 py-2.5 text-sm bg-cream/50 border border-warm-brown/20 focus:border-sage rounded-2xl focus:outline-none transition-colors"
            />
            <p className="text-[11px] text-dark-brown/50 mt-1">
              Must be your official college ID ending with <strong>@sst.scaler.com</strong>. Responders never see this email.
            </p>
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
              minLength={8}
              value={formData.password}
              onChange={handleChange}
              placeholder="At least 8 characters"
              className="w-full px-4 py-2.5 text-sm bg-cream/50 border border-warm-brown/20 focus:border-sage rounded-2xl focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-dark-brown mb-1.5">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm bg-cream/50 border border-warm-brown/20 focus:border-sage rounded-2xl focus:outline-none transition-colors"
              >
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-dark-brown mb-1.5 flex items-center gap-1">
                <GraduationCap className="w-3.5 h-3.5 text-sage" />
                Graduation Batch
              </label>
              <select
                name="batch"
                value={formData.batch}
                onChange={handleChange}
                className="w-full px-3 py-2.5 text-sm bg-cream/50 border border-warm-brown/20 focus:border-sage rounded-2xl focus:outline-none transition-colors"
              >
                <option value={2029}>2029 (Joined 2025)</option>
                <option value={2028}>2028 (Joined 2024)</option>
                <option value={2027}>2027 (Joined 2023)</option>
                <option value={2030}>2030 (Joined 2026)</option>
              </select>
            </div>
          </div>

          <div className="p-3 bg-sage/10 border border-sage/20 rounded-2xl text-[11px] text-deep-green flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              An anonymous alias like <strong>QuietFox42</strong> will be automatically generated for you. Your real identity is never exposed.
            </span>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={loading}
            className="w-full mt-2"
          >
            {loading ? 'Creating Safe Profile...' : 'Sign Up Anonymously'}
          </Button>
        </form>

        <div className="mt-5 text-center text-xs text-dark-brown/70 pt-4 border-t border-warm-brown/10">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-deep-green hover:underline">
            Log in here
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default Signup;
