# 🎯 STORAGE FIX - VPS Deployment Commands

## What Was Fixed

✅ **Added complete Supabase Storage schema** to `init.sql`

- Storage tables: `buckets`, `objects`, `migrations`
- Required functions: `get_size_by_bucket()`, `search()`, etc.
- Proper permissions and policies
- Auto-created `logos` bucket

✅ **Re-enabled Storage API container** in `docker-compose.yml`

- Proper health checks
- Named volume for data persistence
- All required environment variables

---

## 🚀 VPS Commands (කරන්න ඕනේ)

### Option 1: Fresh Install (Recommended)

```bash
cd invoice-generator

# Pull latest changes
git pull

# Remove old database (to apply new schema)
sudo docker compose down -v

# Start everything fresh
sudo docker compose up -d

# Check status (wait 1-2 minutes)
sudo docker compose ps
```

### Option 2: Manual Update (if database has data)

```bash
cd invoice-generator

# Pull latest changes
git pull

# Stop only storage
sudo docker stop invoice-storage
sudo docker rm invoice-storage

# Apply new schema to existing database
sudo docker exec -i invoice-db psql -U postgres -d invoice_generator < supabase/init.sql

# Start all services
sudo docker compose up -d

# Check status
sudo docker compose ps
```

---

## 📊 Expected Result

All containers should be **healthy**:

```
CONTAINER ID   IMAGE                          STATUS
xxxxxxxx       invoice-generator-app          Up (healthy)
xxxxxxxx       invoice-storage                Up (healthy)    <- Should be healthy now!
xxxxxxxx       invoice-kong                   Up (healthy)
xxxxxxxx       invoice-rest                   Up
xxxxxxxx       invoice-db                     Up (healthy)
```

---

## 🧪 Test Storage

After deployment, test logo upload:

1. Access app: `http://your-vps-ip:3027`
2. Go to Settings
3. Upload a logo image
4. Should save successfully in Supabase Storage!

---

## 🔍 Verify Storage

```bash
# Check storage logs (should have no errors)
sudo docker logs invoice-storage --tail 50

# List files in storage bucket
sudo docker exec invoice-db psql -U postgres -d invoice_generator -c "SELECT * FROM storage.objects;"

# Check bucket configuration
sudo docker exec invoice-db psql -U postgres -d invoice_generator -c "SELECT * FROM storage.buckets;"
```

---

## 📁 Files Updated

1. [supabase/init.sql](supabase/init.sql) - Added complete storage schema
2. [docker-compose.yml](docker-compose.yml) - Re-enabled storage container
3. [VPS-DEPLOY.md](VPS-DEPLOY.md) - Updated troubleshooting

---

## 💡 How It Works

**Before**: Logo images saved as base64 in database (large, slow)
**After**: Logo files saved in Supabase Storage (efficient, CDN-ready)

**Storage Flow**:

1. User uploads logo → `/api/upload`
2. API saves to Supabase Storage → `logos` bucket
3. Storage API saves file → Docker volume
4. Returns public URL → Saved in database

**Database Schema**:

- `storage.buckets` - Bucket configuration
- `storage.objects` - File metadata
- `storage.migrations` - Schema version tracking
- Required functions for Storage API operations
