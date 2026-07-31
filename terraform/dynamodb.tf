resource "aws_dynamodb_table" "transactions" {
  name           = "${var.project_name}-transactions"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "txId"

  attribute {
    name = "txId"
    type = "S"
  }

  tags = {
    Project     = var.project_name
    Environment = "dev"
  }
}