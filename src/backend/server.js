const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

let dataStore = [];

app.use(cors());
app.use(express.json());

app.get('/data', (req, res) => {
  res.json({
    success: true,
    message: 'Fetched data successfully',
    data: dataStore,
  });
});

app.post('/data', (req, res) => {
  const { name, value } = req.body;

  if (!name || !value) {
    return res.status(400).json({
      success: false,
      message: 'Missing name or value in request body',
    });
  }

  const newEntry = {
    id: dataStore.length + 1,
    name,
    value,
    timestamp: new Date().toISOString(),
  };

  dataStore.push(newEntry);

  res.status(201).json({
    success: true,
    message: 'Data saved successfully',
    entry: newEntry,
  });
});

app.listen(port, () => {
  console.log(`server running on: http://localhost:${port}`);
});
