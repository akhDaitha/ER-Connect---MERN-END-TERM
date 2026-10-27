import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, CheckCircle, AlertTriangle, UserX, Clock, ShieldCheck } from 'lucide-react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import * as adminApi from '../../api/admin';

const ReportDetail = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [transcript, setTranscript] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [resolutionNote, setResolutionNote] = useState('');

  useEffect(() => {
    const fetchReportAndTranscript = async () => {
      try {
        setLoading(true);
        setError('');

        const reportsRes = await adminApi.getAdminReports();
        const found = reportsRes.reports?.find(r => r._id === reportId);
        if (!found) {
          setError('Report not found');
          return;
        }
        setReport(found);

        // Fetch decrypted transcript (triggers AuditLog on backend)
        const transcriptRes = await adminApi.getChatTranscript(found.chat?._id || found.chat);
        if (transcriptRes.success) {
          setTranscript(transcriptRes);
        }
      } catch (err) {
        setError(err.message || 'Failed to inspect report transcript');
      } finally {
        setLoading(false);
      }
    };

    fetchReportAndTranscript();
  }, [reportId]);

  const handleResolve = async (resolution) => {
    try {
      setError('');
      await adminApi.resolveReport(reportId, {
        resolution,
        note: resolutionNote
      });
      setActionSuccess(`Report successfully resolved with action: ${resolution.toUpperCase()}`);
      setTimeout(() => {
        navigate('/admin');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to resolve report');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs font-bold text-deep-green hover:underline">
        <ArrowLeft className="w-4 h-4" />
        Back to Admin Safety Panel
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-5 h-5 text-terracotta" />
            <h1 className="text-2xl font-extrabold text-dark-brown">Incident Report Investigation</h1>
          </div>
          <p className="text-xs text-dark-brown/70">
            Audit-logged review of student complaint and conversation transcript.
          </p>
        </div>

        <Badge variant={report?.status === 'resolved' ? 'sage' : 'terracotta'} size="md">
          {report?.status?.toUpperCase()}
        </Badge>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-sage/20 border border-sage/40 text-deep-green text-xs font-bold rounded-2xl animate-fade-in flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-terracotta/10 border border-terracotta/30 text-terracotta text-xs font-bold rounded-2xl animate-fade-in">
          {error}
        </div>
      )}

      {/* Report Info Card */}
      <Card className="bg-white/95">
        <h2 className="text-sm font-bold text-dark-brown mb-3">Report Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mb-4">
          <div>
            <span className="text-dark-brown/50 block">Reason</span>
            <span className="font-bold text-terracotta capitalize">{report?.reason}</span>
          </div>
          <div>
            <span className="text-dark-brown/50 block">Filed At</span>
            <span className="font-medium text-dark-brown">{new Date(report?.createdAt).toLocaleString()}</span>
          </div>
          <div>
            <span className="text-dark-brown/50 block">Subject Emotional Responder</span>
            <span className="font-bold text-dark-brown">
              {report?.chat?.er?.alias} ({report?.chat?.er?.email})
            </span>
          </div>
          <div>
            <span className="text-dark-brown/50 block">Reporting Student (Protected)</span>
            <span className="font-bold text-dark-brown">
              {report?.chat?.client?.alias} (Batch {report?.chat?.client?.batch})
            </span>
          </div>
        </div>

        <div className="p-3 bg-cream rounded-2xl border border-warm-brown/15 text-xs">
          <span className="font-bold text-dark-brown block mb-1">Student's Statement:</span>
          <p className="text-dark-brown/80 italic">
            "{report?.details || 'No additional statement provided.'}"
          </p>
        </div>
      </Card>

      {/* Decrypted Transcript Box */}
      <Card className="bg-white/95">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-warm-brown/10">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-deep-green" />
            <h2 className="text-sm font-bold text-dark-brown">Decrypted Conversation Transcript</h2>
          </div>
          <span className="text-[10px] text-dark-brown/50 uppercase font-semibold tracking-wider">
            Access Recorded in Audit Log
          </span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-dark-brown/50">
            Decrypting messages from secure database...
          </div>
        ) : transcript?.messages?.length === 0 ? (
          <p className="text-xs text-center text-dark-brown/50 py-4">No messages were exchanged in this chat.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto p-4 bg-cream/50 rounded-2xl border border-warm-brown/10">
            {transcript?.messages?.map((m) => (
              <div key={m.id} className="text-xs">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-dark-brown">
                    {m.senderAlias} ({m.senderRole})
                  </span>
                  <span className="text-[10px] text-dark-brown/40">
                    {new Date(m.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="p-2.5 bg-white border border-warm-brown/15 rounded-xl text-dark-brown/80 whitespace-pre-wrap">
                  {m.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Resolution Actions */}
      {report?.status !== 'resolved' && (
        <Card className="bg-white/95">
          <h2 className="text-sm font-bold text-dark-brown mb-2">Resolution Action</h2>
          <p className="text-xs text-dark-brown/70 mb-4">
            Take appropriate administrative action on this responder based on the transcript findings.
          </p>

          <div className="mb-4">
            <label className="block text-xs font-bold text-dark-brown mb-1.5">
              Resolution Note (Logged in AuditLog)
            </label>
            <input
              type="text"
              value={resolutionNote}
              onChange={(e) => setResolutionNote(e.target.value)}
              placeholder="e.g. Conducted review, issued reminder regarding institute guidelines..."
              className="w-full px-4 py-2 text-xs bg-cream border border-warm-brown/20 rounded-2xl focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleResolve('dismissed')}
              icon={CheckCircle}
            >
              Dismiss (No Violation)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleResolve('warned')}
              icon={AlertTriangle}
            >
              Issue Formal Warning
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => handleResolve('suspended')}
              icon={UserX}
            >
              Suspend Responder Account
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ReportDetail;
