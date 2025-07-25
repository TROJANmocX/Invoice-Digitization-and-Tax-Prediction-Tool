import React, { useEffect } from 'react';
import { CheckCircle, X, AlertCircle, Info } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      // Auto-close the toast after 3 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900 border-green-500 text-green-800 dark:text-green-100';
      case 'error':
        return 'bg-red-50 dark:bg-red-900 border-red-500 text-red-800 dark:text-red-100';
      case 'info':
        return 'bg-blue-50 dark:bg-blue-900 border-blue-500 text-blue-800 dark:text-blue-100';
      default:
        return 'bg-gray-50 dark:bg-gray-800 border-gray-300 text-gray-800 dark:text-gray-100';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500 dark:text-red-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500 dark:text-blue-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-fadeIn">
      <div className={`flex items-center p-4 rounded-lg shadow-lg border-l-4 ${getToastStyles()}`}>
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1 mr-2">
          {message}
        </div>
        <button 
          onClick={onClose}
          className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;