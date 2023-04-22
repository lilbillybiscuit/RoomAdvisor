locals {
    archive_path = "${path.module}/function.zip"
}

data "aws_caller_identity" "current" {}

variable "prefix" {
    description = "The prefix of every resource name"
}

variable "aws_region" {
    description = "The AWS region to deploy to"
    default     = "us-east-2"
}

provider "aws" {
    region = var.aws_region
}

provider "cloudflare" {

}

provider archive {}

// Create S3 bucket for temporary uploads
resource "aws_s3_bucket" "upload_temp" {
    bucket = "${var.prefix}-upload-temp"
}

// S3 -> SQS
resource "aws_s3_bucket_notification" "bucket_notification" {
    bucket = aws_s3_bucket.upload_temp.id

    # Trigger a publish to the SQS queue from S3 using an S3 bucket notification configuration
    # that targets the SQS queue created below
    queue {
        queue_arn = aws_sqs_queue.image_queue.arn
        # only trigger on put events
        events = ["s3:ObjectCreated:Put"]
    }
}

resource "aws_sqs_queue" "image_queue" {
    name = "${var.prefix}-image-queue"
    delay_seconds            = 1
    max_message_size         = 2048
    message_retention_seconds= 86400
    receive_wait_time_seconds= 10
    policy = data.aws_iam_policy_document.sqs_queue_policy_data.json
}

data "aws_iam_policy_document" "sqs_queue_policy_data" {
    statement {
        sid = "AllowSQSAccess"

        effect = "Allow"

        principals {
            type        = "AWS"
            identifiers = ["*"]
        }

        actions = [
            "sqs:SendMessage",
            "sqs:ReceiveMessage",
            "sqs:DeleteMessage",
            "sqs:GetQueueAttributes",
            "sqs:GetQueueUrl",
        ]

        resources = [
            # Allow access to the SQS queue created above by manually specifying the ARN
            "arn:aws:sqs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:${var.prefix}-image-queue",
        ]

        condition {
            test     = "ArnLike"
            variable = "aws:SourceArn"
            values = [
                # Allow access to the SQS queue created above by manually specifying the ARN
                aws_s3_bucket.upload_temp.arn
            ]
        }
    }
}

resource "aws_iam_role" "lambda_exec" {
    name = "${var.prefix}_lambda_exec"

    assume_role_policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Action = "sts:AssumeRole"
                Effect = "Allow"
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
                    "arn:aws:s3:::${var.prefix}-upload-temp/*",
                    "arn:aws:s3:::${var.prefix}-data/*",
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
        ]
    })
}

resource "aws_s3_bucket" "data_bucket" {
    bucket = "${var.prefix}-data"
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
    type        = "zip"
    source_dir  = "${path.module}/site-packages"
    output_path = "${path.module}/dependencies.zip"
    depends_on  = [null_resource.install_dependencies]
}

// create lambda layer
resource "aws_lambda_layer_version" "python_layer" {
    filename          = data.archive_file.dependencies_zip.output_path
    layer_name        = "${var.prefix}-python-layer"
    compatible_runtimes = ["python3.9"]
}

resource "aws_lambda_function" "image_compressor" {
    filename         = local.archive_path
    function_name    = "${var.prefix}-image-compressor"
    role             = aws_iam_role.lambda_exec.arn
    handler          = "compress.lambda_handler"
    source_code_hash = data.archive_file.function_zip.output_base64sha256
    runtime          = "python3.9"
    layers           = [aws_lambda_layer_version.python_layer.arn]
    environment {
        variables = {
            DATA_BUCKET      = aws_s3_bucket.data_bucket.id
        }
    }

    # Adjust memory and timeout as required
    memory_size    = 3000
    timeout        = 30

#    provisioner "local-exec" {
#        command = "python3.9 -m pip install -r ${path.module}/requirements.txt --upgrade -t ${dirname(local.archive_path)}"
#    }
}

resource "aws_lambda_event_source_mapping" "sqs_mapping" {
    event_source_arn = aws_sqs_queue.image_queue.arn
    function_name    = aws_lambda_function.image_compressor.arn
    batch_size       = 1
    enabled          = true
}

resource "aws_cloudfront_origin_access_identity" "origin_access_identity" {
    comment = "MyCloudFrontOAI"
}

resource "aws_s3_bucket_policy" "data_bucket_policy" {
    bucket = aws_s3_bucket.data_bucket.id

    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Sid       = "Allow CloudFront access to the bucket"
                Effect    = "Allow"
                Principal = {
                    AWS = "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity ${aws_cloudfront_origin_access_identity.origin_access_identity.id}"
                }
                Action    = [ "s3:GetObject", "s3:ListBucket" ]
                Resource  = [
                    aws_s3_bucket.data_bucket.arn,
                    "${aws_s3_bucket.data_bucket.arn}/*",
                ]
            },
        ]
    })
}

resource "aws_cloudfront_distribution" "data_distribution" {
    origin {
        domain_name = aws_s3_bucket.data_bucket.bucket_regional_domain_name
        origin_id   = "S3-${aws_s3_bucket.data_bucket.id}"
    }

    enabled             = true
    is_ipv6_enabled     = true
    comment             = "${var.prefix}-data-distribution"
    price_class         = "PriceClass_200"

    default_cache_behavior {
        allowed_methods  = ["GET", "HEAD", "OPTIONS"]
        cached_methods   = ["GET", "HEAD", "OPTIONS"]
        default_ttl      = 0
        max_ttl          = 86400
        min_ttl          = 0
        forward_headers  = ["Accept-Encoding"]
        forward_cookies  = "none"
        forward_query_string = false
        viewer_protocol_policy = "redirect-to-https"
        target_origin_id = "S3-${aws_s3_bucket.data_bucket.id}"
    }

    restrictions {
        geo_restriction {
            restriction_type = "none"
        }
    }

    viewer_certificate {
        cloudfront_default_certificate = true
    }
}

resource "aws_cloudfront_origin_access_identity" "origin_access_identity" {
    comment = "MyCloudFrontOAI"
}