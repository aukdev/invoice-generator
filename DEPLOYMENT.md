# 🚀 Production Deployment Guide

## Invoice Generator - VPS Deployment

This guide will help you deploy the Invoice Generator to a production VPS.

---

## 📋 Pre-Deployment Checklist

### 1. VPS Requirements

- [ ] Ubuntu 22.04 LTS or newer
- [ ] Minimum 2GB RAM
- [ ] Docker & Docker Compose installed
- [ ] Domain name pointed to your VPS IP
- [ ] Ports 80, 443 open

### 2. Security Checklist

- [ ] Generate new JWT secret
- [ ] Generate new API keys (anon, service_role)
- [ ] Change PostgreSQL password
- [ ] Configure firewall (ufw)
- [ ] Set up SSL certificate

---

## 🔐 Step 1: Generate Production Keys

### Generate JWT Secret

```bash
# Generate a secure JWT secret (at least 32 characters)
openssl rand -base64 32
```

### Generate API Keys

Use this Node.js script to generate keys from your JWT secret:

```javascript
const jwt = require("jsonwebtoken");

const JWT_SECRET = "YOUR_NEW_JWT_SECRET_HERE";

// Generate anon key
const anonPayload = {
  role: "anon",
  iss: "supabase",
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 10 * 365 * 24 * 60 * 60, // 10 years
};

// Generate service_role key
const servicePayload = {
  role: "service_role",
  iss: "supabase",
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 10 * 365 * 24 * 60 * 60,
};

console.log("ANON_KEY:", jwt.sign(anonPayload, JWT_SECRET));
console.log("SERVICE_ROLE_KEY:", jwt.sign(servicePayload, JWT_SECRET));
```

Or use the online tool: https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys

---

## 📁 Step 2: Prepare Production Files

### Create `.env.production` on your VPS:

```bash
# PostgreSQL
POSTGRES_PASSWORD=YOUR_SECURE_PASSWORD_HERE

# JWT - Must match keys generated above
JWT_SECRET=YOUR_NEW_JWT_SECRET_HERE

# API Keys - Generated from JWT_SECRET
ANON_KEY=YOUR_GENERATED_ANON_KEY_HERE
SERVICE_ROLE_KEY=YOUR_GENERATED_SERVICE_ROLE_KEY_HERE

# Application
NEXT_PUBLIC_SUPABASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_GENERATED_ANON_KEY_HERE
```

### Update `supabase/kong.production.yml`:

1. Replace `https://yourdomain.com` with your actual domain
2. Replace API keys with your generated keys

---

## 🐳 Step 3: Deploy to VPS

### Clone Repository

```bash
git clone YOUR_REPO_URL /opt/invoice-generator
cd /opt/invoice-generator
```

### Copy Production Files

```bash
# Copy production kong config
cp supabase/kong.production.yml supabase/kong.yml

# Copy production env file
cp .env.production .env

# Create .env.local for Next.js
cp .env.production .env.local
```

### Build and Start

```bash
# Build and start all services
docker-compose -f docker-compose.production.yml up -d --build

# Wait for services to be healthy
docker-compose -f docker-compose.production.yml ps

# Check logs if needed
docker-compose -f docker-compose.production.yml logs -f
```

---

## 🔒 Step 4: Configure Nginx & SSL

### Install Nginx

```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

### Copy Nginx Config

```bash
sudo cp nginx.conf.example /etc/nginx/sites-available/invoice-generator
sudo ln -s /etc/nginx/sites-available/invoice-generator /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
```

### Edit Domain

```bash
sudo nano /etc/nginx/sites-available/invoice-generator
# Replace yourdomain.com with your actual domain
```

### Get SSL Certificate

```bash
sudo certbot --nginx -d yourdomain.com -d api.yourdomain.com
```

### Restart Nginx

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 🔥 Step 5: Configure Firewall

```bash
# Enable UFW
sudo ufw enable

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Block direct access to Docker ports from outside
# (nginx handles all external traffic)
sudo ufw status
```

---

## 🧪 Step 6: Verify Deployment

### Check Services

```bash
docker-compose -f docker-compose.production.yml ps
```

All services should show "healthy" or "Up" status.

### Test API

```bash
curl https://api.yourdomain.com/rest/v1/products \
  -H "apikey: YOUR_ANON_KEY"
```

### Test Application

Visit `https://yourdomain.com` in your browser.

---

## 📊 Monitoring & Maintenance

### View Logs

```bash
# All services
docker-compose -f docker-compose.production.yml logs -f

# Specific service
docker-compose -f docker-compose.production.yml logs -f app
docker-compose -f docker-compose.production.yml logs -f kong
```

### Restart Services

```bash
docker-compose -f docker-compose.production.yml restart
```

### Update Application

```bash
cd /opt/invoice-generator
git pull
docker-compose -f docker-compose.production.yml up -d --build app
```

### Backup Database

```bash
docker exec invoice-db pg_dump -U postgres postgres > backup_$(date +%Y%m%d).sql
```

### Restore Database

```bash
cat backup_YYYYMMDD.sql | docker exec -i invoice-db psql -U postgres postgres
```

---

## ⚠️ Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL logs
docker-compose -f docker-compose.production.yml logs db

# Connect to database
docker exec -it invoice-db psql -U postgres

# Check roles
\du

# Check tables
\dt
```

### API Not Working

```bash
# Check Kong logs
docker-compose -f docker-compose.production.yml logs kong

# Check REST logs
docker-compose -f docker-compose.production.yml logs rest
```

### Application Errors

```bash
# Check app logs
docker-compose -f docker-compose.production.yml logs app

# Rebuild app
docker-compose -f docker-compose.production.yml up -d --build app
```

---

## 🎉 Production Checklist Summary

| Item                        | Status |
| --------------------------- | ------ |
| New JWT Secret Generated    | ⬜     |
| New API Keys Generated      | ⬜     |
| PostgreSQL Password Changed | ⬜     |
| Domain Configured           | ⬜     |
| SSL Certificate Installed   | ⬜     |
| Firewall Configured         | ⬜     |
| All Services Running        | ⬜     |
| API Endpoints Working       | ⬜     |
| Application Accessible      | ⬜     |
| Backup System Set Up        | ⬜     |

---

## 📞 Support

If you encounter issues:

1. Check the logs: `docker-compose logs -f`
2. Verify all environment variables are set correctly
3. Ensure firewall allows necessary ports
4. Check nginx error logs: `sudo tail -f /var/log/nginx/error.log`
