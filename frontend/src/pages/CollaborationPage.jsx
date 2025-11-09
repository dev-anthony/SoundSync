import React, { useState, useEffect } from 'react';
import { Users, Plus,  Link as LinkIcon, Bell } from 'lucide-react';
import api from '../services/api';
import CreateCollaborationModal from '../components/CreateCollaborationModal';
import JoinCollaborationModal from '../components/JoinCollaborationModal';
import CollaborationCard from '../components/CollaborationCard';

const CollaborationPage = ({ setCurrentPage, user, handleLogout, showNotification }) => {
  const [collabProjects, setCollabProjects] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadCollaborationData();
    checkForUpdates();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(checkForUpdates, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadCollaborationData = async () => {
    try {
      const response = await api.get('/collaboration/projects');
      setCollabProjects(response.data.projects || []);
      
      const notifRes = await api.get('/collaboration/notifications');
      setNotifications(notifRes.data.notifications || []);
    } catch (error) {
      console.error('Failed to load collaboration data:', error);
    }
  };

  const checkForUpdates = async () => {
    try {
      const response = await api.get('/collaboration/check-updates');
      if (response.data.hasUpdates) {
        setNotifications(response.data.notifications);
        showNotification('New collaboration updates available!', 'success');
      }
    } catch (error) {
      console.error('Failed to check updates:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentPage('dashboard')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back
            </button>
            <div className="flex items-center">
              <div className="bg-gradient-to-r from-green-600 to-blue-600 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">Collaboration</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {notifications.length > 0 && (
              <button className="relative p-2 text-orange-600 hover:text-orange-700">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              </button>
            )}
            <span className="text-sm text-gray-600">@{user.username}</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Collaboration Projects</h2>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Collaboration
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="border-2 border-green-600 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition flex items-center"
            >
              <LinkIcon className="w-5 h-5 mr-2" />
              Join Collaboration
            </button>
          </div>
        </div>

        {/* Notifications */}
        {notifications.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-orange-800 mb-2 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Recent Updates ({notifications.length})
            </h3>
            <div className="space-y-2">
              {notifications.slice(0, 3).map((notif, idx) => (
                <div key={idx} className="text-sm text-orange-700 flex items-center justify-between">
                  <span>{notif.message}</span>
                  <button
                    onClick={() => {
                      setSelectedProject(notif.projectId);
                      // Handle pull
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Pull Changes
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Grid */}
        {collabProjects.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Collaboration Projects</h3>
            <p className="text-gray-600 mb-6">Create or join a collaboration to work with other producers</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition"
              >
                Create Collaboration
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="border-2 border-green-600 text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition"
              >
                Join Collaboration
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collabProjects.map((project) => (
              <CollaborationCard 
                key={project.id}
                project={project}
                onPush={() => handlePush(project.id)}
                onPull={() => handlePull(project.id)}
                showNotification={showNotification}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showCreateModal && (
        <CreateCollaborationModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadCollaborationData}
          showNotification={showNotification}
        />
      )}

      {showJoinModal && (
        <JoinCollaborationModal
          onClose={() => setShowJoinModal(false)}
          onSuccess={loadCollaborationData}
          showNotification={showNotification}
        />
      )}
    </div>
  );

  async function handlePush(projectId) {
    try {
      await api.post(`/collaboration/push/${projectId}`);
      showNotification('Changes pushed successfully!');
      loadCollaborationData();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Push failed', 'error');
    }
  }

  async function handlePull(projectId) {
    try {
      await api.post(`/collaboration/pull/${projectId}`);
      showNotification('Changes pulled successfully!');
      loadCollaborationData();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Pull failed', 'error');
    }
  }
};
export default CollaborationPage;
