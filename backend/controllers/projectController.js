// const fs = require('fs').promises;
// const path = require('path');
// const { readJSON, writeJSON, CONFIG_FILE } = require('../utils/storage');

// const getProjects = async (req, res) => {
//   try {
//     const username = req.user.username;
//     const config = await readJSON(CONFIG_FILE);
    
//     const userConfig = config[username];
//     if (!userConfig || !userConfig.projects) {
//       return res.json({ projects: [] });
//     }

//     res.json({ projects: userConfig.projects });
//   } catch (error) {
//     console.error('Get projects error:', error);
//     res.status(500).json({ error: 'Failed to fetch projects' });
//   }
// };

// const addProject = async (req, res) => {
//   try {
//     const { name, path: projectPath, repoName } = req.body;
//     const username = req.user.username;

//     if (!name || !projectPath || !repoName) {
//       return res.status(400).json({ error: 'Name, path, and repoName required' });
//     }

//     // Verify path exists
//     try {
//       await fs.access(projectPath);
//     } catch {
//       return res.status(400).json({ error: 'Project path does not exist' });
//     }

//     const config = await readJSON(CONFIG_FILE);
//     if (!config[username]) {
//       config[username] = { projects: [], repos: [] };
//     }
//     if (!config[username].projects) {
//       config[username].projects = [];
//     }

//     const newProject = {
//       id: `proj_${Date.now()}`,
//       name,
//       path: projectPath,
//       repoName,
//       lastBackup: null,
//       filesCount: 0,
//       size: '0 MB',
//       createdAt: new Date().toISOString()
//     };

//     config[username].projects.push(newProject);
//     await writeJSON(CONFIG_FILE, config);

//     res.status(201).json({
//       success: true,
//       project: newProject
//     });
//   } catch (error) {
//     console.error('Add project error:', error);
//     res.status(500).json({ error: 'Failed to add project' });
//   }
// };

// const removeProject = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const username = req.user.username;

//     const config = await readJSON(CONFIG_FILE);
//     const userConfig = config[username];

//     if (!userConfig || !userConfig.projects) {
//       return res.status(404).json({ error: 'Project not found' });
//     }

//     const projectIndex = userConfig.projects.findIndex(p => p.id === id);
    
//     if (projectIndex === -1) {
//       return res.status(404).json({ error: 'Project not found' });
//     }

//     userConfig.projects.splice(projectIndex, 1);
//     await writeJSON(CONFIG_FILE, config);

//     res.json({ success: true, message: 'Project removed' });
//   } catch (error) {
//     console.error('Remove project error:', error);
//     res.status(500).json({ error: 'Failed to remove project' });
//   }
// };

// const getProjectFiles = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const username = req.user.username;

//     const config = await readJSON(CONFIG_FILE);
//     const userConfig = config[username];
//     const project = userConfig.projects.find(p => p.id === id);

//     if (!project) {
//       return res.status(404).json({ error: 'Project not found' });
//     }

//     async function getFileTree(dirPath, relativePath = '') {
//       const entries = await fs.readdir(dirPath, { withFileTypes: true });
//       const files = [];

//       for (const entry of entries) {
//         // Skip hidden files and node_modules
//         if (entry.name.startsWith('.') || entry.name === 'node_modules') {
//           continue;
//         }

//         const fullPath = path.join(dirPath, entry.name);
//         const relPath = path.join(relativePath, entry.name);

//         if (entry.isDirectory()) {
//           files.push({
//             name: entry.name,
//             type: 'directory',
//             path: relPath,
//             children: await getFileTree(fullPath, relPath)
//           });
//         } else {
//           const stats = await fs.stat(fullPath);
//           files.push({
//             name: entry.name,
//             type: 'file',
//             path: relPath,
//             size: stats.size,
//             modified: stats.mtime
//           });
//         }
//       }

//       return files;
//     }

//     const fileTree = await getFileTree(project.path);

//     res.json({
//       success: true,
//       files: fileTree
//     });
//   } catch (error) {
//     console.error('Get files error:', error);
//     res.status(500).json({ error: 'Failed to fetch files' });
//   }
// };

// module.exports = {
//   getProjects,
//   addProject,
//   removeProject,
//   getProjectFiles
// };
const fs = require('fs').promises;
const path = require('path');
const { readJSON, writeJSON, CONFIG_FILE } = require('../utils/storage');

// Directory to store uploaded projects
// const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

// // Ensure uploads directory exists
// const ensureUploadsDir = async () => {
//   try {
//     await fs.access(UPLOADS_DIR);
//   } catch {
//     await fs.mkdir(UPLOADS_DIR, { recursive: true });
//   }
// };

