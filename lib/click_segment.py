import os
import cv2
import numpy as np
from lib.build import load_model
from utils.sam import click_masks


class ClickSegmenter:
    def __init__(self, image_path,save_dir):
        self.image = None
        self.overlay = None
        self.save_dir = save_dir
        self.model = load_model()
        self.load_image(image_path)
        self.name = image_path.split('/')[-1].split('.')[0] + '_clicked.png'

    def load_image(self, image_path):
        self.image = cv2.imread(image_path)

    def click_event(self, event, x, y, flags, param):
        if event == cv2.EVENT_LBUTTONDOWN:
            print(f"Clicked at: ({x}, {y})")

            point_coords = np.array([[x, y]], dtype=np.float32)

            masks, _, _ = click_masks(self.image, point_coords=point_coords, point_labels=[1])

            if masks is not None and masks.size > 0:
                combined_mask = np.any(masks, axis=0)

                self.overlay = self.image.copy()

                green_mask = np.zeros_like(self.image)
                green_mask[combined_mask] = [0, 255, 0]

                self.overlay = cv2.addWeighted(self.overlay, 1, green_mask, 0.5, 0)

                cv2.imshow('Image', self.overlay)
                if os.path.exists(self.save_dir):
                    cv2.imwrite(os.path.join(self.save_dir, self.name), cv2.cvtColor(self.overlay, cv2.COLOR_RGB2BGR))
                else:
                    os.mkdir(self.save_dir)
                    cv2.imwrite(os.path.join(self.save_dir, self.name), cv2.cvtColor(self.overlay, cv2.COLOR_RGB2BGR))
            else:
                print("No masks found.")

    def run(self):
        cv2.imshow('Image', self.image)
        cv2.setMouseCallback('Image', self.click_event)


        cv2.waitKey(0)
        cv2.destroyAllWindows()



