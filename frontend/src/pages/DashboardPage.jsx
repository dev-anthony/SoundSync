// import React, { useState, useEffect } from 'react';
// import { FolderOpen, Plus, Settings, LogOut } from 'lucide-react';
// import api from '../services/api';
// import ProjectCard from '../components/ProjectCard';
// import AddProjectModal from '../components/AddProjectModal';

// const Dashboard = ({ setCurrentPage, user, projects, setProjects, repos, handleLogout, showNotification }) => {
//   const [showAddProject, setShowAddProject] = useState(false);
//   const [repoInfo, setRepoInfo] = useState(null);

//   useEffect(() => {
//     if (repos && repos.length > 0) {
//       setRepoInfo(repos[0]); // Use first repo as default
//     }
//   }, [repos]);

//   const handleAddProject = async (projectData) => {
//     try {
//       const response = await api.post('/projects/add', projectData);
      
//       const updatedProjects = [...projects, response.data.project];
//       setProjects(updatedProjects);
      
//       showNotification('Project added successfully!');
//       setShowAddProject(false);
//     } catch (error) {
//       showNotification(error.response?.data?.error || 'Failed to add project', 'error');
//     }
//   };

//   const handleBackupProject = async (projectId) => {
//     try {
//       await api.post(`/backup/project/${projectId}`);
      
//       // Refresh projects
//       const response = await api.get('/projects');
//       setProjects(response.data.projects || []);
      
//       showNotification('Backup completed successfully!');
//     } catch (error) {
//       showNotification(error.response?.data?.error || 'Backup failed', 'error');
//     }
//   };

//   const handleRemoveProject = async (projectId) => {
//     if (!confirm('Are you sure you want to remove this project?')) return;
    
//     try {
//       await api.delete(`/projects/${projectId}`);
      
//       const updatedProjects = projects.filter(p => p.id !== projectId);
//       setProjects(updatedProjects);
      
//       showNotification('Project removed');
//     } catch (error) {
//       showNotification('Failed to remove project', 'error');
//     }
//   };

//   const lastBackup = projects.length > 0 && projects[0].lastBackup 
//     ? new Date(projects[0].lastBackup).toLocaleString() 
//     : 'Never';

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
//           <div className="flex items-center">
//             <div className="bg-gradient-to-r from-purple-600 to-blue-600 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
//               <FolderOpen className="w-6 h-6 text-white" />
//             </div>
//             <h1 className="text-xl font-bold text-gray-800">SoundSync</h1>
//           </div>
//           <div className="flex items-center space-x-4">
//             <span className="text-sm text-gray-600">@{user.username}</span>
//             <button
//               onClick={() => setCurrentPage('settings')}
//               className="p-2 text-gray-600 hover:text-gray-800"
//             >
//               <Settings className="w-5 h-5" />
//             </button>
//             <button
//               onClick={handleLogout}
//               className="flex items-center text-gray-600 hover:text-gray-800"
//             >
//               <LogOut className="w-5 h-5" />
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 py-8">
//         {/* Stats Card */}
//         <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white mb-8">
//           <div className="grid grid-cols-3 gap-4">
//             <div>
//               <p className="text-purple-200 text-sm mb-1">Total Projects</p>
//               <p className="text-3xl font-bold">{projects.length}</p>
//             </div>
//             <div>
//               <p className="text-purple-200 text-sm mb-1">Last Backup</p>
//               <p className="text-lg font-semibold">{lastBackup}</p>
//             </div>
//             <div>
//               <p className="text-purple-200 text-sm mb-1">GitHub Repo</p>
//               {repoInfo && (
//                 <a 
//                   href={repoInfo.repoUrl} 
//                   target="_blank" 
//                   rel="noopener noreferrer"
//                   className="text-lg font-semibold hover:underline"
//                 >
//                   {repoInfo.repoName}
//                 </a>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Projects Section */}
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-2xl font-bold text-gray-800">Your Projects</h2>
//           <button
//             onClick={() => setShowAddProject(true)}
//             className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition flex items-center"
//           >
//             <Plus className="w-5 h-5 mr-2" />
//             Add Project
//           </button>
//         </div>

