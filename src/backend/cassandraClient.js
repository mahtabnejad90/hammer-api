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
    firstName text,
    lastName text,
    dateOfBirth text,
    country text,
    postalCode text,
    timestamp timestamp
  )
`);
    console.log('✅ Data entries table ensured');

    await client.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        username text,
        email text,
        password text,
        created_at timestamp
      )
    `);
    console.log('✅ Users table ensured');

    await client.execute(`
      CREATE INDEX IF NOT EXISTS ON users (username)
    `);
    console.log('✅ Users username index ensured');
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  }
}

module.exports = {
  client,
  setupDatabase,
};
