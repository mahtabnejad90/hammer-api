const cassandra = require('cassandra-driver');
require('dotenv').config()

const client = new cassandra.Client({
  contactPoints: ['127.0.0.1'], 
  localDataCenter: process.env.LOCAL_DATACENTRE_NAME,
  keyspace: process.env.DATABASE_KEYSPACE,
  socketOptions: {
    readTimeout: 30000
  }
});

async function setupDatabase() {
  try {
    const tempClient = new cassandra.Client({
      contactPoints: ['127.0.0.1'],
      localDataCenter: 'datacenter1',
    });

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
