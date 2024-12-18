'''
will transfer to another
'''
import io

import torch
from fastapi import Body, APIRouter
from starlette.responses import StreamingResponse
from lib.sam.embedding import Embedder
from diffusers import StableDiffusionInpaintPipeline
from diffusers.utils import load_image
from torchvision import transforms

router = APIRouter()
embedder = Embedder()


pipe = StableDiffusionInpaintPipeline.from_pretrained(
    "stabilityai/stable-diffusion-2-inpainting")

if torch.cuda.is_available():
    pipe = pipe.to("cuda")
elif torch.mps.is_available():
    pipe = pipe.to("mps")
else:
    pipe = pipe.to("cpu")


@router.post("/inpainting")
async def inpaint_image(
        image_url: str = Body(),
        mask_url: str = Body(),
        prompt: str = Body(),
):
    try:
        source_image = load_image(
            image_url
        )
        source = preprocess_image(source_image)
        mask = preprocess_mask(
            load_image(
               mask_url
            )
        )

        print(image_url, mask_url, prompt)

        result = pipe(
            prompt=prompt,
            image=source,
            mask_image=mask,
            num_inference_steps=150,  # Adjust as needed
            guidance_scale=7.5,  # Adjust as needed
            strength=1.0,  # Adjust as needed
        )

        # Get the generated inpainting image
        inpainted_image = result.images[0]
        inpainted_image.save("dest.jpg")
        # Save the image to a BytesIO object for sending back as a response
        img_byte_arr = io.BytesIO()
        inpainted_image.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)

        # Return the inpainted image as a response
        return StreamingResponse(img_byte_arr, media_type="image/png")

    except Exception as e:
        print(e)
        return {"error": str(e)}


def preprocess_image(image):
    image = image.convert("RGB")
    image = transforms.CenterCrop((image.size[1] // 64 * 64, image.size[0] // 64 * 64))(image)
    image = transforms.ToTensor()(image)
    image = image.unsqueeze(0).to("mps")
    return image

def preprocess_mask(mask):
    mask = mask.convert("L")
    mask = transforms.CenterCrop((mask.size[1] // 64 * 64, mask.size[0] // 64 * 64))(mask)
    mask = transforms.ToTensor()(mask)
    mask = mask.to("mps")
    return mask
