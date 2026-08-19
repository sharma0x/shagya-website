# =============================================================================
# Shayga — Provisioning (RDS + VPS) + Deployment
# =============================================================================
#
# A single, independent Terraform config that provisions the managed Postgres
# (RDS) and the app VPS (EC2 + Elastic IP), then deploys a Docker image tag to
# the VPS. Each half can be skipped so you can reuse infrastructure you already
# created.
#
# Usage
# -----
#   # Full fresh provision + deploy
#   terraform -chdir=infra/provision init
#   terraform -chdir=infra/provision apply \
#     -var="db_password=..." -var="ssh_public_key=$(cat ~/.ssh/id_ed25519.pub)" \
#     -var="docker_tag=testing"
#
#   # Reuse an existing RDS AND VPS (just deploy a new tag)
#   terraform -chdir=infra/provision apply \
#     -var="create_rds=false" -var="create_vps=false" \
#     -var="existing_vps_instance_id=i-xxxx" -var="docker_tag=latest"
#
#   # Re-run a deploy for the same tag (or a different tag) later
#   terraform -chdir=infra/provision apply \
#     -var="create_rds=false" -var="create_vps=false" \
#     -var="existing_vps_instance_id=i-xxxx" -var="docker_tag=testing" \
#     -replace=terraform_data.deploy
#
# The deploy step copies docker-compose.prod.yml, Caddyfile and Makefile to
# /opt/shayga on the VPS, copies infra/.env.production to a per-VPS copy
# .env.production.<vps-id>, rewrites DATABASE_URL (only when a new RDS is
# created) and PUBLIC_IP/EXTRA_ALLOWED_ORIGINS, then runs
# `make prod-deploy IMAGE_TAG=<tag>`.
# =============================================================================

terraform {
  required_version = ">= 1.4"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    local = {
      source  = "hashicorp/local"
      version = "~> 2.0"
    }
  }
}

provider "aws" {
  region  = var.aws_region
  profile = var.aws_profile
}

# ---------------------------------------------------------------------------
# Variables
# ---------------------------------------------------------------------------

variable "aws_region" {
  description = "AWS region to provision in"
  type        = string
  default     = "ap-south-1"
}

variable "aws_profile" {
  description = "AWS CLI profile to authenticate as (which account). Override with -var='aws_profile=default' to switch accounts."
  type        = string
  default     = "914800441067-static"
}

variable "create_rds" {
  description = "Provision a new RDS instance. Set false to reuse an existing one."
  type        = bool
  default     = true
}

variable "create_vps" {
  description = "Provision a new VPS (EC2 + Elastic IP). Set false to reuse an existing one."
  type        = bool
  default     = true
}

variable "run_deploy" {
  description = "Run the deploy step (copy files + env + make prod-deploy) after provisioning."
  type        = bool
  default     = true
}

variable "docker_tag" {
  description = "Docker image tag to deploy (e.g. latest, testing)"
  type        = string
  default     = "testing"
}

variable "docker_image" {
  description = "Docker image (repo) to deploy"
  type        = string
  default     = "ghcr.io/sharma0x/shagya-website"
}

# --- RDS ---
variable "db_password" {
  description = "Master password for a NEW RDS instance (required when create_rds=true)"
  type        = string
  sensitive   = true
  default     = ""
}

variable "rds_identifier" {
  description = "DB instance identifier (used to create or look up the RDS)"
  type        = string
  default     = "shayga-rds-server"
}

variable "rds_username" {
  description = "Master username for a NEW RDS instance"
  type        = string
  default     = "shayga"
}

variable "rds_db_name" {
  description = "Initial database name for a NEW RDS instance"
  type        = string
  default     = "shayga"
}

variable "rds_publicly_accessible" {
  description = "Give the RDS a public endpoint. The VPS reaches RDS over its private IP (same VPC), so false is more secure; keep true only if you need direct access from home/CI. Access is still gated by the security group."
  type        = bool
  default     = true
}

variable "final_snapshot_identifier" {
  description = "Name of the final snapshot taken on destroy. Change it if you destroy/recreate the RDS more than once (names are unique per region)."
  type        = string
  default     = "shayga-rds-final"
}

