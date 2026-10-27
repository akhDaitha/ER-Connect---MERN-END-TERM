import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Filter, Sparkles, RefreshCw, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import ERCard from '../../components/er/ERCard';
import Modal from '../../components/shared/Modal';
import MoodSlider from '../../components/shared/MoodSlider';
import useSocket from '../../hooks/useSocket';
import * as erApi from '../../api/ers';
import * as chatApi from '../../api/chats';

const ERPicker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { socket } = useSocket();

  const [genderFilter, setGenderFilter] = useState('no_preference');
  const [minRating, setMinRating] = useState(0);
  const [ers, setErs] = useState([]);
  const [skippedERIds, setSkippedERIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Selected ER & Pending request state
  const [selectedERId, setSelectedERId] = useState(null);
  const [showMoodModal, setShowMoodModal] = useState(false);
  const [moodBefore, setMoodBefore] = useState(location.state?.moodBefore || 3);
  const [pendingChatId, setPendingChatId] = useState(null);
  const [acceptedChat, setAcceptedChat] = useState(null);

  const fetchERs = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (genderFilter !== 'no_preference') params.gender = genderFilter;
      if (minRating > 0) params.minRating = minRating;

      const res = await erApi.getAvailableERs(params);
      if (res.success) {
        setErs(res.ers || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch available responders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchERs();
  }, [genderFilter, minRating]);

  // Real-time listener for chat acceptance and decline
  useEffect(() => {
    if (!socket || !pendingChatId) return;

    const onAccept = (data) => {
      if (String(data.chatId) === String(pendingChatId)) {
        setAcceptedChat({ chatId: pendingChatId, erAlias: data.erAlias });
        setPendingChatId(null);
      }
    };

    const onDecline = (data) => {
      if (String(data.chatId) === String(pendingChatId)) {
        setError('The Responder was unable to accept your request at this moment. Please select another senior.');
        setPendingChatId(null);
      }
    };

    socket.on('chat:accept', onAccept);
    socket.on('chat:decline', onDecline);

    return () => {
      socket.off('chat:accept', onAccept);
      socket.off('chat:decline', onDecline);
    };
  }, [socket, pendingChatId]);

  const handleSkip = (erId) => {
    setSkippedERIds(prev => new Set([...prev, erId]));
  };

  const handleInitiateConnect = (erId) => {
    setSelectedERId(erId);
    setShowMoodModal(true);
  };

  const handleConfirmRequest = async () => {
    setShowMoodModal(false);
    setError('');
    try {
      setLoading(true);
      setAcceptedChat(null);
      const res = await chatApi.createChat({
        erId: selectedERId,
        moodBefore
      });

      if (res.success && res.chat) {
        setPendingChatId(res.chat.id);
      }
    } catch (err) {
      setError(err.message || 'Could not send chat request');
    } finally {
      setLoading(false);
    }
  };

  const handleMatchBest = async () => {
    try {
      setLoading(true);
      setError('');
      const params = { matchBest: 'true' };
      if (genderFilter !== 'no_preference') params.gender = genderFilter;

      const res = await erApi.getAvailableERs(params);
      if (res.success && res.bestMatch) {
        setSelectedERId(res.bestMatch._id || res.bestMatch.id);
        setShowMoodModal(true);
      } else {
        setError('No available responders match your filter criteria right now. Please check back shortly.');
      }
    } catch (err) {
      setError(err.message || 'Unable to find automatic match');
    } finally {
      setLoading(false);
    }
  };

  const visibleERs = ers.filter(er => !skippedERIds.has(er._id || er.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-dark-brown">Find a Peer Responder</h1>
          <p className="text-xs text-dark-brown/70 mt-1">
            Choose an available senior peer to talk with. Your identity stays completely anonymous.
          </p>
        </div>

        <Button
          variant="secondary"
          size="md"
          onClick={handleMatchBest}
          disabled={loading || !!pendingChatId}
          icon={Sparkles}
        >
          Match with Best Rated Available
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-terracotta/10 border border-terracotta/30 text-terracotta text-xs animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {acceptedChat && (
        <div role="status" className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-sage/15 border border-sage/40 text-deep-green animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {acceptedChat.erAlias || 'Your responder'} accepted your request.
          </div>
          <Button size="sm" variant="primary" icon={ArrowRight} onClick={() => navigate(`/chat/${acceptedChat.chatId}`)}>
            Open Chat
          </Button>
        </div>
      )}

      {/* Filters Bar */}
      <Card className="bg-white/90 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-dark-brown flex items-center gap-1">
                <Filter className="w-3.5 h-3.5 text-sage" />
                Gender Preference:
              </span>
              <div className="flex items-center gap-1">
                {[
                  { value: 'no_preference', label: 'No Preference' },
                  { value: 'female', label: 'Female' },
                  { value: 'male', label: 'Male' }
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setGenderFilter(opt.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      genderFilter === opt.value
                        ? 'bg-sage text-cream shadow-soft'
                        : 'bg-cream text-dark-brown/70 hover:bg-cream/80'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-dark-brown">Min Rating:</span>
              <select
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="px-2 py-1 text-xs bg-cream border border-warm-brown/20 rounded-xl focus:outline-none"
              >
                <option value={0}>Any Rating</option>
                <option value={3.5}>3.5+ Stars</option>
                <option value={4.0}>4.0+ Stars</option>
                <option value={4.5}>4.5+ Stars</option>
              </select>
            </div>
          </div>

          <button
            onClick={fetchERs}
            className="text-xs text-deep-green font-semibold flex items-center gap-1 hover:underline"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Availability
          </button>
        </div>
      </Card>

      {/* ERs Grid */}
      {loading && !pendingChatId ? (
        <div className="py-16 text-center text-xs text-dark-brown/60">
          <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Checking online responders...
        </div>
      ) : visibleERs.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-sm font-bold text-dark-brown mb-1">No Responders Found</p>
          <p className="text-xs text-dark-brown/70 max-w-md mx-auto mb-4">
            All appointed seniors are currently either offline or assisting other students. Please try clearing filters or check back shortly.
          </p>
          <Button variant="outline" size="sm" onClick={() => { setGenderFilter('no_preference'); setMinRating(0); setSkippedERIds(new Set()); }}>
            Reset Filters & View All
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleERs.map(er => (
            <ERCard
              key={er._id || er.id}
              er={er}
              onConnect={handleInitiateConnect}
              onSkip={handleSkip}
            />
          ))}
        </div>
      )}

      {/* Mood Check-In Modal before sending request */}
      <Modal
        isOpen={showMoodModal}
        onClose={() => setShowMoodModal(false)}
        title="Quick Check-In Before Connecting"
      >
        <div className="space-y-6">
          <MoodSlider
            value={moodBefore}
            onChange={(v) => setMoodBefore(v)}
            title="How would you describe your mood right now? (Optional)"
          />

          <p className="text-xs text-dark-brown/70 leading-relaxed bg-sage/10 p-3 rounded-2xl">
            This gives your responder gentle context on how to support you. You can adjust or skip anytime.
          </p>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowMoodModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleConfirmRequest}>
              Send Chat Request
            </Button>
          </div>
        </div>
      </Modal>

      {pendingChatId && (
        <p role="status" className="text-xs text-dark-brown/65 text-center">
          Your request has been sent. We’ll let you know when the responder accepts.
        </p>
      )}
    </div>
  );
};

export default ERPicker;
