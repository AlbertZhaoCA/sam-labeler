"""
This module is for image processing utilities.
"""

import os
from typing import Any
import numpy as np
from dotenv import load_dotenv
from io import BytesIO
from PIL import Image

load_dotenv()
save_dir = os.getenv('SAVE_DIR')


def convert_image_data(file_data: bytes) -> bytes:
    """
    Convert the uploaded file data to a format that can be saved to the database.

    Args:
        file_data (bytes): The uploaded file data.

    Returns:
        bytes: The converted image data in PNG format.
    """
    image = Image.open(BytesIO(file_data))
    image_bytes = BytesIO()
    image.save(image_bytes, format='PNG')
    return image_bytes.getvalue()


def pick_image(path: str, resize: bool = False, ratio: tuple[int, int] | list[int] | np.ndarray[Any, np.dtype] = None) \
        -> np.ndarray:
    """
    Pick an image from the given path, and provide ndarray data for processing.
    Args：
        path (str): The path of the image.
        resize (bool): Whether to use default resize.
        ratio (tuple[int, int] | list[int] | np.ndarray): The ratio to resize

    Returns:
        np.ndarray: The image data.
    """
    image = Image.open(path)
    if resize:
        image = image.resize((640, 640))
        return np.array(image.convert("RGB")) / 255.0
    elif ratio:
        image = image.resize(ratio)
        return np.array(image.convert("RGB")) / 255.0
    else:
        return np.array(image.convert("RGB")) / 255.0


def pick_images(dir: str, open: bool = False, recursive: bool = False, repeat: bool = False) -> list:
    """
    Pick images from the given directory.
    Args:
        dir (str): The directory path.
        open (bool): Whether to open the images.
        recursive (bool): Whether to pick images recursively.
        repeat (bool): Whether to repeat the images.
    return: The image paths.
    """
    if recursive:
        images = _pick_images_recursive(dir, open)
    else:
        images = _pick_images(dir)

    if repeat:
        save_images = _pick_images_recursive(save_dir, open)
        for save_image in save_images:
            for image in images:
                save_img_sub_dir = save_image.split('/')[-3]
                img_sub_dir = image.split('/')[-2]
                temp_save_image = \
                save_image.replace('_lg', '').replace('_sm', '').replace('_md', '').split('/')[-1].split('.')[0]
                temp_image = image.split('/')[-1].split('.')[0]

                if temp_save_image == temp_image and save_img_sub_dir == img_sub_dir:
                    images.remove(image)

    if open:
        images = [pick_image(image) for image in images]
    print(f"following images will be labeled {images}\nremaining {images.__len__()} images.... ")
    return images


def _pick_images(dir, open=False):
    image_extensions = ('.jpg', '.jpeg', '.png')
    images = [os.path.join(dir, file) for file in os.listdir(dir) if file.lower().endswith(image_extensions)]
    if open:
        images = [pick_image(image) for image in images]
        return images
    return images


def _pick_images_recursive(dir, open=False):
    image_extensions = ('.jpg', '.jpeg', '.png')
    images = []
    for root, dirs, files in os.walk(dir):
        images.extend([os.path.join(root, file) for file in files if file.lower().endswith(image_extensions)])
    if open:
        images = [pick_image(image) for image in images]
        return images
    return images
