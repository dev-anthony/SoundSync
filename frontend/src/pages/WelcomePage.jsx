import React from 'react';

const WelcomePage = ({ setCurrentPage }) => (
  <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-4xl">📁</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">SoundSync</h1>
        <p className="text-gray-600">Never lose your sounds, patterns, or plugins again</p>
      </div>
      <div className="space-y-4">
        <button
          onClick={() => setCurrentPage('signup')}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition"
        >
          Sign Up
        </button>
        <button
          onClick={() => setCurrentPage('login')}
          className="w-full border-2 border-purple-600 text-purple-600 py-3 rounded-lg font-semibold hover:bg-purple-50 transition"
        >
          Login
        </button>
      </div>
    </div>
  </div>
);

export default WelcomePage;