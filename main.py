"""
This script is used to label the images in of UAV collected images
"""

import os
from utils.image import pick_images
from lib.label import auto_label
from dotenv import load_dotenv
from lib.click_segment import ClickSegmenter


load_dotenv()
size = os.getenv('SIZE')
mode = os.getenv('MODE')

if __name__ == '__main__':
    os.environ["PYTORCH_ENABLE_MPS_FALLBACK"] = "1"
    images = pick_images('data/data_set',recursive=True,repeat=True)
    if mode == 'click':
        for image in images:

            click_segmenter = ClickSegmenter(image, 'data/clicked_labeled')
            click_segmenter.run()
    else:
        auto_label(images,size)