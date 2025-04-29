const express = require('express');
const cors = require('cors');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { client: cassandraClient, setupDatabase } = require('./cassandraClient');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.get('/data', async (req, res) => {
  try {
    const result = await cassandraClient.execute('SELECT * FROM data_entries');
    res.json({
      success: true,
      message: 'Fetched data successfully',
      data: result.rows,
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching data',
    });
  }
});

app.post('/data', async (req, res) => {
  const { name, value } = req.body;

  if (!name || !value) {
    return res.status(400).json({
      success: false,
      message: 'Missing name or value in request body',
    });
  }

  const id = uuidv4();
  const timestamp = new Date();

  const query = 'INSERT INTO data_entries (id, name, value, timestamp) VALUES (?, ?, ?, ?)';
  const params = [id, name, value, timestamp];

  try {
    await cassandraClient.execute(query, params, { prepare: true });
    res.status(201).json({
      success: true,
      message: 'Data saved successfully',
      entry: { id, name, value, timestamp },
    });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving data',
    });
  }
});

// 👇 Setup DB then start server
setupDatabase().then(() => {
  app.listen(port, () => {
    console.log(`🚀 server running on: http://localhost:${port}`);
});
});
