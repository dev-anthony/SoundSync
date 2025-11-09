// const simpleGit = require('simple-git');
// const axios = require('axios');
// const fs = require('fs').promises;
// const path = require('path');
// const { decrypt } = require('../utils/encryption');
// const { readJSON, writeJSON, CONFIG_FILE, TOKENS_FILE } = require('../utils/storage');

// // Get all collaboration projects for a user
// const getCollaborationProjects = async (req, res) => {
//   try {
//     const username = req.user.username;
//     const config = await readJSON(CONFIG_FILE);
    
//     const userConfig = config[username];
//     if (!userConfig || !userConfig.collaborations) {
//       return res.json({ projects: [] });
//     }

//     res.json({ projects: userConfig.collaborations });
//   } catch (error) {
//     console.error('Get collaboration projects error:', error);
//     res.status(500).json({ error: 'Failed to fetch collaboration projects' });
//   }
// };

// // Create new collaboration project
// const createCollaboration = async (req, res) => {
//   try {
//     const { name, path: projectPath, repoName, description } = req.body;
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
//     const tokens = await readJSON(TOKENS_FILE);

//     if (!config[username]) {
//       config[username] = { collaborations: [], repos: [], projects: [] };
//     }
//     if (!config[username].collaborations) {
//       config[username].collaborations = [];
//     }

//     const userToken = tokens[username];
//     if (!userToken) {
//       return res.status(401).json({ error: 'GitHub not connected' });
//     }

//     const githubToken = decrypt(userToken.token);

//     // Create GitHub repository
//     console.log(`Creating collaboration repo: ${repoName}`);
//     const repoResponse = await axios.post(
//       `${process.env.GITHUB_API_URL}/user/repos`,
//       {
//         name: repoName,
//         private: false, // Public for collaboration
//         description: description || 'SoundSync Collaboration Project',
//         auto_init: true
//       },
//       {
//         headers: {
//           'Authorization': `Bearer ${githubToken}`,
//           'Accept': 'application/vnd.github.v3+json'
//         }
//       }
//     );

//     const repoUrl = repoResponse.data.html_url;
//     const cloneUrl = repoResponse.data.clone_url;

//     // Initialize Git and push initial content
//     const git = simpleGit(projectPath);
//     const isRepo = await git.checkIsRepo();
    
//     if (!isRepo) {
//       await git.init();
//       await git.addConfig('user.name', userToken.githubUsername);
//       await git.addConfig('user.email', `${username}@soundsync.local`);
//     }

//     const authenticatedUrl = cloneUrl.replace(
//       'https://github.com/',
//       `https://${githubToken}@github.com/`
//     );

//     try {
//       await git.removeRemote('collab-origin');
//     } catch {}
    
//     await git.addRemote('collab-origin', authenticatedUrl);

//     // Create README
//     const readmePath = path.join(projectPath, 'README.md');
//     await fs.writeFile(
//       readmePath,
//       `# ${name}\n\n${description || 'Collaboration project created with SoundSync'}\n`
//     );

//     await git.add('.');
//     await git.commit('Initial commit - Collaboration setup');
//     await git.push('collab-origin', 'main');

//     const newCollab = {
//       id: `collab_${Date.now()}`,
//       name,
//       path: projectPath,
//       repoName,
//       repoUrl,
//       cloneUrl,
//       description,
//       role: 'owner',
//       collaborators: 1,
//       lastSync: new Date().toISOString(),
//       hasUpdates: false,
//       createdAt: new Date().toISOString()
//     };

//     config[username].collaborations.push(newCollab);
//     await writeJSON(CONFIG_FILE, config);

//     res.status(201).json({
//       success: true,
//       project: newCollab
//     });
//   } catch (error) {
//     console.error('Create collaboration error:', error);
//     res.status(500).json({ 
//       error: 'Failed to create collaboration',
//       details: error.message 
//     });
//   }
// };

