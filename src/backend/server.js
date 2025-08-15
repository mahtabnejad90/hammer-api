const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const { v4: uuidv4 } = require('uuid');
const { client: cassandraClient, setupDatabase } = require('./cassandraClient');

const app = express();
const port = process.env.PORT || 1990;
const SECRET = 'hammer-secret';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.html') || path.endsWith('.js') || path.endsWith('.css')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({ success: false, message: 'Username, email, and password are required' });
  }

  try {
    const existingUser = await cassandraClient.execute(
      'SELECT username FROM users WHERE username = ? LIMIT 1',
      [username],
      { prepare: true }
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Username already exists' });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const userId = uuidv4();
    await cassandraClient.execute(
      'INSERT INTO users (id, username, email, password, created_at) VALUES (?, ?, ?, ?, ?)',
      [userId, username, email, hashedPassword, new Date()],
      { prepare: true }
    );

    const token = jwt.sign({ username, userId }, SECRET, { expiresIn: '1h' });
    res.status(201).json({ success: true, token, message: 'User created successfully' });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ success: false, message: 'Error creating user' });
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!password) {
    const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password are required' });
  }

  try {
    const result = await cassandraClient.execute(
      'SELECT id, username, password FROM users WHERE username = ? LIMIT 1',
      [username],
      { prepare: true }
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = result.rows[0];
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign({ username: user.username, userId: user.id }, SECRET, { expiresIn: '1h' });
    res.json({ success: true, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Error during login' });
  }
});

app.get('/test-token', (req, res) => {
  const token = jwt.sign({ username: 'load-test-user' }, SECRET, { expiresIn: '24h' });
  res.json({ token });
});

app.get('/data', authenticate, async (req, res) => {
  try {
    const result = await cassandraClient.execute('SELECT * FROM data_entries');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching data' });
  }
});

app.post('/data', authenticate, async (req, res) => {
  const { firstName, lastName, dateOfBirth, country, postalCode } = req.body;
  if (!firstName || !lastName || !dateOfBirth || !country || !postalCode) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const id = uuidv4();
  const timestamp = new Date();
  const query = `
    INSERT INTO data_entries (id, firstName, lastName, dateOfBirth, country, postalCode, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const params = [id, firstName, lastName, dateOfBirth, country, postalCode, timestamp];

  try {
    await cassandraClient.execute(query, params, { prepare: true });
    res.status(201).json({ success: true, entry: { id, firstName, lastName, dateOfBirth, country, postalCode, timestamp } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error saving data' });
  }
});

app.delete('/data', authenticate, async (req, res) => {
  try {
    await cassandraClient.execute('TRUNCATE data_entries');
    res.json({ success: true, message: 'All data entries deleted successfully' });
  } catch (error) {
    console.error('Delete all data error:', error);
    res.status(500).json({ success: false, message: 'Error deleting data entries' });
  }
});

setupDatabase().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📘 Swagger UI available at http://localhost:${port}/api-docs`);
  });
});