# --- VPS ---
variable "ssh_public_key" {
  description = "Contents of the SSH public key for the ubuntu user (required when create_vps=true)"
  type        = string
  default     = ""
}

variable "instance_type" {
  description = "EC2 instance type (t3.medium = 2 vCPU / 4 GB x86_64)"
  type        = string
  default     = "t3.medium"
}

variable "existing_vps_instance_id" {
  description = "EC2 instance ID of an existing VPS (required when create_vps=false)"
  type        = string
  default     = ""
}

variable "existing_eip_tag" {
  description = "Name tag of the existing Elastic IP to reuse (when create_vps=false)"
  type        = string
  default     = "shayga-vps-eip"
}

variable "domain_name" {
  description = "Public domain used by Caddy"
  type        = string
  default     = "shayga.in"
}

# ---------------------------------------------------------------------------
# Shared lookups (VPC + public subnets must already exist)
# ---------------------------------------------------------------------------

data "aws_vpc" "project" {
  default = true
}

data "aws_subnets" "public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.project.id]
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ---------------------------------------------------------------------------
# Existing resources (used when create_* = false)
# ---------------------------------------------------------------------------

data "aws_db_instance" "existing_rds" {
  count                  = var.create_rds ? 0 : 1
  db_instance_identifier = var.rds_identifier
}

data "aws_instance" "existing_vps" {
  count = var.create_vps ? 0 : 1

  filter {
    name   = "instance-id"
    values = [var.existing_vps_instance_id]
  }
}

data "aws_eip" "existing_eip" {
  count = var.create_vps ? 0 : 1

  filter {
    name   = "tag:Name"
    values = [var.existing_eip_tag]
  }
}

# ---------------------------------------------------------------------------
# RDS (PostgreSQL)
# ---------------------------------------------------------------------------

resource "aws_security_group" "rds_sg" {
  count       = var.create_rds ? 1 : 0
  name        = "shayga-rds-sg"
  description = "Allow PostgreSQL traffic only from the App VPS"
  vpc_id      = data.aws_vpc.project.id

  ingress {
    description = "PostgreSQL from App VPS (private, same VPC) + allowed admin IPs"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = concat(
      ["${local.vps_private_ip}/32"],
      [for ip in local.admin_ips : "${ip}/32"],
    )
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_db_subnet_group" "shayga" {
  count       = var.create_rds ? 1 : 0
  name        = "shayga-db-subnet-group"
  description = "Public subnets for shayga RDS"
  subnet_ids  = data.aws_subnets.public.ids
}

resource "aws_db_instance" "shayga" {
  count             = var.create_rds ? 1 : 0
  identifier        = var.rds_identifier
  engine            = "postgres"
  engine_version    = "18.4"
  instance_class    = "db.t4g.micro"
  allocated_storage = 20
  storage_type      = "gp3"

  db_name  = var.rds_db_name
  username = var.rds_username
  password = var.db_password

  publicly_accessible    = var.rds_publicly_accessible
  db_subnet_group_name   = aws_db_subnet_group.shayga[0].name
  vpc_security_group_ids = [aws_security_group.rds_sg[0].id]

  backup_retention_period = 7
  storage_encrypted       = true
  # Never silently drop data on destroy: take a final snapshot instead.
  skip_final_snapshot       = false
  final_snapshot_identifier = var.final_snapshot_identifier

  lifecycle {
    # Guard against accidental `terraform destroy`. To actually delete, set
    # this to false, `terraform apply`, then `terraform destroy`.
    prevent_destroy = true
  }
}

# When reusing an existing RDS but creating a NEW VPS, add the new VPS's
# private IP to the existing RDS's security group. Look the SG up by name
# (vpc_security_groups is an unordered set, so index [0] is not reliable).
data "aws_security_group" "existing_rds_sg" {
  count = (!var.create_rds && var.create_vps) ? 1 : 0

  filter {
    name   = "group-name"
    values = ["shayga-rds-sg"]
  }

  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.project.id]
  }
}