// // Join existing collaboration
// const joinCollaboration = async (req, res) => {
//   try {
//     const { shareLink, localPath } = req.body;
//     const username = req.user.username;

//     if (!shareLink || !localPath) {
//       return res.status(400).json({ error: 'Share link and local path required' });
//     }

//     // Parse share link to extract repo info
//     const urlParams = new URL(shareLink).searchParams;
//     const repoName = urlParams.get('repo');
//     const projectId = urlParams.get('id');

//     if (!repoName) {
//       return res.status(400).json({ error: 'Invalid share link' });
//     }

//     const config = await readJSON(CONFIG_FILE);
//     const tokens = await readJSON(TOKENS_FILE);

//     if (!config[username]) {
//       config[username] = { collaborations: [], repos: [], projects: [] };
//     }
//     if (!config[username].collaborations) {
//       config[username].collaborations = [];
//     }

//     const userToken = tokens[username];
//     if (!userToken) {
//       return res.status(401).json({ error: 'GitHub not connected' });
//     }

//     const githubToken = decrypt(userToken.token);

//     // Get repo details from GitHub
//     const repoResponse = await axios.get(
//       `${process.env.GITHUB_API_URL}/repos/${userToken.githubUsername}/${repoName}`,
//       {
//         headers: {
//           'Authorization': `Bearer ${githubToken}`,
//           'Accept': 'application/vnd.github.v3+json'
//         }
//       }
//     );

//     const repoUrl = repoResponse.data.html_url;
//     const cloneUrl = repoResponse.data.clone_url;

//     // Create local directory
//     await fs.mkdir(localPath, { recursive: true });

//     // Clone repository
//     console.log(`Cloning repo to: ${localPath}`);
//     const authenticatedUrl = cloneUrl.replace(
//       'https://github.com/',
//       `https://${githubToken}@github.com/`
//     );

//     const git = simpleGit();
//     await git.clone(authenticatedUrl, localPath);

//     const newCollab = {
//       id: `collab_${Date.now()}`,
//       name: repoName,
//       path: localPath,
//       repoName,
//       repoUrl,
//       cloneUrl,
//       role: 'collaborator',
//       collaborators: 2,
//       lastSync: new Date().toISOString(),
//       hasUpdates: false,
//       joinedAt: new Date().toISOString()
//     };

//     config[username].collaborations.push(newCollab);
//     await writeJSON(CONFIG_FILE, config);

//     res.json({
//       success: true,
//       project: newCollab
//     });
//   } catch (error) {
//     console.error('Join collaboration error:', error);
//     res.status(500).json({ 
//       error: 'Failed to join collaboration',
//       details: error.message 
//     });
//   }
// };

// // Push changes to collaboration repo
// const pushCollaboration = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const username = req.user.username;

//     const config = await readJSON(CONFIG_FILE);
//     const tokens = await readJSON(TOKENS_FILE);

//     const userConfig = config[username];
//     const userToken = tokens[username];

//     if (!userToken) {
//       return res.status(401).json({ error: 'GitHub not connected' });
//     }

//     const collab = userConfig.collaborations.find(c => c.id === id);
//     if (!collab) {
//       return res.status(404).json({ error: 'Collaboration not found' });
//     }

//     const githubToken = decrypt(userToken.token);
//     const git = simpleGit(collab.path);

//     // Check status
//     const status = await git.status();
    
//     if (!status.modified.length && !status.created.length && !status.deleted.length) {
//       return res.json({
//         success: true,
//         message: 'No changes to push'
//       });
//     }

//     // Stage, commit, and push
//     await git.add('.');
    
//     const timestamp = new Date().toLocaleString();
//     await git.commit(`Update - ${timestamp} by ${username}`);

//     const remoteName = collab.role === 'owner' ? 'collab-origin' : 'origin';
//     await git.push(remoteName, 'main');

//     // Update last sync time
//     collab.lastSync = new Date().toISOString();
//     await writeJSON(CONFIG_FILE, config);