//         {/* Projects Grid */}
//         {projects.length === 0 ? (
//           <div className="bg-white rounded-xl p-12 text-center">
//             <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-800 mb-2">No Projects Yet</h3>
//             <p className="text-gray-600 mb-6">Add your first project folder to start backing up</p>
//             <button
//               onClick={() => setShowAddProject(true)}
//               className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition"
//             >
//               Add Your First Project
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {projects.map((project) => (
//               <ProjectCard 
//                 key={project.id} 
//                 project={project} 
//                 onBackup={() => handleBackupProject(project.id)}
//                 onRemove={() => handleRemoveProject(project.id)}
//               />
//             ))}
//           </div>
//         )}
//       </main>

//       {/* Add Project Modal */}
//       {showAddProject && (
//         <AddProjectModal 
//           onClose={() => setShowAddProject(false)}
//           onAdd={handleAddProject}
//           repos={repos}
//           showNotification={showNotification}
//         />
//       )}
//     </div>
//   );
// };

// export default Dashboard;
// import React, { useState, useEffect } from 'react';
// import { FolderOpen, Plus, Settings, LogOut, Users } from 'lucide-react';
// import api from '../services/api';
// import ProjectCard from '../components/ProjectCard';
// import AddProjectModal from '../components/AddProjectModal';

// const Dashboard = ({ setCurrentPage, user, projects, setProjects, repos, handleLogout, showNotification }) => {
//   const [showAddProject, setShowAddProject] = useState(false);
//   const [repoInfo, setRepoInfo] = useState(null);

//   useEffect(() => {
//     if (repos && repos.length > 0) {
//       setRepoInfo(repos[0]); // Use first repo as default
//     }
//   }, [repos]);

//   const handleAddProject = async (projectData) => {
//     try {
//       const response = await api.post('/projects/add', projectData);
      
//       const updatedProjects = [...projects, response.data.project];
//       setProjects(updatedProjects);
      
//       showNotification('Project added successfully!');
//       setShowAddProject(false);
//     } catch (error) {
//       showNotification(error.response?.data?.error || 'Failed to add project', 'error');
//     }
//   };

//   const handleBackupProject = async (projectId) => {
//     try {
//       await api.post(`/backup/project/${projectId}`);
      
//       // Refresh projects
//       const response = await api.get('/projects');
//       setProjects(response.data.projects || []);
      
//       showNotification('Backup completed successfully!');
//     } catch (error) {
//       showNotification(error.response?.data?.error || 'Backup failed', 'error');
//     }
//   };

//   const handleRemoveProject = async (projectId) => {
//     if (!confirm('Are you sure you want to remove this project?')) return;
    
//     try {
//       await api.delete(`/projects/${projectId}`);
      
//       const updatedProjects = projects.filter(p => p.id !== projectId);
//       setProjects(updatedProjects);
      
//       showNotification('Project removed');
//     } catch (error) {
//       showNotification('Failed to remove project', 'error');
//     }
//   };

//   const lastBackup = projects.length > 0 && projects[0].lastBackup 
//     ? new Date(projects[0].lastBackup).toLocaleString() 
//     : 'Never';

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header */}
//       <header className="bg-white shadow-sm">
//         <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
//           <div className="flex items-center">
//             <div className="bg-gradient-to-r from-purple-600 to-blue-600 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
//               <FolderOpen className="w-6 h-6 text-white" />
//             </div>
//             <h1 className="text-xl font-bold text-gray-800">SoundSync</h1>
//           </div>
//           <div className="flex items-center space-x-4">
//             <button
//               onClick={() => setCurrentPage('collaboration')}
//               className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition"
//               title="Collaboration"
//             >
//               <Users className="w-5 h-5" />
//               <span className="hidden sm:inline">Collaborate</span>
//             </button>
//             <span className="text-sm text-gray-600">@{user.username}</span>
//             <button
//               onClick={() => setCurrentPage('settings')}
//               className="p-2 text-gray-600 hover:text-gray-800"
//             >
//               <Settings className="w-5 h-5" />
//             </button>
//             <button
//               onClick={handleLogout}
//               className="flex items-center text-gray-600 hover:text-gray-800"
//             >
//               <LogOut className="w-5 h-5" />
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main Content */}
//       <main className="max-w-7xl mx-auto px-4 py-8">
//         {/* Stats Card */}
//         <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white mb-8">
//           <div className="grid grid-cols-3 gap-4">
//             <div>
//               <p className="text-purple-200 text-sm mb-1">Total Projects</p>
//               <p className="text-3xl font-bold">{projects.length}</p>
//             </div>
//             <div>
//               <p className="text-purple-200 text-sm mb-1">Last Backup</p>
//               <p className="text-lg font-semibold">{lastBackup}</p>
//             </div>
//             <div>
//               <p className="text-purple-200 text-sm mb-1">GitHub Repo</p>
//               {repoInfo && (
//                 <a 
//                   href={repoInfo.repoUrl} 
//                   target="_blank" 
//                   rel="noopener noreferrer"
//                   className="text-lg font-semibold hover:underline"
//                 >
//                   {repoInfo.repoName}
//                 </a>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Projects Section */}
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-2xl font-bold text-gray-800">Your Projects</h2>
//           <button
//             onClick={() => setShowAddProject(true)}
//             className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition flex items-center"
//           >
//             <Plus className="w-5 h-5 mr-2" />
//             Add Project
//           </button>
//         </div>

//         {/* Projects Grid */}
//         {projects.length === 0 ? (
//           <div className="bg-white rounded-xl p-12 text-center">
//             <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-800 mb-2">No Projects Yet</h3>
//             <p className="text-gray-600 mb-6">Add your first project folder to start backing up</p>
//             <button
//               onClick={() => setShowAddProject(true)}
//               className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition"
//             >
//               Add Your First Project
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//             {projects.map((project) => (
//               <ProjectCard 
//                 key={project.id} 
//                 project={project} 
//                 onBackup={() => handleBackupProject(project.id)}
//                 onRemove={() => handleRemoveProject(project.id)}
//               />
//             ))}
//           </div>
//         )}
//       </main>

//       {/* Add Project Modal */}
//       {showAddProject && (
//         <AddProjectModal 
//           onClose={() => setShowAddProject(false)}
//           onAdd={handleAddProject}
//           repos={repos}
//           showNotification={showNotification}
//         />
//       )}
//     </div>
//   );
// };

// export default Dashboard;
import React, { useState, useEffect } from 'react';
import { FolderOpen, Plus, Settings, LogOut, Users } from 'lucide-react';
import api from '../services/api';
import ProjectCard from '../components/ProjectCard';
import AddProjectModal from '../components/AddProjectModal';

const Dashboard = ({
  setCurrentPage,
  user,
  projects,
  setProjects,
  repos,
  handleLogout,
  showNotification
}) => {
  const [showAddProject, setShowAddProject] = useState(false);
  const [repoInfo, setRepoInfo] = useState(null);

  // show first repo in the header
  useEffect(() => {
    if (repos && repos.length) setRepoInfo(repos[0]);
  }, [repos]);


  // fetch fresh project list
  const fetchProjects = async () => {
    try {
      const res = await api.get('/projects');
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error(err);
    }
  };
  //fetch on every rerender
  setInterval(() => {
    fetchProjects();
  }, 3000); // every 3 second

  // backup – only refresh, never add a new card
  const handleBackupProject = async projectId => {
    try {
     await api.post(`/backup/project/${projectId}`)
      await fetchProjects();
      showNotification('Backup completed successfully!');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Backup failed', 'error');
    }
  };

  // remove project
  const handleRemoveProject = async projectId => {
    if (!window.confirm('Are you sure you want to remove this project?')) return;

    try {
      await api.delete(`/projects/${projectId}`);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      showNotification('Project removed');
    } catch (err) {
      showNotification(err.response?.data?.error || 'Failed to remove project', 'error');
    }
  };

  const lastBackup =
    projects.length > 0 && projects[0].lastBackup
      ? new Date(projects[0].lastBackup).toLocaleString()
      : 'Never';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 w-10 h-10 rounded-lg flex items-center justify-center mr-3">
              <FolderOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">SoundSync</h1>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setCurrentPage('collaboration')}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition"
              title="Collaboration"
            >
              <Users className="w-5 h-5" />
              <span className="hidden sm:inline">Collaborate</span>
            </button>

            <span className="text-sm text-gray-600">@{user.username}</span>

            <button
              onClick={() => setCurrentPage('settings')}
              className="p-2 text-gray-600 hover:text-gray-800"
            >
              <Settings className="w-5 h-5" />
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Card */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 text-white mb-8">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-purple-200 text-sm mb-1">Total Projects</p>
              <p className="text-3xl font-bold">{projects.length}</p>
            </div>
            <div>
              <p className="text-purple-200 text-sm mb-1">Last Backup</p>
              <p className="text-lg font-semibold">{lastBackup}</p>
            </div>
            <div>
              <p className="text-purple-200 text-sm mb-1">GitHub Repo</p>
              {repoInfo && (
                <a
                  href={repoInfo.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-semibold hover:underline"
                >
                  {repoInfo.repoName}
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Projects Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Your Projects</h2>
          <button
            onClick={() => setShowAddProject(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Project
          </button>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No Projects Yet</h3>
            <p className="text-gray-600 mb-6">Add your first project folder to start backing up</p>
            <button
              onClick={() => setShowAddProject(true)}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition"
            >
              Add Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onBackup={() => handleBackupProject(project.id)}
                onRemove={() => handleRemoveProject(project.id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Add-Project Modal */}
      {showAddProject && (
        <AddProjectModal
          onClose={() => setShowAddProject(false)}
          repos={repos}
          showNotification={showNotification}
        />
      )}
    </div>
  );
};

export default Dashboard;