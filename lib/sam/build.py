"""
This module is used to build the checkpoints
mps is not supported at now, but you can modify the segment_anything library all computed dtype to torch.float32
"""

import os
import torch
from segment_anything import sam_model_registry
from dotenv import load_dotenv
from segment_anything.modeling import Sam

load_dotenv()

checkpoint = os.getenv('CHECKPOINT')
checkpoint_type = os.getenv('CHECKPOINT_TYPE')


def load_model(fallback: bool = False) -> Sam:
    """
    Load the SAM 1 model.
    Args:
        fallback (bool): Whether to use the fallback device.
    Returns:
        The model.
    """
    sam = sam_model_registry[checkpoint_type](checkpoint=checkpoint)
    sam.to(get_device(fallback))
    return sam


def get_device(fallback: bool = False) -> str:
    """
    Get the device.
    Args:
        fallback (bool): Whether to use the fallback device.
    Returns:
        str: The device.
    """
    device = 'cpu'
    if torch.cuda.is_available():
        device = 'cuda'
    elif torch.mps.is_available() and not fallback:
        device = 'mps'
    return device
