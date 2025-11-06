const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const {
  getCollaborationProjects,
  createCollaboration,
  joinCollaboration,
  pushCollaboration,
  pullCollaboration,
  checkUpdates,
  getNotifications
} = require('../controllers/collaborationController');

// Get all collaboration projects for the user
router.get('/projects', authenticateToken, getCollaborationProjects);

// Create a new collaboration project
router.post('/create', authenticateToken, createCollaboration);

// Join an existing collaboration
router.post('/join', authenticateToken, joinCollaboration);

// Push changes to a collaboration repo
router.post('/push/:id', authenticateToken, pushCollaboration);

// Pull changes from a collaboration repo
router.post('/pull/:id', authenticateToken, pullCollaboration);

// Check for updates across all collaborations
router.get('/check-updates', authenticateToken, checkUpdates);

// Get notifications for collaborations with updates
router.get('/notifications', authenticateToken, getNotifications);

module.exports = router;