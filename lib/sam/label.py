"""
This module is used to label the images
"""

from typing import Any, Union
import matplotlib.pyplot as plt
import os
import numpy as np
from utils.path import get_saved_name_and_sub_dir, create_path
from utils.segment import show_anns
from utils.image import pick_image
from dotenv import load_dotenv
from lib.sam.build import load_model
from segment_anything.automatic_mask_generator import SamAutomaticMaskGenerator,SamPredictor


load_dotenv()

save_dir = os.getenv('SAVE_DIR')
size = os.getenv('SIZE')

sam = load_model()


class Labeler:
    """
    This class is used to label the images.

    Note:
        Modifying the predictor configuration is not currently supported, reload the model costs time.
    """

    def __init__(self):
        self.mask_generator: SamAutomaticMaskGenerator = SamAutomaticMaskGenerator(sam)
        self.predictor: SamPredictor = SamPredictor(sam)

    def auto_label(self, images: list, size: str, use_db: bool = False) -> Union[None,list[dict[str, Any]]]:
        """
        Label the images.
        Args:
            images (list): The images.
            size (str): The size of the images.
        Return:
            The labeled images.

        """
        for image in images:
            print(image)
            saved_name, sub_dir = get_saved_name_and_sub_dir(image)
            save_path = create_path(destination=save_dir, sub_dir=[sub_dir, size], file_name=f"{saved_name}_{size}.png")
            os.makedirs(os.path.join(save_dir, sub_dir, size), exist_ok=True)

            try:
                image_data = pick_image(image)
                if image_data is None:
                    print(f"Image {image} could not be processed.")
                    continue
                masks = self.auto_masks(image_data)
                plt.figure(figsize=(8, 6))
                plt.imshow(image_data)
                show_anns(masks)
                plt.axis('off')
                if use_db:
                    plt.close()
                    return masks
                plt.savefig(save_path, bbox_inches='tight', pad_inches=0)
                plt.close()
                print(f"Saved labeled image to: {save_path}")
            except Exception as e:
                print(f"Error processing image {image}: {e}")

    def auto_masks(self,image:np.ndarray) -> list[dict[str, Any]]:
        """
        Generate the masks.
        Args:
            image: The image.
        Return:
            The masks.
        """
        try:
            return self.mask_generator.generate(image)
        except TypeError as e:
            if "float64" in str(e):
                sam = load_model(fallback=True)
                mask_generator = SamAutomaticMaskGenerator(sam)
                print("\nSwitching to CPU, if you still want to use GPU, please modify \nautomatic_mask_generator.py line 277"
                         "\nuse dtype=torch.float32")
                return mask_generator.generate(image)

    def click_masks(self,image,point_coords,point_labels) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
        """
        Click the masks.
        Args:
            image: The image.
            point_coords: The point coordinates.
            point_labels: The point labels.
        Return:
            The masks.
        """
        if not self.predictor.is_image_set:
            self.predictor.set_image(image)
        return self.predictor.predict(point_coords,point_labels,multimask_output=True)






