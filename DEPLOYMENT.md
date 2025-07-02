# Deployment Instructions

## Prerequisites
- Docker and Docker Compose installed locally
- Fly.io CLI (`flyctl`) installed
- Vercel CLI installed
- GitHub repository with secrets configured

## Local Development
1. Clone the repository
2. Run `docker-compose up` to start all services
3. Access frontend at http://localhost:3000
4. Access backend at http://localhost:4000

## Initial Setup

### Fly.io Backend Setup
1. Install Fly CLI: `curl -L https://fly.io/install.sh | sh`
2. Login: `flyctl auth login`
3. Create app: `flyctl launch` (from root directory)
4. Set secrets:
   ```bash
   flyctl secrets set DATABASE_URL="your-production-postgres-url"
   flyctl secrets set JWT_SECRET="your-production-jwt-secret"
   ```

### Vercel Frontend Setup
1. Install Vercel CLI: `pnpm add -g vercel`
2. Login: `vercel login`
3. Link project: `cd frontend && vercel link`
4. Set environment variable in Vercel dashboard:
   - `VITE_API_URL`: Your Fly.io backend URL (e.g., https://content-calendar-api.fly.dev/api)

### GitHub Actions Setup
Add these secrets to your GitHub repository:
- `FLY_API_TOKEN`: Get from `flyctl auth token`
- `VERCEL_TOKEN`: Get from Vercel dashboard
- `VERCEL_ORG_ID`: Get from `.vercel/project.json` after linking
- `VERCEL_PROJECT_ID`: Get from `.vercel/project.json` after linking

## Deployment
Push to `main` branch to trigger automatic deployment via GitHub Actions.

## URLs
- Backend API: https://content-calendar-api.fly.dev
- Frontend: https://content-calendar.vercel.app

## Troubleshooting

### Docker Compose Issues
- Ensure Docker is running
- Check port conflicts (5432, 4000, 3000)
- Run `docker-compose down -v` to clean up volumes

### Fly.io Issues
- Ensure you're logged in: `flyctl auth whoami`
- Check app status: `flyctl status`
- View logs: `flyctl logs`

### Vercel Issues
- Ensure you're logged in: `vercel whoami`
- Check build logs in Vercel dashboard
- Verify environment variables are set