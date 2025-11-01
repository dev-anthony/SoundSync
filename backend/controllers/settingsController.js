const { readJSON, writeJSON, CONFIG_FILE, TOKENS_FILE } = require('../utils/storage');

const getSettings = async (req, res) => {
  try {
    const username = req.user.username;
    const config = await readJSON(CONFIG_FILE);
    const tokens = await readJSON(TOKENS_FILE);

    const userConfig = config[username] || {};
    const userToken = tokens[username];

    const settings = {
      autoBackupOnLaunch: userConfig.autoBackupOnLaunch || false,
      scheduledBackup: userConfig.scheduledBackup || 'disabled',
      githubConnected: !!userToken,
      githubUsername: userToken ? userToken.githubUsername : null,
      connectedAt: userToken ? userToken.connectedAt : null
    };

    res.json({ success: true, settings });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

const updateSettings = async (req, res) => {
  try {
    const username = req.user.username;
    const { autoBackupOnLaunch, scheduledBackup } = req.body;

    const config = await readJSON(CONFIG_FILE);
    
    if (!config[username]) {
      config[username] = { projects: [], repos: [] };
    }

    if (autoBackupOnLaunch !== undefined) {
      config[username].autoBackupOnLaunch = autoBackupOnLaunch;
    }
    
    if (scheduledBackup !== undefined) {
      config[username].scheduledBackup = scheduledBackup;
    }

    await writeJSON(CONFIG_FILE, config);

    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

module.exports = {
  getSettings,
  updateSettings
};