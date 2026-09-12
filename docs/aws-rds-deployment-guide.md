# Shayga — AWS RDS & Cloudflare High-Scale Deployment Guide

This guide provides step-by-step instructions for hosting Shayga with **AWS RDS PostgreSQL**, **Cloudflare CDN**, **Cloudflare R2 (Object Storage)**, and **Docker / Caddy on a VPS**.

---

## Architecture Overview

```mermaid
flowchart TD
    subgraph Edge["🌐 Edge Layer (Cloudflare)"]
        CF_DNS["Cloudflare DNS & WAF (Proxy Enabled)"]
        CF_CACHE["Cloudflare Edge Cache<br/>(Static Assets & Optimized Images)"]
    end

    subgraph Host["🖥️ Production VPS (Ubuntu)"]
        Caddy["Caddy Reverse Proxy<br/>(Auto SSL, Zstd/Gzip, HTTP/3)"]
        App["Next.js 16 + Payload CMS 3.x<br/>(ghcr.io Docker Container)"]
    end

    subgraph CloudServices["☁️ AWS & Managed Services"]
        RDS[("🐘 AWS RDS PostgreSQL<br/>(Encrypted, VPC Security Group)")]
        R2[("🪣 Cloudflare R2<br/>(Zero-Egress Media Storage)")]
        Resend["📧 Resend API<br/>(Transactional Emails)"]
        Razorpay["💳 Razorpay Gateway<br/>(Payments)"]
    end

    CF_DNS --> CF_CACHE
    CF_CACHE --> Caddy
    Caddy --> App
    App -->|Queries (SSL)| RDS
    App -->|Uploads / S3 API| R2
    App -->|Emails| Resend
    App -->|Verify Orders| Razorpay
```

---

## 1. AWS RDS PostgreSQL Setup

### Step 1.1: Create RDS Instance

