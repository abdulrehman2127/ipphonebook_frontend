import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const USERS_FILE = path.join(__dirname, 'public', 'users.json');

app.use(cors());
app.use(express.json());

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    const users = JSON.parse(data);
    res.json(users);
  } catch (error) {
    console.error('Error reading users:', error);
    res.status(500).json({ error: 'Failed to read users' });
  }
});

// Add new user
app.post('/api/users', async (req, res) => {
  try {
    const newUser = req.body;
    
    // Read current users
    const data = await fs.readFile(USERS_FILE, 'utf-8');
    const users = JSON.parse(data);
    
    // Check if username exists
    if (users.find(u => u.username === newUser.username)) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    
    // Add new user
    users.push(newUser);
    
    // Write back to file
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    
    res.json({ success: true, user: newUser });
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ error: 'Failed to add user' });
  }
});

// Update users file (for bulk operations)
app.put('/api/users', async (req, res) => {
  try {
    const users = req.body;
    
    // Validate it's an array
    if (!Array.isArray(users)) {
      return res.status(400).json({ error: 'Users must be an array' });
    }
    
    // Write to file
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
    
    res.json({ success: true, count: users.length });
  } catch (error) {
    console.error('Error updating users:', error);
    res.status(500).json({ error: 'Failed to update users' });
  }
});

app.listen(PORT, () => {
  console.log(`🔐 Auth API Server running on http://localhost:${PORT}`);
  console.log(`📁 Users file: ${USERS_FILE}`);
});
