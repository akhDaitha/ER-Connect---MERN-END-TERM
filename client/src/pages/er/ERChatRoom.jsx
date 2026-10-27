import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldCheck, XCircle, AlertCircle, HeartHandshake } from 'lucide-react';
import Button from '../../components/shared/Button';
import Badge from '../../components/shared/Badge';
import Avatar from '../../components/shared/Avatar';
import ChatBubble from '../../components/chat/ChatBubble';
import ChatInput from '../../components/chat/ChatInput';
import TypingIndicator from '../../components/chat/TypingIndicator';
import EmptyChat from '../../components/chat/EmptyChat';
import useAuth from '../../hooks/useAuth';
import useSocket from '../../hooks/useSocket';
import * as chatApi from '../../api/chats';
import { mergeChatMessages } from '../../utils/chatMessages';

const ERChatRoom = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [crisisAlert, setCrisisAlert] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, crisisAlert]);

  useEffect(() => {
    const loadChatData = async () => {
      try {
        setLoading(true);
        setError('');

        const res = await chatApi.getMyChats();
        const thisChat = res.chats?.find(c => c.id === chatId);
        if (thisChat) {
          setChat(thisChat);
        }

        const msgRes = await chatApi.getMessages(chatId);
        if (msgRes.success) {
          setMessages(current => mergeChatMessages(current, msgRes.messages || []));
        }
      } catch (err) {
        setError(err.message || 'Failed to load conversation');
      } finally {
        setLoading(false);
      }
    };

    loadChatData();
  }, [chatId]);

  useEffect(() => {
    if (!socket || !chatId) return;

    socket.emit('chat:join', { chatId }, (res) => {
      if (res?.error) setError(res.error);
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
        setChat(prev => ({ ...prev, status: 'ended' }));
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
      navigate('/er/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to end chat');
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      {/* Top Bar with Strict Anonymity Projections */}
      <div className="bg-white/95 border border-warm-brown/15 rounded-t-3xl p-4 shadow-soft flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Avatar name={chat?.peer?.alias || 'Student'} size="md" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-base text-dark-brown">
                {chat?.peer?.alias || 'Anonymous Student'}
              </h2>
              <Badge variant="sage" size="sm">
                {chat?.peer?.year || '1st Year'}
              </Badge>
              <Badge variant="butter" size="sm" className="capitalize">
                {chat?.peer?.gender}
              </Badge>
            </div>
            <p className="text-[11px] text-dark-brown/60 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-sage" />
              Batch: {chat?.peer?.batch} &bull; Client identity protected
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {chat?.status !== 'ended' ? (
            <Button
              variant="dangerOutline"
              size="sm"
              onClick={handleEndChat}
              icon={XCircle}
            >
              End Session
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/er/dashboard')}
            >
              Back to Desk
            </Button>
          )}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-cream/70 border-x border-warm-brown/15 space-y-2">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-terracotta/10 border border-terracotta/30 text-terracotta text-xs mb-3">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {crisisAlert && (
          <div className="bg-amber-100 border border-amber-300 rounded-2xl p-4 my-3 text-dark-brown text-xs">
            <div className="flex items-start gap-2">
              <HeartHandshake className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-900 font-bold mb-1">
                  Gentle Responder Guidance: Potential Crisis Keywords Detected
                </strong>
                <p className="text-amber-800 leading-relaxed mb-2">
                  The system has shared emergency helplines with the student. Please remain calm, compassionate, and non-judgmental. If they are in acute distress, kindly remind them that professional medical and counseling hotlines (such as Tele-MANAS 14416) are available free 24/7.
                </p>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-full text-xs text-dark-brown/60">
            <div className="w-6 h-6 border-3 border-sage border-t-transparent rounded-full animate-spin mr-2"></div>
            Loading chat messages...
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

      {/* Input */}
      <ChatInput
        onSend={handleSendMessage}
        onTyping={handleTyping}
        disabled={chat?.status === 'ended'}
        placeholder={chat?.status === 'ended' ? 'Chat session ended.' : 'Respond with empathy and patience...'}
      />
    </div>
  );
};

export default ERChatRoom;
