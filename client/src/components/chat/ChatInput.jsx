import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import Button from '../shared/Button';

const ChatInput = ({ onSend, onTyping, disabled = false, placeholder = 'Type a kind and supportive message...' }) => {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const typingTimeoutRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;

    setSending(true);
    Promise.resolve(onSend(text.trim()))
      .then((sent) => {
        if (sent !== false) setText('');
      })
      .finally(() => setSending(false));

    if (onTyping) onTyping(false);
  };

  const handleChange = (e) => {
    setText(e.target.value);

    if (onTyping) {
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 2000);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 p-3 bg-white/90 border-t border-warm-brown/10 rounded-b-3xl">
      <input
        type="text"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled || sending}
        placeholder={placeholder}
        maxLength={2000}
        className="flex-1 px-4 py-2.5 text-sm bg-cream/60 focus:bg-white border border-warm-brown/20 focus:border-sage rounded-2xl focus:outline-none transition-colors disabled:opacity-50"
      />
      <Button
        type="submit"
        variant="primary"
        size="md"
        disabled={disabled || sending || !text.trim()}
        className="shrink-0"
        icon={Send}
      >
        Send
      </Button>
    </form>
  );
};

export default ChatInput;
