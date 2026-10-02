# 🐳 DOCKER.md — Production Containerization & Deployment Guide
## Dashmesh Properties AI Suite & Autonomous 24/7 Daemon

This document provides complete instructions for running the Dashmesh Properties AI Suite, Sia WhatsApp Bot, and Google Business Profile Growth Engine inside Docker containers with 100% data persistence.

---

## 1. Quick Start (1-Minute Launch)

### Prerequisites
* Docker Engine 24.0+ installed
* Docker Compose v2 installed

### Commands
```bash
# 1. Clone or navigate to the project directory
cd "c:/Users/satna/Downloads/Google work auto ai"

# 2. Build the Docker image and start in detached background mode
docker compose up -d --build

# 3. Verify the container is running and healthy
docker compose ps

# 4. View live real-time server daemon and WhatsApp webhook logs
docker compose logs -f
```

The application will be accessible at:
* **Dashboard:** `http://localhost:3000`
* **Mobile Customer Shield:** `http://localhost:3000/shield.html`
* **Digital Rate Card:** `http://localhost:3000/rate-card`
* **Production Healthcheck:** `http://localhost:3000/api/health`

---

## 2. Docker Architecture & Container Specifications

```
                       ┌────────────────────────────────────────┐
                       │          HOST ENVIRONMENT              │
                       │                                        │
                       │   ./data/*.json  ◄───►  Volume Mount   │
                       │   ./.env         ◄───►  Secrets Mount  │
                       │   Port 3000      ◄───►  Exposed Port   │
                       └───────────────────┬────────────────────┘
                                           │
                                           ▼
                       ┌────────────────────────────────────────┐
                       │     CONTAINER: dashmesh-ai-suite       │
                       │     Base: node:20-alpine (~50MB)       │
                       │                                        │
                       │   • Node.js 24/7 Autonomous Daemon     │
                       │   • Sia Female AI Executive Engine     │
                       │   • Meta WhatsApp Webhook Listener     │
                       │   • Google Business Profile Connector  │
                       │   • Leaflet Local Ambernath Map Engine │
                       │                                        │
                       │   HEALTHCHECK: /api/health (every 30s) │
                       └────────────────────────────────────────┘
```

### Highlights:
* **Base Image:** `node:20-alpine` — Minimal footprint (~50MB), hardened security, instant startup.
* **Zero Paywall / Zero Dependencies:** No heavy npm package bloat; pure native Node.js core.
* **Volume Persistence:** `./data` on the host machine is mounted directly to `/app/data` inside the container. Even if the container is deleted, re-created, or upgraded, **zero customer leads or Google reviews are lost**.
* **Healthcheck:** Native Docker healthcheck runs `curl -f http://localhost:3000/api/health` every 30 seconds.

---

## 3. Configuration & Environment Variables (`.env`)

Before running in production, ensure your `.env` contains the required keys:

```ini
# Server Port
PORT=3000

# Meta WhatsApp Cloud API Credentials
META_ACCESS_TOKEN=EAAG...
WHATSAPP_PHONE_NUMBER_ID=1239464059243498
WHATSAPP_BUSINESS_ACCOUNT_ID=2124558472274062
WHATSAPP_NUMBER=+919270277281
VERIFY_TOKEN=DashmeshProperties2026

# Boss / Owner Executive Direct Contact
OWNER_ALERT_PHONE=918421077613

# Public Access Tunnel / Domain URL
PUBLIC_URL=https://plod-extrude-lumpish.ngrok-free.dev

# Google Business Profile / Google Maps Place ID
GOOGLE_PLACE_ID=ChIJDxFBTbyV5zsRcHylJmmARG8
GOOGLE_MAPS_API_KEY=AIzaSy...
```

---

## 4. Common Docker Management Commands

| Action | Command |
|---|---|
| **Start Services** | `docker compose up -d` |
| **Stop Services** | `docker compose down` |
| **Restart Services** | `docker compose restart` |
| **View Live Logs** | `docker compose logs -f --tail=100` |
| **Check Health Status** | `docker inspect --format='{{json .State.Health}}' dashmesh-ai-suite` |
| **Execute Shell Inside Container** | `docker compose exec dashmesh-ai sh` |
| **Rebuild After Code Update** | `docker compose up -d --build` |

---

## 5. Production Cloud Deployment (Ubuntu / Debian VPS)

### Step 1: Install Docker on VPS
```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### Step 2: Deploy Project
```bash
mkdir -p /opt/dashmesh-ai
cd /opt/dashmesh-ai
# Transfer or clone project files here
docker compose up -d --build
```

### Step 3: Nginx Reverse Proxy with SSL (Let's Encrypt)
```nginx
server {
    server_name ai.dashmeshproperties.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Obtain free SSL certificate:
```bash
sudo certbot --nginx -d ai.dashmeshproperties.com
```

---

## 6. Backup & Disaster Recovery

Because all records are stored in [`data/`](file:///c:/Users/satna/Downloads/Google%20work%20auto%20ai/data), backing up the entire business state requires copying just one directory:

```bash
# Instant backup snapshot with timestamp
tar -czvf "dashmesh_backup_$(date +%Y%m%d_%H%M%S).tar.gz" ./data ./.env
```

To restore on any server:
```bash
tar -xzvf dashmesh_backup_*.tar.gz
docker compose up -d
```

---

*Verified Production-Grade Container Architecture • Dashmesh Properties AI Suite.*
