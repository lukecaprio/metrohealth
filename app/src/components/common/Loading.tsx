import React from 'react';

interface LoadingProps {
  message?: string;
}

const Loading: React.FC<LoadingProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600"></div>
      <p className="mt-4 text-lg text-gray-600">{message}</p>
    </div>
  );
};

export default Loading;

