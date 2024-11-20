import base64
import datetime
import json
from io import BytesIO
from typing import List, Optional

from fastapi import APIRouter, UploadFile, Depends, Path, Body, Form, Query
from pydantic import BaseModel, Field
from starlette.responses import StreamingResponse
from app.db.data_access.image import (add_or_image_by_upload, get_or_images, add_or_local_images,
                                      get_or_image_by_id as _get_image, add_annotated_image, get_anno_images,
                                      get_anno_image_by_id)
from app.db.data_access.setting import get_preference_setting
from utils.image import convert_image_data, pick_images
from app.db.models.base import Session, get_db_session
from utils.exception import raise_not_found_exception

router = APIRouter()


class ImageModel(BaseModel):
    filename: Optional[str] = Field(None, example="my_cat.jpg")
    img_data: Optional[str] = Field(None,
                                    example="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QBYRXhpZgAATU0AKgAAAAgAA1IBAAABAAEA")
    info: Optional[str] = Field(None, example="Maybe the image is not clear")
    labeled: Optional[bool] = Field(None, example=True)


class AnnotatedImageModel(BaseModel):
    filename: Optional[str] = Field(None, example=["my_cat.jpg", "my dog"])
    img_data: Optional[str] = Field(None, example=[
        "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QBYRXhpZgAATU0AKgAAAAgAA1IBAAABAAEA"])
    annotation_id: int = Field(None, example=1)


class ImageResponse(BaseModel):
    info: Optional[str] = Field(example=["file my_cat.jpg uploaded"])
    id: int = Field(..., example=[1])
    annotation_id: Optional[list[int]] = Field(None, example=[1, 2, 3, 4])
    filename: str = Field(..., example=["my_cat.jpg", "my dog"])
    labeled: bool = Field(..., example=[True])
    url: str = Field(..., example=["images/1"])
    created_time: datetime.datetime = Field(..., example=["2024-09-01T00:00:00"])
    last_modified_time: datetime.datetime = Field(..., example=["2024-09-01T00:00:00"])


class AnnotatedImageResponse(BaseModel):
    id: int = Field(..., example=[1])
    annotation_id: int = Field(..., example=[1])
    original_id: int = Field(..., example=[1])
    url: str = Field(..., example=["images/1"])
    created_time: datetime.datetime = Field(..., example=["2024-09-01T00:00:00"])
    last_modified_time: datetime.datetime = Field(..., example=["2024-09-01T00:00:00"])


@router.post("/images", response_model=ImageResponse)
async def upload_file(*, session: Session = Depends(get_db_session), file: UploadFile = Form(), image: str = Form()):
    try:
        original_image_data = await file.read()
        image = ImageModel.parse_raw(image)
        print(image)
        image_bytes = convert_image_data(original_image_data)
        image = add_or_image_by_upload(session, image_bytes, image.filename, image.info)
    except Exception as e:
        print(e)
        return {"error": str(e)}
    return {"info": f"file '{file.filename}' uploaded", "id": image.id, "filename": image.filename,
            "url": f"images/{image.id}"
        , "created_time": image.created_time,
            "last_modified_time": image.last_modified_time,
            "labeled": image.labeled}


@router.get("/images", response_model=List[ImageResponse] | ImageResponse)
async def list_images(session: Session = Depends(get_db_session), image_id: Optional[int] = Query(None, alias="id")):
    if image_id:
        image = _get_image(session, image_id)
        if image is None:
            raise_not_found_exception('Images')

        return {"id": image.id,
                "filename": image.filename,
                'url': f"images/{image.id}",
                'last_modified_time': image.last_modified_time,
                'created_time': image.created_time,
                "labeled": image.labeled,
                "info": image.info,
                "annotation_id": [annotation.id for annotation in image.annotations]
                }
    images = get_or_images(session)
    return [{"id": image.id,
             "filename": image.filename,
             'url': f"images/{image.id}",
             'last_modified_time': image.last_modified_time,
             'created_time': image.created_time,
             "labeled": image.labeled,
             "info": image.info,
             "annotation_id": [annotation.id for annotation in image.annotations]

             } for image in images]


@router.get("/images/annotated", response_model=List[AnnotatedImageResponse])
async def list_images(session: Session = Depends(get_db_session)):
    images = get_anno_images(session)
    return [{"id": image.id,
             "original_id": image.annotations.original_id,
             "filename": image.filename,
             'url': f"images/annotated/{image.id}",
             'last_modified_time': image.last_modified_time,
             'created_time': image.created_time,
             'annotation_id': image.annotation_id
             } for image in images]


