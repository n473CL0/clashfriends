import React, { useState } from 'react';
import { Search, UserPlus, Share2, Check, AlertCircle, X } from 'lucide-react';
import { api } from '../api/clash';

const FriendSearchModal = ({ isOpen, onClose, currentUser, onFriendAdded }) => {
  if (!isOpen) return null;

  return (
    // Ensure 'fixed' and high 'z-50' are present
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none">
      {/* Semi-transparent Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      ></div>

      {/* Modal Box */}
      <div className="relative w-auto my-6 mx-auto max-w-lg w-full p-4">
        <div className="relative flex flex-col w-full bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl outline-none focus:outline-none">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-slate-700 rounded-t">
            <h3 className="text-xl font-bold text-white">Find Rivals</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Body */}
          <div className="relative p-6 flex-auto">
             <FriendSearchContent 
                currentUser={currentUser} 
                onSuccess={() => {
                    onFriendAdded();
                    onClose();
                }} 
             />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendSearch;