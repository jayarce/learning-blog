# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal blog/dev log ("Glykhol Blog") — a containerized Node.js/Express app backed by MongoDB, deployed on Kubernetes (Minikube) on a dedicated HP EliteDesk 705 G5 running RHEL/AlmaLinux 10. External access is provided via Cloudflare Tunnels running as a sidecar container.

Live URL: `https://blog.glykhol.ai`

## Development Commands

**Local development (Docker Compose):**
```bash
docker-compose up        # Requires .env file (see below)
```

**Run directly (Node.js):**
```bash
PORT=3000 ADMIN_PASSWORD=yourpassword node server.js
```

**Deploy to Kubernetes:**
```bash
./deploy.sh              # Builds image, applies manifests, performs rollout restart
```

**Environment setup for local dev** — create `.env`:
```
PORT=3000
TUNNEL_TOKEN=<cloudflare_tunnel_token>
```

**Kubernetes secrets setup** — copy and populate `k8s/secrets.yaml.template` to `k8s/secrets.yaml` (gitignored). Base64-encode values: `echo -n "value" | base64`

## Architecture

### Application (`server.js`)
Single 91-line Express server. Connects to MongoDB at `mongodb://mongo-service:27017/blogdb`. Exits on DB connection failure. `ADMIN_PASSWORD` env var is required at startup.

**Routes:**
- `GET /` — lists all posts (sorted by date desc), renders markdown via `marked`
- `GET /health` — K8s liveness/readiness probe; checks Mongoose connection state
- `GET /admin`, `POST /admin` — password-protected post creation
- `GET /edit/:id`, `POST /edit/:id` — password-protected post editing

**Mongoose schema:** `Post { title, content, date }`

### Kubernetes (`k8s/`)
- `deployment.yaml` — 2 replicas of the blog app with Cloudflared sidecar; K8s Service on port 80 → pod:3000
- `mongo-stack.yaml` — single MongoDB replica with 1Gi PVC; exposed internally as `mongo-service:27017`
- `secrets.yaml` (gitignored) — holds `ADMIN_PASSWORD` and `TUNNEL_TOKEN`

The Cloudflared sidecar pattern provides external HTTPS access without a public IP or LoadBalancer. The app is stateless (all state in MongoDB) and scales horizontally.

### Deploy flow (`deploy.sh`)
1. Points Docker CLI at Minikube's daemon (`eval $(minikube docker-env)`)
2. Builds `glykhol-blog:latest`
3. Applies secrets → mongo-stack → deployment manifests
4. Runs `kubectl rollout restart` and waits for completion

### Frontend
Server-side rendered EJS (`views/index.ejs`). GitHub dark theme CSS (`public/style.css`). No frontend framework. Markdown content rendered client-side via `marked.parse()` in the template.
