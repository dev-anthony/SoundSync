const express = require('express');
const { 
  backupProject, 
  backupAllProjects,
  getBackupHistory 
} = require('../controllers/backupController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// POST /api/backup/project/:id
router.post('/project/:id', backupProject);

// POST /api/backup/all
router.post('/all', backupAllProjects);

// GET /api/backup/history/:id (moved to projects route for consistency)
router.get('/history/:id', getBackupHistory);

module.exports = router;