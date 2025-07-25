import React from 'react';

const LoadingSpinner: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-dental-500 mb-4" />
    <div className="text-lg text-neutral-600 font-medium">{text}</div>
  </div>
);

export default LoadingSpinner;
