import React from 'react';

const TypingIndicator = ({ alias = 'Peer' }) => {
  return (
    <div className="flex items-center gap-2 py-1 px-3 text-xs text-dark-brown/60 italic animate-fade-in">
      <span>{alias} is typing</span>
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-sage animate-bounce"></span>
        <span className="w-1.5 h-1.5 rounded-full bg-sage animate-bounce [animation-delay:0.2s]"></span>
        <span className="w-1.5 h-1.5 rounded-full bg-sage animate-bounce [animation-delay:0.4s]"></span>
      </div>
    </div>
  );
};

export default TypingIndicator;
