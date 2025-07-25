import React from 'react';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  disabled?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
  children, 
  onClick, 
  type = 'button', 
  className = '',
  disabled = false 
}) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    className={`bg-yellow-400 text-gray-900 hover:bg-yellow-300 px-6 py-3 rounded-lg transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed tactile-3d tactile-3d--yellow ${className}`}
  >
    {children}
  </button>
);

export default PrimaryButton;
export type { PrimaryButtonProps };
