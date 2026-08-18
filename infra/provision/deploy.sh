#!/usr/bin/env bash
# =============================================================================
# Shayga — Deploy a Docker image tag to the VPS
#
# Copies docker-compose.prod.yml, Caddyfile and Makefile to /opt/shayga, then
# writes a per-VPS env file (.env.production.<vps-id>) derived from
# infra/.env.production, and runs `make prod-deploy`.
#
# Normally invoked by Terraform (terraform_data.deploy), but can be run
# standalone:
#   bash deploy.sh --vps-ip 1.2.3.4 --vps-id i-xxxx --tag testing
# =============================================================================

set -euo pipefail

VPS_IP=""
VPS_ID=""
TAG="testing"
IMAGE="ghcr.io/sharma0x/shagya-website"
DATABASE_URL_FILE=""
DOMAIN="shayga.in"

usage() {
  cat <<'EOF' >&2
Usage: deploy.sh --vps-ip <ip> --vps-id <instance-id> [options]

Required:
  --vps-ip <ip>            Public (Elastic) IP of the VPS
  --vps-id <id>            EC2 instance ID of the VPS (used to name the env file)

Options:
  --tag <tag>              Docker image tag to deploy (default: testing)
  --image <repo>           Docker image repo (default: ghcr.io/sharma0x/shagya-website)
  --database-url-file <f>  File containing the DATABASE_URL to write (only for a
                           newly created RDS; keep absent to reuse the existing one)
  --domain <domain>        Public domain served by Caddy (default: shayga.in)
  -h, --help               Show this help
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --vps-ip)           VPS_IP="$2"; shift 2 ;;
    --vps-id)           VPS_ID="$2"; shift 2 ;;
    --tag)              TAG="$2"; shift 2 ;;
    --image)            IMAGE="$2"; shift 2 ;;
    --database-url-file) DATABASE_URL_FILE="$2"; shift 2 ;;
    --domain)           DOMAIN="$2"; shift 2 ;;
    -h|--help)          usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage; exit 1 ;;
  esac
done

if [[ -z "$VPS_IP" ]]; then echo "Missing --vps-ip" >&2; usage; exit 1; fi
if [[ -z "$VPS_ID" ]]; then echo "Missing --vps-id" >&2; usage; exit 1; fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
INFRA_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

ENV_SRC="$INFRA_DIR/.env.production"
ENV_NAME=".env.production.$VPS_ID"
SSH_HOST="ubuntu@$VPS_IP"

[[ -f "$ENV_SRC" ]] || { echo "Missing env source: $ENV_SRC" >&2; exit 1; }

echo "==> Waiting for VPS to finish bootstrapping (SSH + Docker)..."
READY=false
for _ in $(seq 1 60); do
  if ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=accept-new \
         "$SSH_HOST" 'docker --version' >/dev/null 2>&1; then
    READY=true
    break
  fi
  echo "    ...not ready yet, retrying in 10s"
  sleep 10
done
[[ "$READY" == "true" ]] || { echo "VPS never became ready" >&2; exit 1; }
echo "==> VPS ready."

echo "==> Preparing env file: $ENV_NAME"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
cp "$ENV_SRC" "$WORK/$ENV_NAME"

# Rewrite DATABASE_URL only when a new RDS was created (URL supplied via file).
if [[ -n "$DATABASE_URL_FILE" ]]; then
  if [[ -s "$DATABASE_URL_FILE" ]]; then
    DB_URL="$(tr -d '\r\n' < "$DATABASE_URL_FILE")"
    sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=$DB_URL|" "$WORK/$ENV_NAME"
  else
    echo "Warning: --database-url-file '$DATABASE_URL_FILE' is empty; keeping existing DATABASE_URL" >&2
  fi
fi

