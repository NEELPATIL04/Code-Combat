# Code Combat - Deployment Guide

## Server Requirements

✅ **Minimum Specs (Your CX33 is perfect!):**
- CPU: 4 cores
- RAM: 8 GB
- Storage: 80 GB
- OS: Ubuntu 20.04+ or any Linux distribution

## Quick Deployment Steps

### 1. Prepare Your Ubuntu Server

```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt-get install docker-compose-plugin -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL client (for database management)
sudo apt-get install postgresql-client -y
```

### 2. Clone Your Project

```bash
# Clone repository
git clone <your-repo-url>
cd Code-Combat

# Or upload files via SCP
scp -r Code-Combat user@server-ip:/home/user/
```

### 3. Configure Environment

```bash
# Copy environment template
cd backend
cp .env.example .env

# Edit with your production values
nano .env
```

**Important `.env` changes for production:**
```env
NODE_ENV=production
DB_PASSWORD=your_secure_password
JWT_SECRET=your_secure_jwt_secret_min_32_chars
CORS_ORIGIN=http://your-domain.com
JUDGE0_MOCK_MODE=false  # Use REAL Judge0 on Linux!
```

### 4. Set Up Database

```bash
# Start PostgreSQL (if not installed)
sudo apt-get install postgresql postgresql-contrib -y
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres psql -c "CREATE DATABASE codeCombat;"
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'your_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE codeCombat TO postgres;"

# Run migrations
cd backend
npm install
npx drizzle-kit push
```

### 5. Start Judge0

```bash
# From project root
docker compose up -d

# Verify Judge0 is running
curl http://localhost:2358/about
# Should return: {"version":"1.13.1"...}
```

### 6. Start Backend

```bash
cd backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start production server
npm start

# Or use PM2 for process management
sudo npm install -g pm2
pm2 start dist/index.js --name code-combat-api
pm2 save
pm2 startup
```

### 7. Build & Serve Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Build production bundle
npm run build

# Serve with nginx or serve
sudo npm install -g serve
serve -s dist -l 3000

# Or use nginx (recommended)
sudo apt-get install nginx -y
sudo cp dist/* /var/www/html/
```

### 8. Configure Nginx (Recommended)

```bash
sudo nano /etc/nginx/sites-available/code-combat
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/code-combat/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/code-combat /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 9. Set Up SSL (Optional but Recommended)

```bash
sudo apt-get install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

## Post-Deployment

### Add Test Cases

```bash
cd backend
npx tsx src/scripts/addTestCases.ts
```

### Monitor Services

```bash
# Check Docker containers
docker ps

# Check backend logs
pm2 logs code-combat-api

# Check Judge0 health
curl http://localhost:2358/about
```

### Firewall Configuration

```bash
sudo ufw allow 22     # SSH
sudo ufw allow 80     # HTTP
sudo ufw allow 443    # HTTPS
sudo ufw enable
```

## Troubleshooting

### Judge0 Not Working?
```bash
# Check containers
docker compose ps

# View logs
docker compose logs judge0-server

# Restart
docker compose restart
```

### Backend Connection Issues?
```bash
# Check if running
pm2 status

# View logs
pm2 logs

# Restart
pm2 restart code-combat-api
```

### Database Issues?
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Connect to database
psql -U postgres -d codeCombat
```

## Production Checklist

- [ ] Database password changed from default
- [ ] JWT secret changed (min 32 characters)
- [ ] CORS_ORIGIN set to your domain
- [ ] JUDGE0_MOCK_MODE set to false
- [ ] Firewall configured
- [ ] SSL certificate installed
- [ ] PM2 process manager set up
- [ ] Nginx configured
- [ ] Regular backups configured

## Resource Usage

Expected resource usage on your CX33 server:
- **Judge0**: ~2GB RAM, 1-2 CPU cores
- **Node.js Backend**: ~500MB RAM, 1 CPU core
- **PostgreSQL**: ~1GB RAM, 1 CPU core
- **Redis**: ~100MB RAM
- **Total**: ~4GB RAM (4GB free for overhead)

Your server can easily handle 100+ concurrent users!

## Support

For issues, check:
1. Backend logs: `pm2 logs`
2. Docker logs: `docker compose logs`
3. Nginx logs: `sudo tail -f /var/log/nginx/error.log`
