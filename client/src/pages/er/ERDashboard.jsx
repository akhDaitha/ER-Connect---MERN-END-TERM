import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToggleLeft, ToggleRight, Star, MessageSquare, Clock, CheckCircle2, AlertCircle, History } from 'lucide-react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import StarRating from '../../components/shared/StarRating';
import RequestCard from '../../components/er/RequestCard';
import useAuth from '../../hooks/useAuth';
import useSocket from '../../hooks/useSocket';
import * as erApi from '../../api/ers';
import * as chatApi from '../../api/chats';

const ERDashboard = () => {
  const { user, refreshUser } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [isAvailable, setIsAvailable] = useState(user?.isAvailable || false);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [activeChats, setActiveChats] = useState([]);
  const [pastChats, setPastChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadChats = async () => {
    try {
      setLoading(true);
      const res = await chatApi.getMyChats();
      if (res.success && res.chats) {
        const active = res.chats.filter(c => c.status === 'active');
        const pending = res.chats.filter(c => c.status === 'pending').map(c => ({
          chatId: c.id,
          clientGender: c.peer?.gender,
          clientBatch: c.peer?.batch,
          batchYear: c.peer?.year,
          moodBefore: c.moodBefore,
          createdAt: c.createdAt
        }));
        const past = res.chats.filter(c => c.status !== 'active' && c.status !== 'pending');
        setActiveChats(active);
        setIncomingRequests(pending);
        setPastChats(past);
      }
    } catch (err) {
      console.error('Error loading ER chats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  // Sync availability state with user profile
  useEffect(() => {
    if (user) {
      setIsAvailable(user.isAvailable);
    }
  }, [user]);

  // Real-time listener for incoming chat requests
  useEffect(() => {
    if (!socket) return;

    const onIncomingRequest = (req) => {
      setIncomingRequests(prev => [req, ...prev.filter(item => String(item.chatId) !== String(req.chatId))]);
    };

    socket.on('chat:request', onIncomingRequest);

    return () => {
      socket.off('chat:request', onIncomingRequest);
    };
  }, [socket]);

  const handleToggleAvailability = async () => {
    try {
      const nextState = !isAvailable;
      setIsAvailable(nextState);
      await erApi.updateAvailability(nextState);
      if (socket) {
        socket.emit('er:availability', { isAvailable: nextState });
      }
      refreshUser();
    } catch (err) {
      setError(err.message || 'Failed to update availability status');
      setIsAvailable(!isAvailable);
    }
  };

  const handleAcceptRequest = async (chatId) => {
    setActionLoading(true);
    try {
      await chatApi.acceptChat(chatId);
      setIncomingRequests(prev => prev.filter(r => r.chatId !== chatId));
      navigate(`/er/chat/${chatId}`);
    } catch (err) {
      setError(err.message || 'Failed to accept chat request');
      setActionLoading(false);
    }
  };

  const handleDeclineRequest = async (chatId) => {
    setActionLoading(true);
    try {
      await chatApi.declineChat(chatId);
      setIncomingRequests(prev => prev.filter(r => r.chatId !== chatId));
    } catch (err) {
      setError(err.message || 'Failed to decline chat request');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header and Online Switch */}
      <div className="bg-white/95 border border-warm-brown/15 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-deep-green">
              Responder Desk
            </span>
            <Badge variant="butter" size="sm">Senior Peer: {user?.alias}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-brown">
            Thank you for being here for your peers.
          </h1>
          <p className="text-xs sm:text-sm text-dark-brown/70 mt-1">
            Toggle your availability to start receiving anonymous student support requests.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 bg-cream/70 p-3 rounded-2xl border border-warm-brown/15">
          <div className="text-right">
            <span className="block text-xs font-bold text-dark-brown">Status</span>
            <span className={`text-[11px] font-semibold ${isAvailable ? 'text-emerald-600' : 'text-dark-brown/50'}`}>
              {isAvailable ? 'Online & Available' : 'Offline'}
            </span>
          </div>
          <button
            onClick={handleToggleAvailability}
            className="focus:outline-none transition-transform hover:scale-105"
            title="Toggle online availability"
          >
            {isAvailable ? (
              <ToggleRight className="w-10 h-10 text-sage" />
            ) : (
              <ToggleLeft className="w-10 h-10 text-dark-brown/30" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 rounded-2xl bg-terracotta/10 border border-terracotta/30 text-terracotta text-xs animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-white/90">
          <span className="text-xs text-dark-brown/60 font-semibold block mb-1">Your Peer Rating</span>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold text-dark-brown">
              {(user?.avgRating || 4.0).toFixed(1)}
            </span>
            <StarRating rating={user?.avgRating || 4.0} size="sm" count={user?.ratingCount || 0} />
          </div>
          <p className="text-[11px] text-dark-brown/50 mt-1">Weighted Bayesian peer average</p>
        </Card>

        <Card className="bg-white/90">
          <span className="text-xs text-dark-brown/60 font-semibold block mb-1">Active Conversations</span>
          <div className="text-2xl font-extrabold text-deep-green">
            {activeChats.length} / 3
          </div>
          <p className="text-[11px] text-dark-brown/50 mt-1">Max 3 concurrent chats</p>
        </Card>

        <Card className="bg-white/90">
          <span className="text-xs text-dark-brown/60 font-semibold block mb-1">Total Completed</span>
          <div className="text-2xl font-extrabold text-dark-brown">
            {pastChats.length}
          </div>
          <p className="text-[11px] text-dark-brown/50 mt-1">Students supported so far</p>
        </Card>
      </div>

      {/* Incoming Requests Queue */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-dark-brown flex items-center gap-2">
            <Clock className="w-4 h-4 text-sage" />
            Incoming Support Requests ({incomingRequests.length})
          </h2>
        </div>

        {incomingRequests.length === 0 ? (
          <Card className="text-center py-8 bg-white/60">
            <p className="text-xs text-dark-brown/60">
              No pending requests. When a student requests to speak with you, it will appear here in real time.
            </p>
          </Card>
        ) : (
          incomingRequests.map((req) => (
            <RequestCard
              key={req.chatId}
              request={req}
              onAccept={handleAcceptRequest}
              onDecline={handleDeclineRequest}
              isProcessing={actionLoading}
            />
          ))
        )}
      </div>

      {/* Active Chats Ongoing */}
      <div className="space-y-3">
        <h2 className="text-base font-bold text-dark-brown flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-sage" />
          Active Chat Sessions ({activeChats.length})
        </h2>

        {activeChats.length === 0 ? (
          <Card className="text-center py-6 bg-white/60 text-xs text-dark-brown/60">
            You do not have any active chats in progress.
          </Card>
        ) : (
          <div className="space-y-3">
            {activeChats.map((c) => (
              <Card key={c.id} className="bg-white flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-dark-brown">
                      Student Session ({c.peer?.alias || 'Student'})
                    </span>
                    <Badge variant="sage" size="sm">{c.peer?.year || '1st Year'}</Badge>
                  </div>
                  <p className="text-xs text-dark-brown/60">
                    Gender: <strong className="capitalize">{c.peer?.gender}</strong> &bull; Batch: {c.peer?.batch}
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate(`/er/chat/${c.id}`)}
                >
                  Enter Room
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Past Chat Log */}
      <Card className="bg-white/90">
        <div className="flex items-center gap-2 mb-4">
          <History className="w-4 h-4 text-sage" />
          <h2 className="text-base font-bold text-dark-brown">Recent Completed Sessions</h2>
        </div>

        {pastChats.length === 0 ? (
          <p className="text-xs text-dark-brown/50 text-center py-4">No completed sessions yet.</p>
        ) : (
          <div className="divide-y divide-warm-brown/10 text-xs">
            {pastChats.slice(0, 5).map((c) => (
              <div key={c.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-dark-brown">Student ({c.peer?.alias})</span>
                  <span className="text-dark-brown/50 ml-2">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="gray" size="sm">{c.status.toUpperCase()}</Badge>
                  {c.rating && <span className="font-bold text-amber-500">★ {c.rating}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ERDashboard;
