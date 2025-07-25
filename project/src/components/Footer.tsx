import React from 'react';
import { FileText, Heart, Github } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 dark:bg-gray-950 text-white py-8 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <FileText className="w-6 h-6 text-blue-400" />
            <span className="text-lg font-semibold">Invoice Digitization Tool</span>
          </div>
          
          <div className="text-center md:text-right">
            <p className="text-gray-400 mb-2">
              Developed by <span className="text-blue-400 font-medium">Arish Ali</span> 
              <Heart className="w-4 h-4 inline-block mx-1 text-red-500 animate-pulse" />
            </p>
            <p className="text-gray-500 text-sm">
              Powered by Flask, EasyOCR, Pandas, React & Tailwind
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-6 pt-6 flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Invoice Digitization Tool. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-blue-400 transition-colors flex items-center">
              <Github className="w-4 h-4 mr-1" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;