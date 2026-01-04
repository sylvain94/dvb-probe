# Architecture

## Overview

DVB Probe follows an MVC architecture with a clear separation of responsibilities :

```architecture
┌────────────────────────────────────────┐
│           Frontend (Vue.js)            │
│  - User Interface                      │
│  - Pinia Store                         │
│  - Router                              │
└──────────────┬─────────────────────────┘
               │ HTTP/REST
┌──────────────▼─────────────────────────┐
│         Backend (Express.js)           │
│  ┌─────────────────────────────────┐   │
│  │  Routes (API)                   │   │
│  └──────────┬──────────────────────┘   │
│             │                          │
│  ┌──────────▼──────────────────────┐   │
│  │  Controllers (MVC)              │   │
│  └──────────┬──────────────────────┘   │
│             │                          │
│  ┌──────────▼──────────────────────┐   │
│  │  Services (Business logic)      │   │
│  └──────────┬──────────────────────┘   │
│             │                          │
│  ┌──────────▼──────────────────────┐   │
│  │  Models (Datas)                 │   │
│  └──────────┬──────────────────────┘   │
│             │                          │
│  ┌──────────▼──────────────────────┐   │
│  │  Storage (MariaDB)              │   │
│  └─────────────────────────────────┘   │
└──────────────┬─────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         TSDuck (Process)                │
│  - Analysis of MPEG-TS streams          │
│  - Report generation                    │
└─────────────────────────────────────────┘
```

## Structure of the projet

```code

dvb-probe/
├── backend/          # API + probe engine
│   ├── src/
│   │   ├── app.js                # Express Initialization
│   │   ├── server.js             # HTTP server
│   │   ├── config/               # Configuration
│   │   ├── routes/               # API routes
│   │   ├── controllers/          # MVC Controllers
│   │   ├── services/             # Business logic
│   │   ├── models/               # Data Models
│   │   ├── middlewares/          # Middleware Express
│   │   ├── utils/                # Utilities
│   │   ├── jobs/                 # Planned tasks
│   │   └── storage/              # Database
│   └── package.json
│
├── frontend/         # Interface web Vue.js
│   ├── src/
│   │   ├── views/                # Vue Pages
│   │   ├── stores/               # Pinia Stores
│   │   ├── router/               # Vue Router
│   │   └── api/                  # Client API
│   └── package.json
│
├── docker/           # Docker Configuration
├── scripts/          # Utility scripts
└── docs/             # Documentation

```

## Main components

### Backend

#### Routes (`routes/`)

They define the HTTP endpoints and delegate to the controllers.

#### Controllers (`controllers/`)

They handle HTTP requests, validate data, and call services.

#### Services (`services/`)

Contains the business logic:

- `probe.service.js` - Probe management
- `tsduck.service.js` - Interface with TSDuck
- `process.service.js` - Process management
- `monitoring.service.js` - System monitoring
- `alerting.service.js` - Alerting system

#### Models (`models/`)

Data access (MariaDB):

- `probe.model.js`
- `stream.model.js`
- `analysis.model.js`
- `alert.model.js`

#### Jobs (`jobs/`)

Scheduled tasks:

- `healthcheck.job.js` - Health check
- `cleanup.job.js` - Data cleaning
- `watchdog.job.js` - Process monitoring

### Frontend

#### Views (`views/`)

Vue.js Pages:

- `ProbesView.vue` - Probe management
- `StreamsView.vue` - Stream management
- `AnalysisView.vue` - Analysis visualization
- `SystemView.vue` - System information

#### Stores (`stores/`)

State management with Pinia:

- `probes.js` - Probe state
- `streams.js` - Stream state

## Data flow

### Starting a Probe

1. User clicks "Start" in the interface
2. Frontend calls `POST /api/probes/:id/start`
3. Controller calls `probeService.start(id)`
4. Service retrieves the probe and the stream
5. Service constructs the TSDuck command
6. Service starts the process via `processService`
7. The TSDuck process analyzes the stream
8. The results are parsed and stored in the database
9. The probe status is updated

### Continuous Analysis

1. TSDuck process running
2. Stdout output parsed in real time
3. Data analyzed and stored in `analyses`
4. Metrics extracted and compared to thresholds
5. Alerts generated if necessary
6. Watchdog verifies that the process is still active

## Database

### Tables

- `streams` - Stream configuration
- `probes` - Probe configuration
- `analyses` - Analysis results
- `alerts` - System alerts
- `probe_logs` - Probe logs

## Security

- Helmet.js for secure HTTP headers
- CORS configured
- Input validation
- API key authentication (needs improvement)

## Monitoring

- Healthcheck every minute
- Watchdog every 30 seconds
- Hourly cleanup
- Structured logs with Winston
