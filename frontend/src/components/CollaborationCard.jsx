import { useState } from "react";
import { GitBranch, Upload, Download, Link as Copy, Check } from 'lucide-react';
// import api from "../services/api";
const CollaborationCard = ({ project, onPush, onPull, showNotification }) => {
  const [copying, setCopying] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [pulling, setPulling] = useState(false);

  const copyShareLink = () => {
    const shareLink = `${window.location.origin}/join?repo=${project.repoName}&id=${project.id}`;
    navigator.clipboard.writeText(shareLink);
    setCopying(true);
    showNotification('Share link copied to clipboard!');
    setTimeout(() => setCopying(false), 2000);
  };

  const handlePush = async () => {
    setPushing(true);
    try {
      await onPush();
    } finally {
      setPushing(false);
    }
  };

  const handlePull = async () => {
    setPulling(true);
    try {
      await onPull();
    } finally {
      setPulling(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <GitBranch className="w-8 h-8 text-green-600 mr-3" />
          <div>
            <h3 className="font-semibold text-gray-800">{project.name}</h3>
            <p className="text-xs text-gray-500 mt-1">{project.role === 'owner' ? 'Owner' : 'Collaborator'}</p>
          </div>
        </div>
        {project.hasUpdates && (
          <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
            Updates
          </span>
        )}
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Repository:</span>
          <span className="font-medium text-gray-800">{project.repoName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Collaborators:</span>
          <span className="font-medium text-gray-800">{project.collaborators || 1}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Last Sync:</span>
          <span className="font-medium text-gray-800">
            {project.lastSync 
              ? new Date(project.lastSync).toLocaleDateString() 
              : 'Never'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Local Path:</span>
          <span className="font-medium text-gray-800 truncate max-w-[150px]" title={project.path}>
            {project.path}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {project.role === 'owner' && (
          <button
            onClick={copyShareLink}
            className="w-full flex items-center justify-center py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            {copying ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Share Link
              </>
            )}
          </button>
        )}

        <div className="flex space-x-2">
          <button
            onClick={handlePush}
            disabled={pushing}
            className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition flex items-center justify-center disabled:opacity-50"
          >
            {pushing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Pushing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Push
              </>
            )}
          </button>
          <button
            onClick={handlePull}
            disabled={pulling}
            className="flex-1 border-2 border-green-600 text-green-600 py-2 rounded-lg font-medium hover:bg-green-50 transition flex items-center justify-center disabled:opacity-50"
          >
            {pulling ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent mr-2"></div>
                Pulling...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Pull
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
export default CollaborationCard