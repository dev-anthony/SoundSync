// import React, { useState } from 'react';
// import api from '../services/api';

// const AddProjectModal = ({ onClose, onAdd, repos, showNotification }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     path: '',
//     repoOption: 'existing',
//     repoName: repos && repos.length > 0 ? repos[0].repoName : ''
//   });
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!formData.name || !formData.path) {
//       showNotification('Please fill all fields', 'error');
//       return;
//     }

//     if (formData.repoOption === 'new' && !formData.repoName) {
//       showNotification('Please enter a repository name', 'error');
//       return;
//     }

//     setLoading(true);

//     try {
//       let repoNameToUse = formData.repoName;

//       // If creating new repo, create it first
//       if (formData.repoOption === 'new') {
//         console.log('Creating new repository:', formData.repoName);
        
//         const repoResponse = await api.post('/github/create-repo', {
//           repoName: formData.repoName,
//           isPrivate: true
//         });

//         console.log('Repository created:', repoResponse.data);
//         repoNameToUse = repoResponse.data.repoName;
        
//         showNotification(`Repository "${repoNameToUse}" created successfully!`);
//       } else {
//         // Use existing repo
//         repoNameToUse = repos[0].repoName;
//       }

//       // Now add the project with the repo
//       const projectData = {
//         name: formData.name,
//         path: formData.path,
//         repoName: repoNameToUse
//       };

//       await onAdd(projectData);
//     } catch (error) {
//       console.error('Error:', error);
//       showNotification(
//         error.response?.data?.error || 'Failed to add project', 
//         'error'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Project</h2>
        
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
//             <input
//               type="text"
//               value={formData.name}
//               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//               placeholder="e.g., Trap Beat Pack"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Folder Path</label>
//             <input
//               type="text"
//               value={formData.path}
//               onChange={(e) => setFormData({ ...formData, path: e.target.value })}
//               placeholder="e.g., C:/Music/TrapBeat or /home/user/music/trap"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
//               required
//             />
//             <p className="text-xs text-gray-500 mt-1">Enter the full path to your project folder</p>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-3">GitHub Repository</label>
            
//             <div className="space-y-3">
//               {repos && repos.length > 0 && (
//                 <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-600 transition">
//                   <input
//                     type="radio"
//                     name="repoOption"
//                     value="existing"
//                     checked={formData.repoOption === 'existing'}
//                     onChange={(e) => setFormData({ ...formData, repoOption: e.target.value })}
//                     className="mt-1 mr-3"
//                   />
//                   <div>
//                     <p className="font-medium text-gray-800">Use existing repo</p>
//                     <p className="text-sm text-gray-600 mt-1">Backup to: {repos[0].repoName}</p>
//                   </div>
//                 </label>
//               )}

//               <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-600 transition">
//                 <input
//                   type="radio"
//                   name="repoOption"
//                   value="new"
//                   checked={formData.repoOption === 'new'}
//                   onChange={(e) => setFormData({ ...formData, repoOption: e.target.value })}
//                   className="mt-1 mr-3"
//                 />
//                 <div className="flex-1">
//                   <p className="font-medium text-gray-800">Create new repo for this project</p>
//                   <p className="text-sm text-gray-600 mt-1">Better organization for multiple projects</p>
//                   {formData.repoOption === 'new' && (
//                     <input
//                       type="text"
//                       value={formData.repoName}
//                       onChange={(e) => setFormData({ ...formData, repoName: e.target.value })}
//                       placeholder="repo-name"
//                       className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
//                     />
//                   )}
//                 </div>
//               </label>
//             </div>
//           </div>

//           <div className="flex space-x-4 pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               disabled={loading}
//               className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
//             >
//               {loading ? 'Adding...' : 'Add Project'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddProjectModal;
// import React, { useState } from 'react';
// import { Upload, FolderOpen, File } from 'lucide-react';
// import api from '../services/api';

// const AddProjectModal = ({ onClose, onAdd, repos, showNotification }) => {
//   const [formData, setFormData] = useState({
//     name: '',
//     repoOption: 'existing',
//     repoName: repos && repos.length > 0 ? repos[0].repoName : ''
//   });
//   const [uploadedFiles, setUploadedFiles] = useState([]);
//   const [uploadType, setUploadType] = useState('folder'); // 'folder' or 'files'
//   const [loading, setLoading] = useState(false);
//   const [uploading, setUploading] = useState(false);

//   const handleFileUpload = async (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length === 0) return;

//     setUploading(true);
//     try {
//       // Store files temporarily
//       setUploadedFiles(files);
//       showNotification(`${files.length} file(s) selected for upload`);
//     } catch (error) {
//       showNotification('Failed to process files', 'error');
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleFolderUpload = async (e) => {
//     const files = Array.from(e.target.files);
//     if (files.length === 0) return;

//     setUploading(true);
//     try {
//       // Store folder contents
//       setUploadedFiles(files);
//       showNotification(`${files.length} file(s) from folder selected`);
//     } catch (error) {
//       showNotification('Failed to process folder', 'error');
//     } finally {
//       setUploading(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
    
//     if (!formData.name) {
//       showNotification('Please enter a project name', 'error');
//       return;
//     }

//     if (uploadedFiles.length === 0) {
//       showNotification('Please upload files or a folder', 'error');
//       return;
//     }

//     if (formData.repoOption === 'new' && !formData.repoName) {
//       showNotification('Please enter a repository name', 'error');
//       return;
//     }

//     setLoading(true);

//     try {
//       let repoNameToUse = formData.repoName;

//       // If creating new repo, create it first
//       if (formData.repoOption === 'new') {
//         const repoResponse = await api.post('/github/create-repo', {
//           repoName: formData.repoName,
//           isPrivate: true
//         });

//         repoNameToUse = repoResponse.data.repoName;
//         showNotification(`Repository "${repoNameToUse}" created successfully!`);
//       } else {
//         repoNameToUse = repos[0].repoName;
//       }

//       // Create FormData for file upload
//       const uploadFormData = new FormData();
//       uploadFormData.append('name', formData.name);
//       uploadFormData.append('repoName', repoNameToUse);
//       uploadFormData.append('uploadType', uploadType);

//       // Add all files to FormData
//       uploadedFiles.forEach((file) => {
//         // Preserve folder structure using webkitRelativePath
//         const relativePath = file.webkitRelativePath || file.name;
//         uploadFormData.append('files', file, relativePath);
//       });

//       // Upload files and create project
//       const response = await api.post('/projects/upload', uploadFormData, {
//         headers: {
//           'Content-Type': 'multipart/form-data'
//         }
//       });

//       showNotification('Project created and files uploaded successfully!');
//       await onAdd(response.data.project);
//       onClose();
//     } catch (error) {
//       console.error('Error:', error);
//       showNotification(
//         error.response?.data?.error || 'Failed to create project', 
//         'error'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatFileSize = (bytes) => {
//     if (bytes === 0) return '0 Bytes';
//     const k = 1024;
//     const sizes = ['Bytes', 'KB', 'MB', 'GB'];
//     const i = Math.floor(Math.log(bytes) / Math.log(k));
//     return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
//   };

//   const totalSize = uploadedFiles.reduce((sum, file) => sum + file.size, 0);

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Project</h2>
        
//         <form onSubmit={handleSubmit} className="space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
//             <input
//               type="text"
//               value={formData.name}
//               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//               placeholder="e.g., Trap Beat Pack"
//               className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
//               required
//             />
//           </div>

//           {/* Upload Type Selection */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-3">Upload Type</label>
//             <div className="grid grid-cols-2 gap-3">
//               <button
//                 type="button"
//                 onClick={() => setUploadType('folder')}
//                 className={`p-4 border-2 rounded-lg transition ${
//                   uploadType === 'folder'
//                     ? 'border-purple-600 bg-purple-50'
//                     : 'border-gray-200 hover:border-purple-400'
//                 }`}
//               >
//                 <FolderOpen className={`w-6 h-6 mx-auto mb-2 ${
//                   uploadType === 'folder' ? 'text-purple-600' : 'text-gray-500'
//                 }`} />
//                 <p className="font-medium text-gray-800">Upload Folder</p>
//                 <p className="text-xs text-gray-500 mt-1">Select entire folder</p>
//               </button>
              
//               <button
//                 type="button"
//                 onClick={() => setUploadType('files')}
//                 className={`p-4 border-2 rounded-lg transition ${
//                   uploadType === 'files'
//                     ? 'border-purple-600 bg-purple-50'
//                     : 'border-gray-200 hover:border-purple-400'
//                 }`}
//               >
//                 <File className={`w-6 h-6 mx-auto mb-2 ${
//                   uploadType === 'files' ? 'text-purple-600' : 'text-gray-500'
//                 }`} />
//                 <p className="font-medium text-gray-800">Upload Files</p>
//                 <p className="text-xs text-gray-500 mt-1">Select individual files</p>
//               </button>
//             </div>
//           </div>

//           {/* File/Folder Upload Area */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               {uploadType === 'folder' ? 'Select Folder' : 'Select Files'}
//             </label>
            
//             <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-600 transition">
//               <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              
//               {uploadedFiles.length === 0 ? (
//                 <>
//                   <p className="text-gray-600 mb-2">
//                     {uploadType === 'folder' 
//                       ? 'Click to select a folder'
//                       : 'Click to select files'
//                     }
//                   </p>
//                   <p className="text-xs text-gray-500">
//                     All file types are supported
//                   </p>
//                 </>
//               ) : (
//                 <div className="text-left">
//                   <p className="text-green-600 font-medium mb-2">
//                     ✓ {uploadedFiles.length} file(s) selected
//                   </p>
//                   <p className="text-sm text-gray-600">
//                     Total size: {formatFileSize(totalSize)}
//                   </p>
//                   {uploadedFiles.length <= 5 && (
//                     <div className="mt-3 space-y-1">
//                       {uploadedFiles.slice(0, 5).map((file, idx) => (
//                         <p key={idx} className="text-xs text-gray-500 truncate">
//                           • {file.webkitRelativePath || file.name}
//                         </p>
//                       ))}
//                     </div>
//                   )}
//                   {uploadedFiles.length > 5 && (
//                     <p className="text-xs text-gray-500 mt-2">
//                       and {uploadedFiles.length - 5} more files...
//                     </p>
//                   )}
//                 </div>
//               )}
              
//               <input
//                 type="file"
//                 onChange={uploadType === 'folder' ? handleFolderUpload : handleFileUpload}
//                 {...(uploadType === 'folder' 
//                   ? { webkitdirectory: '', directory: '' } 
//                   : { multiple: true }
//                 )}
//                 className="hidden"
//                 id="file-upload"
//                 disabled={uploading}
//               />
              
//               <label
//                 htmlFor="file-upload"
//                 className="inline-block mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition"
//               >
//                 {uploading ? 'Processing...' : uploadType === 'folder' ? 'Select Folder' : 'Select Files'}
//               </label>
//             </div>
//           </div>

//           {/* Repository Selection */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-3">GitHub Repository</label>
            
//             <div className="space-y-3">
//               {repos && repos.length > 0 && (
//                 <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-600 transition">
//                   <input
//                     type="radio"
//                     name="repoOption"
//                     value="existing"
//                     checked={formData.repoOption === 'existing'}
//                     onChange={(e) => setFormData({ ...formData, repoOption: e.target.value })}
//                     className="mt-1 mr-3"
//                   />
//                   <div>
//                     <p className="font-medium text-gray-800">Use existing repo</p>
//                     <p className="text-sm text-gray-600 mt-1">Backup to: {repos[0].repoName}</p>
//                   </div>
//                 </label>
//               )}

//               <label className="flex items-start p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-purple-600 transition">
//                 <input
//                   type="radio"
//                   name="repoOption"
//                   value="new"
//                   checked={formData.repoOption === 'new'}
//                   onChange={(e) => setFormData({ ...formData, repoOption: e.target.value })}
//                   className="mt-1 mr-3"
//                 />
//                 <div className="flex-1">
//                   <p className="font-medium text-gray-800">Create new repo for this project</p>
//                   <p className="text-sm text-gray-600 mt-1">Better organization for multiple projects</p>
//                   {formData.repoOption === 'new' && (
//                     <input
//                       type="text"
//                       value={formData.repoName}
//                       onChange={(e) => setFormData({ ...formData, repoName: e.target.value })}
//                       placeholder="repo-name"
//                       className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
//                     />
//                   )}
//                 </div>
//               </label>
//             </div>
//           </div>

//           <div className="flex space-x-4 pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               disabled={loading || uploading}
//               className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading || uploading || uploadedFiles.length === 0}
//               className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
//             >
//               {loading ? 'Creating...' : 'Create Project'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddProjectModal;
import React, { useState } from 'react';
import { Upload, FolderOpen, File } from 'lucide-react';
import api from '../services/api';

const AddProjectModal = ({ onClose, repos, showNotification }) => {
  const [formData, setFormData] = useState({
    name: '',
    repoOption: 'existing',
    repoName: repos && repos.length > 0 ? repos[0].repoName : ''
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadType, setUploadType] = useState('folder'); // 'folder' or 'files'
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = e => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setUploadedFiles(files);
    showNotification(`${files.length} file(s) selected for upload`);
    setUploading(false);
  };

  const handleFolderUpload = e => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setUploadedFiles(files);
    showNotification(`${files.length} file(s) from folder selected`);
    setUploading(false);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    if (!formData.name) return showNotification('Please enter a project name', 'error');
    if (uploadedFiles.length === 0) return showNotification('Please upload files or a folder', 'error');
    if (formData.repoOption === 'new' && !formData.repoName) return showNotification('Please enter a repository name', 'error');

    setLoading(true);

    try {
      // ---- create repo if needed ----
      let repoNameToUse = formData.repoName;
      if (formData.repoOption === 'new') {
        const repoRes = await api.post('/github/create-repo', {
          repoName: formData.repoName,
          isPrivate: true
        });
        repoNameToUse = repoRes.data.repoName;
        showNotification(`Repository "${repoNameToUse}" created!`);
      } else {
        repoNameToUse = repos[0].repoName;
      }

      // ---- upload files ----
      const uploadForm = new FormData();
      uploadForm.append('name', formData.name);
      uploadForm.append('repoName', repoNameToUse);
      uploadForm.append('uploadType', uploadType);

      uploadedFiles.forEach(file => {
        const rel = file.webkitRelativePath || file.name;
        uploadForm.append('files', file, rel);
      });

      await api.post('/projects/upload', uploadForm, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showNotification('Project created & files uploaded!');
      onClose();               // <-- ONLY close – dashboard refreshes itself
    } catch (err) {
      console.error(err);
      showNotification(err.response?.data?.error || 'Failed to create project', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = bytes => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  const totalSize = uploadedFiles.reduce((s, f) => s + f.size, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Add New Project</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Trap Beat Pack"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
              required
            />
          </div>

          {/* Upload type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Upload Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setUploadType('folder')}
                className={`p-4 border-2 rounded-lg transition ${
                  uploadType === 'folder'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-400'
                }`}
              >
                <FolderOpen className={`w-6 h-6 mx-auto mb-2 ${uploadType === 'folder' ? 'text-purple-600' : 'text-gray-500'}`} />
                <p className="font-medium text-gray-800">Upload Folder</p>
                <p className="text-xs text-gray-500 mt-1">Select entire folder</p>
              </button>

              <button
                type="button"
                onClick={() => setUploadType('files')}
                className={`p-4 border-2 rounded-lg transition ${
                  uploadType === 'files'
                    ? 'border-purple-600 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-400'
                }`}
              >
                <File className={`w-6 h-6 mx-auto mb-2 ${uploadType === 'files' ? 'text-purple-600' : 'text-gray-500'}`} />
                <p className="font-medium text-gray-800">Upload Files</p>
                <p className="text-xs text-gray-500 mt-1">Select individual files</p>
              </button>
            </div>
          </div>

          {/* File picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {uploadType === 'folder' ? 'Select Folder' : 'Select Files'}
            </label>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-600 transition">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />

              {uploadedFiles.length === 0 ? (
                <>
                  <p className="text-gray-600 mb-2">
                    {uploadType === 'folder' ? 'Click to select a folder' : 'Click to select files'}
                  </p>
                  <p className="text-xs text-gray-500">All file types are supported</p>
                </>
              ) : (
                <div className="text-left">
                  <p className="text-green-600 font-medium mb-2">
                    {uploadedFiles.length} file(s) selected
                  </p>
                  <p className="text-sm text-gray-600">Total size: {formatFileSize(totalSize)}</p>
                  {uploadedFiles.length <= 5 && (
                    <div className="mt-3 space-y-1">
                      {uploadedFiles.slice(0, 5).map((f, i) => (
                        <p key={i} className="text-xs text-gray-500 truncate">
                          • {f.webkitRelativePath || f.name}
                        </p>
                      ))}
                    </div>
                  )}
                  {uploadedFiles.length > 5 && (
                    <p className="text-xs text-gray-500 mt-2">
                      and {uploadedFiles.length - 5} more files...
                    </p>
                  )}
                </div>
              )}

              <input
                type="file"
                onChange={uploadType === 'folder' ? handleFolderUpload : handleFileUpload}
                {...(uploadType === 'folder'
                  ? { webkitdirectory: '', directory: '' }
                  : { multiple: true })}
                className="hidden"
                id="file-upload"
                disabled={uploading}
              />
              <label
                htmlFor="file-upload"
                className="inline-block mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg cursor-pointer hover:bg-purple-700 transition"
              >
                {uploading ? 'Processing...' : uploadType === 'folder' ? 'Select Folder' : 'Select Files'}
              </label>
            </div>
          </div>

          {/* Repo selection */}
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
                    onChange={e => setFormData({ ...formData, repoOption: e.target.value })}
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
                  onChange={e => setFormData({ ...formData, repoOption: e.target.value })}
                  className="mt-1 mr-3"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-800">Create new repo for this project</p>
                  <p className="text-sm text-gray-600 mt-1">Better organization for multiple projects</p>
                  {formData.repoOption === 'new' && (
                    <input
                      type="text"
                      value={formData.repoName}
                      onChange={e => setFormData({ ...formData, repoName: e.target.value })}
                      placeholder="repo-name"
                      className="w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600"
                    />
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || uploading}
              className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploading || uploadedFiles.length === 0}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectModal;