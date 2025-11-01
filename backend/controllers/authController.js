// // const bcrypt = require('bcryptjs');
// // const jwt = require('jsonwebtoken');
// // const { readJSON, writeJSON, USERS_FILE } = require('../utils/storage');

// // const signup = async (req, res) => {
// //   try {
// //     const { username, password } = req.body;

// //     if (!username || !password) {
// //       return res.status(400).json({ error: 'Username and password required' });
// //     }

// //     if (password.length < 6) {
// //       return res.status(400).json({ error: 'Password must be at least 6 characters' });
// //     }

// //     const users = await readJSON(USERS_FILE);

// //     if (users[username]) {
// //       return res.status(400).json({ error: 'Username already exists' });
// //     }

// //     const hashedPassword = await bcrypt.hash(password, 10);
    
// //     users[username] = {
// //       username,
// //       password: hashedPassword,
// //       createdAt: new Date().toISOString()
// //     };

// //     await writeJSON(USERS_FILE, users);

// //     const token = jwt.sign(
// //       { username },
// //       process.env.JWT_SECRET,
// //       { expiresIn: process.env.JWT_EXPIRES_IN }
// //     );

// //     res.status(201).json({
// //       success: true,
// //       token,
// //       username
// //     });
// //   } catch (error) {
// //     console.error('Signup error:', error);
// //     res.status(500).json({ error: 'Signup failed' });
// //   }
// // };

// // const login = async (req, res) => {
// //   try {
// //     const { username, password } = req.body;

// //     if (!username || !password) {
// //       return res.status(400).json({ error: 'Username and password required' });
// //     }

// //     const users = await readJSON(USERS_FILE);
// //     const user = users[username];

// //     if (!user) {
// //       return res.status(401).json({ error: 'Invalid credentials' });
// //     }

// //     const validPassword = await bcrypt.compare(password, user.password);

// //     if (!validPassword) {
// //       return res.status(401).json({ error: 'Invalid credentials' });
// //     }

// //     const token = jwt.sign(
// //       { username },
// //       process.env.JWT_SECRET,
// //       { expiresIn: process.env.JWT_EXPIRES_IN }
// //     );

// //     res.json({
// //       success: true,
// //       token,
// //       username
// //     });
// //   } catch (error) {
// //     console.error('Login error:', error);
// //     res.status(500).json({ error: 'Login failed' });
// //   }
// // };

// // module.exports = { signup, login };
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const db = require('../config/database');

// const signup = async (req, res) => {
//   try {
//     const { username, email, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({ error: 'Username and password required' });
//     }

//     if (password.length < 6) {
//       return res.status(400).json({ error: 'Password must be at least 6 characters' });
//     }

//     // Check if user exists
//     const [existingUsers] = await db.query(
//       'SELECT * FROM users WHERE username = ? OR email = ?',
//       [username, email || null]
//     );

//     if (existingUsers.length > 0) {
//       return res.status(400).json({ error: 'Username or email already exists' });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);
    
//     // Insert new user
//     const [result] = await db.query(
//       'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
//       [username, email || null, hashedPassword]
//     );

//     const userId = result.insertId;

//     // Create default settings
//     await db.query(
//       'INSERT INTO users (user_id) VALUES (?)',
//       [userId]
//     );

//     const token = jwt.sign(
//       { userId, username },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRES_IN }
//     );

//     res.status(201).json({
//       success: true,
//       token,
//       username,
//       userId
//     });
//   } catch (error) {
//     console.error('Signup error:', error);
//     res.status(500).json({ error: 'Signup failed' });
//   }
// };

// const login = async (req, res) => {
//   try {
//     const { username, password } = req.body;

//     if (!username || !password) {
//       return res.status(400).json({ error: 'Username and password required' });
//     }

//     // Find user by username or email
//     const [users] = await db.query(
//       'SELECT * FROM users WHERE username = ? OR email = ?',
//       [username, username]
//     );

//     if (users.length === 0) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const user = users[0];
//     const validPassword = await bcrypt.compare(password, user.password);

//     if (!validPassword) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const token = jwt.sign(
//       { userId: user.id, username: user.username },
//       process.env.JWT_SECRET,
//       { expiresIn: process.env.JWT_EXPIRES_IN }
//     );

//     res.json({
//       success: true,
//       token,
//       username: user.username,
//       userId: user.id
//     });
//   } catch (error) {
//     console.error('Login error:', error);
//     res.status(500).json({ error: 'Login failed' });
//   }
// };

// module.exports = { signup, login };
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { readJSON, writeJSON, USERS_FILE } = require('../utils/storage');

// Utility: Choose whether to use DB or local JSON
const useDatabase = process.env.USE_DATABASE === 'true';

// ------------------------- SIGNUP -------------------------
const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // ----------- DATABASE MODE -----------
    if (useDatabase) {
      const [existingUsers] = await db.query(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [username, email]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ error: 'Username or email already exists.' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const [result] = await db.query(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
      );

      const userId = result.insertId;

      const token = jwt.sign(
        { userId, username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      return res.status(201).json({
        success: true,
        token,
        username,
        userId,
        message: 'Account created successfully!'
      });
    }

    // ----------- LOCAL JSON MODE -----------
    const users = await readJSON(USERS_FILE);
    if (users[username] || Object.values(users).some(u => u.email === email)) {
      return res.status(400).json({ error: 'Username or email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users[username] = {
      username,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    await writeJSON(USERS_FILE, users);

    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.status(201).json({
      success: true,
      token,
      username,
      message: 'Account created successfully!'
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Signup failed', details: error.message });
  }
};

// ------------------------- LOGIN -------------------------
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required.' });
    }

    // ----------- DATABASE MODE -----------
    if (useDatabase) {
      const [users] = await db.query(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [username, username]
      );

      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const user = users[0];
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const token = jwt.sign(
        { userId: user.id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      return res.json({
        success: true,
        token,
        username: user.username,
        userId: user.id
      });
    }

    // ----------- LOCAL JSON MODE -----------
    const users = await readJSON(USERS_FILE);
    const user = users[username];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      { username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      success: true,
      token,
      username
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

module.exports = { signup, login };
