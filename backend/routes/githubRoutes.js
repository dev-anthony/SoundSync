const express = require('express');
const { 
  connectGithub, 
  createRepo, 
  getRepos,
  disconnectGithub 
} = require('../controllers/githubController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// POST /api/github/connect
router.post('/connect', connectGithub);

// POST /api/github/create-repo
router.post('/create-repo', createRepo);

// GET /api/github/repos
router.get('/repos', getRepos);

// DELETE /api/github/disconnect
router.delete('/disconnect', disconnectGithub);

module.exports = router;