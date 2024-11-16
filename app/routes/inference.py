from io import BytesIO

import numpy as np
from fastapi import APIRouter, UploadFile, File, Depends
from starlette.responses import StreamingResponse
from app.db.data_access.image import get_or_image_by_id
from lib.sam.embedding import Embedder
from app.db.models.base import get_db_session
router = APIRouter()
embedder = Embedder()

@router.post("/inferences")
async def infer(file: UploadFile = File(...)):
    contents = await file.read()
    embedding = embedder.process_image(contents)

    byte_stream = BytesIO()
    np.save(byte_stream, embedding)
    byte_stream.seek(0)

    return StreamingResponse(byte_stream, media_type="application/octet-stream", headers={"Content-Disposition": "attachment; filename=embedding.npy"})

@router.post("/inferences/{image_id}")
async def infer_by_image_id(image_id:int, session=Depends(get_db_session)):
    image = get_or_image_by_id(session,image_id)
    embedding = embedder.process_image(image.image_data)
    byte_stream = BytesIO()
    np.save(byte_stream, embedding)
    byte_stream.seek(0)

    return StreamingResponse(byte_stream, media_type="application/octet-stream", headers={"Content-Disposition": "attachment; filename=embedding.npy"})
