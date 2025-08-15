#!/usr/bin/env node

// Comprehensive Gatling Helper - handles token generation, data setup, and config generation
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const BASE_URL = 'http://localhost:1990';
const ENV_FILE = path.join(process.cwd(), '../../../gatling.env');
const CONFIG_FILE = './src/config.js';

// Load environment variables
function loadEnv() {
  dotenv.config({ path: ENV_FILE });
  return {
    STATIC_TOKEN: process.env.STATIC_TOKEN,
    BASE_URL
  };
}

// Get fresh token from API and save to gatling.env
async function getToken() {
  try {
    console.log('🔑 Getting fresh token...');
    
    const response = await axios.post(`${BASE_URL}/login`, {
      username: 'perfuser'
    });
    
    const token = response.data.token;
    console.log('✅ Token obtained successfully');
    
    // Update gatling.env file
    const envContent = `# Gatling Load Test Environment Variables\nSTATIC_TOKEN=${token}\n`;
    fs.writeFileSync(ENV_FILE, envContent);
    
    console.log('💾 Token saved to gatling.env');
    return token;
  } catch (error) {
    console.error('❌ Error getting token:', error.message);
    process.exit(1);
  }
}

// Generate config file from environment variables for Gatling
function generateConfig() {
  try {
    console.log('⚙️  Generating config file...');
    
    const env = loadEnv();
    
    if (!env.STATIC_TOKEN) {
      console.error('❌ No token found in gatling.env. Run with --get-token first.');
      process.exit(1);
    }
    
    const configContent = `// Auto-generated config - do not edit manually
export const STATIC_TOKEN = "${env.STATIC_TOKEN}";
export const BASE_URL = "${env.BASE_URL}";
`;
    
    // Ensure src directory exists
    if (!fs.existsSync('./src')) {
      fs.mkdirSync('./src');
    }
    
    fs.writeFileSync(CONFIG_FILE, configContent);
    console.log('✅ Config file generated successfully');
  } catch (error) {
    console.error('❌ Error generating config:', error.message);
    process.exit(1);
  }
}

// Setup test data (500 records)
async function setupData() {
  try {
    console.log('📊 Setting up test data...');
    
    // Login to get token
    const loginResponse = await axios.post(`${BASE_URL}/login`, {
      username: 'perfuser'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful for data setup');
    
    // Create 500 test records
    for (let i = 0; i < 500; i++) {
      await axios.post(`${BASE_URL}/data`, {
        firstName: `Test${i}`,
        lastName: "User",
        dateOfBirth: "1990-01-01",
        country: "UK",
        postalCode: "AB12CD"
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (i % 100 === 0) {
        console.log(`📝 Created ${i + 1} test records...`);
      }
    }
    
    console.log('✅ Test data setup completed - 500 records created');
  } catch (error) {
    console.error('❌ Error setting up test data:', error.message);
    process.exit(1);
  }
}

// Main function to handle command line arguments
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🚀 Gatling Helper Commands:

  --get-token       Get fresh token and save to gatling.env
  --generate-config Generate config.js from gatling.env
  --setup-data      Create 500 test records
  --full-setup      Do everything: get token, generate config, setup data
  
Examples:
  node gatling-helper.js --get-token
  node gatling-helper.js --full-setup
`);
    return;
  }
  
  if (args.includes('--get-token')) {
    await getToken();
  }
  
  if (args.includes('--generate-config')) {
    generateConfig();
  }
  
  if (args.includes('--setup-data')) {
    await setupData();
  }
  
  if (args.includes('--full-setup')) {
    await getToken();
    generateConfig();
    await setupData();
    console.log('🎉 Full setup completed! Ready to run: npx gatling run --simulation baseline');
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}