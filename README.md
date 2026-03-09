# Glykhol Blog 🚀

A high-availability, containerized CMS built with Node.js and MongoDB, deployed on a hardened AlmaLinux environment using Kubernetes (Minikube). The site is securely exposed to the internet via Cloudflare Tunnels.

## 🛠 Tech Stack

* Backend: Node.js (LTS Bookworm Slim)
* Database: MongoDB (with Persistent Volume Claims for data durability)
* Orchestration: Kubernetes (Minikube on AlmaLinux)
* Networking: Cloudflare Tunnels (Sidecar pattern)
* OS: AlmaLinux 10.x

## 📁 Repository Structure

```
.
├── k8s/
│   ├── deployment.yaml           # Node.js app + Cloudflared sidecar
│   ├── mongo-stack.yaml          # MongoDB deployment, service, and PVC
│   ├── mongo-backup-cronjob.yaml # Daily mongodump CronJob + backup PVC
│   └── secrets.yaml              # K8s Secrets (Placeholders for Tokens/Passwords)
├── views/
│   └── index.ejs            # Frontend templates
├── server.js                # Express backend with Mongo logic & health checks
├── Dockerfile               # Multi-stage optimized build
├── deploy.sh                # Automated idempotency script
└── package.json             # App dependencies
```

## 🚀 Deployment

This project uses an automated deployment script to handle image builds and Kubernetes rollouts.

### Prerequisites
- Minikube installed and running on AlmaLinux.

- Cloudflare Tunnel token.

- kubectl and docker CLI tools.

## 🔐 Secret Management

This project uses Kubernetes Secrets for sensitive data. 
The `k8s/secrets.yaml` file is excluded from Git via `.gitignore`. 

To deploy:
1. Copy `k8s/secrets.yaml.template` to `k8s/secrets.yaml`.
2. Generate base64 values: `echo -n "secret" | base64`.
3. Update the values and run `./deploy.sh`.

The script will:

* Connect to the Minikube Docker environment.
* Build the node:lts-bookworm-slim image.
* Apply all Kubernetes manifests.
* Perform a zero-downtime rollout restart.
* Verify health via rollout status.

## 🛡 Features

* Persistence: MongoDB data survives pod restarts and cluster reboots via PVCs.
* Security: Admin actions (Post/Edit) are protected by environment-injected secrets.
* Health Monitoring: Kubernetes Liveness and Readiness probes monitor app and DB connectivity.
* Automated Scaling: Deployment is configured for multiple replicas with automated recovery.

## 💾 Backups

MongoDB is backed up nightly at 2am via a Kubernetes CronJob (`mongo-backup`) using `mongodump`. Backups are stored on a dedicated 2Gi PVC (`mongo-backup-pvc`) with a `Retain` reclaim policy, so data survives PVC deletion. Backups older than 7 days are pruned automatically.

Trigger a manual backup:

`kubectl create job mongo-backup-manual --from=cronjob/mongo-backup`

Restore from a backup:

`kubectl exec -it deployment/mongo-db -- mongorestore --host mongo-service /backup/blogdb_<timestamp>`

List available backups:

`kubectl exec -it <mongo-backup-pod> -- ls /backup`

## 🔧 Maintenance

View Logs:

`kubectl logs -l app=blog -c node-blog`

Check Health Status:

`kubectl get pods` - Look for 2/2 READY status

Access DB Directly:

`kubectl exec -it deployment/mongo-db -- mongosh`