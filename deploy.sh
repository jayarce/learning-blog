#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting Deployment for glykhol.ai..."

# 1. Point shell to Minikube's Docker daemon
echo "🐳 Connecting to Minikube Docker environment..."
eval $(minikube docker-env)

# 2. Build the latest image
echo "📦 Building Node.js image..."
docker build -t glykhol-blog:latest .

# 3. Apply Infrastructure (Secrets and Database)
echo "💾 Applying Secrets and MongoDB..."
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/mongo-stack.yaml

# 4. Apply Application
echo "🌐 Applying Node.js Deployment and Service..."
kubectl apply -f k8s/deployment.yaml

# 5. Force a rollout to pick up any Secret or Image changes
echo "♻️  Restarting deployment to ensure fresh config..."
kubectl rollout restart deployment glykhol-blog

# 6. Wait for rollout to complete
echo "⏳ Waiting for pods to be ready..."
kubectl rollout status deployment glykhol-blog

echo "✅ Deployment Successful!"
echo "📍 App is running at https://blog.glykhol.ai"