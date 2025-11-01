const simpleGit = require('simple-git');
const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { decrypt } = require('../utils/encryption');
const { readJSON, writeJSON, CONFIG_FILE, TOKENS_FILE } = require('../utils/storage');

const backupProject = async (req, res) => {
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

    const project = userConfig.projects.find(p => p.id === id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const repo = userConfig.repos.find(r => r.repoName === project.repoName);
    if (!repo) {
      return res.status(404).json({ error: 'Repository not found' });
    }

    const githubToken = decrypt(userToken.token);
    const git = simpleGit(project.path);

    // Check if git is initialized
    const isRepo = await git.checkIsRepo();
    
    if (!isRepo) {
      await git.init();
      await git.addConfig('user.name', userToken.githubUsername);
      await git.addConfig('user.email', `${username}@soundsync.local`);
      
      // Add authenticated remote URL
      const authenticatedUrl = repo.cloneUrl.replace(
        'https://',
        `https://${githubToken}@`
      );
      await git.addRemote('origin', authenticatedUrl);
    }

    // Create .gitignore if it doesn't exist
    const gitignorePath = path.join(project.path, '.gitignore');
    try {
      await fs.access(gitignorePath);
    } catch {
      const gitignoreContent = `# SoundSync Auto-generated
*.cache
*.log
*.tmp
Temp/
Cache/
node_modules/
.DS_Store
Thumbs.db
`;
      await fs.writeFile(gitignorePath, gitignoreContent);
    }

    // Get status to see changes
    const status = await git.status();
    
    const changes = {
      modified: status.modified.length,
      created: status.created.length + status.not_added.length,
      deleted: status.deleted.length
    };

    // Only proceed if there are changes
    if (changes.modified === 0 && changes.created === 0 && changes.deleted === 0) {
      return res.json({
        success: true,
        message: 'No changes to backup',
        changes
      });
    }

    // Stage all changes
    await git.add('.');

    // Commit with detailed message
    const timestamp = new Date().toLocaleString();
    const commitMessage = `Backup - ${timestamp}

Modified: ${changes.modified} files
Added: ${changes.created} files
Deleted: ${changes.deleted} files`;
    
    await git.commit(commitMessage);

    // Push to GitHub
    try {
      await git.push('origin', 'main');
    } catch (error) {
      // If main branch doesn't exist, try master
      try {
        await git.push('origin', 'master');
      } catch {
        // Create main branch and push
        await git.branch(['-M', 'main']);
        await git.push(['-u', 'origin', 'main']);
      }
    }

    // Update project config
    project.lastBackup = new Date().toISOString();
    project.filesCount = changes.modified + changes.created;
    
    // Calculate total size
    const calculateSize = async (dirPath) => {
      let totalSize = 0;
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);
        if (entry.isDirectory()) {
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            totalSize += await calculateSize(fullPath);
          }
        } else {
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
        }
      }
      return totalSize;
    };

    const totalBytes = await calculateSize(project.path);
    const totalMB = (totalBytes / (1024 * 1024)).toFixed(2);
    project.size = `${totalMB} MB`;

    await writeJSON(CONFIG_FILE, config);

    res.json({
      success: true,
      changes,
      timestamp: project.lastBackup,
      message: 'Backup completed successfully'
    });
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ error: 'Backup failed: ' + error.message });
  }
};

const backupAllProjects = async (req, res) => {
  try {
    const username = req.user.username;
    const config = await readJSON(CONFIG_FILE);
    const userConfig = config[username];

    if (!userConfig || !userConfig.projects || userConfig.projects.length === 0) {
      return res.status(400).json({ error: 'No projects to backup' });
    }

    const results = [];

    for (const project of userConfig.projects) {
      try {
        const response = await backupProject(
          { params: { id: project.id }, user: { username } },
          { json: () => {} }
        );
        results.push({ 
          projectId: project.id, 
          projectName: project.name,
          success: true 
        });
      } catch (error) {
        results.push({ 
          projectId: project.id, 
          projectName: project.name,
          success: false, 
          error: error.message 
        });
      }
    }

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error('Backup all error:', error);
    res.status(500).json({ error: 'Backup all failed' });
  }
};

const getBackupHistory = async (req, res) => {
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

    const project = userConfig.projects.find(p => p.id === id);
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const githubToken = decrypt(userToken.token);

    // Get commit history from GitHub API
    const response = await axios.get(
      `${process.env.GITHUB_API_URL}/repos/${userToken.githubUsername}/${project.repoName}/commits`,
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    const commits = response.data.map(commit => ({
      sha: commit.sha,
      message: commit.commit.message,
      author: commit.commit.author.name,
      date: commit.commit.author.date,
      url: commit.html_url
    }));

    res.json({
      success: true,
      commits
    });
  } catch (error) {
    console.error('Get history error:', error);
    if (error.response && error.response.status === 404) {
      return res.json({ success: true, commits: [] });
    }
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

module.exports = {
  backupProject,
  backupAllProjects,
  getBackupHistory
};