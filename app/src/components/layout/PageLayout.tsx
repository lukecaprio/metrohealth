import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  title,
  showBack = false,
  onBack,
  className = '',
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {(showBack || title) && (
        <div className="bg-white shadow-sm">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center">
            {showBack && (
              <button
                onClick={handleBack}
                className="mr-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Go back"
              >
                <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
              </button>
            )}
            {title && (
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            )}
          </div>
        </div>
      )}
      <div className="max-w-2xl mx-auto px-6 py-6">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;