sed -i.bak "s|^PUBLIC_IP=.*|PUBLIC_IP=$VPS_IP|" "$WORK/$ENV_NAME"
sed -i.bak "s|^EXTRA_ALLOWED_ORIGINS=.*|EXTRA_ALLOWED_ORIGINS=https://$VPS_IP|" "$WORK/$ENV_NAME"
sed -i.bak "s|^DOMAIN_NAME=.*|DOMAIN_NAME=$DOMAIN|" "$WORK/$ENV_NAME"
rm -f "$WORK"/*.bak

# Fail fast if a key we depend on is absent from the source env file (the sed
# above is a no-op for missing keys, which would leave Caddy with an empty
# {$PUBLIC_IP}/{$DOMAIN_NAME} and break the proxy).
for key in PUBLIC_IP EXTRA_ALLOWED_ORIGINS DOMAIN_NAME NEXT_PUBLIC_SERVER_URL; do
  if ! grep -q "^$key=" "$WORK/$ENV_NAME"; then
    echo "Error: '$key' is missing from $ENV_SRC — add it before deploying." >&2
    exit 1
  fi
done
if [[ -n "$DATABASE_URL_FILE" && -s "$DATABASE_URL_FILE" ]] && ! grep -q "^DATABASE_URL=" "$WORK/$ENV_NAME"; then
  echo "Error: 'DATABASE_URL' is missing from $ENV_SRC — add it before deploying." >&2
  exit 1
fi

# Minimal env for Caddy — only what the proxy needs, no app secrets.
cat > "$WORK/caddy.env" <<EOF
DOMAIN_NAME=$DOMAIN
PUBLIC_IP=$VPS_IP
EOF

echo "==> Ensuring /opt/shayga is owned by ubuntu"
ssh -o StrictHostKeyChecking=accept-new "$SSH_HOST" \
  'sudo chown -R ubuntu:ubuntu /opt/shayga'

echo "==> Copying deploy files (docker-compose.prod.yml, Caddyfile, Makefile, $ENV_NAME)"
scp -o StrictHostKeyChecking=accept-new \
  "$REPO_ROOT/docker-compose.prod.yml" \
  "$REPO_ROOT/Caddyfile" \
  "$REPO_ROOT/Makefile" \
  "$SSH_HOST:/opt/shayga/"
scp -o StrictHostKeyChecking=accept-new \
  "$WORK/$ENV_NAME" \
  "$SSH_HOST:/opt/shayga/$ENV_NAME"
scp -o StrictHostKeyChecking=accept-new \
  "$WORK/caddy.env" \
  "$SSH_HOST:/opt/shayga/caddy.env"

echo "==> Deploying tag '$TAG' (image $IMAGE) with $ENV_NAME"
ssh -o StrictHostKeyChecking=accept-new "$SSH_HOST" \
  "cd /opt/shayga && make prod-deploy IMAGE_TAG=$TAG DOCKER_IMAGE=$IMAGE ENV_FILE=$ENV_NAME"

echo "==> Deploy complete. Env file on VPS: /opt/shayga/$ENV_NAME"

echo ""
echo "=============================================================="
echo "  Next step: update DNS records in your domain registrar"
echo "=============================================================="
echo "  Point these records to the VPS public IP (proxy via Cloudflare"
echo "  or leave DNS-only; both work):"
echo ""
echo "    A      $DOMAIN        -> $VPS_IP"
echo "    A      www.$DOMAIN    -> $VPS_IP   (or CNAME www -> $DOMAIN)"
echo ""
echo "  SSL: Caddy obtains a trusted Let's Encrypt certificate"
echo "  automatically once the DNS records resolve to this VPS."
echo "  If proxying through Cloudflare, note that TLS-ALPN-01 cannot"
echo "  reach the origin, so Caddy uses HTTP-01; set Cloudflare"
echo "  SSL/TLS mode to Full (strict) once the cert is issued (or use"
echo "  a Cloudflare Origin certificate). The bare IP (https://$VPS_IP)"
echo "  uses a self-signed cert and will show a browser warning."
echo "=============================================================="
