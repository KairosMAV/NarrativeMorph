import React from 'react';
import { Link } from 'react-router-dom';
import { VideoCameraIcon, PlusIcon } from '@heroicons/react/24/outline';

function Navigation() {
  return (
    <nav className="bg-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="flex items-center space-x-2">
            <VideoCameraIcon className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">NarrativeMorph</span>
          </Link>
          
          <div className="flex items-center space-x-4">
            <Link
              to="/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
