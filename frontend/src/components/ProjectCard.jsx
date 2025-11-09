import React, { useState } from 'react';
import { FolderOpen, Upload, Trash2 } from 'lucide-react';

const ProjectCard = ({ project, onBackup, onRemove }) => {
  const [isBackingUp, setIsBackingUp] = useState(false);

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      await onBackup();
    } finally {
      setIsBackingUp(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <FolderOpen className="w-8 h-8 text-purple-600 mr-3" />
          <div>
            <h3 className="font-semibold text-gray-800">{project.name}</h3>
            <p className="text-xs text-gray-500 mt-1 truncate max-w-[200px]" title={project.path}>
              {project.path}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Repository:</span>
          <span className="font-medium text-gray-800">{project.repoName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Last Backup:</span>
          <span className="font-medium text-gray-800">
            {project.lastBackup 
              ? new Date(project.lastBackup).toLocaleDateString() 
              : 'Never'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Files:</span>
          <span className="font-medium text-gray-800">{project.filesCount || 0}</span>
        </div>
        {project.size && (
          <div className="flex justify-between">
            <span className="text-gray-600">Size:</span>
            <span className="font-medium text-gray-800">{project.size}</span>
          </div>
        )}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={handleBackup}
          disabled={isBackingUp}
          className={`flex-1 ${isBackingUp ? 'bg-gray-400' : 'bg-gradient-to-r from-purple-600 to-blue-600'} text-white py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition flex items-center justify-center disabled:cursor-not-allowed`}
        >
          {isBackingUp ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
              Backing up...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Backup Now
            </>
          )}
        </button>
        <button
          onClick={onRemove}
          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ProjectCard;
