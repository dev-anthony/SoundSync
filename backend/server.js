// // import express from "express";
// // import cors from "cors";
// // import dotenv from "dotenv";
// // import { db } from "./db.js";
// // import userRoutes from "./routes/userRoutes.js";

// // dotenv.config();
// // const app = express();
// // app.use(cors());

// // app.use(express.json());

// // // Routes
// // app.use("/api/auth/", userRoutes);

// // app.listen(process.env.PORT, () => {
// //   console.log(`🚀 Server running on port ${process.env.PORT}`);
// // });
// const express = require('express');
// const cors = require('cors');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const simpleGit = require('simple-git');
// const fs = require('fs').promises;
// const path = require('path');
// const crypto = require('crypto');
// const axios = require('axios');

// const app = express();
// const PORT = 5000;
// const JWT_SECRET = 'your-secret-key-change-in-production';
// const ENCRYPTION_KEY = crypto.randomBytes(32);
// const IV_LENGTH = 16;

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Data storage paths
// const DATA_DIR = path.join(__dirname, 'data');
// const USERS_FILE = path.join(DATA_DIR, 'users.json');
// const TOKENS_FILE = path.join(DATA_DIR, 'tokens.json');
// const CONFIG_FILE = path.join(DATA_DIR, 'config.json');

// // Initialize data directory
// async function initDataDirectory() {
//   try {
//     await fs.mkdir(DATA_DIR, { recursive: true });
    
//     // Initialize files if they don't exist
//     for (const file of [USERS_FILE, TOKENS_FILE, CONFIG_FILE]) {
//       try {
//         await fs.access(file);
//       } catch {
//         await fs.writeFile(file, JSON.stringify({}));
//       }
//     }
//   } catch (error) {
//     console.error('Failed to initialize data directory:', error);
//   }
// }

// // Helper functions for reading/writing JSON files
// async function readJSON(filePath) {
//   try {
//     const data = await fs.readFile(filePath, 'utf8');
//     return JSON.parse(data);
//   } catch (error) {
//     return {};
//   }
// }

// async function writeJSON(filePath, data) {
//   await fs.writeFile(filePath, JSON.stringify(data, null, 2));
// }

// // Encryption/Decryption functions
// function encrypt(text) {
//   const iv = crypto.randomBytes(IV_LENGTH);
//   const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
//   let encrypted = cipher.update(text, 'utf8', 'hex');
//   encrypted += cipher.final('hex');
//   return iv.toString('hex') + ':' + encrypted;
// }

// function decrypt(text) {
//   const parts = text.split(':');
//   const iv = Buffer.from(parts[0], 'hex');
//   const encryptedText = parts[1];
//   const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
//   let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
//   decrypted += decipher.final('utf8');
//   return decrypted;
// }

// // Authentication middleware
// function authenticateToken(req, res, next) {
//   const authHeader = req.headers['authorization'];
//   const token = authHeader && authHeader.split(' ')[1];

//   if (!token) {
//     return res.status(401).json({ error: 'Access token required' });
//   }

//   jwt.verify(token, JWT_SECRET, (err, user) => {
//     if (err) {
//       return res.status(403).json({ error: 'Invalid token' });
//     }
//     req.user = user;
//     next();
//   });
// }

// // ==================== AUTH ENDPOINTS ====================

// // POST /api/auth/signup
// app.post('/api/auth/signup', async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({ error: 'Username and password required' });
//     }

//     if (password.length < 6) {
//       return res.status(400).json({ error: 'Password must be at least 6 characters' });
//     }

//     const users = await readJSON(USERS_FILE);

//     if (users[username]) {
//       return res.status(400).json({ error: 'Username already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
//     users[username] = {
//       username,
//       password: hashedPassword,
//       createdAt: new Date().toISOString()
//     };

//     await writeJSON(USERS_FILE, users);

//     const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });

//     res.json({
//       success: true,
//       token,
//       username
//     });
//   } catch (error) {
//     console.error('Signup error:', error);
//     res.status(500).json({ error: 'Signup failed' });
//   }
// });

// // POST /api/auth/login
// app.post('/api/auth/login', async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({ error: 'Username and password required' });
//     }

//     const users = await readJSON(USERS_FILE);
//     const user = users[username];

