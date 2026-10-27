import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-md'
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-brown/40 backdrop-blur-sm animate-fade-in">
      <div
        className={`bg-cream border border-warm-brown/20 rounded-3xl w-full ${maxWidth} shadow-2xl overflow-hidden transform transition-all p-6 relative`}
      >
        <div className="flex items-center justify-between pb-4 border-b border-warm-brown/10 mb-4">
          <h3 className="text-lg font-bold text-dark-brown">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-dark-brown/60 hover:text-dark-brown hover:bg-sage/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
