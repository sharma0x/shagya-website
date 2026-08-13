# High-Scale E-Commerce Deployment Plan

**Stack:** Payload CMS (Node.js), Managed PostgreSQL, Redis, Caddy, Cloudflare R2

This architecture isolates the database from the application layer to prevent resource starvation during high-traffic events (like festive sales). Application traffic is load-balanced across multiple Node.js containers, while static media is served entirely from the edge via Cloudflare.

## 1. Architecture Overview

```mermaid
flowchart TD
    %% Clients
    subgraph Clients["🌐 End Users & Traffic Source"]
        Customer["📱 Real Customers (Browsers / Mobile)"]
        Admin["💻 Business Owner (Payload Admin Panel)"]
    end

    %% Edge Layer
    subgraph EdgeLayer["🛡️ Edge Network & CDN Layer (Cloudflare)"]
        CF_DNS["Cloudflare DNS & WAF"]
        CF_CDN["Cloudflare CDN & Edge Cache<br/>(Static Assets & Saree Images)"]
    end

    %% VPS Infrastructure
    subgraph Server["🖥️ Primary Production Server (App VPS)"]
        subgraph ReverseProxy["Reverse Proxy Layer"]
            Caddy["Caddy Proxy<br/>(Automatic SSL & Brotli Compression)"]
        end

        subgraph ContainerRuntime["Docker Host Engine"]
            Node1["App Container 1<br/>(Payload CMS)"]
            Node2["App Container 2<br/>(Payload CMS)"]
            Redis["Redis Container<br/>(Session Store)"]
        end
    end

    %% Managed Cloud Services
    subgraph ManagedServices["☁️ Managed Third-Party Services"]
        RDS[("Managed PostgreSQL Database<br/>(Point-in-Time Recovery Enabled)")]
        R2[("Cloudflare R2 Bucket<br/>(Media Storage)") ]
        SMTP["Transactional Email API<br/>(Resend / SendGrid)"]
    end

    %% Connections
    Customer -->|HTTPS| CF_DNS
    Admin -->|HTTPS| CF_DNS
    CF_DNS --> CF_CDN

    CF_CDN -->|Cached Media Request| R2
    CF_CDN -->|Dynamic API & Admin Requests| Caddy

    Caddy -->|Load Balances Traffic| Node1
    Caddy -->|Load Balances Traffic| Node2

    Node1 <-->|Read / Write Sessions| Redis
    Node2 <-->|Read / Write Sessions| Redis

    Node1 -->|Search Plugin & DB Queries| RDS
    Node2 -->|Search Plugin & DB Queries| RDS

    Node1 -->|Uploads via @payloadcms/storage-s3| R2
    Node2 -->|Uploads via @payloadcms/storage-s3| R2

    Node1 -->|Trigger Order Receipts| SMTP
    Node2 -->|Trigger Order Receipts| SMTP

```

---

## 2. Infrastructure Requirements

To support a high-volume saree business, provision the following resources:

| Component            | Minimum Spec                | Recommended Service                                 |
| -------------------- | --------------------------- | --------------------------------------------------- |
| **App Server (VPS)** | 4 to 8 GB RAM, 2 to 4 vCPU  | Hetzner Cloud, DigitalOcean Droplet, AWS EC2        |
| **Managed DB**       | 2 GB RAM, 20 GB SSD Storage | AWS RDS (`db.t4g.small`) or DigitalOcean Managed PG |
| **Media Storage**    | N/A (Object Storage)        | Cloudflare R2                                       |
| **Email Delivery**   | SMTP / API Access           | Resend, AWS SES, or SendGrid                        |
| **DNS & CDN**        | Free Tier                   | Cloudflare                                          |

---

## 3. Environment Variables (`.env.production`)

Create a `.env.production` file on your App Server. Do not commit this to version control.

```env
# Payload CMS Configuration
NODE_ENV=production
PAYLOAD_SECRET=generate_a_secure_random_string_here
PORT=3000

# Managed Database Connection
DATABASE_URI=postgres://<username>:<password>@<managed-db-host>:5432/shayga?sslmode=require

# Redis Connection for Sessions/Caching
REDIS_URL=redis://redis:6379

# Cloudflare R2 Storage (@payloadcms/storage-s3)
S3_BUCKET=shayga-saree-media
S3_ACCESS_KEY_ID=<your_r2_access_key>
S3_SECRET_ACCESS_KEY=<your_r2_secret_key>
S3_ENDPOINT=https://<your_account_id>.r2.cloudflarestorage.com
S3_REGION=auto

# Transactional Emails
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_USER=resend
SMTP_PASS=<your_api_key>

```

---

## 4. Reverse Proxy Setup (`Caddyfile`)

Caddy handles automatic SSL generation and HTTP/2 multiplexing. Create a file named `Caddyfile` in the same directory as your Docker Compose file.

```caddy
yourstore.com, www.yourstore.com {
    # Compress text-based responses (HTML, JSON, JS, CSS)
    encode zstd gzip

    # Reverse proxy traffic to the Payload CMS containers
    reverse_proxy app:3000 {
        # Pass real client IP to the Payload backend
        header_up X-Real-IP {remote_host}
        header_up X-Forwarded-For {remote_host}
    }

    # Log format for production
    log {
        output file /var/log/caddy/access.log
        format json
    }
}

```

---

## 5. Docker Compose Configuration (`docker-compose.prod.yml`)

This file configures the Application and Redis containers on the primary VPS. The database and storage are handled externally by managed services.

```yaml
version: '3.8'

services:
  app:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: shayga-app
    restart: always
    # Automatically deploy 2 instances to utilize multiple CPU cores
    deploy:
      replicas: 2
    expose:
      - '3000'
    env_file:
      - .env.production
    depends_on:
      redis:
        condition: service_healthy
    logging:
      driver: 'json-file'
      options:
        max-size: '10m'
        max-file: '3'

  redis:
    image: redis:7-alpine
    container_name: shayga-redis
    restart: always
    expose:
      - '6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5
    logging:
      driver: 'json-file'
      options:
        max-size: '10m'
        max-file: '3'

  caddy:
    image: caddy:2-alpine
    container_name: shayga-proxy
    restart: always
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
      - caddy_config:/config
      - caddy_logs:/var/log/caddy
    depends_on:
      - app

volumes:
  redis_data:
    name: shayga-prod-redis
  caddy_data:
    name: shayga-prod-caddy-data
  caddy_config:
    name: shayga-prod-caddy-config
  caddy_logs:
    name: shayga-prod-caddy-logs
```

---

## 6. Deployment Steps

Execute the following commands on your production server to bring the application online:

1. **Clone your repository** and navigate to the project root.
2. **Create the production environment file:**
   Populate `.env.production` with your Managed DB and R2 credentials.
3. **Build and start the containers:**

```bash
docker compose -f docker-compose.prod.yml up -d --build

```

4. **Verify the services:**
   Ensure all containers (App replicas, Redis, Caddy) are running without errors.

```bash
docker compose -f docker-compose.prod.yml logs -f

```

5. **Update DNS:**
   Point your domain's A-record in Cloudflare to the IP address of your App VPS. Make sure Cloudflare is set to "Proxied" (orange cloud) for the domain. Caddy will automatically generate and bind the SSL certificates.
