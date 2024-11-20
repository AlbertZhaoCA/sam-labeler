import base64

from fastapi import APIRouter, Depends, Body, Query
from pydantic import Field, BaseModel

from app.db.data_access.image import add_annotated_image
from app.db.data_access.tag import add_tags, get_tags_by_ids
from app.db.models.base import Session, get_db_session
from app.db.models.annotation import Annotation
from app.db.models.image import OriginalImage, AnnotatedImage

router = APIRouter()


class Annotation_Model(BaseModel):
    info: str = Field(examples=['Maybe the image is not clear'])
    rate: float = Field(examples=[3])  # at now integer
    tags: list[str] = Field(examples=[["树", "松树"]])
    image_data: str = Field(examples=["data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAIBAQEBAQIBAQECAgICAgQDAgICAgUEBAMEBgUGBgYFBgYGBwkIBgcJBwYGCAsICQoKCgoKBggLDAsKDAkKCgr/2wBDAQICAgICAgUDAwUKBwYHC"])
    original_id: int = Field(examples=[1])


@router.post("/annotation")
async def upload_annotation(*, session: Session = Depends(get_db_session), annotation: Annotation_Model = Body(...)):
    try:
        result = add_tags(session, annotation.tags)
        added_tags = get_tags_by_ids(session, result["tag_ids"])
        original_image = session.query(OriginalImage).filter(OriginalImage.id == annotation.original_id).first()
        if original_image is None:
            raise Exception("Original image not found")

        base64_data = annotation.image_data.split(",")[1]
        image_bytes = base64.b64decode(base64_data)
        annotated_image = AnnotatedImage(image_data=image_bytes)
        annotation = Annotation(info=annotation.info, rate=annotation.rate, tags=added_tags,
                                originals=original_image, annotated_images=[annotated_image],
                                original_id=annotation.original_id)

        original_image.labeled = True
        session.add(annotation)
        session.commit()

    except Exception as e:
        print(e)
        return {"error": str(e)}
    return {"info": f"annotation added", "id": annotation.id, "new tags": result["new_tags"], "tags": annotation.tags}


@router.get("/annotations")
async def get_annotations(*, session: Session = Depends(get_db_session)):
    annotations = session.query(Annotation).all()
    annotations_with_tags = [
        {**annotation.__dict__, "tags": [tag.name for tag in annotation.tags]}
        for annotation in annotations
    ]
    return annotations_with_tags

@router.get("/annotation")
async def get_annotation_by_id(annotation_id:int = Query(...,alias="id"), session: Session = Depends(get_db_session)):
    annotation = session.query(Annotation).filter(Annotation.id == annotation_id).first()
    return annotation



