const axios = require('axios');
const { encrypt, decrypt } = require('../utils/encryption');
const { readJSON, writeJSON, TOKENS_FILE, CONFIG_FILE } = require('../utils/storage');

const connectGithub = async (req, res) => {
  try {
    const { githubToken } = req.body;
    const username = req.user.username;

    if (!githubToken) {
      return res.status(400).json({ error: 'GitHub token required' });
    }

    // Validate token with GitHub API
    const response = await axios.get(`${process.env.GITHUB_API_URL}/user`, {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    const githubUsername = response.data.login;

    // Encrypt and store token
    const tokens = await readJSON(TOKENS_FILE);
    tokens[username] = {
      token: encrypt(githubToken),
      githubUsername,
      connectedAt: new Date().toISOString()
    };

    await writeJSON(TOKENS_FILE, tokens);

    res.json({
      success: true,
      githubUsername
    });
  } catch (error) {
    console.error('GitHub connect error:', error);
    if (error.response && error.response.status === 401) {
      return res.status(401).json({ error: 'Invalid GitHub token' });
    }
    res.status(500).json({ error: 'Failed to connect GitHub' });
  }
};

const createRepo = async (req, res) => {
  try {
    const { repoName, isPrivate = true } = req.body;
    const username = req.user.username;

    console.log(`Creating repo for user: ${username}, repo name: ${repoName}`);

    if (!repoName) {
      return res.status(400).json({ error: 'Repository name required' });
    }

    const tokens = await readJSON(TOKENS_FILE);
    const userToken = tokens[username];

    if (!userToken) {
      console.error(`No GitHub token found for user: ${username}`);
      return res.status(401).json({ error: 'GitHub not connected' });
    }

    console.log(`GitHub username: ${userToken.githubUsername}`);

    const githubToken = decrypt(userToken.token);
    console.log(`Token decrypted successfully`);

    // Create repository via GitHub API
    console.log(`Calling GitHub API to create repo: ${repoName}`);
    const response = await axios.post(
      `${process.env.GITHUB_API_URL}/user/repos`,
      {
        name: repoName,
        private: isPrivate,
        description: 'SoundSync backup repository',
        auto_init: false
      },
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    );

    console.log(`GitHub API response:`, response.status);

    const repoUrl = response.data.html_url;
    const cloneUrl = response.data.clone_url;

    console.log(`Repo created: ${repoUrl}`);

    // Store repo configuration
    const config = await readJSON(CONFIG_FILE);
    if (!config[username]) {
      config[username] = { repos: [], projects: [] };
    }
    if (!config[username].repos) {
      config[username].repos = [];
    }
    
    const repoData = {
      repoName,
      repoUrl,
      cloneUrl,
      isPrivate,
      createdAt: new Date().toISOString()
    };

    config[username].repos.push(repoData);

    await writeJSON(CONFIG_FILE, config);
    console.log(`Repo saved to config for user: ${username}`);

    res.status(201).json({
      success: true,
      repoName,
      repoUrl,
      cloneUrl
    });
  } catch (error) {
    console.error('Create repo error:', error.message);
    console.error('Error stack:', error.stack);
    
    if (error.response) {
      console.error('GitHub API Error Status:', error.response.status);
      console.error('GitHub API Error Data:', error.response.data);
      
      if (error.response.status === 422) {
        return res.status(400).json({ error: 'Repository already exists' });
      }
      if (error.response.status === 401) {
        return res.status(401).json({ error: 'Invalid GitHub token' });
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to create repository',
      details: error.message 
    });
  }
};

const getRepos = async (req, res) => {
  try {
    const username = req.user.username;
    const config = await readJSON(CONFIG_FILE);
    
    const userConfig = config[username];
    if (!userConfig || !userConfig.repos) {
      return res.json({ repos: [] });
    }

    res.json({ repos: userConfig.repos });
  } catch (error) {
    console.error('Get repos error:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
};

const disconnectGithub = async (req, res) => {
  try {
    const username = req.user.username;
    
    const tokens = await readJSON(TOKENS_FILE);
    delete tokens[username];
    await writeJSON(TOKENS_FILE, tokens);

    res.json({ success: true, message: 'GitHub disconnected' });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect GitHub' });
  }
};

module.exports = {
  connectGithub,
  createRepo,
  getRepos,
  disconnectGithub
};