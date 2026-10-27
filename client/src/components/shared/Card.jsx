import React from 'react';

const Card = ({
  children,
  className = '',
  onClick,
  hover = false
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white/80 backdrop-blur-sm border border-warm-brown/10 rounded-3xl p-6 shadow-soft transition-all duration-200 ${
        hover ? 'hover:shadow-hover hover:-translate-y-0.5 cursor-pointer' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;
