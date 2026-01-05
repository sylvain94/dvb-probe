# DVB Probe

DVB probe for the 24/7 continuous analysis of UDP/RTP MPEG-TS streams based on [TSDuck](https://tsduck.io/).

## Description

DVB Probe is a comprehensive application for monitoring and analyzing continuous MPEG-TS transport streams. It combines the power of TSDuck with a modern web interface and a REST API for management and monitoring.

## Architecture

- **Backend**: API REST Node.js/Express with MariaDB
- **Frontend**: web Interface using Vue.js 3
- **Analysis engine**: TSDuck

## Prerequisites

- Node.js 18+
- npm or yarn
- TSDuck installed on the system
- MariaDB 10.5+ (or MySQL 8.0+)

## Installation

### Automatic installation

```bash
./scripts/install.sh
./scripts/setup-env.sh
```

### Manual installation

1.**Backend**

```bash
cd backend
npm install
cp .env.example .env
# Modify the .env file according to your needs.
```

2.**Frontend**

```bash
cd frontend
npm install
```

## Configuration

### Backend

Copy `backend/.env.example` to `backend/.env` and modify the values according to your needs :

```env
NODE_ENV=development
PORT=3000
TSDUCK_PATH=/usr/bin/tsp
DB_TYPE=mariadb
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=dvb_probe
LOG_LEVEL=info
```

### TSDuck

Ensure that TSDuck is installed and accessible in the PATH or configure the path in `.env`.

## Use

The web interface will be accessible on http://localhost:5173
The API documentation will be accessible on [swagger](http://localhost:3000/api-docs/)

### Start-up in production

Use Docker Compose :

```bash
cd docker
docker-compose up -d
```

## Features

- ✅ UDP/RTP stream management
- ✅ Probe start/stop
- ✅ Database storage of analyses
- ✅ System monitoring
- ✅ Modern web interface
- ✅ Full REST API
- ✅ Automated maintenance jobs
- ✅ Alert system

## License

MIT