//     res.json({
//       success: true,
//       message: 'Changes pushed successfully',
//       timestamp: collab.lastSync
//     });
//   } catch (error) {
//     console.error('Push collaboration error:', error);
//     res.status(500).json({ 
//       error: 'Failed to push changes',
//       details: error.message 
//     });
//   }
// };

// // Pull changes from collaboration repo
// const pullCollaboration = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const username = req.user.username;

//     const config = await readJSON(CONFIG_FILE);
//     const userConfig = config[username];

//     const collab = userConfig.collaborations.find(c => c.id === id);
//     if (!collab) {
//       return res.status(404).json({ error: 'Collaboration not found' });
//     }

//     const git = simpleGit(collab.path);

//     // Pull latest changes
//     const remoteName = collab.role === 'owner' ? 'collab-origin' : 'origin';
//     await git.pull(remoteName, 'main');

//     // Update last sync time
//     collab.lastSync = new Date().toISOString();
//     collab.hasUpdates = false;
//     await writeJSON(CONFIG_FILE, config);

//     res.json({
//       success: true,
//       message: 'Changes pulled successfully',
//       timestamp: collab.lastSync
//     });
//   } catch (error) {
//     console.error('Pull collaboration error:', error);
//     res.status(500).json({ 
//       error: 'Failed to pull changes',
//       details: error.message 
//     });
//   }
// };

// // Check for updates
// const checkUpdates = async (req, res) => {
//   try {
//     const username = req.user.username;
//     const config = await readJSON(CONFIG_FILE);
    
//     const userConfig = config[username];
//     if (!userConfig || !userConfig.collaborations) {
//       return res.json({ hasUpdates: false, notifications: [] });
//     }

//     const notifications = [];
//     let hasUpdates = false;

//     for (const collab of userConfig.collaborations) {
//       try {
//         const git = simpleGit(collab.path);
//         const remoteName = collab.role === 'owner' ? 'collab-origin' : 'origin';
        
//         await git.fetch(remoteName);
//         const status = await git.status();

//         if (status.behind > 0) {
//           hasUpdates = true;
//           collab.hasUpdates = true;
//           notifications.push({
//             projectId: collab.id,
//             projectName: collab.name,
//             message: `${collab.name} has ${status.behind} new commits`
//           });
//         }
//       } catch (error) {
//         console.error(`Error checking updates for ${collab.name}:`, error.message);
//       }
//     }

//     await writeJSON(CONFIG_FILE, config);

//     res.json({
//       hasUpdates,
//       notifications
//     });
//   } catch (error) {
//     console.error('Check updates error:', error);
//     res.status(500).json({ error: 'Failed to check updates' });
//   }
// };

// // Get notifications
// const getNotifications = async (req, res) => {
//   try {
//     const username = req.user.username;
//     const config = await readJSON(CONFIG_FILE);
    
//     const userConfig = config[username];
//     if (!userConfig || !userConfig.collaborations) {
//       return res.json({ notifications: [] });
//     }

//     const notifications = userConfig.collaborations
//       .filter(c => c.hasUpdates)
//       .map(c => ({
//         projectId: c.id,
//         projectName: c.name,
//         message: `New changes available in ${c.name}`
//       }));

//     res.json({ notifications });
//   } catch (error) {
//     console.error('Get notifications error:', error);
//     res.status(500).json({ error: 'Failed to fetch notifications' });
//   }
// };

// module.exports = {
//   getCollaborationProjects,
//   createCollaboration,
//   joinCollaboration,
//   pushCollaboration,
//   pullCollaboration,
//   checkUpdates,
//   getNotifications
// };
const simpleGit = require('simple-git');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { decrypt } = require('../utils/encryption');
const { readJSON, writeJSON, CONFIG_FILE, TOKENS_FILE } = require('../utils/storage');

const PROJECTS_DIR = path.resolve(__dirname, '..', 'projects');