resource "aws_security_group_rule" "existing_rds_allow_vps" {
  count             = (!var.create_rds && var.create_vps) ? 1 : 0
  type              = "ingress"
  description       = "PostgreSQL from App VPS (private, same VPC)"
  from_port         = 5432
  to_port           = 5432
  protocol          = "tcp"
  cidr_blocks       = ["${local.vps_private_ip}/32"]
  security_group_id = data.aws_security_group.existing_rds_sg[0].id
}

# ---------------------------------------------------------------------------
# VPS (EC2 + Elastic IP)
# ---------------------------------------------------------------------------

resource "aws_key_pair" "shayga_vps" {
  count      = var.create_vps ? 1 : 0
  key_name   = "shayga-vps-key"
  public_key = var.ssh_public_key
}

resource "aws_security_group" "vps_sg" {
  count       = var.create_vps ? 1 : 0
  name        = "shayga-vps-sg"
  description = "SSH for admin, HTTP/HTTPS for Caddy reverse proxy"
  vpc_id      = data.aws_vpc.project.id

  ingress {
    description = "SSH from admin IPs"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [for ip in local.admin_ips : "${ip}/32"]
  }

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  lifecycle {
    precondition {
      condition     = length(local.admin_ips) > 0 && !contains([for ip in local.admin_ips : "${ip}/32"], "0.0.0.0/0")
      error_message = "allowed_ips.txt must contain at least one admin IP and must not contain 0.0.0.0/0. Run `make provision-allow-ip IP=<your-ip>` to add one."
    }
  }
}

resource "aws_instance" "shayga_vps" {
  count         = var.create_vps ? 1 : 0
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type

  subnet_id              = data.aws_subnets.public.ids[0]
  vpc_security_group_ids = [aws_security_group.vps_sg[0].id]
  key_name               = aws_key_pair.shayga_vps[0].key_name

  # The Elastic IP below is the stable public address, so no auto-assigned one
  associate_public_ip_address = false

  # The EIP puts a public IP on the instance's ENI, which the provider's
  # refresh misreads as associate_public_ip_address=true and forces
  # replacement. The subnet has MapPublicIpOnLaunch=false, so ignore it.
  lifecycle {
    ignore_changes  = [associate_public_ip_address]
    prevent_destroy = true
  }

  root_block_device {
    volume_type = "gp3"
    volume_size = 40
  }

  user_data = <<-EOF
    #!/usr/bin/env bash
    set -euo pipefail
    export DEBIAN_FRONTEND=noninteractive

    echo "==> Updating packages"
    apt-get update
    apt-get upgrade -y

    echo "==> Installing base tooling (Make, Git, CA certs)"
    apt-get install -y ca-certificates curl gnupg make git

    echo "==> Installing Docker Engine + Compose plugin"
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

    echo "==> Allow ubuntu user to run docker without sudo"
    usermod -aG docker ubuntu

    echo "==> App directory for deployment files"
    mkdir -p /opt/shayga

    echo "==> UFW firewall: only 22, 80, 443"
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow 22/tcp
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw --force enable

    echo "==> Bootstrap complete"
  EOF

  tags = {
    Name = "shayga-vps"
  }
}

