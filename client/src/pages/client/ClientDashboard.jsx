import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MessageSquareHeart, Heart, Sparkles, PhoneCall, History, ArrowRight, ShieldCheck, Clock } from 'lucide-react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import MoodSlider from '../../components/shared/MoodSlider';
import useAuth from '../../hooks/useAuth';
import * as chatApi from '../../api/chats';

const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeChat, setActiveChat] = useState(null);
  const [pastChats, setPastChats] = useState([]);
  const [currentMood, setCurrentMood] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await chatApi.getMyChats();
        if (res.success && res.chats) {
          const ongoing = res.chats.find(c => c.status === 'active' || c.status === 'pending');
          setActiveChat(ongoing || null);
          setPastChats(res.chats.filter(c => c.status !== 'active' && c.status !== 'pending').slice(0, 3));
        }
      } catch (err) {
        console.error('Error loading dashboard chats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sage/20 via-cream to-butter/20 border border-warm-brown/15 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-soft">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-deep-green flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Welcome back
            </span>
            <Badge variant="sage" size="sm">Anonymous: {user?.alias}</Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-dark-brown mb-2">
            How are you taking care of yourself today?
          </h1>
          <p className="text-xs sm:text-sm text-dark-brown/75 max-w-xl">
            Whenever academic stress or personal challenges feel heavy, trained senior peers are online and ready to listen.
          </p>
        </div>

        <div className="shrink-0">
          {activeChat ? (
            <Link to={`/chat/${activeChat.id}`}>
              <Button size="lg" variant="secondary" icon={ArrowRight}>
                {activeChat.status === 'active' ? 'Resume Ongoing Chat' : 'View Pending Request'}
              </Button>
            </Link>
          ) : (
            <Link to="/find-er">
              <Button size="lg" variant="primary" icon={MessageSquareHeart}>
                Talk to Someone Now
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Ongoing / Pending Chat Alert (if present) */}
      {activeChat && (
        <Card className="border-l-4 border-l-sage bg-white animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-sage/20 text-deep-green">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-dark-brown">
                    {activeChat.status === 'active' ? 'You have an active chat session' : 'Your chat request is pending'}
                  </h3>
                  <Badge variant={activeChat.status === 'active' ? 'sage' : 'butter'} size="sm">
                    {activeChat.status.toUpperCase()}
                  </Badge>
                </div>
                <p className="text-xs text-dark-brown/70 mt-0.5">
                  Connected with peer: <strong>{activeChat.peer?.alias || 'Responder'}</strong>
                </p>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/chat/${activeChat.id}`)}
              icon={ArrowRight}
            >
              Open Room
            </Button>
          </div>
        </Card>
      )}

      {/* Main Grid: Mood Check-in & Helpline */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mood Check-In Card */}
        <Card className="md:col-span-2 bg-white/90">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-dark-brown">Daily Mood Check-In</h2>
              <p className="text-xs text-dark-brown/60">Take a mindful pause to check in with how you are feeling</p>
            </div>
            <Heart className="w-5 h-5 text-sage fill-sage/20" />
          </div>

          <MoodSlider
            value={currentMood}
            onChange={(val) => setCurrentMood(val)}
            title="Select your current emotional state:"
          />

          {currentMood && (
            <div className="mt-4 p-3 rounded-2xl bg-sage/10 text-xs text-deep-green flex items-center justify-between animate-fade-in">
              <span>Thanks for checking in. Would you like to share thoughts with a friendly senior?</span>
              <Link to="/find-er" state={{ moodBefore: currentMood }}>
                <Button size="sm" variant="ghost" className="text-deep-green hover:underline">
                  Connect →
                </Button>
              </Link>
            </div>
          )}
        </Card>

        {/* Helpline Quick Card */}
        <Card className="bg-white/90 flex flex-col justify-between">
          <div>
            <div className="p-2.5 rounded-2xl bg-amber-100/60 text-amber-800 w-fit mb-3">
              <PhoneCall className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-dark-brown mb-1">Emergency Help</h3>
            <p className="text-xs text-dark-brown/70 leading-relaxed mb-4">
              Need immediate professional support? National and campus counseling helplines operate 24 hours a day.
            </p>
            <div className="p-3 rounded-2xl bg-cream border border-warm-brown/15 text-xs mb-3">
              <span className="font-bold text-dark-brown block">Tele-MANAS (Govt of India):</span>
              <a href="tel:14416" className="text-sm font-extrabold text-deep-green hover:underline">
                14416 (Toll-Free 24/7)
              </a>
            </div>
          </div>

          <Link to="/helpline">
            <Button variant="outline" size="sm" className="w-full">
              View All Helpline Contacts
            </Button>
          </Link>
        </Card>
      </div>

      {/* Recent History Preview */}
      <Card className="bg-white/90">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-sage" />
            <h2 className="text-base font-bold text-dark-brown">Recent Conversations</h2>
          </div>
          <Link to="/history" className="text-xs font-semibold text-deep-green hover:underline">
            View All History →
          </Link>
        </div>

        {pastChats.length === 0 ? (
          <div className="py-8 text-center text-xs text-dark-brown/60">
            You don't have any past conversations yet. Whenever you're ready, reach out to an available responder.
          </div>
        ) : (
          <div className="divide-y divide-warm-brown/10">
            {pastChats.map((c) => (
              <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-dark-brown">Chat with {c.peer?.alias || 'Responder'}</span>
                  <div className="text-[11px] text-dark-brown/50 mt-0.5">
                    {new Date(c.createdAt).toLocaleDateString()} &bull; Ended by {c.endedBy || 'session'}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={c.status === 'ended' ? 'sage' : 'gray'} size="sm">
                    {c.status.toUpperCase()}
                  </Badge>
                  {c.rating && (
                    <span className="text-amber-500 font-bold">★ {c.rating}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default ClientDashboard;
