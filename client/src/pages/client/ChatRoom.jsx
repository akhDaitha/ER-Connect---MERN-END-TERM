import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, PhoneCall, Flag, XCircle, Heart, Star, Sparkles, AlertCircle } from 'lucide-react';
import Card from '../../components/shared/Card';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Avatar from '../../components/shared/Avatar';
import Modal from '../../components/shared/Modal';
import StarRating from '../../components/shared/StarRating';
import MoodSlider from '../../components/shared/MoodSlider';
import CrisisBanner from '../../components/shared/CrisisBanner';
import ChatBubble from '../../components/chat/ChatBubble';
import ChatInput from '../../components/chat/ChatInput';
import TypingIndicator from '../../components/chat/TypingIndicator';
import EmptyChat from '../../components/chat/EmptyChat';
import useAuth from '../../hooks/useAuth';
import useSocket from '../../hooks/useSocket';
import * as chatApi from '../../api/chats';
import * as reportApi from '../../api/reports';
import { mergeChatMessages } from '../../utils/chatMessages';

const ChatRoom = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [crisisAlert, setCrisisAlert] = useState(null);

  // Modals
  const [showEndModal, setShowEndModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Rating & Mood after
  const [rating, setRating] = useState(5);
  const [moodAfter, setMoodAfter] = useState(4);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  // Report fields
  const [reportReason, setReportReason] = useState('unhelpful');
  const [reportDetails, setReportDetails] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, crisisAlert]);

  // Load chat & messages
  useEffect(() => {
    const loadChatData = async () => {
      try {
        setLoading(true);
        setError('');

        const chatsRes = await chatApi.getMyChats();
        const thisChat = chatsRes.chats?.find(c => c.id === chatId);
        if (thisChat) {
          setChat(thisChat);
          if (thisChat.status === 'ended') {
            setShowEndModal(true);
          }
        }

        const msgRes = await chatApi.getMessages(chatId);
        if (msgRes.success) {
          setMessages(current => mergeChatMessages(current, msgRes.messages || []));
        }
      } catch (err) {
        setError(err.message || 'Failed to load conversation history');
      } finally {
        setLoading(false);
      }
    };

    loadChatData();
  }, [chatId]);

  // Socket room join & listeners
  useEffect(() => {
    if (!socket || !chatId) return;

    socket.emit('chat:join', { chatId }, (res) => {
      if (res?.error) {
        setError(res.error);
      }
    });

    const onNewMessage = (msg) => {
      if (String(msg.chatId) === String(chatId)) {
        setMessages(prev => mergeChatMessages(prev, [{
          id: msg.id,
          chatId: msg.chatId,
          senderAlias: msg.senderAlias,
          senderRole: msg.senderRole,
          text: msg.text,
          createdAt: msg.createdAt,
          isMe: msg.senderRole === user?.role && msg.senderAlias === user?.alias
        }]));
      }
    };

    const onTypingStart = (data) => {
      if (data.chatId === chatId) setIsTyping(true);
    };

    const onTypingStop = (data) => {
      if (data.chatId === chatId) setIsTyping(false);
    };

    const onCrisis = (data) => {
      if (data.chatId === chatId) {
        setCrisisAlert(data);
      }
    };

    const onChatEnd = (data) => {
      if (data.chatId === chatId) {
        setChat(prev => ({ ...prev, status: 'ended', endedBy: data.endedBy }));
        setShowEndModal(true);
      }
    };

    socket.on('message:new', onNewMessage);
    socket.on('typing:start', onTypingStart);
    socket.on('typing:stop', onTypingStop);
    socket.on('message:crisis', onCrisis);
    socket.on('chat:end', onChatEnd);

    return () => {
      socket.off('message:new', onNewMessage);
      socket.off('typing:start', onTypingStart);
      socket.off('typing:stop', onTypingStop);
      socket.off('message:crisis', onCrisis);
      socket.off('chat:end', onChatEnd);
    };
  }, [socket, chatId, user]);

  const handleSendMessage = async (text) => {
    try {
      const res = await chatApi.sendMessage(chatId, text);
      setError('');
      setMessages(prev => mergeChatMessages(prev, [{ ...res.message, isMe: true }]));
      return true;
    } catch (err) {
      setError(err.message || 'Failed to send message');
      return false;
    }
  };

  const handleTyping = (typing) => {
    if (!socket) return;
    socket.emit(typing ? 'typing:start' : 'typing:stop', { chatId });
  };

  const handleEndChat = async () => {
    try {
      await chatApi.endChat(chatId);
      setChat(prev => ({ ...prev, status: 'ended' }));
      setShowEndModal(true);
    } catch (err) {
      setError(err.message || 'Failed to end chat');
    }
  };

  const handleRateSubmit = async () => {
    try {
      await chatApi.rateChat(chatId, { rating, moodAfter });
      setRatingSubmitted(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit rating');
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    try {
      await reportApi.createReport({
        chatId,
        reason: reportReason,
        details: reportDetails
      });
      setReportSuccess('Your report has been submitted to administration. Thank you for keeping our community safe.');
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess('');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to submit report');
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Top Chat Header */}
      <div className="bg-white/95 border border-warm-brown/15 rounded-t-3xl p-4 shadow-soft flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Avatar name={chat?.peer?.alias || 'Responder'} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-dark-brown">
                {chat?.peer?.alias || 'Senior Responder'}
              </h2>
              <Badge variant="sage" size="sm">Peer Support</Badge>
            </div>
            <p className="text-[11px] text-dark-brown/60 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-sage" />
              AES-256-GCM Encrypted &bull; Anonymous Session
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowReportModal(true)}
            className="text-terracotta hover:bg-terracotta/10 text-xs"
            icon={Flag}
          >
            Report
          </Button>

          {chat?.status !== 'ended' && (
            <Button
              variant="dangerOutline"
              size="sm"
              onClick={handleEndChat}
              className="text-xs"
              icon={XCircle}
            >
              End Chat
            </Button>
          )}
        </div>
      </div>

      {/* Messages Stream Container */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-cream/70 border-x border-warm-brown/15 space-y-2">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-terracotta/10 border border-terracotta/30 text-terracotta text-xs mb-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Crisis Banner if triggered */}
        {crisisAlert && (
          <CrisisBanner
            notice={crisisAlert.notice}
            helplines={crisisAlert.helplines}
          />
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full text-xs text-dark-brown/60">
            <div className="w-6 h-6 border-3 border-sage border-t-transparent rounded-full animate-spin mr-2"></div>
            Loading encrypted conversation...
          </div>
        ) : messages.length === 0 ? (
          <EmptyChat peerAlias={chat?.peer?.alias} />
        ) : (
          messages.map((m, idx) => (
            <ChatBubble
              key={m.id || idx}
              message={m}
              isMe={m.isMe}
            />
          ))
        )}

        {isTyping && <TypingIndicator alias={chat?.peer?.alias} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <ChatInput
        onSend={handleSendMessage}
        onTyping={handleTyping}
        disabled={chat?.status === 'ended'}
        placeholder={chat?.status === 'ended' ? 'This conversation has ended.' : 'Share your feelings freely (anonymous)...'}
      />

      {/* Rating & Post-Chat Mood Modal */}
      <Modal
        isOpen={showEndModal}
        onClose={() => navigate('/dashboard')}
        title="Chat Ended — Feedback & Check-In"
      >
        <div className="space-y-6">
          {ratingSubmitted ? (
            <div className="p-6 text-center text-deep-green font-bold text-sm bg-sage/10 rounded-2xl animate-fade-in">
              <Sparkles className="w-8 h-8 text-sage mx-auto mb-2" />
              Thank you! Your feedback helps keep our peer community safe and supportive.
            </div>
          ) : (
            <>
              <div>
                <p className="text-xs font-bold text-dark-brown mb-2">
                  How was your experience talking with {chat?.peer?.alias}?
                </p>
                <div className="flex justify-center p-3 bg-white rounded-2xl border border-warm-brown/10 mb-2">
                  <StarRating
                    rating={rating}
                    interactive
                    onChange={(val) => setRating(val)}
                    size="lg"
                  />
                </div>
                <p className="text-[11px] text-center text-dark-brown/50">
                  Ratings use a balanced community-weighted formula to ensure fair evaluations.
                </p>
              </div>

              <div>
                <MoodSlider
                  value={moodAfter}
                  onChange={(v) => setMoodAfter(v)}
                  title="How are you feeling after this conversation?"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-warm-brown/10">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReportModal(true)}
                  className="text-terracotta text-xs"
                  icon={Flag}
                >
                  Report an issue
                </Button>
                <Button variant="primary" size="md" onClick={handleRateSubmit}>
                  Submit & Finish
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Report Chat Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Report This Conversation"
      >
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <p className="text-xs text-dark-brown/70 leading-relaxed">
            Your safety and emotional well-being are paramount. Submitted reports are carefully audited by institute counselors.
          </p>

          {reportSuccess && (
            <div className="p-3 bg-sage/20 text-deep-green text-xs rounded-2xl font-semibold">
              {reportSuccess}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-dark-brown mb-1.5">
              Reason for Report
            </label>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-cream border border-warm-brown/20 rounded-2xl focus:outline-none"
            >
              <option value="harassment">Harassment or rude behavior</option>
              <option value="inappropriate">Inappropriate or offensive remarks</option>
              <option value="unhelpful">Dismissive or unhelpful response</option>
              <option value="other">Other concern</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-dark-brown mb-1.5">
              Additional Details (Optional)
            </label>
            <textarea
              rows={3}
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              maxLength={1000}
              placeholder="Briefly describe what happened..."
              className="w-full p-3 text-xs bg-cream border border-warm-brown/20 rounded-2xl focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowReportModal(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" type="submit">
              Submit Report
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ChatRoom;
