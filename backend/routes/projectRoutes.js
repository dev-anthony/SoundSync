// const express = require('express');
// const { 
//   getProjects, 
//   addProject, 
//   removeProject,
//   getProjectFiles 
// } = require('../controllers/projectController');
// const { authenticateToken } = require('../middleware/auth');

// const router = express.Router();

// // All routes require authentication
// router.use(authenticateToken);

// // GET /api/projects
// router.get('/', getProjects);

// // POST /api/projects/add
// router.post('/add', addProject);

// // DELETE /api/projects/:id
// router.delete('/:id', removeProject);

// // GET /api/projects/:id/files
// router.get('/:id/files', getProjectFiles);

// module.exports = router;
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { authenticateToken } = require('../middleware/auth');
const {
  getProjects,
  addProject,
  uploadProject,
  removeProject,
  getProjectFiles,
  updateProjectFiles
} = require('../controllers/projectController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const tempDir = path.join(__dirname, '..', 'temp');
    try {
      await fs.access(tempDir);
    } catch {
      await fs.mkdir(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: (req, file, cb) => {
    // Keep original filename with timestamp to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB per file
  },
  fileFilter: (req, file, cb) => {
    // Accept all file types for music production
    cb(null, true);
  }
});

// Routes
router.get('/', authenticateToken, getProjects);
router.post('/add', authenticateToken, addProject); // Keep for backward compatibility
router.post('/upload', authenticateToken, upload.array('files', 1000), uploadProject);
router.post('/:id/update-files', authenticateToken, upload.array('files', 1000), updateProjectFiles);
router.delete('/:id', authenticateToken, removeProject);
router.get('/:id/files', authenticateToken, getProjectFiles);

module.exports = router;