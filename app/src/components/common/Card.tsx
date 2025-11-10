import React from 'react';

interface CardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  hoverable?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  onClick,
  className = '',
  hoverable = false,
}) => {
  const hoverStyles = hoverable
    ? 'cursor-pointer hover:shadow-md transition-shadow duration-200'
    : '';

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-2xl p-6 shadow-sm ${hoverStyles} ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;