//     if (!user) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const validPassword = await bcrypt.compare(password, user.password);

//     if (!validPassword) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });

//     // Check if GitHub token exists
//     const tokens = await readJSON(TOKENS_FILE);
//     const hasGithubToken = !!tokens[username];

//     res.json({
//       success: true,
//       token,
//       username,
//       hasGithubToken
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ error: 'Login failed' });
//   }
// });

// // ==================== GITHUB ENDPOINTS ====================

// // POST /api/github/connect
// app.post('/api/github/connect', authenticateToken, async (req, res) => {
//   try {
//     const { githubToken } = req.body;
//     const username = req.user.username;

//     if (!githubToken) {
//       return res.status(400).json({ error: 'GitHub token required' });
//     }

//     // Validate token with GitHub API
//     const response = await axios.get('https://api.github.com/user', {
//       headers: {
//         'Authorization': `Bearer ${githubToken}`,
//         'Accept': 'application/vnd.github.v3+json'
//       }
//     });

//     const githubUsername = response.data.login;

//     // Encrypt and store token
//     const tokens = await readJSON(TOKENS_FILE);
//     tokens[username] = {
//       token: encrypt(githubToken),
//       githubUsername,
//       connectedAt: new Date().toISOString()
//     };

//     await writeJSON(TOKENS_FILE, tokens);

//     res.json({
//       success: true,
//       githubUsername
//     });
//   } catch (error) {
//     console.error('GitHub connect error:', error);
//     if (error.response && error.response.status === 401) {
//       return res.status(401).json({ error: 'Invalid GitHub token' });
//     }
//     res.status(500).json({ error: 'Failed to connect GitHub' });
//   }
// });

// // POST /api/github/create-repo
// app.post('/api/github/create-repo', authenticateToken, async (req, res) => {
//   try {
//     const { repoName, isPrivate = true } = req.body;
//     const username = req.user.username;

//     if (!repoName) {
//       return res.status(400).json({ error: 'Repository name required' });
//     }

//     const tokens = await readJSON(TOKENS_FILE);
//     const userToken = tokens[username];

//     if (!userToken) {
//       return res.status(401).json({ error: 'GitHub not connected' });
//     }

//     const githubToken = decrypt(userToken.token);

//     // Create repository via GitHub API
//     const response = await axios.post(
//       'https://api.github.com/user/repos',
//       {
//         name: repoName,
//         private: isPrivate,
//         description: 'Producer backup repository'
//       },
//       {
//         headers: {
//           'Authorization': `Bearer ${githubToken}`,
//           'Accept': 'application/vnd.github.v3+json'
//         }
//       }
//     );

//     const repoUrl = response.data.html_url;
//     const cloneUrl = response.data.clone_url;

//     // Store repo configuration
//     const config = await readJSON(CONFIG_FILE);
//     if (!config[username]) {
//       config[username] = { repos: [] };
//     }
    
//     config[username].repos.push({
//       repoName,
//       repoUrl,
//       cloneUrl,
//       isPrivate,
//       createdAt: new Date().toISOString()
//     });

//     await writeJSON(CONFIG_FILE, config);

//     res.json({
//       success: true,
//       repoName,
//       repoUrl,
//       cloneUrl
//     });
//   } catch (error) {
//     console.error('Create repo error:', error);
//     if (error.response && error.response.status === 422) {
//       return res.status(400).json({ error: 'Repository already exists' });
//     }
//     res.status(500).json({ error: 'Failed to create repository' });
//   }
// });

// // GET /api/github/repos
// app.get('/api/github/repos', authenticateToken, async (req, res) => {
//   try {
//     const username = req.user.username;
//     const config = await readJSON(CONFIG_FILE);
    
//     const userConfig = config[username];
//     if (!userConfig || !userConfig.repos) {
//       return res.json({ repos: [] });
//     }

//     res.json({ repos: userConfig.repos });
//   } catch (error) {
//     console.error('Get repos error:', error);
//     res.status(500).json({ error: 'Failed to fetch repositories' });
//   }
// });

// // ==================== PROJECT ENDPOINTS ====================

// // GET /api/projects
// app.get('/api/projects', authenticateToken, async (req, res) => {
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
// });

// // POST /api/projects/add
// app.post('/api/projects/add', authenticateToken, async (req, res) => {
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

