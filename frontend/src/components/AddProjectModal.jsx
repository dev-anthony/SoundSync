import React, { useState } from 'react';
import api from '../services/api';

const AddProjectModal = ({ onClose, onAdd, repos, showNotification }) => {
  const [formData, setFormData] = useState({
    name: '',
    path: '',
    repoOption: 'existing',
    repoName: repos && repos.length > 0 ? repos[0].repoName : ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.path) {
      showNotification('Please fill all fields', 'error');
      return;
    }

    if (formData.repoOption === 'new' && !formData.repoName) {
      showNotification('Please enter a repository name', 'error');
      return;
    }

    setLoading(true);

    try {
      let repoNameToUse = formData.repoName;

      // If creating new repo, create it first
      if (formData.repoOption === 'new') {
        console.log('Creating new repository:', formData.repoName);
        
        const repoResponse = await api.post('/github/create-repo', {
          repoName: formData.repoName,
          isPrivate: true
        });

        console.log('Repository created:', repoResponse.data);
        repoNameToUse = repoResponse.data.repoName;
        
        showNotification(`Repository "${repoNameToUse}" created successfully!`);
      } else {
        // Use existing repo
        repoNameToUse = repos[0].repoName;
      }

      // Now add the project with the repo
      const projectData = {
        name: formData.name,
        path: formData.path,
        repoName: repoNameToUse
      };

      await onAdd(projectData);
    } catch (error) {
      console.error('Error:', error);
      showNotification(
        error.response?.data?.error || 'Failed to add project', 
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Project</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Trap Beat Pack"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Folder Path</label>
            <input
              type="text"
              value={formData.path}
              onChange={(e) => setFormData({ ...formData, path: e.target.value })}
              placeholder="e.g., C:/Music/TrapBeat or /home/user/music/trap"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Enter the full path to your project folder</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">GitHub Repository</label>
            
            <div className="space-y-3">
              {repos && repos.length > 0 && (
                <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-600 transition">
                  <input
                    type="radio"
                    name="repoOption"
                    value="existing"
                    checked={formData.repoOption === 'existing'}
                    onChange={(e) => setFormData({ ...formData, repoOption: e.target.value })}
                    className="mt-1 mr-3"
                  />
                  <div>
                    <p className="font-medium text-gray-800">Use existing repo</p>
                    <p className="text-sm text-gray-600 mt-1">Backup to: {repos[0].repoName}</p>
                  </div>
                </label>
              )}

              <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-600 transition">
                <input
                  type="radio"
                  name="repoOption"
                  value="new"
                  checked={formData.repoOption === 'new'}
                  onChange={(e) => setFormData({ ...formData, repoOption: e.target.value })}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">Create new repo for this project</p>
                  <p className="text-sm text-gray-600 mt-1">Better organization for multiple projects</p>
                  {formData.repoOption === 'new' && (
                    <input
                      type="text"
                      value={formData.repoName}
                      onChange={(e) => setFormData({ ...formData, repoName: e.target.value })}
                      placeholder="repo-name"
                      className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                    />
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;
// import React, { useState } from 'react';
// import { X, FolderOpen, AlertCircle } from 'lucide-react';

// const AddProjectModal = ({ onClose, onAdd, repos, showNotification }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     path: '',
//     repoName: repos && repos.length > 0 ? repos[0].repoName : ''
//   });
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!formData.name.trim()) {
//       showNotification('Please enter a project name', 'error');
//       return;
//     }

//     if (!formData.path.trim()) {
//       showNotification('Please enter a project path', 'error');
//       return;
//     }

//     if (!formData.repoName) {
//       showNotification('Please select a repository', 'error');
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       await onAdd(formData);
//     } catch (error) {
//       console.error('Submit error:', error);
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleBrowse = async () => {
//     try {
//       // Use Electron's dialog API if available
//       if (window.electron && window.electron.selectDirectory) {
//         const result = await window.electron.selectDirectory();
//         if (result) {
//           setFormData(prev => ({ ...prev, path: result }));
//         }
//       } else {
//         showNotification('Directory selection not available. Please enter the path manually.', 'error');
//       }
//     } catch (error) {
//       console.error('Browse error:', error);
//       showNotification('Failed to open directory browser', 'error');
//     }
//   };

//   if (!repos || repos.length === 0) {
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//         <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-bold text-gray-800">Add Project</h2>
//             <button
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-600"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>

//           <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
//             <div className="flex items-start">
//               <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
//               <div>
//                 <h3 className="font-semibold text-yellow-800 mb-1">No Repositories Available</h3>
//                 <p className="text-yellow-700 text-sm">
//                   You need to create at least one GitHub repository before adding projects.
//                 </p>
//               </div>
//             </div>
//           </div>

//           <button
//             onClick={onClose}
//             className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg font-medium hover:bg-gray-300 transition"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
//         <div className="p-6">
//           <div className="flex items-center justify-between mb-6">
//             <h2 className="text-2xl font-bold text-gray-800">Add New Project</h2>
//             <button
//               onClick={onClose}
//               className="text-gray-400 hover:text-gray-600"
//             >
//               <X className="w-6 h-6" />
//             </button>
//           </div>

//           <form onSubmit={handleSubmit}>
//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Project Name <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                 placeholder="My Unity Project"
//                 required
//               />
//             </div>

//             <div className="mb-4">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Project Path <span className="text-red-500">*</span>
//               </label>
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   value={formData.path}
//                   onChange={(e) => setFormData({ ...formData, path: e.target.value })}
//                   className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                   placeholder="C:/Projects/MyGame"
//                   required
//                 />
//                 <button
//                   type="button"
//                   onClick={handleBrowse}
//                   className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center"
//                 >
//                   <FolderOpen className="w-4 h-4 mr-1" />
//                   Browse
//                 </button>
//               </div>
//               <p className="text-xs text-gray-500 mt-1">
//                 Full path to your project folder
//               </p>
//             </div>

//             <div className="mb-6">
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 GitHub Repository <span className="text-red-500">*</span>
//               </label>
//               <select
//                 value={formData.repoName}
//                 onChange={(e) => setFormData({ ...formData, repoName: e.target.value })}
//                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
//                 required
//               >
//                 <option value="">Select a repository</option>
//                 {repos.map((repo) => (
//                   <option key={repo.repoName} value={repo.repoName}>
//                     {repo.repoName} {repo.isPrivate ? '🔒' : '🌐'}
//                   </option>
//                 ))}
//               </select>
//               <p className="text-xs text-gray-500 mt-1">
//                 Choose which repository to backup this project to
//               </p>
//             </div>

//             <div className="flex space-x-3">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
//                 disabled={isSubmitting}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isSubmitting ? 'Adding...' : 'Add Project'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AddProjectModal;