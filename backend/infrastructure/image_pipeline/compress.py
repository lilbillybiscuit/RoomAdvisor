# import from lambda layers
import sys
sys.path.append('/opt')

import boto3
import os
import uuid
from PIL import Image
from pillow_heif import register_heif_opener
register_heif_opener()

s3 = boto3.resource('s3')
sqs = boto3.resource('sqs')

data_bucket_name = os.environ['DATA_BUCKET']
thumbnail_bucket_name = os.environ['THUMBNAIL_BUCKET']
tmp_file_path = '/tmp/{}'
max_image_size = 5000
thumbnail_size = (500, 500)

allowed_extensions = ['.jpg', '.jpeg', '.png', '.heic', '.heif', '.webp', '.tiff', '.bmp']


def lambda_handler(event, context):
    for record in event['Records']:
        message = record['body']
        file_key = message['Records'][0]['s3']['object']['key']

        image = s3.Object(data_bucket_name, file_key).get()
        image_file_path = tmp_file_path.format(file_key)

        # get file extension
        _, ext = os.path.splitext(file_key)
        if ext not in allowed_extensions:
            # delete
            s3.Object(data_bucket_name, file_key).delete()
            return "File extension not allowed." + file_key

        with open(image_file_path, 'wb') as f:
            f.write(image['Body'].read())

        with Image.open(image_file_path) as img:
            original_size = img.size

            # Resize image
            # check if image is larger than max size
            if max(original_size) > max_image_size:
                new_size = get_new_size(original_size)
            else:
                new_size = original_size
            # High-res image
            img.thumbnail(new_size)

            high_res_path = tmp_file_path.format(get_filename(file_key, '')) # no suffix
            img.save(high_res_path, img.format)
            s3.meta.client.upload_file(high_res_path, data_bucket_name, high_res_path)

            # Thumbnail
            thumbnail = crop_to_square(img)
            thumbnail.thumbnail(thumbnail_size)

            thumbnail_path = tmp_file_path.format(get_filename(file_key, '-thumbnail'))
            thumbnail.save(thumbnail_path, img.format)
            s3.meta.client.upload_file(thumbnail_path, thumbnail_bucket_name, thumbnail_path)

        os.remove(thumbnail_path)
        os.remove(high_res_path)
        os.remove(image_file_path)
        return "Image processed successfully." + file_key

def get_new_size(original):
    # Calculate new dimensions based on original size
    max_dimension = max(original)
    ratio = max_dimension / max_image_size
    new_size = tuple(int(d / ratio) for d in original)

    return new_size


def get_filename(key, suffix):
    filename, ext = os.path.splitext(key)
    return f'{filename}{suffix}{ext}'


def crop_to_square(img):
    # Get smallest dimension and crop image to square
    width, height = img.size
    smallest = min(width, height)
    crop = (width - smallest, height - smallest, width, height)
    img = img.crop(crop)

    return img