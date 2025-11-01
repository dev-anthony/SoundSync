const express = require('express');
const { 
  getProjects, 
  addProject, 
  removeProject,
  getProjectFiles 
} = require('../controllers/projectController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/projects
router.get('/', getProjects);

// POST /api/projects/add
router.post('/add', addProject);

// DELETE /api/projects/:id
router.delete('/:id', removeProject);

// GET /api/projects/:id/files
router.get('/:id/files', getProjectFiles);

module.exports = router;