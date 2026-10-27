import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Shield, AlertTriangle, Flag, Users, MessageSquare, HeartHandshake, Eye, CheckCircle2, History } from 'lucide-react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import StarRating from '../../components/shared/StarRating';
import * as adminApi from '../../api/admin';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [reports, setReports] = useState([]);
  const [ers, setErs] = useState([]);
  const [crisisChats, setCrisisChats] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadAllAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, reportsRes, ersRes, crisisRes, logsRes] = await Promise.all([
        adminApi.getAdminStats(),
        adminApi.getAdminReports('open'),
        adminApi.getAllERs(),
        adminApi.getCrisisFlags(),
        adminApi.getAuditLogs(1)
      ]);

      if (statsRes.success) setStats(statsRes.stats);
      if (reportsRes.success) setReports(reportsRes.reports || []);
      if (ersRes.success) setErs(ersRes.ers || []);
      if (crisisRes.success) setCrisisChats(crisisRes.chats || []);
      if (logsRes.success) setAuditLogs(logsRes.logs || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
  }, []);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Admin Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-deep-green" />
            <h1 className="text-2xl font-extrabold text-dark-brown">Administrative Safety Panel</h1>
          </div>
          <p className="text-xs text-dark-brown/70">
            Real-time platform oversight, report resolution, and responder supervision.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/ers">
            <Button variant="primary" size="sm" icon={Users}>
              Manage Responders
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white/95">
          <span className="text-xs text-dark-brown/60 font-semibold block mb-1">Active Sessions</span>
          <div className="text-2xl font-extrabold text-deep-green">
            {stats?.activeChats ?? 0}
          </div>
          <span className="text-[11px] text-dark-brown/50">Total sessions: {stats?.totalChats ?? 0}</span>
        </Card>

        <Card className="bg-white/95">
          <span className="text-xs text-dark-brown/60 font-semibold block mb-1">Open Reports</span>
          <div className="text-2xl font-extrabold text-terracotta">
            {stats?.openReports ?? 0}
          </div>
          <span className="text-[11px] text-dark-brown/50">Pending investigation</span>
        </Card>

        <Card className="bg-white/95">
          <span className="text-xs text-dark-brown/60 font-semibold block mb-1">Crisis Alerts</span>
          <div className="text-2xl font-extrabold text-amber-600">
            {stats?.crisisCount ?? 0}
          </div>
          <span className="text-[11px] text-dark-brown/50">Helplines delivered</span>
        </Card>

        <Card className="bg-white/95">
          <span className="text-xs text-dark-brown/60 font-semibold block mb-1">Flagged Responders</span>
          <div className="text-2xl font-extrabold text-terracotta">
            {stats?.flaggedERs ?? 0}
          </div>
          <span className="text-[11px] text-dark-brown/50">Rating &lt; 2.5 (5+ reviews)</span>
        </Card>
      </div>

      {/* Open Incident Reports */}
      <Card className="bg-white/95">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flag className="w-4 h-4 text-terracotta" />
            <h2 className="text-base font-bold text-dark-brown">Open Student Incident Reports</h2>
          </div>
          <Badge variant="terracotta" size="sm">{reports.length} Open</Badge>
        </div>

        {reports.length === 0 ? (
          <p className="text-xs text-center text-dark-brown/50 py-6">
            All clear. No unresolved incident reports.
          </p>
        ) : (
          <div className="divide-y divide-warm-brown/10 text-xs">
            {reports.map((r) => (
              <div key={r._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-dark-brown uppercase tracking-wider text-[11px] text-terracotta">
                      {r.reason}
                    </span>
                    <span className="text-dark-brown/40">&bull;</span>
                    <span className="text-dark-brown/70 font-medium">
                      Reported ER: <strong>{r.chat?.er?.alias || 'Responder'}</strong>
                    </span>
                  </div>
                  <p className="text-dark-brown/70 line-clamp-1 italic">
                    "{r.details || 'No additional text provided'}"
                  </p>
                  <span className="text-[10px] text-dark-brown/40">
                    Filed on {new Date(r.createdAt).toLocaleString()}
                  </span>
                </div>

                <Link to={`/admin/reports/${r._id}`} className="shrink-0">
                  <Button variant="outline" size="sm" icon={Eye}>
                    Inspect Transcript
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ER Leaderboard & Auto-Flags */}
      <Card className="bg-white/95">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-sage" />
            <h2 className="text-base font-bold text-dark-brown">Appointed Responders & Performance</h2>
          </div>
          <span className="text-xs text-dark-brown/60">Total: {ers.length} Responders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-cream/60 border-b border-warm-brown/10 text-dark-brown/70 uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">Alias</th>
                <th className="py-2.5 px-3">Email</th>
                <th className="py-2.5 px-3">Rating (Bayesian)</th>
                <th className="py-2.5 px-3">Reviews</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Flagged</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-warm-brown/10">
              {ers.map((er) => (
                <tr key={er.id} className="hover:bg-cream/30">
                  <td className="py-2.5 px-3 font-bold text-dark-brown">{er.alias}</td>
                  <td className="py-2.5 px-3 text-dark-brown/70">{er.email}</td>
                  <td className="py-2.5 px-3">
                    <StarRating rating={er.avgRating} size="sm" />
                  </td>
                  <td className="py-2.5 px-3">{er.ratingCount}</td>
                  <td className="py-2.5 px-3">
                    {er.isSuspended ? (
                      <Badge variant="terracotta" size="sm">Suspended</Badge>
                    ) : er.isAvailable ? (
                      <Badge variant="sage" size="sm">Available</Badge>
                    ) : (
                      <Badge variant="gray" size="sm">Offline</Badge>
                    )}
                  </td>
                  <td className="py-2.5 px-3">
                    {er.isFlagged ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-full">
                        <AlertTriangle className="w-3 h-3" /> Flagged for Review
                      </span>
                    ) : (
                      <span className="text-deep-green font-medium">Good Standing</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Audit Log (Last 10 Actions) */}
      <Card className="bg-white/95">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-sage" />
          <h2 className="text-base font-bold text-dark-brown">Recent Administrator Audit Log</h2>
        </div>

        <div className="divide-y divide-warm-brown/10 text-xs">
          {auditLogs.slice(0, 10).map((log) => (
            <div key={log._id} className="py-2 flex items-center justify-between">
              <div>
                <span className="font-bold text-dark-brown">{log.action}</span>
                <p className="text-dark-brown/60 text-[11px]">{log.details}</p>
              </div>
              <span className="text-[10px] text-dark-brown/40">
                {new Date(log.createdAt).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboard;
