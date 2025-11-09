import { useState } from "react";
import api from "../services/api";
// import { Users, Plus, GitBranch, Upload, Download, Link as LinkIcon, Bell, Copy, Check } from 'lucide-react';
const JoinCollaborationModal = ({ onClose, onSuccess, showNotification }) => {
  const [formData, setFormData] = useState({
    shareLink: '',
    localPath: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/collaboration/join', formData);
      showNotification('Successfully joined collaboration!');
      onSuccess();
      onClose();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Failed to join collaboration', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Join Collaboration</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Shared Repository Link</label>
            <input
              type="text"
              value={formData.shareLink}
              onChange={(e) => setFormData({ ...formData, shareLink: e.target.value })}
              placeholder="Paste the collaboration link here"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Local Download Path</label>
            <input
              type="text"
              value={formData.localPath}
              onChange={(e) => setFormData({ ...formData, localPath: e.target.value })}
              placeholder="C:/Music/CollabProjects/ProjectName"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Files will be downloaded to this location</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> You'll be able to push and pull changes to collaborate in real-time.
            </p>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Joining...' : 'Join & Clone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default JoinCollaborationModal