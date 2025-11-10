import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HomeIcon,
  BellIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import {
  HomeIcon as HomeIconSolid,
  BellIcon as BellIconSolid,
  UserGroupIcon as UserGroupIconSolid,
  ChatBubbleLeftRightIcon as ChatBubbleLeftRightIconSolid,
} from '@heroicons/react/24/solid';

const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.includes(path);

  const navItems = [
    {
      path: '/staff/dashboard',
      label: 'Home',
      Icon: HomeIcon,
      IconSolid: HomeIconSolid,
    },
    {
      path: '/staff/alerts',
      label: 'Alerts',
      Icon: BellIcon,
      IconSolid: BellIconSolid,
    },
    {
      path: '/staff/patients',
      label: 'Patients',
      Icon: UserGroupIcon,
      IconSolid: UserGroupIconSolid,
    },
    {
      path: '/staff/messages',
      label: 'Messages',
      Icon: ChatBubbleLeftRightIcon,
      IconSolid: ChatBubbleLeftRightIconSolid,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe">
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

export default BottomNav;

