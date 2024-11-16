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

    def process_image(self, image):
        image = cv2.imdecode(np.frombuffer(image, np.uint8), cv2.IMREAD_COLOR)
        self.predictor.set_image(image)
        embedding = self.predictor.get_image_embedding().cpu().numpy()
        return embedding
