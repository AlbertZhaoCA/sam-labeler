import cv2
from diffusers import DiffusionPipeline

pipe = DiffusionPipeline.from_pretrained("stabilityai/stable-diffusion-3.5-large")

prompt = "Astronaut in a jungle, cold color palette, muted colors, detailed, 8k"
image = pipe(prompt).images[0]

# Convert the image from RGB to BGR
image_bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

cv2.imshow("Stable Diffusion", image_bgr)
cv2.waitKey(0)
cv2.destroyAllWindows()