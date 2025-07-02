#!/bin/bash

# Setup script for initial deployment configuration

echo "Setting up deployment configuration..."

# Check if required CLIs are installed
command -v docker >/dev/null 2>&1 || { echo "Docker is required but not installed. Aborting." >&2; exit 1; }
command -v flyctl >/dev/null 2>&1 || { echo "Fly CLI is required but not installed. Visit https://fly.io/docs/hands-on/install-flyctl/" >&2; exit 1; }
command -v vercel >/dev/null 2>&1 || { echo "Vercel CLI is required but not installed. Run: pnpm add -g vercel" >&2; exit 1; }

# Backend setup
echo "Setting up Fly.io backend..."
flyctl launch --no-deploy

echo "Remember to set Fly.io secrets:"
echo "  flyctl secrets set DATABASE_URL='your-database-url'"
echo "  flyctl secrets set JWT_SECRET='your-jwt-secret'"

# Frontend setup
echo "Setting up Vercel frontend..."
cd frontend
vercel link

# Extract Vercel IDs
echo ""
echo "GitHub Actions secrets needed:"
echo "  FLY_API_TOKEN: $(flyctl auth token)"
echo "  VERCEL_TOKEN: Get from https://vercel.com/account/tokens"
echo "  VERCEL_ORG_ID: Check .vercel/project.json"
echo "  VERCEL_PROJECT_ID: Check .vercel/project.json"