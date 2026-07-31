variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Project prefix to avoid conflicts"
  type        = string
  default     = "fintech-k8s"
}