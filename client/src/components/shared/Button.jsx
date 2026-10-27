import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  onClick,
  className = '',
  icon: Icon
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-2xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-sage hover:bg-deep-green text-cream shadow-soft hover:shadow-hover focus:ring-sage',
    secondary: 'bg-butter hover:bg-amber-300 text-dark-brown shadow-soft focus:ring-butter',
    outline: 'border border-sage/40 hover:border-sage text-dark-brown hover:bg-sage/10 focus:ring-sage',
    ghost: 'text-dark-brown/80 hover:text-dark-brown hover:bg-sage/10 focus:ring-sage',
    danger: 'bg-terracotta hover:bg-terracotta/90 text-cream shadow-soft focus:ring-terracotta',
    dangerOutline: 'border border-terracotta/40 text-terracotta hover:bg-terracotta/10 focus:ring-terracotta'
  };

  const sizes = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5'
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

export default Button;
