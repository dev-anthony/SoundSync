// import React, { useState, useEffect } from 'react';
// import { Users, Plus, GitBranch, Upload, Download, Link as LinkIcon, Bell, Copy, Check } from 'lucide-react';
// import api from '../services/api';

// const CollaborationPage = ({ setCurrentPage, user, handleLogout, showNotification }) => {
//   const [collabProjects, setCollabProjects] = useState([]);
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showJoinModal, setShowJoinModal] = useState(false);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [notifications, setNotifications] = useState([]);

//   useEffect(() => {
//     loadCollaborationData();
//     checkForUpdates();
    
//     // Poll for updates every 30 seconds
//     const interval = setInterval(checkForUpdates, 30000);
//     return () => clearInterval(interval);
//   }, []);

//   const loadCollaborationData = async () => {
//     try {
//       const response = await api.get('/collaboration/projects');
//       setCollabProjects(response.data.projects || []);
      
//       const notifRes = await api.get('/collaboration/notifications');
//       setNotifications(notifRes.data.notifications || []);
//     } catch (error) {
//       console.error('Failed to load collaboration data:', error);
//     }
//   };

//   const checkForUpdates = async () => {
//     try {
//       const response = await api.get('/collaboration/check-updates');
//       if (response.data.hasUpdates) {
//         setNotifications(response.data.notifications);
//         showNotification('New collaboration updates available!', 'success');
//       }
//     } catch (error) {
//       console.error('Failed to check updates:', error);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={() => setCurrentPage('dashboard')}
//               className="text-gray-600 hover:text-gray-800"
//             >
//               ← Back
//             </button>
//             <div className="flex items-center">
//               <div className="bg-gradient-to-r from-green-600 to-blue-600 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
//                 <Users className="w-6 h-6 text-white" />
//               </div>
//               <h1 className="text-xl font-bold text-gray-800">Collaboration</h1>
//             </div>
//           </div>
//           <div className="flex items-center space-x-4">
//             {notifications.length > 0 && (
//               <button className="relative p-2 text-orange-600 hover:text-orange-700">
//                 <Bell className="w-5 h-5" />
//                 <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
//                   {notifications.length}
//                 </span>
//               </button>
//             )}
//             <span className="text-sm text-gray-600">@{user.username}</span>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 py-8">
//         {/* Action Buttons */}
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-2xl font-bold text-gray-800">Collaboration Projects</h2>
//           <div className="flex space-x-3">
//             <button
//               onClick={() => setShowCreateModal(true)}
//               className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition flex items-center"
//             >
//               <Plus className="w-5 h-5 mr-2" />
//               Create Collaboration
//             </button>
//             <button
//               onClick={() => setShowJoinModal(true)}
//               className="border-2 border-green-600 text-green-600 px-4 py-2 rounded-lg font-medium hover:bg-green-50 transition flex items-center"
//             >
//               <LinkIcon className="w-5 h-5 mr-2" />
//               Join Collaboration
//             </button>
//           </div>
//         </div>

