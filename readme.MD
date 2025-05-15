# Hammer API

Hammer API is a lightweight Node.js Express service with basic GET and POST endpoints, designed for local benchmarking performance testing tools like K6, Gatling, and Artillery. It also comes with a simple web UI and now supports persistent storage using **Apache Cassandra**.

## Features

- 🔐 JWT-based token authentication (`/login`)
- 📘 Swagger UI (`/api-docs`) based on OpenAPI 3.0 spec
- 🗃️ `GET /data`: Fetch all entries (secured)
- 📝 `POST /data`: Add new entries (secured)
- 👩‍💻 Simple HTML/JS-based frontend UI
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
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username": "your-name"}'
  ```

This returns a JWT token. Use this token for authenticated requests like so:

```bash
curl -X GET http://localhost:3000/data \
  -H "Authorization: Bearer <your-token>"
  ```
### UI

Includes a simple login + data entry interface.

	1.	Open browser to:
http://localhost:3000
	2.	Enter a username to log in and receive a JWT.
	3.	Once authenticated, submit new data using:
	•	First Name
	•	Last Name
	•	Date of Birth
	•	Country
	•	Postal Code

### Swagger UI

Accessible at:
http://localhost:3000/api-docs

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

#### Gatling

1. From root of this project execute `cd src/tests/performance/gatling` on your terminal.
2. Execute `npm install` on your terminal.
3. Execute `npx gatling run --simulation baseline` to execute the performance test.

#### K6

1. Install K6 for your given OS via this link: https://grafana.com/docs/k6/latest/set-up/install-k6/
2. Execute `npm run k6:baseline` on your terminal from the root of this project.

#### Artillery

1. Install Artillery globally via `npm install -G artillery@latest` command.
2. Execute `npm run artillery:baseline` on your terminal from the root of this project.

## Development/Testing Phases

	•	✅ Phase 1: Basic GET/POST API
	•	✅ Phase 2: Basic UI interaction
	•	✅ Phase 3: Cassandra integration
	•	✅ Phase 4: Docker & docker-compose setup
	•	✅ Phase 5: Gatling baseline script against 5000 req in 50s
	•	⏳ Phase 5.1: Gatling baseline report (p95)
	•	✅ Phase 6: K6 baseline script against 5000 req in 50s
	•	⏳ Phase 6.1: K6 baseline report (p95)
	•	✅ Phase 7: Artillery baseline script against 5000 req in 50s
	•	⏳ Phase 7.1: Artillery baseline report (p95)
	•	✅ Phase 8: Add Token-based Authentication
	•	✅ Phase 9: Replace name/value with realistic data fields
  •	✅ Phase 10: Update performance tests scripts to add bulk-data and get  
  