// Get all collaboration projects for a user
const getCollaborationProjects = async (req, res) => {
  try {
    const username = req.user.username;
    const config = await readJSON(CONFIG_FILE);
    
    const userConfig = config[username];
    if (!userConfig || !userConfig.collaborations) {
      return res.json({ projects: [] });
    }

    res.json({ projects: userConfig.collaborations });
  } catch (error) {
    console.error('Get collaboration projects error:', error);
    res.status(500).json({ error: 'Failed to fetch collaboration projects' });
  }
};

// Create new collaboration project with file upload (like Add Project)
// const createCollaboration = async (req, res) => {
//   try {
//     const { name, repoName, description } = req.body;
//     const username = req.user.username;
//     const files = req.files;

//     if (!name || !repoName || !files || files.length === 0) {
//       return res.status(400).json({ error: 'Name, repoName, and files required' });
//     }

//     const config = await readJSON(CONFIG_FILE);
//     const tokens = await readJSON(TOKENS_FILE);

//     if (!config[username]) {
//       config[username] = { collaborations: [], repos: [], projects: [] };
//     }
//     if (!config[username].collaborations) {
//       config[username].collaborations = [];
//     }

//     const userToken = tokens[username];
//     if (!userToken) {
//       return res.status(401).json({ error: 'GitHub not connected' });
//     }

//     const githubToken = decrypt(userToken.token);

//     // === 1. CREATE ISOLATED PROJECT FOLDER ===
//     const projectId = `collab_${Date.now()}`;
//     const projectDir = path.join(PROJECTS_DIR, username, projectId);
//     await fs.mkdir(projectDir, { recursive: true });

//     // === 2. COPY USER FILES ===
//     let filesCount = 0;
//     let totalSize = 0;

//     for (const file of files) {
//       const relativePath = file.originalname.replace(/^.*[\\\/]/, '');
//       const targetPath = path.join(projectDir, relativePath);

//       const targetDir = path.dirname(targetPath);
//       await fs.mkdir(targetDir, { recursive: true });

//       await fs.copyFile(file.path, targetPath);
//       await fs.unlink(file.path);

//       filesCount++;
//       totalSize += file.size;
//     }

//     // === 3. CREATE GITHUB REPOSITORY (PUBLIC for collaboration) ===
//     console.log(`Creating collaboration repo: ${repoName}`);
//     const repoResponse = await axios.post(
//       `${process.env.GITHUB_API_URL}/user/repos`,
//       {
//         name: repoName,
//         private: false, // Public for collaboration
//         description: description || 'SoundSync Collaboration Project',
//         auto_init: false
//       },
//       {
//         headers: {
//           'Authorization': `Bearer ${githubToken}`,
//           'Accept': 'application/vnd.github.v3+json'
//         }
//       }
//     );

//     const repoUrl = repoResponse.data.html_url;
//     const cloneUrl = repoResponse.data.clone_url;

//     // === 4. INITIALIZE GIT AND PUSH ===
//     const git = simpleGit(projectDir);
//     await git.init();
//     await git.addConfig('user.name', userToken.githubUsername);
//     await git.addConfig('user.email', `${username}@soundsync.local`);

//     const authenticatedUrl = cloneUrl.replace(
//       'https://github.com/',
//       `https://${githubToken}@github.com/`
//     );

//     await git.addRemote('origin', authenticatedUrl);

//     // Create README
//     const readmePath = path.join(projectDir, 'README.md');
//     await fs.writeFile(
//       readmePath,
//       `# ${name}\n\n${description || 'Collaboration project created with SoundSync'}\n`
//     );

//     await git.add('.');
//     await git.commit('Initial commit - Collaboration setup');
//     await git.branch(['-M', 'main']);
//     await git.push('origin', 'main', ['--set-upstream']);

//     const totalMB = (totalSize / (1024 * 1024)).toFixed(2);

