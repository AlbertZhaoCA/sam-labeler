"""
This module is used to pick image
"""

import os
from PIL import Image
import numpy as np
from dotenv import load_dotenv

load_dotenv()

save_dir = os.getenv('SAVE_DIR')

def pick_image(path):
    image = Image.open(path)
    return np.array(image.convert("RGB")) / 255.0


def pick_images(dir, open=False, recursive=False, repeat=False):
    if recursive:
        images = _pick_images_recursive(dir, open)
    else:
        images = _pick_images(dir)

    if repeat:
        save_images = _pick_images_recursive(save_dir, open)
        for save_image in save_images:
            for image in images:
                temp_save_image = save_image.replace('_lg', '').replace('_sm', '').replace('_md', '').split('/')[-1].split('.')[0]
                temp_image = image.split('/')[-1].split('.')[0]

                if temp_save_image == temp_image:
                    images.remove(image)

    if open:
        images = [pick_image(image) for image in images]
    print( f"following images will be labeled {images}\nremaining {images.__len__()} images.... ")
    return images

def _pick_images(dir,open=False):
    image_extensions = ('.jpg', '.jpeg', '.png')
    images = [os.path.join(dir, file) for file in os.listdir(dir) if file.lower().endswith(image_extensions)]
    if open:
        images = [pick_image(image) for image in images]
        return images
    return images

def _pick_images_recursive(dir,open=False):
    image_extensions = ('.jpg', '.jpeg', '.png')
    images = []
    for root, dirs, files in os.walk(dir):
        images.extend([os.path.join(root, file) for file in files if file.lower().endswith(image_extensions)])
    if open:
        images = [pick_image(image) for image in images]
        return images
    return images

