'''
will transfer to another repo
'''
import io
from typing import Union, Dict

import httpx
import torch
from PIL import Image
from fastapi import Body, APIRouter
from pydantic import BaseModel
from starlette.responses import StreamingResponse
from diffusers import StableDiffusionInpaintPipeline,StableDiffusion3Pipeline
from torchvision import transforms
from lib.groq import generate_props


class ErrorResponse(BaseModel):
    error: str

router = APIRouter()
pipe = StableDiffusionInpaintPipeline.from_pretrained(
    "stabilityai/stable-diffusion-2-inpainting")

text2ImagePipe = StableDiffusion3Pipeline.from_pretrained("stabilityai/stable-diffusion-3.5-large",torch_dtype=torch.bfloat16)


device = None
if torch.cuda.is_available():
    pipe = pipe.to("cuda")
    textPipe = text2ImagePipe.to("cuda")
    device = "cuda"
    print("Using CUDA")
elif torch.mps.is_available():
    print("Using MPS")
    textPipe = text2ImagePipe.to('mps')
    pipe = pipe.to("mps")
    print("finished")
    device = "mps"
else:
    pipe = pipe.to("cpu")
    textPipe = text2ImagePipe.to("cpu")
    print("Using CPU")
    device = "cpu"


# will be deprecated
async def load_image_async(image_url: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(image_url)
        response.raise_for_status()
        return Image.open(io.BytesIO(response.content))


@router.post("/text2image")
async def text2image(
        prompt: str = Body(),
        negative_prompt: str = Body("low quality"),
        step: int = Body(50),
        guidance_scale: float = Body(0.7),
):
    try:
        params = {'prompt': prompt,
                  'negative_prompt': negative_prompt,
                  'num_inference_steps': step,
                  'guidance_scale': guidance_scale,
                  }
        print(params)

        result = text2ImagePipe(
            **params
        )

        inpainted_image = result.images[0]
        img_byte_arr = io.BytesIO()
        inpainted_image.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        return StreamingResponse(img_byte_arr, media_type="image/png")

    except Exception as e:
        print(e)
        return {"error": str(e)}


@router.post("/inpainting")
async def inpaint_image(
        image_url: str = Body(),
        mask_url: str = Body(),
        prompt: str = Body(),
        step: int = Body(50),
        guidance_scale: float = Body(0.7),
        strength: float = Body(1.0),
        negative_prompt: str = Body("low quality")

):
    try:
        source_image = await load_image_async(
            image_url
        )
        source, size = preprocess_image(source_image)
        mask_image = await load_image_async(
            mask_url
        )
        mask = preprocess_mask(mask_image)

        print(image_url, mask_url, prompt)

        params = generate_props(prompt)
        if params is None:
            params = {'prompt': prompt,
                      'negative_prompt': negative_prompt,
                      'num_inference_steps': step,
                      'guidance_scale': guidance_scale,
                      'strength': strength}

        result = pipe(
            image=source,
            mask_image=mask,
            width=size[0],
            height=size[1],
            **params
        )

        inpainted_image = result.images[0]
        img_byte_arr = io.BytesIO()
        inpainted_image.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)
        return StreamingResponse(img_byte_arr, media_type="image/png")

    except Exception as e:
        print(e)
        return {"error": str(e)}


def preprocess_image(image):
    image = image.convert("RGB")
    print(image.size)
    image = transforms.CenterCrop((image.size[1] // 64 * 64, image.size[0] // 64 * 64))(image)
    size = image.size
    image = transforms.ToTensor()(image)
    image = image.unsqueeze(0).to(device)
    return image, size


def preprocess_mask(mask):
    mask = mask.convert("L")
    mask = transforms.CenterCrop((mask.size[1] // 64 * 64, mask.size[0] // 64 * 64))(mask)
    mask = transforms.ToTensor()(mask)
    mask = mask.to(device)
    return mask
