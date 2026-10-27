import React from 'react';

const Avatar = ({ name = 'Anonymous', size = 'md', className = '' }) => {
  const getInitials = (str) => {
    if (!str) return 'A';
    const clean = str.replace(/[0-9]/g, '');
    return clean.slice(0, 2).toUpperCase() || str.slice(0, 2).toUpperCase();
  };

  const getBgColor = (str) => {
    const colors = [
      'bg-sage/20 text-deep-green border-sage/40',
      'bg-butter/40 text-warm-brown border-butter',
      'bg-emerald-100 text-emerald-800 border-emerald-300',
      'bg-amber-100 text-amber-800 border-amber-300',
      'bg-teal-100 text-teal-800 border-teal-300'
    ];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-14 h-14 text-base font-bold'
  };

  return (
    <div
      className={`inline-flex items-center justify-center rounded-2xl border ${getBgColor(name)} ${sizes[size]} ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};

export default Avatar;
