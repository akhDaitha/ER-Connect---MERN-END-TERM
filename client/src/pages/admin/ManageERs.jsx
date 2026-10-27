import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, ArrowLeft, Check, X, AlertCircle, Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import StarRating from '../../components/shared/StarRating';
import Modal from '../../components/shared/Modal';
import * as adminApi from '../../api/admin';

const ManageERs = () => {
  const [ers, setErs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    gender: 'female'
  });

  const loadERs = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAllERs();
      if (res.success) {
        setErs(res.ers || []);
      }
    } catch (err) {
      console.error('Failed to load ERs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadERs();
  }, []);

  const handleCreateER = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await adminApi.createER(formData);
      if (res.success) {
        setSuccess(`Successfully appointed new ER with alias: ${res.er.alias}`);
        setShowCreateModal(false);
        setFormData({ email: '', password: '', gender: 'female' });
        loadERs();
      }
    } catch (err) {
      setError(err.message || 'Failed to create ER account');
    }
  };

  const handleToggleSuspension = async (erId, currentSuspended) => {
    try {
      await adminApi.updateERStatus(erId, { isSuspended: !currentSuspended });
      loadERs();
    } catch (err) {
      setError(err.message || 'Failed to update suspension status');
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs font-bold text-deep-green hover:underline">
        <ArrowLeft className="w-4 h-4" />
        Back to Admin Safety Panel
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-deep-green" />
            <h1 className="text-2xl font-extrabold text-dark-brown">Manage Emotional Responders</h1>
          </div>
          <p className="text-xs text-dark-brown/70">
            Appoint new senior peer responders and manage operational access.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setShowCreateModal(true)}
          icon={UserPlus}
        >
          Appoint New Senior ER
        </Button>
      </div>

      {success && (
        <div className="p-4 bg-sage/20 border border-sage/40 text-deep-green text-xs font-bold rounded-2xl animate-fade-in flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-terracotta/10 border border-terracotta/30 text-terracotta text-xs font-bold rounded-2xl animate-fade-in">
          {error}
        </div>
      )}

      <Card className="bg-white/95">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream/60 border-b border-warm-brown/10 text-dark-brown/70 uppercase text-[10px]">
              <tr>
                <th className="py-3 px-3">Alias</th>
                <th className="py-3 px-3">Institutional Email</th>
                <th className="py-3 px-3">Gender</th>
                <th className="py-3 px-3">Rating</th>
                <th className="py-3 px-3">Active Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-brown/10">
              {ers.map((er) => (
                <tr key={er.id} className="hover:bg-cream/30">
                  <td className="py-3 px-3 font-bold text-dark-brown">{er.alias}</td>
                  <td className="py-3 px-3 text-dark-brown/70">{er.email}</td>
                  <td className="py-3 px-3 capitalize">{er.gender}</td>
                  <td className="py-3 px-3">
                    <StarRating rating={er.avgRating} count={er.ratingCount} size="sm" />
                  </td>
                  <td className="py-3 px-3">
                    {er.isSuspended ? (
                      <Badge variant="terracotta" size="sm">Suspended</Badge>
                    ) : er.isAvailable ? (
                      <Badge variant="sage" size="sm">Online</Badge>
                    ) : (
                      <Badge variant="gray" size="sm">Offline</Badge>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <Button
                      variant={er.isSuspended ? 'outline' : 'dangerOutline'}
                      size="sm"
                      onClick={() => handleToggleSuspension(er.id, er.isSuspended)}
                      className="text-xs"
                    >
                      {er.isSuspended ? 'Lift Suspension' : 'Suspend Account'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Appoint New ER Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Appoint New Emotional Responder"
      >
        <form onSubmit={handleCreateER} className="space-y-4">
          <p className="text-xs text-dark-brown/70 leading-relaxed">
            Responders cannot self-register. Creating an account generates an anonymous alias and grants responder desk access.
          </p>

          <div>
            <label className="block text-xs font-bold text-dark-brown mb-1.5">
              Senior Student Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="senior@college.edu"
              className="w-full px-3 py-2 text-xs bg-cream border border-warm-brown/20 rounded-2xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark-brown mb-1.5">
              Initial Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-cream border border-warm-brown/20 rounded-2xl focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-dark-brown mb-1.5">
              Gender
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-cream border border-warm-brown/20 rounded-2xl focus:outline-none"
            >
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Create Responder Account
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ManageERs;