@router.get("/images/{image_id}", description="send original image by id")
async def get_image_by_id(image_id: int, session: Session = Depends(get_db_session)):
    image = _get_image(session, image_id)
    if image is None:
        raise_not_found_exception('Images')

    return StreamingResponse(BytesIO(image.image_data), media_type="image/jpeg")


@router.put("/images/{image_id}")
async def update_image_by_id(image_id: int, image: ImageModel, session: Session = Depends(get_db_session)):
    try:
        new_image = _get_image(session, image_id)
        if new_image is None:
            raise_not_found_exception('Images')

        if image.filename:
            new_image.filename = image.filename

        if image.labeled:
            new_image.labeled = image.labeled

        if image.info:
            new_image.info = image.info

        session.add(new_image)
        session.commit()
    except Exception as e:
        print(e)
        return {"error": str(e)}
    return {"id": image_id, "info": "Image updated"}


@router.get("/images/annotated/{image_id}", description="send annotated image by id")
async def get_image_by_id(image_id: int, session: Session = Depends(get_db_session)):
    image = get_anno_image_by_id(session, image_id)
    if image is None:
        raise_not_found_exception('Images')

    return StreamingResponse(BytesIO(image.image_data), media_type="image/jpeg")


@router.post("/images/local")
async def upload_local_images(session: Session = Depends(get_db_session)):
    setting = get_preference_setting(session)
    try:
        if setting and setting.dataset_path:
            images = pick_images(setting.dataset_path, recursive=True, repeat=False, open=False)
            for image in images:
                add_or_local_images(session, image, image.split('/')[-1])
            return {"info": "Images added to database"}
        else:
            return {"error": "Dataset path not set"}
    except Exception as e:
        print(e)
        return {"error": str(e)}


@router.post("/images/annotated/{annotation_id}")
async def upload_annotated_image(*, session: Session = Depends(get_db_session), image: AnnotatedImageModel = Body(),
                                 annotation_id: int = Path(...)):
    try:
        base64_data = image.img_data.split(",")[1]
        image_bytes = base64.b64decode(base64_data)
        image_id = add_annotated_image(session, image_bytes, annotation_id)
        session.commit()
    except Exception as e:
        print(e)
        return {"error": str(e)}
    return {"id": image_id}


@router.post("/images/annotated", deprecated=True)
async def upload_annotated_image(*, session: Session = Depends(get_db_session), file: UploadFile,
                                 filename: str = Body(None)
                                 , annotation_id: int = Body(...)):
    try:
        image_data = await file.read()
        image_bytes = convert_image_data(image_data)
        if filename is None:
            filename = file.filename
        image_id = add_annotated_image(session, image_bytes, filename=filename, annotation_id=annotation_id)
    except Exception as e:
        print(e)
        return {"error": str(e)}
    return {"image_id": image_id}


@router.put("/images/annotated/{image_id}")
async def update_annotated_image_by_id(image_id: int, image: AnnotatedImageModel,
                                       session: Session = Depends(get_db_session)):
    try:
        new_image = get_anno_image_by_id(session, image_id)
        if new_image is None:
            raise_not_found_exception('Images')

        if image.filename:
            new_image.filename = image.filename

        session.add(new_image)
        session.commit()
    except Exception as e:
        print(e)
        return {"error": str(e)}
    return {"id": image_id, "info": "Image updated"}


@router.delete("/images/{image_id}")
async def delete_image_by_id(image_id: int, session: Session = Depends(get_db_session)):
    try:
        image = _get_image(session, image_id)
        if image is None:
            raise_not_found_exception('Images')
        session.delete(image)
        session.commit()
    except Exception as e:
        print(e)
        return {"error": str(e)}
    return {"info": f"Image {image_id} deleted"}


@router.delete("/images/annotated/{image_id}")
async def delete_image_by_id(image_id: int, session: Session = Depends(get_db_session)):
    try:
        image = get_anno_image_by_id(session, image_id)
        if image is None:
            raise_not_found_exception('Images')
        original_image = image.annotations.originals
        if len(original_image.annotations ) == 1:
            original_image.labeled = False
        session.delete(image)
        session.commit()
    except Exception as e:
        print(e)
        return {"error": str(e)}
    return {"info": f"Image {image_id} deleted"}
