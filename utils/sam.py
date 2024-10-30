"""
This module is used to generate automatic masks for images.
"""

from segment_anything.automatic_mask_generator import SamAutomaticMaskGenerator,SamPredictor
from lib.build import load_model

sam = load_model()
mask_generator = SamAutomaticMaskGenerator(sam)
predtictor = SamPredictor(sam)


def auto_masks(image):
    global mask_generator
    try:
        return mask_generator.generate(image)
    except TypeError as e:
        if "float64" in str(e):
            sam = load_model(fallback=True)
            mask_generator = SamAutomaticMaskGenerator(sam)
            print("\nSwitching to CPU, if you still want to use GPU, please modify \nautomatic_mask_generator.py line 277"
                     "\nuse dtype=torch.float32")
            return mask_generator.generate(image)

def click_masks(image,point_coords,point_labels):
    predtictor.set_image(image)
    return predtictor.predict(point_coords,point_labels,multimask_output=True)




