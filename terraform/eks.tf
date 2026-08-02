module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "${var.project_name}-cluster"
  cluster_version = "1.30"

  vpc_id                   = module.vpc.vpc_id
  subnet_ids               = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.private_subnets

  eks_managed_node_groups = {
    main_nodes = {
      min_size     = 1
      max_size     = 3
      desired_size = 2
      instance_types = ["t3.small"] 

      iam_role_additional_policies = {
        dynamodb_policy = aws_iam_policy.node_dynamodb_policy.arn
      }
    }
  }

  cluster_endpoint_public_access = true

  tags = {
    Project     = var.project_name
    Environment = "dev"
  }
}

resource "aws_iam_policy" "node_dynamodb_policy" {
  name        = "${var.project_name}-node-dynamodb-policy-v2"
  description = "Allow EKS nodes to write and read/scan DynamoDB transactions table"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:Scan",
          "dynamodb:Query",
          "dynamodb:GetItem",
          "dynamodb:DescribeTable"
        ]
        Resource = aws_dynamodb_table.transactions.arn
      }
    ]
  })
}