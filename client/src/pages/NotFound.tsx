import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft, Compass } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full text-center">
        
        {/* 404 Animation */}
        <div className="relative mb-8">
          <div className="text-8xl font-bold text-blue-600 opacity-20 animate-pulse">
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center transform animate-bounce">
              <Compass className="w-16 h-16 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Oops! Page Not Found
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 leading-relaxed">
          The page you're looking for seems to have wandered off into the digital void. 
          Don't worry, even the best artists sometimes lose their way!
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            <Home className="w-5 h-5" />
            <span>Go Home</span>
          </Link>
          
          <Link
            to="/explore"
            className="flex items-center justify-center space-x-2 bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            <Search className="w-5 h-5" />
            <span>Explore Canvases</span>
          </Link>
        </div>

        {/* Back Button */}
        <button
          onClick={() => window.history.back()}
          className="flex items-center justify-center space-x-2 text-gray-600 hover:text-gray-800 mt-6 mx-auto transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Go back to previous page</span>
        </button>

        {/* Decorative Elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-200 rounded-full opacity-50 animate-float"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-purple-200 rounded-full opacity-50 animate-float-delayed"></div>
        <div className="absolute top-1/3 right-20 w-12 h-12 bg-pink-200 rounded-full opacity-50 animate-float"></div>
      </div>
    </div>
  );
};

export default NotFound;
