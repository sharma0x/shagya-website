# RDS PostgreSQL for the Shayga app (Payload CMS backend).
#
# Provisions the managed Postgres instance, the security group that locks
# port 5432 to the App VPS IP, and the multi-AZ DB subnet group.
#
# Usage:
#   terraform plan  -var="db_password=..." -var="vps_ip=<app-vps-public-ip>"
#   terraform apply -var="db_password=..." -var="vps_ip=<app-vps-public-ip>"
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# 1. Set your AWS Region
provider "aws" {
  region = "ap-south-1" # Change to your preferred region (e.g., ap-south-1 for India)
}

# 2. Variables for your secrets and IP
variable "db_password" {
  description = "Master password for PostgreSQL"
  type        = string
  sensitive   = true
}

variable "vps_ip" {
  description = "The public IP address of your App VPS"
  type        = string
}

# 2.5 Look up the project VPC and its public subnets (ap-south-1a + ap-south-1b).
# RDS requires a DB subnet group that spans at least 2 AZs.
data "aws_vpc" "project" {
  filter {
    name   = "tag:Name"
    values = ["project-vpc"]
  }
}

data "aws_subnets" "public" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.project.id]
  }

  filter {
    name   = "tag:Name"
    values = ["project-subnet-public*"]
  }
}

# 3. Security Group (The Firewall)
# This replaces Step 7: It locks down port 5432 so ONLY your VPS can connect
resource "aws_security_group" "rds_sg" {
  name        = "shayga-rds-sg"
  description = "Allow PostgreSQL traffic only from the App VPS"
  vpc_id      = data.aws_vpc.project.id

  ingress {
    description = "PostgreSQL from VPS"
    from_port   = 5432
    to_port     = 5432
    protocol    = "tcp"
    cidr_blocks = ["${var.vps_ip}/32"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# 3.5 DB subnet group spanning both public AZs.
# Without this, RDS falls back to the default VPC subnet group, which only
# covers a single AZ and fails with DBSubnetGroupDoesNotCoverEnoughAZs.
resource "aws_db_subnet_group" "shayga" {
  name        = "shayga-db-subnet-group"
  description = "Public subnets for shayga RDS in ap-south-1a and ap-south-1b"
  subnet_ids  = data.aws_subnets.public.ids

  tags = {
    Name = "shayga-db-subnet-group"
  }
}

# 4. The Managed Database Instance
# This replaces Steps 1-6: Provisions the actual hardware and PostgreSQL engine
resource "aws_db_instance" "shayga_postgres" {
  identifier             = "shayga-rds-server"
  engine                 = "postgres"
  engine_version         = "18.4"             # Latest available in ap-south-1
  instance_class         = "db.t4g.micro"     # 2 vCPU, 1 GB RAM (Graviton)
  allocated_storage      = 20
  storage_type           = "gp3"
  
  db_name                = "shayga"           # Creates the initial database for Payload
  username               = "shayga"
  password               = var.db_password
  
  publicly_accessible    = true               # Allows routing from outside AWS
  db_subnet_group_name   = aws_db_subnet_group.shayga.name
  vpc_security_group_ids = [aws_security_group.rds_sg.id]

  backup_retention_period = 7                 # Automated nightly backups (7 days)
  storage_encrypted       = true
  
  # Set to false in real production so you don't accidentally delete your data without a snapshot
  skip_final_snapshot    = true
}

# 5. Output the Connection String
output "database_connection_string" {
  description = "Copy this into your Payload CMS .env.production file"
  value       = "postgres://${aws_db_instance.shayga_postgres.username}:${var.db_password}@${aws_db_instance.shayga_postgres.endpoint}/${aws_db_instance.shayga_postgres.db_name}?sslmode=require"
  sensitive   = true
}