//         {/* Notifications */}
//         {notifications.length > 0 && (
//           <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
//             <h3 className="font-semibold text-orange-800 mb-2 flex items-center">
//               <Bell className="w-5 h-5 mr-2" />
//               Recent Updates ({notifications.length})
//             </h3>
//             <div className="space-y-2">
//               {notifications.slice(0, 3).map((notif, idx) => (
//                 <div key={idx} className="text-sm text-orange-700 flex items-center justify-between">
//                   <span>{notif.message}</span>
//                   <button
//                     onClick={() => {
//                       setSelectedProject(notif.projectId);
//                       // Handle pull
//                     }}
//                     className="text-blue-600 hover:text-blue-700 font-medium"
//                   >
//                     Pull Changes
//                   </button>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Projects Grid */}
//         {collabProjects.length === 0 ? (
//           <div className="bg-white rounded-xl p-12 text-center">
//             <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-800 mb-2">No Collaboration Projects</h3>
//             <p className="text-gray-600 mb-6">Create or join a collaboration to work with other producers</p>
//             <div className="flex justify-center space-x-4">
//               <button
//                 onClick={() => setShowCreateModal(true)}
//                 className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition"
//               >
//                 Create Collaboration
//               </button>
//               <button
//                 onClick={() => setShowJoinModal(true)}
//                 className="border-2 border-green-600 text-green-600 px-6 py-3 rounded-lg font-medium hover:bg-green-50 transition"
//               >
//                 Join Collaboration
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {collabProjects.map((project) => (
//               <CollaborationCard 
//                 key={project.id}
//                 project={project}
//                 onPush={() => handlePush(project.id)}
//                 onPull={() => handlePull(project.id)}
//                 showNotification={showNotification}
//               />
//             ))}
//           </div>
//         )}
//       </main>

//       {/* Modals */}
//       {showCreateModal && (
//         <CreateCollaborationModal
//           onClose={() => setShowCreateModal(false)}
//           onSuccess={loadCollaborationData}
//           showNotification={showNotification}
//         />
//       )}

//       {showJoinModal && (
//         <JoinCollaborationModal
//           onClose={() => setShowJoinModal(false)}
//           onSuccess={loadCollaborationData}
//           showNotification={showNotification}
//         />
//       )}
//     </div>
//   );

//   async function handlePush(projectId) {
//     try {
//       await api.post(`/collaboration/push/${projectId}`);
//       showNotification('Changes pushed successfully!');
//       loadCollaborationData();
//     } catch (error) {
//       showNotification(error.response?.data?.error || 'Push failed', 'error');
//     }
//   }

//   async function handlePull(projectId) {
//     try {
//       await api.post(`/collaboration/pull/${projectId}`);
//       showNotification('Changes pulled successfully!');
//       loadCollaborationData();
//     } catch (error) {
//       showNotification(error.response?.data?.error || 'Pull failed', 'error');
//     }
//   }
// };

// // Collaboration Card Component
// const CollaborationCard = ({ project, onPush, onPull, showNotification }) => {
//   const [copying, setCopying] = useState(false);
//   const [pushing, setPushing] = useState(false);
//   const [pulling, setPulling] = useState(false);

//   const copyShareLink = () => {
//     const shareLink = `${window.location.origin}/join?repo=${project.repoName}&id=${project.id}`;
//     navigator.clipboard.writeText(shareLink);
//     setCopying(true);
//     showNotification('Share link copied to clipboard!');
//     setTimeout(() => setCopying(false), 2000);
//   };

//   const handlePush = async () => {
//     setPushing(true);
//     try {
//       await onPush();
//     } finally {
//       setPushing(false);
//     }
//   };

//   const handlePull = async () => {
//     setPulling(true);
//     try {
//       await onPull();
//     } finally {
//       setPulling(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
//       <div className="flex items-start justify-between mb-4">
//         <div className="flex items-center">
//           <GitBranch className="w-8 h-8 text-green-600 mr-3" />
//           <div>
//             <h3 className="font-semibold text-gray-800">{project.name}</h3>
//             <p className="text-xs text-gray-500 mt-1">{project.role === 'owner' ? 'Owner' : 'Collaborator'}</p>
//           </div>
//         </div>
//         {project.hasUpdates && (
//           <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
//             Updates
//           </span>
//         )}
//       </div>

//       <div className="space-y-2 mb-4 text-sm">
//         <div className="flex justify-between">
//           <span className="text-gray-600">Repository:</span>
//           <span className="font-medium text-gray-800">{project.repoName}</span>
//         </div>
//         <div className="flex justify-between">
//           <span className="text-gray-600">Collaborators:</span>
//           <span className="font-medium text-gray-800">{project.collaborators || 1}</span>
//         </div>
//         <div className="flex justify-between">
//           <span className="text-gray-600">Last Sync:</span>
//           <span className="font-medium text-gray-800">
//             {project.lastSync 
//               ? new Date(project.lastSync).toLocaleDateString() 
//               : 'Never'}
//           </span>
//         </div>
//         <div className="flex justify-between">
//           <span className="text-gray-600">Local Path:</span>
//           <span className="font-medium text-gray-800 truncate max-w-[150px]" title={project.path}>
//             {project.path}
//           </span>
//         </div>
//       </div>

//       <div className="space-y-2">
//         {project.role === 'owner' && (
//           <button
//             onClick={copyShareLink}
//             className="w-full flex items-center justify-center py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
//           >
//             {copying ? (
//               <>
//                 <Check className="w-4 h-4 mr-2" />
//                 Copied!
//               </>
//             ) : (
//               <>
//                 <Copy className="w-4 h-4 mr-2" />
//                 Share Link
//               </>
//             )}
//           </button>
//         )}

//         <div className="flex space-x-2">
//           <button
//             onClick={handlePush}
//             disabled={pushing}
//             className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-2 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition flex items-center justify-center disabled:opacity-50"
//           >
//             {pushing ? (
//               <>
//                 <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
//                 Pushing...
//               </>
//             ) : (
//               <>
//                 <Upload className="w-4 h-4 mr-2" />
//                 Push
//               </>
//             )}
//           </button>
//           <button
//             onClick={handlePull}
//             disabled={pulling}
//             className="flex-1 border-2 border-green-600 text-green-600 py-2 rounded-lg font-medium hover:bg-green-50 transition flex items-center justify-center disabled:opacity-50"
//           >
//             {pulling ? (
//               <>
//                 <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-600 border-t-transparent mr-2"></div>
//                 Pulling...
//               </>
//             ) : (
//               <>
//                 <Download className="w-4 h-4 mr-2" />
//                 Pull
//               </>
//             )}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // Create Collaboration Modal
// const CreateCollaborationModal = ({ onClose, onSuccess, showNotification }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     path: '',
//     repoName: '',
//     description: ''
//   });
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       await api.post('/collaboration/create', formData);
//       showNotification('Collaboration project created!');
//       onSuccess();
//       onClose();
//     } catch (error) {
//       showNotification(error.response?.data?.error || 'Failed to create collaboration', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-xl p-8 max-w-md w-full">
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Collaboration</h2>
        
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
//             <input
//               type="text"
//               value={formData.name}
//               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//               placeholder="Collaboration Project Name"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Local Project Path</label>
//             <input
//               type="text"
//               value={formData.path}
//               onChange={(e) => setFormData({ ...formData, path: e.target.value })}
//               placeholder="C:/Music/CollabProject"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Repository Name</label>
//             <input
//               type="text"
//               value={formData.repoName}
//               onChange={(e) => setFormData({ ...formData, repoName: e.target.value })}
//               placeholder="collab-repo-name"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
//             <textarea
//               value={formData.description}
//               onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//               placeholder="What's this collaboration about?"
//               rows="3"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
//             />
//           </div>

//           <div className="flex space-x-4 pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition disabled:opacity-50"
//             >
//               {loading ? 'Creating...' : 'Create'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// // Join Collaboration Modal
// const JoinCollaborationModal = ({ onClose, onSuccess, showNotification }) => {
//   const [formData, setFormData] = useState({
//     shareLink: '',
//     localPath: ''
//   });
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       await api.post('/collaboration/join', formData);
//       showNotification('Successfully joined collaboration!');
//       onSuccess();
//       onClose();
//     } catch (error) {
//       showNotification(error.response?.data?.error || 'Failed to join collaboration', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-xl p-8 max-w-md w-full">
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">Join Collaboration</h2>
        
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Shared Repository Link</label>
//             <input
//               type="text"
//               value={formData.shareLink}
//               onChange={(e) => setFormData({ ...formData, shareLink: e.target.value })}
//               placeholder="Paste the collaboration link here"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Local Download Path</label>
//             <input
//               type="text"
//               value={formData.localPath}
//               onChange={(e) => setFormData({ ...formData, localPath: e.target.value })}
//               placeholder="C:/Music/CollabProjects/ProjectName"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
//               required
//             />
//             <p className="text-xs text-gray-500 mt-1">Files will be downloaded to this location</p>
//           </div>

//           <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
//             <p className="text-sm text-blue-800">
//               <strong>Note:</strong> You'll be able to push and pull changes to collaborate in real-time.
//             </p>
//           </div>

//           <div className="flex space-x-4 pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition disabled:opacity-50"
//             >
//               {loading ? 'Joining...' : 'Join & Clone'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default CollaborationPage;
import React, { useState, useEffect } from 'react';
import { Users, Plus, GitBranch, Upload, Download, Link as LinkIcon, Bell, Copy, Check, FolderOpen, File } from 'lucide-react';
import api from '../services/api';

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
                    onClick={() => handlePull(notif.projectId)}
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
};

// Collaboration Card Component
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

// Create Collaboration Modal with File Upload
const CreateCollaborationModal = ({ onClose, onSuccess, showNotification }) => {
  const [formData, setFormData] = useState({
    name: '',
    repoName: '',
    description: ''
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadType, setUploadType] = useState('folder');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploadedFiles(files);
    showNotification(`${files.length} file(s) selected`);
  };

  const handleFolderUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploadedFiles(files);
    showNotification(`${files.length} file(s) from folder selected`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.repoName || uploadedFiles.length === 0) {
      showNotification('Please fill all fields and upload files', 'error');
      return;
    }

    setLoading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('name', formData.name);
      uploadFormData.append('repoName', formData.repoName);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('uploadType', uploadType);

      uploadedFiles.forEach((file) => {
        const relativePath = file.webkitRelativePath || file.name;
        uploadFormData.append('files', file, relativePath);
      });

      await api.post('/collaboration/create', uploadFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showNotification('Collaboration project created!');
      onSuccess();
      onClose();
    } catch (error) {
      showNotification(error.response?.data?.error || 'Failed to create collaboration', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create Collaboration</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Collaboration Project Name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Repository Name</label>
            <input
              type="text"
              value={formData.repoName}
              onChange={(e) => setFormData({ ...formData, repoName: e.target.value })}
              placeholder="collab-repo-name"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-600 focus:border-transparent"
              required
            />
          </div>

          {/* Upload Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Upload Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUploadType('folder')}
                className={`p-3 border-2 rounded-lg transition ${
                  uploadType === 'folder' ? 'border-green-600 bg-green-50' : 'border-gray-200'
                }`}
              >
                <FolderOpen className={`w-5 h-5 mx-auto mb-1 ${
                  uploadType === 'folder' ? 'text-green-600' : 'text-gray-500'
                }`} />
                <p className="text-sm font-medium">Folder</p>
              </button>
              <button
                type="button"
                onClick={() => setUploadType('files')}
                className={`p-3 border-2 rounded-lg transition ${
                  uploadType === 'files' ? 'border-green-600 bg-green-50' : 'border-gray-200'
                }`}
              >
                <File className={`w-5 h-5 mx-auto mb-1 ${
                  uploadType === 'files' ? 'text-green-600' : 'text-gray-500'
                }`} />
                <p className="text-sm font-medium">Files</p>
              </button>
            </div>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            {uploadedFiles.length === 0 ? (
              <p className="text-gray-600 mb-2">Upload your project files</p>
            ) : (
              <div>
                <p className="text-green-600 font-medium">
                  ✓ {uploadedFiles.length} file(s) ({formatFileSize(totalSize)})
                </p>
              </div>
            )}
            <input
              type="file"
              onChange={uploadType === 'folder' ? handleFolderUpload : handleFileUpload}
              {...(uploadType === 'folder' ? { webkitdirectory: '', directory: '' } : { multiple: true })}
              className="hidden"
              id="collab-file-upload"
            />
            <label
              htmlFor="collab-file-upload"
              className="inline-block mt-3 px-4 py-2 bg-green-600 text-white rounded-lg cursor-pointer hover:bg-green-700"
            >
              {uploadType === 'folder' ? 'Select Folder' : 'Select Files'}
            </label>
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
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Join Collaboration Modal (similar file upload approach)
const JoinCollaborationModal = ({ onClose, onSuccess, showNotification }) => {
  const [formData, setFormData] = useState({
    shareLink: ''
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Files will be synced automatically after joining.
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

export default CollaborationPage;