import React from 'react';

const Badge = ({ children, variant = 'default', size = 'sm', className = '' }) => {
  const variants = {
    default: 'bg-cream text-dark-brown border border-warm-brown/20',
    sage: 'bg-sage/15 text-deep-green border border-sage/30',
    butter: 'bg-butter/30 text-warm-brown border border-butter',
    terracotta: 'bg-terracotta/15 text-terracotta border border-terracotta/30',
    gray: 'bg-gray-100 text-gray-700 border border-gray-200'
  };

  const sizes = {
    sm: 'text-xs px-2.5 py-0.5 rounded-full font-medium',
    md: 'text-sm px-3 py-1 rounded-full font-medium'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
