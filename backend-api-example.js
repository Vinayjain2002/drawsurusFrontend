// Example Backend API Structure (Node.js/Express)
// This shows how your backend should handle the authentication endpoints

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory user storage (replace with database in production)
const users = [];

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};

// API Routes

// POST /api/auth/signup
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    users.push(newUser);

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', authenticateToken, (req, res) => {
  // In a real application, you might want to blacklist the token
  // For now, we'll just return success
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: userWithoutPassword
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/auth/refresh
app.post('/api/auth/refresh', authenticateToken, (req, res) => {
  try {
    // Generate new token
    const token = jwt.sign(
      { userId: req.user.userId, email: req.user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token
      },
      message: 'Token refreshed successfully'
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Game-related endpoints

// POST /api/games/create
app.post('/api/games/create', authenticateToken, (req, res) => {
  try {
    const { settings } = req.body;
    const gameId = Date.now().toString();
    
    // Create game logic here
    const game = {
      id: gameId,
      hostId: req.user.userId,
      settings,
      players: [req.user.userId],
      status: 'waiting',
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      data: game,
      message: 'Game created successfully'
    });

  } catch (error) {
    console.error('Create game error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// POST /api/games/:gameId/join
app.post('/api/games/:gameId/join', authenticateToken, (req, res) => {
  try {
    const { gameId } = req.params;
    
    // Join game logic here
    res.json({
      success: true,
      data: { gameId, playerId: req.user.userId },
      message: 'Joined game successfully'
    });

  } catch (error) {
    console.error('Join game error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// GET /api/games/:gameId
app.get('/api/games/:gameId', authenticateToken, (req, res) => {
  try {
    const { gameId } = req.params;
    
    // Get game state logic here
    res.json({
      success: true,
      data: { gameId, status: 'active' }
    });

  } catch (error) {
    console.error('Get game error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app; 