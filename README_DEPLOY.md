# 🚀 Auto-Deploy Backend ke Fly.io

## Setup Auto-Deploy Backend Express/Socket.IO

### 1. Buat Akun Fly.io
- Daftar di [fly.io](https://fly.io)
- **Tidak butuh credit card** untuk free tier

### 2. Install Fly CLI (Opsional - untuk setup awal)
```bash
curl -L https://fly.io/install.sh | sh
fly auth login
```

### 3. Setup GitHub Secrets
Masuk ke **GitHub repo** → **Settings** → **Secrets and variables** → **Actions**

Tambahkan secrets berikut:
- `FLY_API_TOKEN` - Ambil dari Fly.io dashboard → Access Tokens
- `OPENAI_API_KEY` - API key OpenAI kamu
- `AI_MODEL` - Model AI (opsional, default: gpt-4o-mini)

### 4. Deploy Pertama Kali
```bash
cd backend
fly launch --name fmaa-backend --region sin
fly secrets set OPENAI_API_KEY=your-api-key
fly deploy
```

### 5. Auto-Deploy Setup
Setelah deploy pertama berhasil:
- **Setiap push ke branch `main`** akan otomatis deploy
- **Hanya deploy jika ada perubahan di folder `backend/`**
- **Tidak perlu CLI lagi**, cukup push code ke GitHub

### 6. Update Frontend
Setelah backend live, update URL backend di frontend:
```javascript
// Di client/src/config.js atau .env
const BACKEND_URL = "https://fmaa-backend.fly.dev";
```

### 7. Cek Status Deploy
- **GitHub Actions:** Lihat di tab Actions
- **Fly.io Dashboard:** Lihat status app
- **Health Check:** `https://fmaa-backend.fly.dev/api/health`

## Troubleshooting

### Error: FLY_API_TOKEN not found
- Pastikan secret `FLY_API_TOKEN` sudah ditambahkan di GitHub
- Ambil token dari Fly.io dashboard → Access Tokens

### Error: App not found
- Jalankan `fly launch` dulu untuk membuat app
- Atau buat app manual di Fly.io dashboard

### Error: Port already in use
- Backend sudah dikonfigurasi untuk port 8080
- Pastikan tidak ada konflik port

## Free Tier Limits
- **3 shared-CPU-1x VMs** (256MB RAM/VM)
- **160GB outbound data/bulan**
- **Cukup untuk backend chat AI ringan**

## Monitoring
- **Fly.io Dashboard:** Monitor resource usage
- **GitHub Actions:** Monitor deploy status
- **Health Check:** `/api/health` endpoint