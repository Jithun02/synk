import { CanvasObject, IaCFormat } from '../types/canvas';

export function generateIaC(objects: CanvasObject[], format: IaCFormat): string {
  const nodes = objects.filter((o) => o.type === 'rectangle' || o.type === 'circle');

  if (format === 'terraform') {
    return generateTerraformHCL(nodes);
  } else if (format === 'kubernetes') {
    return generateKubernetesYAML(nodes);
  } else {
    return generateDockerCompose(nodes);
  }
}

function generateTerraformHCL(nodes: CanvasObject[]): string {
  const headers = `# ==============================================================================
# synk — Terraform Infrastructure as Code (IaC) Spec
# Generated automatically from semantic architecture visual model
# Target Cloud Provider: AWS (us-east-1)
# ==============================================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = "us-east-1"
  default_tags {
    tags = {
      Environment = "Production"
      ManagedBy   = "synk-IaC-Engine"
      Security    = "ZeroTrust-Enforced"
    }
  }
}

# --- Core VPC & Security Groups ---
resource "aws_vpc" "main_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "synk-prod-vpc"
  }
}
\n`;

  let body = '';

  for (const node of nodes) {
    const safeName = (node.text || 'component').toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const role = node.semanticRole || 'service';

    if (role === 'gateway') {
      body += `# Ingress Gateway: ${node.text}
resource "aws_alb" "${safeName}" {
  name               = "synk-${safeName}"
  internal           = false
  load_balancer_type = "application"
  subnets            = [aws_subnet.public_a.id, aws_subnet.public_b.id]
  security_groups    = [aws_security_group.web_sg.id]

  enable_deletion_protection = true
}

resource "aws_alb_listener" "${safeName}_https" {
  load_balancer_arn = aws_alb.${safeName}.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = var.acm_certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_alb_target_group.${safeName}_tg.arn
  }
}
\n`;
    } else if (role === 'database') {
      body += `# Database Layer: ${node.text}
resource "aws_db_instance" "${safeName}" {
  allocated_storage      = 100
  max_allocated_storage  = 500
  engine                 = "postgres"
  engine_version         = "15.4"
  instance_class         = "db.r6g.xlarge"
  db_name                = "synk_${safeName}"
  username               = "db_admin"
  password               = var.db_password
  storage_encrypted      = true
  kms_key_id             = aws_kms_key.db_key.arn
  multi_az               = true
  skip_final_snapshot    = false
  vpc_security_group_ids = [aws_security_group.db_sg.id]

  deletion_protection    = true
}
\n`;
    } else if (role === 'cache') {
      body += `# Redis Cache Cluster: ${node.text}
resource "aws_elasticache_replication_group" "${safeName}" {
  replication_group_id          = "synk-${safeName}"
  replication_group_description = "High scale Redis cluster"
  node_type                     = "cache.r6g.large"
  num_cache_clusters            = 3
  port                          = 6379
  automatic_failover_enabled    = true
  at_rest_encryption_enabled    = true
  transit_encryption_enabled    = true
}
\n`;
    } else {
      body += `# Containerized Microservice: ${node.text}
resource "aws_ecs_task_definition" "${safeName}" {
  family                   = "synk-${safeName}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = 1024
  memory                   = 2048

  container_definitions = jsonencode([
    {
      name      = "${safeName}"
      image     = "123456789012.dkr.ecr.us-east-1.amazonaws.com/${safeName}:v1.2.0"
      essential = true
      portMappings = [
        {
          containerPort = 8080
          hostPort      = 8080
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-group         = "/ecs/synk-${safeName}"
          awslogs-region        = "us-east-1"
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}
\n`;
    }
  }

  return headers + body;
}

function generateKubernetesYAML(nodes: CanvasObject[]): string {
  let doc = `# ==============================================================================
# synk — Kubernetes Production Deployment Spec (k8s v1.28)
# ==============================================================================
apiVersion: v1
kind: Namespace
metadata:
  name: synk-prod
  labels:
    istio-injection: enabled
---
`;

  for (const node of nodes) {
    const safeName = (node.text || 'component').toLowerCase().replace(/[^a-z0-9_]/g, '-');
    const role = node.semanticRole || 'service';

    if (role === 'gateway') {
      doc += `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${safeName}-ingress
  namespace: synk-prod
  annotations:
    kubernetes.io/ingress.class: "nginx"
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/backend-protocol: "HTTPS"
spec:
  tls:
  - hosts:
    - app.synk.io
    secretName: synk-tls-cert
  rules:
  - host: app.synk.io
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ${safeName}-service
            port:
              number: 443
---
`;
    } else {
      doc += `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${safeName}
  namespace: synk-prod
  labels:
    app.kubernetes.io/name: ${safeName}
    tier: ${role}
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ${safeName}
  template:
    metadata:
      labels:
        app: ${safeName}
    spec:
      containers:
      - name: ${safeName}
        image: registry.synk.io/microservices/${safeName}:v2.4.1
        ports:
        - containerPort: 8080
        resources:
          limits:
            cpu: "1000m"
            memory: "1Gi"
          requests:
            cpu: "250m"
            memory: "256Mi"
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
          initialDelaySeconds: 15
          periodSeconds: 10
---
apiVersion: v1
kind: Service
metadata:
  name: ${safeName}-service
  namespace: synk-prod
spec:
  type: ClusterIP
  selector:
    app: ${safeName}
  ports:
  - port: 8080
    targetPort: 8080
---
`;
    }
  }

  return doc;
}

function generateDockerCompose(nodes: CanvasObject[]): string {
  let yaml = `version: '3.8'

services:
`;

  for (const node of nodes) {
    const safeName = (node.text || 'component').toLowerCase().replace(/[^a-z0-9_]/g, '_');
    const role = node.semanticRole || 'service';

    if (role === 'database') {
      yaml += `  ${safeName}:
    image: postgres:15-alpine
    container_name: synk_${safeName}
    environment:
      POSTGRES_DB: synk_prod
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret_password_change_me
    ports:
      - "5432:5432"
    volumes:
      - ${safeName}_data:/var/lib/postgresql/data
    restart: always
\n`;
    } else if (role === 'cache') {
      yaml += `  ${safeName}:
    image: redis:7-alpine
    container_name: synk_${safeName}
    ports:
      - "6379:6379"
    command: redis-server --save 60 1 --loglevel notice
    restart: always
\n`;
    } else if (role === 'gateway') {
      yaml += `  ${safeName}:
    image: nginx:alpine
    container_name: synk_${safeName}
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    restart: always
\n`;
    } else {
      yaml += `  ${safeName}:
    build:
      context: .
      dockerfile: Dockerfile.${safeName}
    container_name: synk_${safeName}
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://admin:secret_password@db:5432/synk_prod
    ports:
      - "8080:8080"
    restart: always
\n`;
    }
  }

  yaml += `volumes:
  db_data:
    driver: local

networks:
  default:
    name: synkcanvas_net
`;

  return yaml;
}
