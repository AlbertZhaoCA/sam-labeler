import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import images, settings, inference, tags, annotation,inpainting

app = FastAPI(description='SAM Labeler', version='0.0.1',title='SAM Labeler')


@app.middleware("http")
async def add_csp_header(request, call_next):
    response = await call_next(request)
    response.headers["Content-Security-Policy"] = ("img-src 'self' http://localhost:3000 https://1797-65-175-57-118.ngrok-free.app "
                                                   "data:;")
    response.headers["Access-Control-Allow-Origin"] = "*"

    return response


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(images.router)
app.include_router(settings.router)
app.include_router(inference.router)
app.include_router(tags.router)
app.include_router(annotation.router)
app.include_router(inpainting.router)


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
