# import from lambda layers
import sys
sys.path.append('/opt')

import boto3
import os
import uuid
from PIL import Image
import requests
import json
import traceback
from io import BytesIO
import base64
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
result_extension = 'jpeg'

image_options = {
    "optimize": True,
    "quality": 80,
    "resample": Image.LANCZOS,
    "progressive": True
}

def send_message(stri, encode = True, as_file = False, filename = "file.txt"):
    return
#     url = 'url'
#     headers = {
#         'Content-Type': 'application/json'
#     }
#     if as_file:
#         files = {
#             'file': (filename, str(stri))
#         }
#         respose = requests.post(url, files=files)
#     else:
#         data = {
#             'content': base64.b64encode(stri.encode('utf-8')).decode('utf-8') if encode else stri
#         }
#         data = json.dumps(data)
#         response = requests.post(url, data=data, headers=headers)

def lambda_handler(event, context):
    try:
        send_message("Image processing started.", False)
        data = json.dumps(event)
        send_message(data, as_file=True, filename="event.json")
        body_obj = event["Records"]
        if "body" in body_obj[0]:
            body = body_obj[0]["body"]
            body_obj = json.loads(body)
            # check if is testevent
            if "Event" in body_obj:
                if body_obj["Event"] == "s3:TestEvent":
                    return "Test event received."
            body_obj = body_obj["Records"]

        for record in body_obj:
            s3obj = record['s3']
            temp_bucket = s3obj['bucket']['name']
            file_key = s3obj['object']['key']

            image = s3.Object(temp_bucket, file_key).get()
            image_bytes = BytesIO(image['Body'].read())

            # get file extension
            _, ext = os.path.splitext(file_key)
            if ext not in allowed_extensions:
                # delete
                s3.Object(temp_bucket, file_key).delete()
                return "File extension not allowed." + file_key

            with Image.open(image_bytes) as img:
                original_size = img.size

                # Resize image
                # check if image is larger than max size
                if max(original_size) > max_image_size:
                    new_size = get_new_size(original_size)
                else:
                    new_size = original_size
                # High-res image
                high_res_bytes = BytesIO()
                img.thumbnail(new_size)
                img.save(high_res_bytes, result_extension, **image_options)
                high_res_bytes.seek(0)
                s3.meta.client.upload_fileobj(high_res_bytes, data_bucket_name, get_filename(file_key, ''))

                # Thumbnail
                thumbnail = crop_to_square(img)
                thumbnail.thumbnail(thumbnail_size)

                thumbnail_bytes = BytesIO()
                thumbnail.save(thumbnail_bytes, result_extension, **image_options)
                thumbnail_bytes.seek(0)
                s3.meta.client.upload_fileobj(thumbnail_bytes, thumbnail_bucket_name, get_filename(file_key, '-thumbnail'))

        return "Image processed successfully." + file_key
    except Exception as e:
        return "Error: " + str(e)

def get_new_size(original):
    # Calculate new dimensions based on original size
    max_dimension = max(original)
    ratio = max_dimension / max_image_size
    new_size = tuple(int(d / ratio) for d in original)

    return new_size


def get_filename(key, suffix):
    filename, ext = os.path.splitext(key)
    return f'{filename}{suffix}.{result_extension}' # changed from ext, added period


def crop_to_square(img):
    # Get smallest dimension and crop image to square
    width, height = img.size
    smallest = min(width, height)
    crop = (width - smallest, height - smallest, width, height)
    img = img.crop(crop)

    return img