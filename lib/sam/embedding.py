import numpy as np
from segment_anything import SamPredictor
import cv2
from lib.sam.build import load_model
from dotenv import load_dotenv

load_dotenv()
sam = load_model()


class Embedder:
    def __init__(self):
        self.predictor = SamPredictor(sam)
        self.image = None
        self.available = True

    def add_image(self, image: bytes):
        if not self.available:
            return
        self.image = image

    def process_image(self, image):
        self.add_image(image)
        if not self.available:
            raise Exception("The model is not available.")
        self.available = False
        image = cv2.imdecode(np.frombuffer(image, np.uint8), cv2.IMREAD_COLOR)
        self.predictor.set_image(image)
        embedding = self.predictor.get_image_embedding().cpu().numpy()
        self.available = True
        return embedding