resource "aws_eip" "shayga_vps" {
  count  = var.create_vps ? 1 : 0
  domain = "vpc"

  tags = {
    Name = "shayga-vps-eip"
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_eip_association" "shayga_vps" {
  count         = var.create_vps ? 1 : 0
  instance_id   = aws_instance.shayga_vps[0].id
  allocation_id = aws_eip.shayga_vps[0].id
}

# ---------------------------------------------------------------------------
# Resolved values (new OR existing, depending on create_* flags)
# ---------------------------------------------------------------------------

locals {
  # Machines (public IPs, one per line) allowed to reach RDS (5432) and SSH (22).
  # Edit infra/provision/allowed_ips.txt, or use `make provision-allow-ip` /
  # `make provision-deny-ip`. Lines starting with # are ignored.
  admin_ips = [
    for line in split("\n", try(file("${path.module}/allowed_ips.txt"), "")) :
    trimspace(line)
    if trimspace(line) != "" && substr(trimspace(line), 0, 1) != "#"
  ]

  rds_address  = var.create_rds ? aws_db_instance.shayga[0].address : data.aws_db_instance.existing_rds[0].address
  rds_port     = var.create_rds ? aws_db_instance.shayga[0].port : data.aws_db_instance.existing_rds[0].port
  rds_endpoint = "${local.rds_address}:${local.rds_port}"

  vps_private_ip  = var.create_vps ? aws_instance.shayga_vps[0].private_ip : data.aws_instance.existing_vps[0].private_ip
  vps_public_ip   = var.create_vps ? aws_eip.shayga_vps[0].public_ip : data.aws_eip.existing_eip[0].public_ip
  vps_instance_id = var.create_vps ? aws_instance.shayga_vps[0].id : var.existing_vps_instance_id

  # Only build a new connection string when a new RDS is created. When reusing
  # an existing RDS the deploy step keeps the DATABASE_URL already present in
  # infra/.env.production. Username/db-name come from the vars (they match the
  # existing RDS defaults).
  database_url = var.create_rds ? "postgresql://${var.rds_username}:${urlencode(var.db_password)}@${local.rds_endpoint}/${var.rds_db_name}?sslmode=no-verify" : ""
}

# ---------------------------------------------------------------------------
# Deployment
# ---------------------------------------------------------------------------

# Write the (secret) connection string to a 0600 file so it never ends up in
# the local-exec command string (which Terraform persists to state in plaintext).
resource "local_sensitive_file" "database_url_file" {
  count           = var.run_deploy ? 1 : 0
  content         = local.database_url
  filename        = "${path.module}/.database_url"
  file_permission = "0600"
}

resource "terraform_data" "deploy" {
  count = var.run_deploy ? 1 : 0

  triggers_replace = {
    tag = var.docker_tag
    vps = local.vps_instance_id
    # Re-run the deploy when the connection string changes (new RDS / password
    # rotation). Hashed so the secret never appears in state.
    db = sha256(local.database_url)
  }

  depends_on = [
    aws_instance.shayga_vps,
    aws_eip_association.shayga_vps,
    aws_db_instance.shayga,
    local_sensitive_file.database_url_file,
  ]

  provisioner "local-exec" {
    working_dir = path.module
    command     = <<-EOT
      bash deploy.sh \
        --vps-ip '${local.vps_public_ip}' \
        --vps-id '${local.vps_instance_id}' \
        --tag '${var.docker_tag}' \
        --image '${var.docker_image}' \
        --domain '${var.domain_name}' \
        --database-url-file '${path.module}/.database_url'
    EOT
  }
}

# ---------------------------------------------------------------------------
# Outputs
# ---------------------------------------------------------------------------

output "rds_endpoint" {
  description = "RDS endpoint (host:port)"
  value       = local.rds_endpoint
}

output "vps_public_ip" {
  description = "Public (Elastic) IP of the VPS"
  value       = local.vps_public_ip
}

output "vps_instance_id" {
  description = "EC2 instance ID of the VPS"
  value       = local.vps_instance_id
}

output "ssh_command" {
  description = "SSH into the VPS"
  value       = "ssh ubuntu@${local.vps_public_ip}"
}

output "database_url" {
  description = "Connection string for a newly created RDS (empty when reusing an existing RDS)"
  value       = local.database_url
  sensitive   = true
}

output "dns_records" {
  description = "DNS records to create so the domain resolves to the VPS (Caddy then auto-issues the Let's Encrypt cert)"
  value = [
    "A     ${var.domain_name}     -> ${local.vps_public_ip}",
    "A     www.${var.domain_name} -> ${local.vps_public_ip}  (or CNAME www -> ${var.domain_name})",
  ]
}

output "ssl_note" {
  description = "SSL/TLS configuration note"
  value       = "Caddy auto-issues a trusted Let's Encrypt cert once DNS points to the VPS. Behind Cloudflare proxy, TLS-ALPN-01 cannot reach the origin, so Caddy falls back to HTTP-01; set Cloudflare SSL/TLS mode to Full (strict) once the cert exists, or use a Cloudflare Origin certificate. The bare IP (https://${local.vps_public_ip}) uses a self-signed cert."
}
