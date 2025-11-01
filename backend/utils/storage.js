const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');

const getFilePath = (filename) => path.join(DATA_DIR, filename);

const readJSON = async (filename) => {
  try {
    const filePath = getFilePath(filename);
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
};

const writeJSON = async (filename, data) => {
  try {
    const filePath = getFilePath(filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    throw new Error(`Failed to write to ${filename}`);
  }
};

module.exports = {
  readJSON,
  writeJSON,
  USERS_FILE: 'users.json',
  TOKENS_FILE: 'tokens.json',
  CONFIG_FILE: 'config.json'
};