//     const newCollab = {
//       id: projectId,
//       name,
//       path: projectDir,
//       repoName,
//       repoUrl,
//       cloneUrl,
//       description,
//       role: 'owner',
//       ownerUsername: userToken.githubUsername,
//       collaborators: 1,
//       filesCount,
//       size: `${totalMB} MB`,
//       lastSync: new Date().toISOString(),
//       hasUpdates: false,
//       createdAt: new Date().toISOString()
//     };

//     config[username].collaborations.push(newCollab);
//     await writeJSON(CONFIG_FILE, config);

//     res.status(201).json({
//       success: true,
//       project: newCollab
//     });
//   } catch (error) {
//     console.error('Create collaboration error:', error);
//     res.status(500).json({ 
//       error: 'Failed to create collaboration',
//       details: error.message 
//     });
//   }
// };
const createCollaboration = async (req, res) => {
  try {
    // Ensure req.body exists even if no files uploaded
    const body = req.body || {};
    const { name, path: projectPath, repoName, description } = body;
    const username = req.user.username;

    // Check if frontend sent JSON or multipart files
    const files = req.files || [];

    // If using JSON only (no file upload)
    if (!files.length && !projectPath) {
      return res.status(400).json({ error: 'Project path required when no files are uploaded' });
    }

    if (!name || !repoName) {
      return res.status(400).json({ error: 'Name and repoName required' });
    }

    const config = await readJSON(CONFIG_FILE);
    const tokens = await readJSON(TOKENS_FILE);

    if (!config[username]) config[username] = { collaborations: [], repos: [], projects: [] };
    if (!config[username].collaborations) config[username].collaborations = [];

    const userToken = tokens[username];
    if (!userToken) {
      return res.status(401).json({ error: 'GitHub not connected' });
    }

    const githubToken = decrypt(userToken.token);

    // === Create GitHub repo ===
    console.log(`Creating collaboration repo: ${repoName}`);
    const repoResponse = await axios.post(
      `${process.env.GITHUB_API_URL}/user/repos`,
      {
        name: repoName,
        private: false,
        description: description || 'SoundSync Collaboration Project',
        auto_init: true
      },
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    const repoUrl = repoResponse.data.html_url;
    const cloneUrl = repoResponse.data.clone_url;

    // === Prepare local path ===
    const finalPath = files.length
      ? path.join(PROJECTS_DIR, username, `collab_${Date.now()}`)
      : projectPath;

    await fs.mkdir(finalPath, { recursive: true });

    // === If file uploads exist, copy them ===
    if (files.length) {
      for (const file of files) {
        const dest = path.join(finalPath, file.originalname);
        await fs.copyFile(file.path, dest);
        await fs.unlink(file.path);
      }
    }

    // === Git initialization ===
    const git = simpleGit(finalPath);
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      await git.init();
      await git.addConfig('user.name', userToken.githubUsername);
      await git.addConfig('user.email', `${username}@soundsync.local`);
    }

    const authenticatedUrl = cloneUrl.replace(
      'https://github.com/',
      `https://${githubToken}@github.com/`
    );
    await git.addRemote('origin', authenticatedUrl);

    const readmePath = path.join(finalPath, 'README.md');
    await fs.writeFile(
      readmePath,
      `# ${name}\n\n${description || 'Collaboration project created with SoundSync'}\n`
    );

    await git.add('.');
    await git.commit('Initial commit - Collaboration setup');
    await git.push('origin', 'main');

    const newCollab = {
      id: `collab_${Date.now()}`,
      name,
      path: finalPath,
      repoName,
      repoUrl,
      cloneUrl,
      description,
      role: 'owner',
      collaborators: 1,
      lastSync: new Date().toISOString(),
      hasUpdates: false,
      createdAt: new Date().toISOString()
    };

    config[username].collaborations.push(newCollab);
    await writeJSON(CONFIG_FILE, config);

    res.status(201).json({
      success: true,
      project: newCollab
    });
  } catch (error) {
    console.error('Create collaboration error:', error);
    res.status(500).json({
      error: 'Failed to create collaboration',
      details: error.message
    });
  }
};


