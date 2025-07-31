# 🚀 Auto-Deploy Backend ke Fly.io (Hugging Face)

## Setup Auto-Deploy Backend Express/Socket.IO dengan Hugging Face

### 1. Buat Akun Hugging Face (Gratis)
- Daftar di [huggingface.co](https://huggingface.co)
- **Gratis** untuk inference API
- Dapatkan API key dari Settings → Access Tokens

### 2. Buat Akun Fly.io
- Daftar di [fly.io](https://fly.io)
- **Tidak butuh credit card** untuk free tier

### 3. Install Fly CLI (Opsional - untuk setup awal)
```bash
curl -L https://fly.io/install.sh | sh
fly auth login
```

### 4. Setup GitHub Secrets
Masuk ke **GitHub repo** → **Settings** → **Secrets and variables** → **Actions**

Tambahkan secrets berikut:
- `FLY_API_TOKEN` - Ambil dari Fly.io dashboard → Access Tokens
- `HUGGINGFACE_API_KEY` - API key dari Hugging Face
- `HUGGINGFACE_MODEL` - Model yang ingin digunakan (opsional, default: microsoft/DialoGPT-medium)

### 5. Model Hugging Face yang Direkomendasikan
- **microsoft/DialoGPT-medium** - Chat bot yang baik
- **microsoft/DialoGPT-large** - Lebih besar, lebih baik
- **facebook/blenderbot-400M-distill** - Conversational AI
- **EleutherAI/gpt-neo-125M** - Lightweight GPT

### 6. Deploy Pertama Kali
```bash
cd backend
fly launch --name fmaa-backend --region sin
fly secrets set HUGGINGFACE_API_KEY=your-huggingface-api-key
fly secrets set HUGGINGFACE_MODEL=microsoft/DialoGPT-medium
fly deploy
```

### 7. Auto-Deploy Setup
Setelah deploy pertama berhasil:
- **Setiap push ke branch `main`** akan otomatis deploy
- **Hanya deploy jika ada perubahan di folder `backend/`**
- **Tidak perlu CLI lagi**, cukup push code ke GitHub

### 8. Update Frontend
Setelah backend live, update URL backend di frontend:
```javascript
// Di client/src/config.js atau .env
const BACKEND_URL = "https://fmaa-backend.fly.dev";
```

### 9. Cek Status Deploy
- **GitHub Actions:** Lihat di tab Actions
- **Fly.io Dashboard:** Lihat status app
- **Health Check:** `https://fmaa-backend.fly.dev/api/health`

## Keuntungan Hugging Face
- **Gratis** untuk inference API
- **Model open source** berkualitas tinggi
- **Tidak butuh credit card**
- **Rate limit** yang cukup untuk development

## Troubleshooting

### Error: HUGGINGFACE_API_KEY not found
- Pastikan secret `HUGGINGFACE_API_KEY` sudah ditambahkan di GitHub
- Ambil token dari Hugging Face → Settings → Access Tokens

### Error: Model not found
- Pastikan model yang dipilih tersedia di Hugging Face
- Coba model default: `microsoft/DialoGPT-medium`

### Error: Rate limit exceeded
- Hugging Face punya rate limit untuk free tier
- Tunggu beberapa menit atau upgrade ke pro

## Free Tier Limits
- **3 shared-CPU-1x VMs** (256MB RAM/VM)
- **160GB outbound data/bulan**
- **Hugging Face:** Rate limit untuk free tier
- **Cukup untuk backend chat AI ringan**

## Monitoring
- **Fly.io Dashboard:** Monitor resource usage
- **GitHub Actions:** Monitor deploy status
- **Health Check:** `/api/health` endpoint
- **Hugging Face:** Monitor API usage di dashboard