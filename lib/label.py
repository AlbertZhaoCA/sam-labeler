"""
This module is used to label the images
"""

import matplotlib.pyplot as plt
import os
from utils.segment import show_anns
from utils.sam import auto_masks
from utils.image import pick_image
from dotenv import load_dotenv

load_dotenv()

save_dir = os.getenv('SAVE_DIR')

def auto_label(images,size):
    for image in images:
        saved_name = image.split('/')[-1].split('.')[0]
        save_path = os.path.join(save_dir, f"{saved_name}_{size}.png")
        os.makedirs(save_dir, exist_ok=True)
        image = pick_image(image)
        masks = auto_masks(image)
        plt.figure(figsize=(20, 20))
        plt.imshow(image)

        show_anns(masks)
        plt.axis('off')
        plt.savefig(save_path, bbox_inches='tight', pad_inches=0)
        plt.close()




