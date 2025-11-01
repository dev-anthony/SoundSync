import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

const Notification = ({ message, type }) => (
  <div className="fixed top-4 right-4 z-50 animate-slide-in">
    <div className={`${type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white px-6 py-4 rounded-lg shadow-lg flex items-center`}>
      {type === 'success' ? (
        <Check className="w-5 h-5 mr-3" />
      ) : (
        <AlertCircle className="w-5 h-5 mr-3" />
      )}
      <span className="font-medium">{message}</span>
    </div>
  </div>
);

export default Notification;