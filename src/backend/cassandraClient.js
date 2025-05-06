const cassandra = require('cassandra-driver');
require('dotenv').config();

const contactPoints = [process.env.CASSANDRA_HOST || 'cassandra'];
const localDataCenter = process.env.CASSANDRA_DC || 'datacenter1';

const client = new cassandra.Client({
  contactPoints,
  localDataCenter,
  keyspace: 'hammerapi',
  socketOptions: { readTimeout: 30000 }
});

const tempClient = new cassandra.Client({
  contactPoints,
  localDataCenter,
  socketOptions: { readTimeout: 30000 }
});

async function setupDatabase() {
  try {
    // Use the existing tempClient already configured for Docker
    await tempClient.connect();

    await tempClient.execute(`
      CREATE KEYSPACE IF NOT EXISTS hammerapi
      WITH replication = {
        'class': 'SimpleStrategy',
        'replication_factor': 1
      }
    `);
    console.log('✅ Keyspace ensured');

    await tempClient.shutdown();

    await client.connect();

    await client.execute(`
      CREATE TABLE IF NOT EXISTS data_entries (
        id UUID PRIMARY KEY,
        name text,
        value text,
        timestamp timestamp
      )
    `);
    console.log('✅ Table ensured');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

module.exports = {
  client,
  setupDatabase,
};
