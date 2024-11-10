import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import images, settings

app = FastAPI(description='SAM Labeler', version='0.0.1',title='SAM Labeler')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(images.router)
app.include_router(settings.router)


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000,reload=True)