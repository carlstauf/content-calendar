terraform {
  required_version = ">= 1.0"
  
  required_providers {
    fly = {
      source  = "fly-apps/fly"
      version = "~> 0.0.20"
    }
  }
  
  backend "remote" {
    organization = "finalround"
    
    workspaces {
      name = "content-calendar"
    }
  }
}

provider "fly" {
  fly_api_token = var.fly_api_token
}

variable "fly_api_token" {
  description = "Fly.io API token"
  type        = string
  sensitive   = true
}

variable "app_name" {
  description = "Application name"
  type        = string
  default     = "finalround-content-calendar"
}

variable "database_name" {
  description = "PostgreSQL database name"
  type        = string
  default     = "content_calendar"
}

variable "redis_name" {
  description = "Redis instance name"
  type        = string
  default     = "content-calendar-redis"
}

# PostgreSQL Database
resource "fly_postgres_cluster" "content_calendar_db" {
  name   = "${var.app_name}-db"
  region = "sjc"
  
  vm_size     = "shared-cpu-1x"
  volume_size = 1
  node_count  = 1
}

# Redis Instance
resource "fly_app" "redis" {
  name = var.redis_name
  org  = "finalround"
}

resource "fly_machine" "redis" {
  app    = fly_app.redis.id
  region = "sjc"
  name   = "${var.redis_name}-machine"
  image  = "flyio/redis:7"
  
  services = [
    {
      ports = [
        {
          port     = 6379
          handlers = ["tls"]
        }
      ]
      protocol      = "tcp"
      internal_port = 6379
    }
  ]
  
  env = {
    REDIS_PASSWORD = random_password.redis_password.result
  }
  
  cpu    = 1
  memory = 256
}

# Generate random password for Redis
resource "random_password" "redis_password" {
  length  = 32
  special = true
}

# Main Application
resource "fly_app" "content_calendar" {
  name = var.app_name
  org  = "finalround"
}

# Application Secrets
resource "fly_secret" "database_url" {
  app   = fly_app.content_calendar.id
  name  = "DATABASE_URL"
  value = fly_postgres_cluster.content_calendar_db.database_url
}

resource "fly_secret" "redis_url" {
  app   = fly_app.content_calendar.id
  name  = "REDIS_URL"
  value = "redis://default:${random_password.redis_password.result}@${fly_app.redis.name}.internal:6379"
}

resource "fly_secret" "jwt_secret" {
  app   = fly_app.content_calendar.id
  name  = "JWT_SECRET"
  value = random_password.jwt_secret.result
}

resource "random_password" "jwt_secret" {
  length  = 64
  special = false
}

# Outputs
output "app_url" {
  value = "https://${fly_app.content_calendar.name}.fly.dev"
}

output "database_connection_info" {
  value = {
    hostname = fly_postgres_cluster.content_calendar_db.hostname
    port     = fly_postgres_cluster.content_calendar_db.port
    database = fly_postgres_cluster.content_calendar_db.database
    username = fly_postgres_cluster.content_calendar_db.username
  }
  sensitive = true
}