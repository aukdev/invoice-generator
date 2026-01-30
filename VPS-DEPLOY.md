# ==============================================

# 🚀 VPS QUICK DEPLOYMENT GUIDE

# ==============================================

# Invoice Generator - One Command Deploy

# ==============================================

## ⚡ Quick Start (VPS එකේදි)

### Step 1: Clone & Setup

```bash
# Clone repository
git clone <your-repo-url> invoice-generator
cd invoice-generator

# Copy environment file
cp .env.production .env

# Edit .env (optional - default values work)
nano .env
```

### Step 2: Deploy

```bash
# That's it! One command:
docker compose up -d
```

### Step 3: Access

- Application: http://your-vps-ip:3000

---

## 📦 What Gets Deployed

| Service     | Container       | Purpose             |
| ----------- | --------------- | ------------------- |
| **app**     | invoice-app     | Next.js Application |
| **db**      | invoice-db      | PostgreSQL Database |
| **kong**    | invoice-kong    | API Gateway         |
| **rest**    | invoice-rest    | PostgREST API       |
| **storage** | invoice-storage | File Storage        |

---

## 🔧 Common Commands

```bash
# View all containers
docker compose ps

# View logs
docker compose logs -f

# View app logs only
docker compose logs -f app

# Stop all
docker compose down

# Restart
docker compose restart

# Rebuild app (after code changes)
docker compose up -d --build app

# Full rebuild
docker compose down && docker compose up -d --build
```

---

## 🔐 Production Security (Optional)

### 1. Change PostgreSQL Password

```bash
# Edit .env
POSTGRES_PASSWORD=your_strong_password_here
```

### 2. Generate New JWT Secret

```bash
# Generate
openssl rand -base64 32

# Update .env
JWT_SECRET=<generated-value>
```

### 3. Add Nginx Reverse Proxy (HTTPS)

```bash
# Install Nginx
sudo apt install nginx certbot python3-certbot-nginx

# Configure (replace yourdomain.com)
sudo nano /etc/nginx/sites-available/invoice
```

```nginx
server {
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
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

```bash
# Enable & SSL
sudo ln -s /etc/nginx/sites-available/invoice /etc/nginx/sites-enabled/
sudo certbot --nginx -d yourdomain.com
sudo systemctl restart nginx
```

---

## 🐛 Troubleshooting

### Database not starting?

```bash
# Check logs
docker compose logs db

# Reset database (WARNING: deletes data!)
docker compose down -v
docker compose up -d
```

### App not building?

```bash
# Rebuild with no cache
docker compose build --no-cache app
docker compose up -d
```

### Port already in use?

```bash
# Change port in .env
APP_PORT=3001
docker compose up -d
```

---

## 💾 Backup

```bash
# Backup database
docker exec invoice-db pg_dump -U postgres invoice_generator > backup.sql

# Restore database
cat backup.sql | docker exec -i invoice-db psql -U postgres invoice_generator
```

---

## 📊 Resource Usage

- **RAM**: ~500MB total
- **Disk**: ~2GB (including images)
- **CPU**: Minimal (idle: <1%)
