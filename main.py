"""
This script is used to label the images in of UAV collected images
"""
import os
from utils.image import pick_images
from lib.sam.label import Labeler
from dotenv import load_dotenv
from lib.sam.click_segment import ClickSegmenter

load_dotenv()
size = os.getenv('SIZE')
mode = os.getenv('MODE')
to_be_labeled_dir = os.getenv('TO_BE_LABELED_DIR')

os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"
os.environ["PYTORCH_CUDA_ALLOC_CONF"] = "expandable_segments:True"
images = pick_images(to_be_labeled_dir, recursive=True, repeat=True)
if mode == 'click':
    for image in images:
        click_segmenter = ClickSegmenter(image, 'data/clicked_labeled')
        click_segmenter.run()
else:
    Labeler().auto_label(images, size)