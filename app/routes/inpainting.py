'''
will transfer to another repo
'''
import io
import httpx
import torch
from PIL import Image
from fastapi import Body, APIRouter
from starlette.responses import StreamingResponse
from diffusers import StableDiffusionInpaintPipeline
from torchvision import transforms
from lib.groq import generate_props

router = APIRouter()

pipe = StableDiffusionInpaintPipeline.from_pretrained(
    "stabilityai/stable-diffusion-2-inpainting")

device = None
if torch.cuda.is_available():
    pipe = pipe.to("cuda")
    device = "cuda"
    print("Using CUDA")
elif torch.mps.is_available():
    print("Using MPS")
    pipe = pipe.to("mps")
    device = "mps"
else:
    pipe = pipe.to("cpu")
    print("Using CPU")
    device = "cpu"


# will be deprecated
async def load_image_async(image_url: str):
    async with httpx.AsyncClient() as client:
        response = await client.get(image_url)
        response.raise_for_status()
        return Image.open(io.BytesIO(response.content))

@router.post("/inpainting")
async def inpaint_image(
        image_url: str = Body(),
        mask_url: str = Body(),
        prompt: str = Body(),
):
    try:
        source_image = await load_image_async(
            image_url
        )
        source,size = preprocess_image(source_image)
        mask_image = await load_image_async(
            mask_url
        )
        mask = preprocess_mask(mask_image)

        print(image_url, mask_url, prompt)

        params = generate_props(prompt)
        if params is None:
            params = {'prompt': prompt,
                      'negative_prompt':"low quality",
                      'num_inference_steps': 50,
                      'guidance_scale': 0.7,
                      'strength': 1.0}

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
    return image,size


def preprocess_mask(mask):
    mask = mask.convert("L")
    mask = transforms.CenterCrop((mask.size[1] // 64 * 64, mask.size[0] // 64 * 64))(mask)
    mask = transforms.ToTensor()(mask)
    mask = mask.to(device)
    return mask

