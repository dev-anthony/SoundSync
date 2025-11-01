const fs = require('fs').promises;
const path = require('path');
const { readJSON, writeJSON, CONFIG_FILE } = require('../utils/storage');

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

module.exports = {
  getProjects,
  addProject,
  removeProject,
  getProjectFiles
};