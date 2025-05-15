const express = require('express');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const { v4: uuidv4 } = require('uuid');
const { client: cassandraClient, setupDatabase } = require('./cassandraClient');

const app = express();
const port = 3000;
const SECRET = 'hammer-secret';

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

// Swagger setup
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// JWT middleware
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

// Login route for testing JWT (insecure; use real auth in prod)
app.post('/login', (req, res) => {
  const { username } = req.body;
  const token = jwt.sign({ username }, SECRET, { expiresIn: '1h' });
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

setupDatabase().then(() => {
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`📘 Swagger UI available at http://localhost:${port}/api-docs`);
  });
});