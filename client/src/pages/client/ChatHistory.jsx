import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { History, Heart, Star, Calendar, MessageSquare } from 'lucide-react';
import Card from '../../components/shared/Card';
import Badge from '../../components/shared/Badge';
import StarRating from '../../components/shared/StarRating';
import * as chatApi from '../../api/chats';

const ChatHistory = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await chatApi.getMyChats();
        if (res.success) {
          setChats(res.chats || []);
        }
      } catch (err) {
        console.error('Failed to fetch chat history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <History className="w-5 h-5 text-sage" />
          <h1 className="text-2xl font-extrabold text-dark-brown">Your Conversation History</h1>
        </div>
        <p className="text-xs text-dark-brown/70">
          Reflect on past sessions. All chats remain completely confidential.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-dark-brown/60">
          <div className="w-8 h-8 border-4 border-sage border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          Loading past sessions...
        </div>
      ) : chats.length === 0 ? (
        <Card className="text-center py-12 bg-white/90">
          <MessageSquare className="w-10 h-10 text-sage/40 mx-auto mb-3" />
          <p className="text-sm font-bold text-dark-brown mb-1">No Past Conversations</p>
          <p className="text-xs text-dark-brown/70 max-w-sm mx-auto mb-4">
            When you chat with an Emotional Responder, records of your completed sessions and ratings will show here.
          </p>
          <Link to="/find-er" className="text-xs font-bold text-deep-green hover:underline">
            Talk to someone now →
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {chats.map((c) => (
            <Card key={c.id} className="bg-white/90">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-sm text-dark-brown">
                      Session with {c.peer?.alias || 'Senior Responder'}
                    </h3>
                    <Badge variant={c.status === 'ended' ? 'sage' : c.status === 'active' ? 'butter' : 'gray'} size="sm">
                      {c.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-dark-brown/60">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-sage" />
                      {new Date(c.createdAt).toLocaleDateString([], { dateStyle: 'medium' })}
                    </span>
                    <span>&bull;</span>
                    <span>Ended by: <strong className="capitalize">{c.endedBy || 'Session'}</strong></span>
                    {c.moodBefore && (
                      <>
                        <span>&bull;</span>
                        <span>Mood Before: <strong>{c.moodBefore}/5</strong></span>
                      </>
                    )}
                    {c.moodAfter && (
                      <>
                        <span>&bull;</span>
                        <span>Mood After: <strong>{c.moodAfter}/5</strong></span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {c.rating ? (
                    <div className="flex items-center gap-1">
                      <StarRating rating={c.rating} size="sm" />
                    </div>
                  ) : (
                    <span className="text-[11px] text-dark-brown/40 italic">Not rated</span>
                  )}
                  {c.status === 'active' && (
                    <Link
                      to={`/chat/${c.id}`}
                      className="px-3 py-1.5 rounded-xl bg-sage text-cream font-bold text-xs hover:bg-deep-green transition-colors"
                    >
                      Resume
                    </Link>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChatHistory;
