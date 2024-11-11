"""
This module contains utility functions for handling paths.
"""
from typing import Optional, List, Union
import os
from dotenv import load_dotenv

load_dotenv()
save_dir = os.getenv('SAVE_DIR')
size = os.getenv('SIZE')

def get_saved_name_and_sub_dir(image_path: str) -> tuple[str, str]:
    """
    Extract the saved name and subdirectory from the image path.

    Args:
        image_path (str): The path of the image.

    Returns:
        tuple: A tuple containing the saved name and subdirectory.
    """
    saved_name = image_path.split('/')[-1].split('.')[0]
    sub_dir = image_path.split('/')[-2]
    return saved_name, sub_dir


def create_path(*,destination: str, sub_dir: Optional[Union[List[str], str]] = None, file_name: str) -> str:
    """
    Create a path for the given file name and subdirectory.

    Args:
        destination (str): The destination directory.
        sub_dir (Union[List[str], str]): The subdirectory.
        file_name (str): The file name.

    Returns:
        str: The path.
    """
    if sub_dir is None:
        return os.path.join(destination, file_name)
    if isinstance(sub_dir, list):
        return os.path.join(destination, *sub_dir, file_name)
    return os.path.join(destination, sub_dir, file_name)