1. Open the [AWS RDS Console](https://console.aws.amazon.com/rds/).
2. Click **Create database**.
3. Choose **Standard create** → **PostgreSQL**.
4. Select **PostgreSQL 16.x** or **17.x** (supported by Payload CMS).
5. Template: Choose **Production** or **Free tier / Dev/Test** (e.g. `db.t4g.micro` or `db.t4g.small` with 20GB–50GB gp3 storage).
6. **Settings**:
   - DB instance identifier: `shayga-production-db`
   - Master username: `shayga_admin`
   - Master password: _[Generate a strong 24+ character password]_
7. **Connectivity**:
   - Public access: **Yes** (or connect via VPC Peering / Private Subnet if VPS is within the same AWS VPC).
   - VPC Security Group: Create new, named `shayga-rds-sg`.
8. **Initial Database**:
   - Under **Additional configuration** → **Initial database name**: enter `shayga`.
9. Click **Create database** (takes ~5–10 minutes to provision).

### Step 1.2: Configure Security Group (Restrict Access to VPS Only)

1. In the RDS Console, click your database → **Connectivity & security**.
2. Click the link under **VPC security groups** (`shayga-rds-sg`).
3. Click **Edit inbound rules**.
4. Set:
   - **Type**: `PostgreSQL`
   - **Port**: `5432`
   - **Source**: `Custom` → Enter your **Production VPS Public IP** (e.g., `203.0.113.45/32`).
     _(Do NOT allow `0.0.0.0/0` in production)_.
5. Save rules.

### Step 1.3: Construct Connection URL

Your connection string in `.env` will look like:

```env
DATABASE_URL=postgres://shayga_admin:<YOUR_PASSWORD>@shayga-production-db.<region_id>.rds.amazonaws.com:5432/shayga?sslmode=require
DB_POOL_MAX=15
```

---

## 2. Cloudflare DNS & Edge Performance Setup

### Step 2.1: DNS Configuration

1. In the Cloudflare Dashboard, add DNS `A` records pointing your apex `@` and `www` to your VPS public IPv4:
   - `A` | `@` | `<VPS_IP>` | **Proxied (Orange Cloud)**
   - `A` | `www` | `<VPS_IP>` | **Proxied (Orange Cloud)**

### Step 2.2: SSL/TLS Encryption

1. Go to **SSL/TLS** → **Overview**.
2. Set SSL/TLS encryption mode to **Full (Strict)**.

### Step 2.3: Enable Speed & Compression Features

1. Go to **Speed** → **Optimization**:
   - Enable **Brotli** compression.
   - Enable **Early Hints**.
   - Enable **HTTP/3 (with QUIC)**.
   - Enable **0-RTT Connection Resumption**.
2. Go to **Caching** → **Tiered Cache**:
   - Enable **Tiered Cache** (select closest topology).

### Step 2.4: Edge Cache Rule for Static Assets & Images

1. Go to **Caching** → **Cache Rules** → **Create rule**.
2. Rule Name: `Cache Next.js Static Assets & Images`
3. If incoming requests match:
   - `URI Path` starts with `/_next/static/` OR
   - `URI Path` starts with `/_next/image` OR
   - `URI Path` starts with `/images/` OR
   - `URI Path` starts with `/fonts/`
4. Cache eligibility: **Eligible for cache**.
5. Edge TTL: **Override origin** → **1 month** (or 1 year for `/_next/static/`).
6. Browser TTL: **Respect origin headers**.

---

## 3. Cloudflare R2 (Object Storage) Setup

1. In the Cloudflare Dashboard, go to **R2** → **Create bucket**.
2. Bucket Name: `shayga-media` (Location: Asia-Pacific / Western Europe close to your target users).
3. Connect a custom domain:
   - Click your bucket → **Settings** → **Custom Domains** → **Connect Domain**.
   - Enter `media.shayga.in` (auto-creates DNS record).
4. Generate S3 API Credentials:
   - In R2 Overview, click **Manage R2 API Tokens** → **Create API Token**.
   - Permissions: **Object Read & Write**.
   - Bucket: `shayga-media`.
   - Copy `Access Key ID`, `Secret Access Key`, and the `Endpoint` URL.
5. In your production `.env`:
   ```env
   R2_BUCKET=shayga-media
   R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
   R2_ACCESS_KEY_ID=<YOUR_R2_ACCESS_KEY_ID>
   R2_SECRET_ACCESS_KEY=<YOUR_R2_SECRET_ACCESS_KEY>
   NEXT_PUBLIC_SERVER_URL=https://shayga.in
   ```

---

## 4. Production VPS Deployment (Docker + Caddy)

### Step 4.1: Server Setup (Ubuntu 22.04 / 24.04 LTS)

SSH into your VPS and install Docker & Caddy:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl ufw git docker.io docker-compose-v2 debian-keyring debian-archive-keyring apt-transport-https

# Install Caddy
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy

# Configure Firewall
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 443/udp # For HTTP/3 (QUIC)
sudo ufw enable
```

### Step 4.2: Caddyfile (`/etc/caddy/Caddyfile`)

```caddy
shayga.in, www.shayga.in {
    encode zstd gzip

    # Reverse proxy to the Next.js container
    reverse_proxy localhost:3000 {
        header_up Host {host}
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
        header_up X-Forwarded-Proto {scheme}
    }
}
```

Reload Caddy:

```bash
sudo systemctl reload caddy
```

### Step 4.3: Deploy Container Image

Create `/opt/shayga/docker-compose.yml`:

```yaml
services:
  app:
    image: ghcr.io/sharma0x/shagya-website:latest
    container_name: shayga_web
    restart: always
    ports:
      - '127.0.0.1:3000:3000'
    env_file:
      - .env
```

Run database migrations and start the service:

```bash
# Pull and start
docker compose pull
docker compose up -d

# Verify logs
docker compose logs -f app
```

---

## 5. Post-Deployment Verification Checklist

- [ ] **SSL / TLS**: Visit `https://shayga.in` — verify green padlock and HTTP/2 or HTTP/3 negotiation.
- [ ] **AWS RDS Connectivity**: Verify products, categories, and site settings load smoothly.
- [ ] **Image Optimization**: Inspect images in DevTools Network tab — ensure Content-Type is `image/avif` or `image/webp` and transferred sizes are < 100KB per card.
- [ ] **Admin Panel**: Visit `https://shayga.in/admin` and verify authentication and media uploads to R2.
- [ ] **PageSpeed / Lighthouse**: Run [PageSpeed Insights](https://pagespeed.web.dev/) to verify Core Web Vitals (LCP < 1.2s, CLS = 0.00).
