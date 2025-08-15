#!/usr/bin/env node
import axios from 'axios';

const BASE_URL = process.env.BASE_URL || 'http://localhost:1990';

async function cleanupData() {
  try {
    console.log('🧹 Starting data cleanup...');
    
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      username: 'perfuser'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Authentication successful');
    
    const deleteResponse = await axios.delete(`${BASE_URL}/data`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (deleteResponse.data.success) {
      console.log('✅ All existing data deleted successfully');
    } else {
      console.error('❌ Failed to delete data:', deleteResponse.data.message);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error.response?.data?.message || error.message);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  cleanupData().catch(console.error);
}

export default cleanupData;