//     res.json({
//       success: true,
//       project: newProject
//     });
//   } catch (error) {
//     console.error('Add project error:', error);
//     res.status(500).json({ error: 'Failed to add project' });
//   }
// });

// // DELETE /api/projects/:id
// app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
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

//     res.json({ success: true });
//   } catch (error) {
//     console.error('Remove project error:', error);
//     res.status(500).json({ error: 'Failed to remove project' });
//   }
// });

// // GET /api/projects/:id/files
// app.get('/api/projects/:id/files', authenticateToken, async (req, res) => {
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
// });

// // ==================== BACKUP ENDPOINTS ====================

// // POST /api/backup/project/:id
// app.post('/api/backup/project/:id', authenticateToken, async (req, res) => {
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

//     const project = userConfig.projects.find(p => p.id === id);
//     if (!project) {
//       return res.status(404).json({ error: 'Project not found' });
//     }

//     const repo = userConfig.repos.find(r => r.repoName === project.repoName);
//     if (!repo) {
//       return res.status(404).json({ error: 'Repository not found' });
//     }

//     const githubToken = decrypt(userToken.token);
//     const git = simpleGit(project.path);

//     // Check if git is initialized
//     const isRepo = await git.checkIsRepo();
    
//     if (!isRepo) {
//       await git.init();
      
//       // Add authenticated remote URL
//       const authenticatedUrl = repo.cloneUrl.replace(
//         'https://',
//         `https://${githubToken}@`
//       );
//       await git.addRemote('origin', authenticatedUrl);
//     }

//     // Create .gitignore if it doesn't exist
//     const gitignorePath = path.join(project.path, '.gitignore');
//     try {
//       await fs.access(gitignorePath);
//     } catch {
//       await fs.writeFile(gitignorePath, '*.cache\n*.log\n*.tmp\nTemp/\nCache/\nnode_modules/\n');
//     }

//     // Get status to see changes
//     const status = await git.status();
    
//     const changes = {
//       modified: status.modified.length,
//       created: status.created.length + status.not_added.length,
//       deleted: status.deleted.length
//     };

//     // Stage all changes
//     await git.add('.');

//     // Commit with detailed message
//     const timestamp = new Date().toLocaleString();
//     const commitMessage = `Backup - ${timestamp}\n\nModified: ${changes.modified} files\nAdded: ${changes.created} files\nDeleted: ${changes.deleted} files`;
    
//     await git.commit(commitMessage);

//     // Push to GitHub
//     await git.push('origin', 'main');

//     // Update project config
//     project.lastBackup = new Date().toISOString();
//     project.filesCount = changes.modified + changes.created;
//     await writeJSON(CONFIG_FILE, config);

//     res.json({
//       success: true,
//       changes,
//       timestamp: project.lastBackup
//     });
//   } catch (error) {
//     console.error('Backup error:', error);
//     res.status(500).json({ error: 'Backup failed: ' + error.message });
//   }
// });

// // POST /api/backup/all
// app.post('/api/backup/all', authenticateToken, async (req, res) => {
//   try {
//     const username = req.user.username;
//     const config = await readJSON(CONFIG_FILE);
//     const userConfig = config[username];

//     if (!userConfig || !userConfig.projects || userConfig.projects.length === 0) {
//       return res.status(400).json({ error: 'No projects to backup' });
//     }

//     const results = [];

//     for (const project of userConfig.projects) {
//       try {
//         // Call backup for each project
//         const result = await axios.post(
//           `http://localhost:${PORT}/api/backup/project/${project.id}`,
//           {},
//           {
//             headers: {
//               'Authorization': req.headers.authorization
//             }
//           }
//         );
//         results.push({ projectId: project.id, success: true });
//       } catch (error) {
//         results.push({ projectId: project.id, success: false, error: error.message });
//       }
//     }

//     res.json({
//       success: true,
//       results
//     });
//   } catch (error) {
//     console.error('Backup all error:', error);
//     res.status(500).json({ error: 'Backup all failed' });
//   }
// });

// // GET /api/projects/:id/history
// app.get('/api/projects/:id/history', authenticateToken, async (req, res) => {
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

//     const project = userConfig.projects.find(p => p.id === id);
//     if (!project) {
//       return res.status(404).json({ error: 'Project not found' });
//     }

