locals {
    archive_path = "${path.module}/function.zip"
}

data "aws_caller_identity" "current" {}

variable "prefix" {
    description = "The prefix of every resource name"
}

provider "aws" {
    region = "us-east-2"
}

provider archive {}

// Create S3 bucket for temporary uploads
resource "aws_s3_bucket" "upload_temp" {
    bucket = "${var.prefix}-upload-temp"
}

// S3 -> SNS
resource "aws_s3_bucket_notification" "bucket_notification" {
    bucket = aws_s3_bucket.upload_temp.id

    # Trigger a publish to the SNS topic from S3 using an S3 bucket notification configuration
    # that targets the SNS topic created above
    topic {
        topic_arn    = aws_sns_topic.s3_topic.arn
        events       = ["s3:ObjectCreated:*"]
        filter_prefix = ""
        filter_suffix = ""
    }
}

// Allows S3 to publish to SNS
data "aws_iam_policy_document" "sns_policy_data" {
    statement {
        effect = "Allow"

        principals {
            type        = "Service"
            identifiers = ["s3.amazonaws.com"]
        }

        actions = ["SNS:Publish"]
        resources = [
            "arn:aws:sns:*:${data.aws_caller_identity.current.account_id}:${var.prefix}-s3-topic"
        ]

        condition {
            test     = "ArnLike"
            variable = "aws:SourceArn"
            values   = [aws_s3_bucket.upload_temp.arn]
        }
    }
}

// Create an SNS Topic for S3 events
resource "aws_sns_topic" "s3_topic" {
    name   = "${var.prefix}-s3-topic"
    policy = data.aws_iam_policy_document.sns_policy_data.json
}



// SQS Queue Policy
resource "aws_iam_policy" "sqs_queue_policy" {
    name = "sqs_queue_policy"
    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Sid = "AllowSQSAccess"
                Effect = "Allow"
                Action = [
                    "sqs:SendMessage",
                    "sqs:ReceiveMessage",
                    "sqs:DeleteMessage",
                    "sqs:GetQueueAttributes",
                    "sqs:GetQueueUrl",
                ]
                Resource = [
                    aws_sqs_queue.image_queue.arn,
                ]
            }
        ]
    })
}

resource "aws_iam_role_policy_attachment" "sqs_queue_policy_attachment" {
    policy_arn = aws_iam_policy.sqs_queue_policy.arn
    role       = aws_iam_role.lambda_exec.name
}

// SQS Queue
resource "aws_sqs_queue" "image_queue" {
    name                      = "${var.prefix}-image-queue"
    delay_seconds             = 1
    max_message_size          = 2048
    message_retention_seconds = 86400
    receive_wait_time_seconds = 10
    policy                    = aws_iam_policy.sqs_queue_policy.arn
}



// SNS Topic -> SQS
resource "aws_sns_topic_subscription" "sqs_subscription" {
    topic_arn = aws_sns_topic.s3_topic.arn
    protocol  = "sqs"
    endpoint  = aws_sqs_queue.image_queue.arn
}



// LAMBDAS AND DESTINATION BUCKETS
resource "aws_s3_bucket" "data_bucket" {
    bucket = "${var.prefix}-data"
}

resource "aws_s3_bucket" "thumbnails_bucket" {
    bucket = "${var.prefix}-thumbnails"
}

resource "aws_iam_role" "lambda_exec" {
    name = "${var.prefix}_lambda_exec"

    assume_role_policy = jsonencode({
        Version   = "2012-10-17"
        Statement = [
            {
                Action    = "sts:AssumeRole"
                Effect    = "Allow"
                Principal = {
                    Service = "lambda.amazonaws.com"
                }
            }
        ]
    })
}


resource "aws_iam_role_policy" "lambda_policy" {
    name = "${var.prefix}_lambda_policy"
    role = aws_iam_role.lambda_exec.id

    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Action = [
                    "s3:GetObject",
                    "s3:PutObject",
                    "s3:DeleteObject",
                ]
                Effect = "Allow"
                Resource = [
                    aws_s3_bucket.upload_temp.arn,
                    aws_s3_bucket.data_bucket.arn,
                    aws_s3_bucket.thumbnails_bucket.arn,
                ]
            },
            {
                Action = "sqs:*"
                Effect = "Allow"
                Resource = aws_sqs_queue.image_queue.arn
            },
            {
                Action = "logs:*"
                Effect = "Allow"
                Resource = "arn:aws:logs:*:*:*"
            },
            {
                Action = "sns:Publish"
                Effect = "Allow"
                Resource = aws_sns_topic.s3_topic.arn
            },
        ]
    })
}

resource "aws_lambda_event_source_mapping" "sqs_mapping" {
    event_source_arn = aws_sqs_queue.image_queue.arn
    function_name    = aws_lambda_function.image_compressor.arn
    batch_size       = 1
    enabled          = true
}

data "archive_file" "function_zip" {
    type = "zip"

    source {
        content  = file("${path.module}/compress.py")
        filename = "compress.py"
    }

    output_path = local.archive_path
    depends_on  = [null_resource.install_dependencies]
}

resource "null_resource" "install_dependencies" {
    provisioner "local-exec" {
        command = "pip install -r requirements.txt -t ${path.module}/site-packages"
    }
}

data "archive_file" "dependencies_zip" {
    type      = "zip"
    source_dir= "${path.module}/site-packages"
    output_path = "${path.module}/dependencies.zip"
    depends_on  = [null_resource.install_dependencies]
}

// create lambda layer
resource "aws_lambda_layer_version" "python_layer" {
    filename         = data.archive_file.dependencies_zip.output_path
    layer_name       = "${var.prefix}-python-layer"
    compatible_runtimes = ["python3.8"]
}


resource "aws_lambda_function" "image_compressor" {
    filename         = local.archive_path
    function_name    = "${var.prefix}-image-compressor"
    role             = aws_iam_role.lambda_exec.arn
    handler          = "compress.lambda_handler"
    source_code_hash = data.archive_file.function_zip.output_base64sha256
    runtime          = "python3.8"
    layers           = [aws_lambda_layer_version.python_layer.arn]
    environment {
        variables = {
            DATA_BUCKET      = aws_s3_bucket.data_bucket.id
            THUMBNAIL_BUCKET = aws_s3_bucket.thumbnails_bucket.id
        }
    }

    # Adjust memory and timeout as required
    memory_size    = 512
    timeout        = 30

    provisioner "local-exec" {
        command = "pip install -r ${path.module}/requirements.txt --upgrade -t ${dirname(local.archive_path)}"
    }
}
