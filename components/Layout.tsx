import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, CheckSquare } from 'lucide-react';
import { Button } from './Button';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <CheckSquare className="h-8 w-8 text-primary" />
              <span className="ml-2 text-xl font-bold text-gray-900">TaskFlow Pro</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Welcome, {user?.name || user?.email}</span>
              <Button variant="ghost" onClick={logout} className="!px-2">
                <LogOut className="h-5 w-5 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};