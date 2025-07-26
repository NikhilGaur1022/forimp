import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  premium?: boolean;
}

const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  hover = false,
  premium = false 
}) => {
  const baseClasses = premium ? 'card-premium' : 'card';
  const hoverClasses = hover ? 'card-hover' : '';
  
  return (
  <div className={`${baseClasses} ${hoverClasses} p-6 ${className}`}>
    {children}
  </div>
  );
};

export default Card;
