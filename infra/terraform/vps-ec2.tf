# App VPS (EC2) for the Shayga app (Next.js + Payload CMS, Docker Compose + Caddy).
#
# Provisions the minimum-spec production VPS described in docs/deployment.md:
#   - 2 vCPU / 4 GB RAM x86_64 instance (t3.medium) — Docker images are built
#     for linux/amd64 on GitHub Actions runners, so Graviton (arm64) instances
#     like t4g/c7g would fall back to slow QEMU emulation.
#   - Ubuntu 24.04 LTS, 40 GB gp3 root volume
#   - Bootstraps Docker CE, Compose plugin, Make and Git via user_data (Step 1)
#   - Creates /opt/shayga (Step 2) and opens 22/80/443 in the firewall
#   - Allocates a stable public Elastic IP so the RDS security group
#     (see rds-postgres.tf, var.vps_ip) never breaks on instance restarts.
#
# Usage (provider, region and VPC/subnet lookups are shared with rds-postgres.tf):
#   terraform plan  -var="ssh_public_key=\"$(cat ~/.ssh/id_ed25519.pub)\""
#   terraform apply -var="ssh_public_key=\"$(cat ~/.ssh/id_ed25519.pub)\""
# 1. Variables
variable "ssh_public_key" {
  description = "Contents of your public SSH key (~/.ssh/id_ed25519.pub) for the ubuntu user"
  type        = string
}

variable "instance_type" {
  description = "EC2 instance type. t3.medium is the minimum spec from docs/deployment.md (2 vCPU, 4 GB RAM, x86_64)"
  type        = string
  default     = "t3.medium"
}

variable "ssh_allowed_cidrs" {
  description = "CIDRs allowed to SSH to the VPS. Restrict to your office/home IP in production"
  type        = list(string)
  default     = ["0.0.0.0/0"] # ⚠️ Tighten this before going live
}

# 2. Ubuntu 24.04 LTS (Noble) x86_64 AMI from Canonical, latest in region.
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

# 3. SSH key pair for the ubuntu user
resource "aws_key_pair" "shayga_vps" {
  key_name   = "shayga-vps-key"
  public_key = var.ssh_public_key

  tags = {
    Name = "shayga-vps-key"
  }
}

# 4. Security Group (The Firewall)
# 22 SSH for you, 80/443 for Caddy (traffic arrives via Cloudflare, proxied)
resource "aws_security_group" "vps_sg" {
  name        = "shayga-vps-sg"
  description = "SSH for admin, HTTP/HTTPS for Caddy reverse proxy"
  vpc_id      = data.aws_vpc.project.id

  ingress {
    description = "SSH from admin"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = var.ssh_allowed_cidrs
  }

  ingress {
    description = "HTTP from Cloudflare edge"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "HTTPS from Cloudflare edge"
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
}

# 5. The VPS instance
# user_data bootstraps everything from docs/deployment.md Step 1: Docker,
# Compose, Make and Git, plus Step 2's /opt/shayga directory.
resource "aws_instance" "shayga_vps" {
  ami           = data.aws_ami.ubuntu.id
  instance_type = var.instance_type

  subnet_id              = data.aws_subnets.public.ids[0]
  vpc_security_group_ids = [aws_security_group.vps_sg.id]
  key_name               = aws_key_pair.shayga_vps.key_name

  # The Elastic IP below is the stable public address, so no auto-assigned one
  associate_public_ip_address = false

  # The EIP (aws_eip_association below) puts a public IP on the instance's ENI,
  # which the provider's refresh misreads as associate_public_ip_address=true,
  # causing perpetual "forces replacement". The subnet already has
  # MapPublicIpOnLaunch=false, so no auto-assigned IP is ever created — ignore
  # the field to stop the drift.
  lifecycle {
    ignore_changes = [associate_public_ip_address]
  }

  root_block_device {
    volume_type = "gp3"
    volume_size = 40 # 40 GB+ SSD per docs/deployment.md minimum spec
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

    echo "==> App directory for deployment files (docs/deployment.md Step 2)"
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

# 6. Public Elastic IP — stable address for the RDS security group
# (pass it as -var="vps_ip=<this>" when applying rds-postgres.tf).
resource "aws_eip" "shayga_vps" {
  domain = "vpc"

  tags = {
    Name = "shayga-vps-eip"
  }
}

resource "aws_eip_association" "shayga_vps" {
  instance_id   = aws_instance.shayga_vps.id
  allocation_id = aws_eip.shayga_vps.id
}

# 7. Outputs
output "vps_public_ip" {
  description = "Public IP of the VPS. Point shayga.in / www.shayga.in A records at this, and use it as var.vps_ip for rds-postgres.tf"
  value       = aws_eip.shayga_vps.public_ip
}

output "ssh_command" {
  description = "SSH into the VPS"
  value       = "ssh ubuntu@${aws_eip.shayga_vps.public_ip}"
}

output "vps_instance_id" {
  description = "EC2 instance ID"
  value       = aws_instance.shayga_vps.id
}
