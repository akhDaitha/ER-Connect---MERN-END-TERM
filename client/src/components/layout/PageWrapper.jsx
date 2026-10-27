import React from 'react';

const PageWrapper = ({ children, maxWidth = 'max-w-5xl', className = '' }) => {
  return (
    <main className={`w-full mx-auto px-4 sm:px-6 py-8 ${maxWidth} ${className}`}>
      {children}
    </main>
  );
};

export default PageWrapper;