const getProjects = async (req, res) => {
  try {
    const username = req.user.username;
    const config = await readJSON(CONFIG_FILE);
    
    const userConfig = config[username];
    if (!userConfig || !userConfig.projects) {
      return res.json({ projects: [] });
    }

    res.json({ projects: userConfig.projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
};

// const uploadProject = async (req, res) => {
//   try {
//     const { name, repoName, uploadType } = req.body;
//     const username = req.user.username;
//     const files = req.files;

//     console.log('Upload project request:', { name, repoName, uploadType, filesCount: files?.length });

//     if (!name || !repoName) {
//       return res.status(400).json({ error: 'Name and repoName required' });
//     }

//     if (!files || files.length === 0) {
//       return res.status(400).json({ error: 'No files uploaded' });
//     }

//     await ensureUploadsDir();

//     // Create project directory
//     const projectId = `proj_${Date.now()}`;
//     const projectDir = path.join(UPLOADS_DIR, username, projectId);
//     await fs.mkdir(projectDir, { recursive: true });

//     console.log('Created project directory:', projectDir);

//     // CRITICAL FIX: Extract the actual content without wrapper folders
//     let filesCount = 0;
//     let totalSize = 0;

//     // Group files by their root folder (if uploaded as folder)
//     const filesByRoot = {};
    
//     for (const file of files) {
//       const relativePath = file.originalname;
//       const pathParts = relativePath.split(path.sep).filter(p => p);
      
//       if (pathParts.length > 0) {
//         const rootFolder = pathParts[0];
//         if (!filesByRoot[rootFolder]) {
//           filesByRoot[rootFolder] = [];
//         }
//         filesByRoot[rootFolder].push({ file, pathParts });
//       }
//     }

//     // Determine if this is a single folder upload or multiple files
//     const rootFolders = Object.keys(filesByRoot);
//     const isSingleFolderUpload = uploadType === 'folder' && rootFolders.length === 1;

//     console.log('Upload analysis:', { 
//       rootFolders, 
//       isSingleFolderUpload,
//       uploadType 
//     });

//     // Process files based on upload type
//     for (const file of files) {
//       const relativePath = file.originalname;
//       const pathParts = relativePath.split(path.sep).filter(p => p);
      
//       let targetPath;
      
//       if (isSingleFolderUpload) {
//         // STRIP THE ROOT FOLDER - only save the contents
//         // e.g., "MyProject/src/file.js" becomes "src/file.js"
//         const contentPath = pathParts.slice(1).join(path.sep);
        
//         // Skip if it's just the folder itself with no content
//         if (!contentPath) continue;
        
//         targetPath = path.join(projectDir, contentPath);
//       } else {
//         // For individual files, keep the structure as-is
//         targetPath = path.join(projectDir, relativePath);
//       }
      
//       // Create subdirectories if needed
//       const targetDir = path.dirname(targetPath);
//       await fs.mkdir(targetDir, { recursive: true });

//       // Move file from temp location to target location
//       await fs.copyFile(file.path, targetPath);
//       await fs.unlink(file.path); // Clean up temp file

//       filesCount++;
//       totalSize += file.size;
      
//       console.log(`Saved: ${relativePath} -> ${path.relative(projectDir, targetPath)}`);
//     }

//     console.log(`Saved ${filesCount} files, total size: ${totalSize} bytes`);

//     // Calculate size in MB
//     const totalMB = (totalSize / (1024 * 1024)).toFixed(2);

//     // Create project entry
//     const config = await readJSON(CONFIG_FILE);
//     if (!config[username]) {
//       config[username] = { projects: [], repos: [] };
//     }
//     if (!config[username].projects) {
//       config[username].projects = [];
//     }

//     const newProject = {
//       id: projectId,
//       name,
//       path: projectDir,
//       repoName,
//       lastBackup: null,
//       filesCount,
//       size: `${totalMB} MB`,
//       uploadType,
//       createdAt: new Date().toISOString()
//     };

//     config[username].projects.push(newProject);
//     await writeJSON(CONFIG_FILE, config);

//     console.log('Project created successfully:', newProject);
//     console.log('Project directory contents will be pushed directly to GitHub (no wrapper folders)');

//     res.status(201).json({
//       success: true,
//       project: newProject
//     });
//   } catch (error) {
//     console.error('Upload project error:', error);
//     res.status(500).json({ error: 'Failed to upload project: ' + error.message });
//   }
// };
// const PROJECTS_DIR = path.join(__dirname, '..', 'projects');
const PROJECTS_DIR = path.resolve(__dirname, '..', 'projects');

const uploadProject = async (req, res) => {
  try {
    const { name, repoName } = req.body;
    const username = req.user.username;
    const files = req.files;

    if (!name || !repoName || !files || files.length === 0) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // === 1. CREATE ISOLATED PROJECT FOLDER ===
    const projectId = `proj_${Date.now()}`;
    const projectDir = path.join(PROJECTS_DIR, username, projectId);
    await fs.mkdir(projectDir, { recursive: true });

    // === 2. COPY ONLY USER FILES (NO APP CODE) ===
    let filesCount = 0;
    let totalSize = 0;

    for (const file of files) {
      const relativePath = file.originalname.replace(/^.*[\\\/]/, ''); // Strip any fake path
      const targetPath = path.join(projectDir, relativePath);

      await fs.copyFile(file.path, targetPath);
      await fs.unlink(file.path);

      filesCount++;
      totalSize += file.size;
    }

    const totalMB = (totalSize / (1024 * 1024)).toFixed(2);

    // === 3. SAVE TO CONFIG ===
    const config = await readJSON(CONFIG_FILE);
    if (!config[username]) config[username] = { projects: [], repos: [] };

    const newProject = {
      id: projectId,
      name,
      path: projectDir,
      repoName,
      lastBackup: null,
      filesCount,
      size: `${totalMB} MB`,
      createdAt: new Date().toISOString()
    };

    config[username].projects.push(newProject);
    await writeJSON(CONFIG_FILE, config);

    res.status(201).json({ success: true, project: newProject });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
};

const addProject = async (req, res) => {
  try {
    const { name, path: projectPath, repoName } = req.body;
    const username = req.user.username;

    if (!name || !projectPath || !repoName) {
      return res.status(400).json({ error: 'Name, path, and repoName required' });
    }

    // Verify path exists
    try {
      await fs.access(projectPath);
    } catch {
      return res.status(400).json({ error: 'Project path does not exist' });
    }

    const config = await readJSON(CONFIG_FILE);
    if (!config[username]) {
      config[username] = { projects: [], repos: [] };
    }
    if (!config[username].projects) {
      config[username].projects = [];
    }

    const newProject = {
      id: `proj_${Date.now()}`,
      name,
      path: projectPath,
      repoName,
      lastBackup: null,
      filesCount: 0,
      size: '0 MB',
      createdAt: new Date().toISOString()
    };

    config[username].projects.push(newProject);
    await writeJSON(CONFIG_FILE, config);

    res.status(201).json({
      success: true,
      project: newProject
    });
  } catch (error) {
    console.error('Add project error:', error);
    res.status(500).json({ error: 'Failed to add project' });
  }
};

const removeProject = async (req, res) => {
  try {
    const { id } = req.params;
    const username = req.user.username;

    const config = await readJSON(CONFIG_FILE);
    const userConfig = config[username];

    if (!userConfig || !userConfig.projects) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const projectIndex = userConfig.projects.findIndex(p => p.id === id);
    
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = userConfig.projects[projectIndex];

    // Delete project directory if it's in uploads folder
    if (project.path.includes('uploads')) {
      try {
        await fs.rm(project.path, { recursive: true, force: true });
        console.log('Deleted project directory:', project.path);
      } catch (error) {
        console.error('Failed to delete project directory:', error);
      }
    }

    userConfig.projects.splice(projectIndex, 1);
    await writeJSON(CONFIG_FILE, config);

    res.json({ success: true, message: 'Project removed' });
  } catch (error) {
    console.error('Remove project error:', error);
    res.status(500).json({ error: 'Failed to remove project' });
  }
};

const getProjectFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const username = req.user.username;

    const config = await readJSON(CONFIG_FILE);
    const userConfig = config[username];
    const project = userConfig.projects.find(p => p.id === id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    async function getFileTree(dirPath, relativePath = '') {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      const files = [];

      for (const entry of entries) {
        // Skip hidden files and node_modules
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
          continue;
        }

        const fullPath = path.join(dirPath, entry.name);
        const relPath = path.join(relativePath, entry.name);

        if (entry.isDirectory()) {
          files.push({
            name: entry.name,
            type: 'directory',
            path: relPath,
            children: await getFileTree(fullPath, relPath)
          });
        } else {
          const stats = await fs.stat(fullPath);
          files.push({
            name: entry.name,
            type: 'file',
            path: relPath,
            size: stats.size,
            modified: stats.mtime
          });
        }
      }

      return files;
    }

    const fileTree = await getFileTree(project.path);

    res.json({
      success: true,
      files: fileTree
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ error: 'Failed to fetch files' });
  }
};

const updateProjectFiles = async (req, res) => {
  try {
    const { id } = req.params;
    const username = req.user.username;
    const files = req.files;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const config = await readJSON(CONFIG_FILE);
    const userConfig = config[username];
    const project = userConfig.projects.find(p => p.id === id);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Add new files to project directory
    let newFilesCount = 0;
    let addedSize = 0;

    for (const file of files) {
      const relativePath = file.originalname;
      const targetPath = path.join(project.path, relativePath);
      
      const targetDir = path.dirname(targetPath);
      await fs.mkdir(targetDir, { recursive: true });

      await fs.copyFile(file.path, targetPath);
      await fs.unlink(file.path);

      newFilesCount++;
      addedSize += file.size;
    }

    // Update project metadata
    project.filesCount += newFilesCount;
    const currentSize = parseFloat(project.size) || 0;
    const newSize = currentSize + (addedSize / (1024 * 1024));
    project.size = `${newSize.toFixed(2)} MB`;

    await writeJSON(CONFIG_FILE, config);

    res.json({
      success: true,
      message: `Added ${newFilesCount} new file(s)`,
      project
    });
  } catch (error) {
    console.error('Update project files error:', error);
    res.status(500).json({ error: 'Failed to update project files' });
  }
};

module.exports = {
  getProjects,
  addProject,
  uploadProject,
  removeProject,
  getProjectFiles,
  updateProjectFiles
};