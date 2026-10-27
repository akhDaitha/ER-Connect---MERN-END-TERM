import React from 'react';

const ChatBubble = ({ message, isMe }) => {
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex flex-col mb-3 ${isMe ? 'items-end' : 'items-start'}`}>
      <div className="flex items-center gap-1.5 mb-1 px-1">
        <span className="text-[11px] font-bold text-dark-brown/70">
          {isMe ? 'You' : message.senderAlias || 'Peer'}
        </span>
        <span className="text-[10px] text-dark-brown/40">
          {formatTime(message.createdAt)}
        </span>
      </div>

      <div
        className={`max-w-[85%] sm:max-w-md px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-soft whitespace-pre-wrap break-words ${
          isMe
            ? 'bg-sage text-cream rounded-tr-none'
            : 'bg-white text-dark-brown border border-warm-brown/10 rounded-tl-none'
        }`}
      >
        {message.text}
      </div>
    </div>
  );
};

export default ChatBubble;
