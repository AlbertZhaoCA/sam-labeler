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
size = os.getenv('SIZE')

def auto_label(images,size):
    for image in images:
        print(image)
        saved_name = image.split('/')[-1].split('.')[0]
        sub_dir = image.split('/')[-2]
        save_path = os.path.join(save_dir,sub_dir,size, f"{saved_name}_{size}.png")
        os.makedirs(os.path.join(save_dir,sub_dir,size), exist_ok=True)
        try:
            image_data = pick_image(image)
            if image_data is None:
                print(f"Image {image} could not be processed.")
                continue

            masks = auto_masks(image_data)
            plt.figure(figsize=(20, 20))
            plt.imshow(image_data)
            show_anns(masks)
            plt.axis('off')
            plt.savefig(save_path, bbox_inches='tight', pad_inches=0)
            plt.close()
            print(f"Saved labeled image to: {save_path}")
        except Exception as e:
            print(f"Error processing image {image}: {e}")







