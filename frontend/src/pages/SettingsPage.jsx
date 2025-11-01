import React, { useState, useEffect } from 'react';
import { Github, Check, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const SettingsPage = ({ setCurrentPage, user, repos, handleLogout, showNotification }) => {
  const [githubInfo, setGithubInfo] = useState(null);
  const [settings, setSettings] = useState({
    autoBackupOnLaunch: false,
    scheduledBackup: 'disabled'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await api.get('/settings');
      setSettings(response.data.settings);
      setGithubInfo({
        connected: response.data.settings.githubConnected,
        username: response.data.settings.githubUsername,
        connectedAt: response.data.settings.connectedAt
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSettings = async (newSettings) => {
    try {
      await api.put('/settings', newSettings);
      setSettings({ ...settings, ...newSettings });
      showNotification('Settings updated');
    } catch (error) {
      showNotification('Failed to update settings', 'error');
    }
  };

  const handleDisconnectGithub = async () => {
    if (!confirm('Are you sure you want to disconnect GitHub? You will need to reconnect to backup projects.')) return;
    
    try {
      await api.delete('/github/disconnect');
      showNotification('GitHub disconnected');
      setCurrentPage('onboarding');
    } catch (error) {
      showNotification('Failed to disconnect', 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="mr-4 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold text-gray-800">Settings</h1>
          </div>
          <span className="text-sm text-gray-600">@{user.username}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* GitHub Account Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Github className="w-6 h-6 mr-2" />
            GitHub Account
          </h2>
          
          {githubInfo && githubInfo.connected ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Connected as</p>
                  <p className="font-semibold text-gray-800">@{githubInfo.username}</p>
                </div>
                <div className="flex items-center text-green-600">
                  <Check className="w-5 h-5 mr-2" />
                  <span className="font-medium">Active</span>
                </div>
              </div>
              
              {githubInfo.connectedAt && (
                <div>
                  <p className="text-sm text-gray-600">Token saved</p>
                  <p className="font-medium text-gray-800">
                    {new Date(githubInfo.connectedAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setCurrentPage('onboarding')}
                  className="px-4 py-2 border-2 border-purple-600 text-purple-600 rounded-lg font-medium hover:bg-purple-50 transition"
                >
                  Update Token
                </button>
                <button
                  onClick={handleDisconnectGithub}
                  className="px-4 py-2 border-2 border-red-600 text-red-600 rounded-lg font-medium hover:bg-red-50 transition"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">GitHub not connected</p>
              <button
                onClick={() => setCurrentPage('onboarding')}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition"
              >
                Connect GitHub
              </button>
            </div>
          )}
        </div>

        {/* Repositories Section */}
        {repos && repos.length > 0 && (
          <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Repositories</h2>
            
            <div className="space-y-3">
              {repos.map((repo, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-800">{repo.repoName}</p>
                    <p className="text-sm text-gray-600">{repo.isPrivate ? 'Private' : 'Public'}</p>
                  </div>
                  <a
                    href={repo.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 hover:text-purple-700 font-medium text-sm"
                  >
                    View on GitHub →
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Backup Settings Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Backup Settings</h2>
          
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-purple-600 transition">
              <div>
                <p className="font-medium text-gray-800">Auto-backup on app launch</p>
                <p className="text-sm text-gray-600">Automatically backup all projects when you open the app</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoBackupOnLaunch}
                onChange={(e) => handleUpdateSettings({ autoBackupOnLaunch: e.target.checked })}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-purple-600 transition">
              <div>
                <p className="font-medium text-gray-800">Scheduled auto-backup</p>
                <p className="text-sm text-gray-600">Backup projects automatically at regular intervals</p>
              </div>
              <select 
                value={settings.scheduledBackup}
                onChange={(e) => handleUpdateSettings({ scheduledBackup: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              >
                <option value="disabled">Disabled</option>
                <option value="1">Every hour</option>
                <option value="6">Every 6 hours</option>
                <option value="12">Every 12 hours</option>
                <option value="24">Every 24 hours</option>
              </select>
            </label>
          </div>
        </div>

        {/* Account Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Account</h2>
          
          <div className="space-y-4">
            <button
              className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-purple-600 transition"
            >
              <p className="font-medium text-gray-800">Change Password</p>
              <p className="text-sm text-gray-600">Update your account password</p>
            </button>

            <button
              onClick={handleLogout}
              className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-red-600 transition"
            >
              <p className="font-medium text-gray-800">Logout</p>
              <p className="text-sm text-gray-600">Sign out of your account</p>
            </button>

            <button
              className="w-full text-left p-4 border-2 border-red-200 rounded-lg hover:border-red-600 transition"
            >
              <p className="font-medium text-red-600">Delete Account</p>
              <p className="text-sm text-red-500">Permanently delete your account and all data</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;