// Join existing collaboration - clones to user-specified path
const joinCollaboration = async (req, res) => {
  try {
    const { shareLink, localPath } = req.body;
    const username = req.user.username;

    if (!shareLink || !localPath) {
      return res.status(400).json({ error: 'Share link and local path required' });
    }

    // Parse share link to extract repo info
    const urlParams = new URL(shareLink).searchParams;
    const repoName = urlParams.get('repo');
    const ownerUsername = urlParams.get('owner');

    if (!repoName || !ownerUsername) {
      return res.status(400).json({ error: 'Invalid share link' });
    }

    const config = await readJSON(CONFIG_FILE);
    const tokens = await readJSON(TOKENS_FILE);

    if (!config[username]) {
      config[username] = { collaborations: [], repos: [], projects: [] };
    }
    if (!config[username].collaborations) {
      config[username].collaborations = [];
    }

    const userToken = tokens[username];
    if (!userToken) {
      return res.status(401).json({ error: 'GitHub not connected' });
    }

    const githubToken = decrypt(userToken.token);

    // === 1. VERIFY LOCAL PATH ===
    // Create parent directory if it doesn't exist
    const parentDir = path.dirname(localPath);
    try {
      await fs.mkdir(parentDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create parent directory:', error);
    }

    // Check if localPath already exists
    try {
      await fs.access(localPath);
      return res.status(400).json({ error: 'Local path already exists. Please choose a different location.' });
    } catch {
      // Path doesn't exist, which is what we want
    }

    // === 2. GET REPO DETAILS ===
    const repoResponse = await axios.get(
      `${process.env.GITHUB_API_URL}/repos/${ownerUsername}/${repoName}`,
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    const repoUrl = repoResponse.data.html_url;
    const cloneUrl = repoResponse.data.clone_url;

    // === 3. CLONE REPOSITORY TO LOCAL PATH ===
    console.log(`Cloning repo to: ${localPath}`);
    const authenticatedUrl = cloneUrl.replace(
      'https://github.com/',
      `https://${githubToken}@github.com/`
    );

    const git = simpleGit();
    await git.clone(authenticatedUrl, localPath);

    // === 4. CALCULATE SIZE ===
    const calculateDirSize = async (dirPath) => {
      let totalSize = 0;
      let filesCount = 0;
      
      async function traverse(currentPath) {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        for (const entry of entries) {
          if (entry.name.startsWith('.')) continue;
          const fullPath = path.join(currentPath, entry.name);
          if (entry.isDirectory()) {
            await traverse(fullPath);
          } else {
            const stats = await fs.stat(fullPath);
            totalSize += stats.size;
            filesCount++;
          }
        }
      }
      
      await traverse(dirPath);
      return { totalSize, filesCount };
    };

    const { totalSize, filesCount } = await calculateDirSize(localPath);
    const totalMB = (totalSize / (1024 * 1024)).toFixed(2);

    const newCollab = {
      id: `collab_${Date.now()}`,
      name: repoName,
      path: localPath,
      repoName,
      repoUrl,
      cloneUrl,
      role: 'collaborator',
      ownerUsername,
      collaborators: 2,
      filesCount,
      size: `${totalMB} MB`,
      lastSync: new Date().toISOString(),
      hasUpdates: false,
      joinedAt: new Date().toISOString()
    };

    config[username].collaborations.push(newCollab);
    await writeJSON(CONFIG_FILE, config);

    res.json({
      success: true,
      project: newCollab
    });
  } catch (error) {
    console.error('Join collaboration error:', error);
    res.status(500).json({ 
      error: 'Failed to join collaboration',
      details: error.message 
    });
  }
};

// Push changes to collaboration repo
const pushCollaboration = async (req, res) => {
  try {
    const { id } = req.params;
    const username = req.user.username;

    const config = await readJSON(CONFIG_FILE);
    const tokens = await readJSON(TOKENS_FILE);

    const userConfig = config[username];
    const userToken = tokens[username];

    if (!userToken) {
      return res.status(401).json({ error: 'GitHub not connected' });
    }

    const collab = userConfig.collaborations.find(c => c.id === id);
    if (!collab) {
      return res.status(404).json({ error: 'Collaboration not found' });
    }

    const git = simpleGit(collab.path);

    // Check status
    const status = await git.status();
    
    if (!status.modified.length && !status.created.length && !status.deleted.length) {
      return res.json({
        success: true,
        message: 'No changes to push'
      });
    }

    // Stage, commit, and push
    await git.add('.');
    
    const timestamp = new Date().toLocaleString();
    await git.commit(`Update - ${timestamp} by ${username}`);

    await git.push('origin', 'main');

    // Update last sync time
    collab.lastSync = new Date().toISOString();
    await writeJSON(CONFIG_FILE, config);

    res.json({
      success: true,
      message: 'Changes pushed successfully',
      timestamp: collab.lastSync
    });
  } catch (error) {
    console.error('Push collaboration error:', error);
    res.status(500).json({ 
      error: 'Failed to push changes',
      details: error.message 
    });
  }
};

// Pull changes from collaboration repo
const pullCollaboration = async (req, res) => {
  try {
    const { id } = req.params;
    const username = req.user.username;

    const config = await readJSON(CONFIG_FILE);
    const userConfig = config[username];

    const collab = userConfig.collaborations.find(c => c.id === id);
    if (!collab) {
      return res.status(404).json({ error: 'Collaboration not found' });
    }

    const git = simpleGit(collab.path);

    // Pull latest changes
    await git.pull('origin', 'main');

    // Update last sync time
    collab.lastSync = new Date().toISOString();
    collab.hasUpdates = false;
    await writeJSON(CONFIG_FILE, config);

    res.json({
      success: true,
      message: 'Changes pulled successfully',
      timestamp: collab.lastSync
    });
  } catch (error) {
    console.error('Pull collaboration error:', error);
    res.status(500).json({ 
      error: 'Failed to pull changes',
      details: error.message 
    });
  }
};

// Check for updates
const checkUpdates = async (req, res) => {
  try {
    const username = req.user.username;
    const config = await readJSON(CONFIG_FILE);
    
    const userConfig = config[username];
    if (!userConfig || !userConfig.collaborations) {
      return res.json({ hasUpdates: false, notifications: [] });
    }

    const notifications = [];
    let hasUpdates = false;

    for (const collab of userConfig.collaborations) {
      try {
        const git = simpleGit(collab.path);
        
        await git.fetch('origin');
        const status = await git.status();

        if (status.behind > 0) {
          hasUpdates = true;
          collab.hasUpdates = true;
          notifications.push({
            projectId: collab.id,
            projectName: collab.name,
            message: `${collab.name} has ${status.behind} new commits`
          });
        }
      } catch (error) {
        console.error(`Error checking updates for ${collab.name}:`, error.message);
      }
    }

    await writeJSON(CONFIG_FILE, config);

    res.json({
      hasUpdates,
      notifications
    });
  } catch (error) {
    console.error('Check updates error:', error);
    res.status(500).json({ error: 'Failed to check updates' });
  }
};

// Get notifications
const getNotifications = async (req, res) => {
  try {
    const username = req.user.username;
    const config = await readJSON(CONFIG_FILE);
    
    const userConfig = config[username];
    if (!userConfig || !userConfig.collaborations) {
      return res.json({ notifications: [] });
    }

    const notifications = userConfig.collaborations
      .filter(c => c.hasUpdates)
      .map(c => ({
        projectId: c.id,
        projectName: c.name,
        message: `New changes available in ${c.name}`
      }));

    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

module.exports = {
  getCollaborationProjects,
  createCollaboration,
  joinCollaboration,
  pushCollaboration,
  pullCollaboration,
  checkUpdates,
  getNotifications
};