#!/bin/bash

# 1. Update the ConfigMap from the local posts.json
echo "Updating ConfigMap..."
kubectl create configmap blog-posts --from-file=posts.json=posts.json --dry-run=client -o yaml | kubectl apply -f -

# 2. Trigger the rolling restart
echo "Restarting Pods to pick up changes..."
kubectl rollout restart deployment glykhol-blog

# 3. Wait for the new pods to be ready
echo "Waiting for pods to be healthy..."
kubectl rollout status deployment/glykhol-blog

echo "Deployment complete! Check https://glykhol.ai"