//     const repo = userConfig.repos.find(r => r.repoName === project.repoName);
//     if (!repo) {
//       return res.status(404).json({ error: 'Repository not found' });
//     }

//     const githubToken = decrypt(userToken.token);

//     // Get commit history from GitHub API
//     const response = await axios.get(
//       `https://api.github.com/repos/${userToken.githubUsername}/${project.repoName}/commits`,
//       {
//         headers: {
//           'Authorization': `Bearer ${githubToken}`,
//           'Accept': 'application/vnd.github.v3+json'
//         }
//       }
//     );

//     const commits = response.data.map(commit => ({
//       sha: commit.sha,
//       message: commit.commit.message,
//       author: commit.commit.author.name,
//       date: commit.commit.author.date,
//       url: commit.html_url
//     }));

//     res.json({
//       success: true,
//       commits
//     });
//   } catch (error) {
//     console.error('Get history error:', error);
//     res.status(500).json({ error: 'Failed to fetch history' });
//   }
// });

// // ==================== SETTINGS ENDPOINTS ====================

// // GET /api/settings
// app.get('/api/settings', authenticateToken, async (req, res) => {
//   try {
//     const username = req.user.username;
//     const config = await readJSON(CONFIG_FILE);
//     const tokens = await readJSON(TOKENS_FILE);

//     const userConfig = config[username] || {};
//     const userToken = tokens[username];

//     const settings = {
//       autoBackupOnLaunch: userConfig.autoBackupOnLaunch || false,
//       scheduledBackup: userConfig.scheduledBackup || 'disabled',
//       githubConnected: !!userToken,
//       githubUsername: userToken ? userToken.githubUsername : null
//     };

//     res.json({ success: true, settings });
//   } catch (error) {
//     console.error('Get settings error:', error);
//     res.status(500).json({ error: 'Failed to fetch settings' });
//   }
// });

// // PUT /api/settings
// app.put('/api/settings', authenticateToken, async (req, res) => {
//   try {
//     const username = req.user.username;
//     const { autoBackupOnLaunch, scheduledBackup } = req.body;

//     const config = await readJSON(CONFIG_FILE);
    
//     if (!config[username]) {
//       config[username] = {};
//     }

//     config[username].autoBackupOnLaunch = autoBackupOnLaunch;
//     config[username].scheduledBackup = scheduledBackup;

//     await writeJSON(CONFIG_FILE, config);

//     res.json({ success: true });
//   } catch (error) {
//     console.error('Update settings error:', error);
//     res.status(500).json({ error: 'Failed to update settings' });
//   }
// });

// // Start server
// async function startServer() {
//   await initDataDirectory();
  
//   app.listen(PORT, () => {
//     console.log(`🚀 Backend server running on http://localhost:${PORT}`);
//     console.log(`📁 Data directory: ${DATA_DIR}`);
//   });
// }

// startServer();
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs').promises;

// Import routes
const collaborationRoutes = require('./routes/collaborationRoutes');
const authRoutes = require('./routes/authRoutes');
const githubRoutes = require('./routes/githubRoutes');
const projectRoutes = require('./routes/projectRoutes');
const backupRoutes = require('./routes/backupRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Initialize data directory
async function initDataDirectory() {
  const DATA_DIR = path.join(__dirname, 'data');
  
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    
    const files = ['users.json', 'tokens.json', 'config.json'];
    for (const file of files) {
      const filePath = path.join(DATA_DIR, file);
      try {
        await fs.access(filePath);
      } catch {
        await fs.writeFile(filePath, JSON.stringify({}));
      }
    }
    
    console.log('✅ Data directory initialized');
  } catch (error) {
    console.error('❌ Failed to initialize data directory:', error);
  }
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/github', githubRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/backup', backupRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/collaboration', collaborationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'SoundSync API is running' });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
  await initDataDirectory();
  
  app.listen(PORT, () => {
    console.log(`SoundSync Backend running on http://localhost:${PORT}`);
    console.log(`Data directory: ${path.join(__dirname, 'data')}`);
    console.log(`Accepting requests from: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  });
}
// const token = crypto.randomBytes(32).toString('hex')
// console.log(token)

startServer();

module.exports = app;