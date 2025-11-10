import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  BeakerIcon, 
  CalendarIcon, 
  ChatBubbleLeftIcon 
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  BeakerIcon as BeakerIconSolid,
  CalendarIcon as CalendarIconSolid,
  ChatBubbleLeftIcon as ChatBubbleLeftIconSolid,
} from '@heroicons/react/24/solid';

const PatientBottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);

  const navItems = [
    {
      path: '/patient/dashboard',
      label: 'Home',
      Icon: HomeIcon,
      IconSolid: HomeIconSolid,
    },
    {
      path: '/patient/test-results',
      label: 'Results',
      Icon: BeakerIcon,
      IconSolid: BeakerIconSolid,
    },
    {
      path: '/patient/schedule',
      label: 'Schedule',
      Icon: CalendarIcon,
      IconSolid: CalendarIconSolid,
    },
    {
      path: '/patient/messages',
      label: 'Messages',
      Icon: ChatBubbleLeftIcon,
      IconSolid: ChatBubbleLeftIconSolid,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
      <div className="max-w-2xl mx-auto px-6 py-3">
        <div className="flex justify-around items-center">
          {navItems.map(({ path, label, Icon, IconSolid }) => {
            const active = isActive(path);
            const IconComponent = active ? IconSolid : Icon;

            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex flex-col items-center space-y-1 px-4 py-2 rounded-lg transition-colors ${
                  active ? 'text-purple-600' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <IconComponent className="w-6 h-6" />
                <span className="text-xs font-medium">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default PatientBottomNav;

