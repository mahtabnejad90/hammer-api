# Hammer API

Hammer API is a lightweight Node.js Express service with basic GET and POST endpoints, designed for local benchmarking performance testing tools like K6, Gatling, and Artillery. It also comes with a simple web UI and now supports persistent storage using **Apache Cassandra**.

## Features

- 🔐 JWT-based token authentication (`/login`)
- 📘 Swagger UI (`/api-docs`) based on OpenAPI 3.0 spec
- 🗃️ `GET /data`: Fetch all entries (secured)
- 📝 `POST /data`: Add new entries (secured)
- 🗑️ `DELETE /data`: Delete all entries (secured)
- 👩‍💻 Modern HTML/JS-based frontend UI with signup/signin functionality
- 🧱 Cassandra database integration with auto Keyspace/Table creation
- ⚡ Built for performance testing benchmarks

## Installation & Execution

**Pre-requisites**

- Node.js
- Docker

1. Run `git clone git@github.com:mahtabnejad90/hammer-api.git` command on your terminal
2. Copy `.env.example` file from the root of this project and and paste it within the root of this project rename it to `.env`
3. Re-route your terminal to wherever this repository was cloned via the following commands (respective to your operating system):
     - Windows OS: `cd C:\Users\YOUR-PATH\hammer-api`
     - Mac: `cd YOUR-PATH/hammer-api`
4. Open and start docker
5. Run `npm install` command on your terminal.
6. Run `npm run docker:start` command on your terminal.

## Usage

### POST Request

To utilise the post endpoint to create some basic data, just run the following command on your terminal

```bash
curl -X POST http://localhost:1990/login \
  -H "Content-Type: application/json" \
  -d '{"username": "your-name"}'
  ```

This returns a JWT token. Use this token for authenticated requests like so:

```bash
curl -X GET http://localhost:1990/data \
  -H "Authorization: Bearer <your-token>"
  ```
### UI

Includes a modern login/signup + data management interface with glass morphism design.

	1.	Open browser to:
http://localhost:1990
	2.	Choose to either signup (new user) or signin (existing user)
	3.	Enter username and password to authenticate and receive a JWT
	4.	Once authenticated, you can:
	•	Submit new data (First Name, Last Name, Date of Birth, Country, Postal Code)
	•	View all existing data entries
	•	Delete all data entries with confirmation dialog

### Swagger UI

Accessible at:
http://localhost:1990/api-docs

Explore and test the /login, /data endpoints interactively using OpenAPI 3.0 spec.

## Database Notes

	•	Database: Apache Cassandra
	•	Keyspace: hammerapi
	•	Table: data_entries
	•	Auto-created on server start

To inspect your data:

```bash
docker exec -it hammer-cassandra cqlsh
USE hammerapi;
SELECT * FROM data_entries;
```

## Testing

### Performance Testing

All performance tests now include automatic data cleanup before execution. There are two types of tests available:

**Baseline Tests (GET requests):**
- **Duration**: 60 seconds
- **Rate**: 100 requests per second  
- **Pattern**: Constant arrival rate

**POST Load Tests (POST requests):**
- **Duration**: 300 seconds (5 minutes)
- **Rate**: 300 requests per second
- **Pattern**: Constant arrival rate

**Data Cleanup**: Run `npm run cleanup:data` to delete all existing data before tests.

#### Gatling

**Quick Start (from root directory):**
1. Install dependencies: `npm run gatling:install`
2. Run complete test: `npm run gatling:full`

**Individual Commands:**
- `npm run gatling:token` → Get fresh authentication token
- `npm run gatling:setup` → Create 500 test records
- `npm run gatling:config` → Generate config file
- `npm run gatling:baseline` → Run GET baseline test (100 req/s, 60s)
- `npm run gatling:post-load` → Run POST load test (300 req/s, 300s)
- `npm run gatling:full` → Full test (token + setup + baseline test)

**Advanced Usage:**
From `src/tests/performance/gatling` directory:
```bash
# Use the consolidated helper directly
node gatling-helper.js --get-token
node gatling-helper.js --setup-data
node gatling-helper.js --full-setup
```

**Configuration:**
- Token stored in: `gatling.env` (root directory)
- Baseline test: 100 requests/second for 60 seconds (GET requests)
- POST load test: 300 requests/second for 300 seconds (POST requests)
- Auto data cleanup before each test run
- Test data: 500 user records with authentication

#### K6

1. Install K6 for your given OS via this link: https://grafana.com/docs/k6/latest/set-up/install-k6/
2. Execute performance tests from the root of this project:
   - `npm run k6:baseline` → GET baseline test (100 req/s, 60s)
   - `npm run k6:post-load` → POST load test (300 req/s, 300s)

**Configuration:**
- Baseline test: 100 requests/second for 60 seconds (GET requests)
- POST load test: 300 requests/second for 300 seconds (POST requests)
- Test data: 500 user records with authentication
- Auto data cleanup before each test run

#### Artillery

1. Install Artillery globally via `npm install -G artillery@latest` command.
2. Execute performance tests from the root of this project:
   - `npm run artillery:baseline` → GET baseline test (100 req/s, 60s)
   - `npm run artillery:post-load` → POST load test (300 req/s, 300s)

**Configuration:**
- Baseline test: 100 requests/second for 60 seconds (GET requests)
- POST load test: 300 requests/second for 300 seconds (POST requests)
- Test data: 500 user records with authentication
- Auto data cleanup before each test run

## Development/Testing Phases

- ✅ Phase 1: Basic GET/POST API
- ✅ Phase 2: Basic UI interaction
- ✅ Phase 3: Cassandra integration
- ✅ Phase 4: Docker & docker-compose setup
- ✅ Phase 5: Gatling baseline script against 6000 req in 60s
- ⏳ Phase 5.1: Gatling baseline report (p95)
- ✅ Phase 6: K6 baseline script against 6000 req in 60s
- ⏳ Phase 6.1: K6 baseline report (p95)
- ✅ Phase 7: Artillery baseline script against 6000 req in 60s
- ⏳ Phase 7.1: Artillery baseline report (p95)
- ✅ Phase 8: Add Token-based Authentication
- ✅ Phase 9: Replace name/value with realistic data fields
- ✅ Phase 10: Update k6/artillery performance tests scripts to add bulk-data and be able to hit the get request endpoint
- ✅ Phase 11: Update gatling performance tests script to add bulk-data and be able to hit the get request endpoint
- ✅ Phase 12: Standardize all performance test configurations (60s, 100 req/sec constant rate)
- ✅ Phase 13: Add data cleanup helper for performance tests
- ✅ Phase 14: Modern UI redesign with signup/signin and delete functionality
- ✅ Phase 15: Add POST load tests for all frameworks (300 req/sec, 5 minutes)