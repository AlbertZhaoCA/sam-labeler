from fastapi import APIRouter, UploadFile, Depends, Path
from pydantic import BaseModel
from app.db.data_access.tag import (get_tags, add_tag, add_tags, delete_tag, get_tags_by_annotation_id,
                                    get_tag_counts,get_annotations_images_by_tag_id)
from app.db.models.base import Session, get_db_session
from fastapi import Depends
from app.db.models.image import OriginalImageResponse, AnnotatedImageResponse

router = APIRouter()


class Tag_Model(BaseModel):
    name: str


class TagCountResponse(BaseModel):
    id: int
    name: str
    count: int

class AnnotationsResponse(BaseModel):
    id: int
    info: str
    rate: float
    tags: list[str]|None
    annotated: list[AnnotatedImageResponse]|None
    original: OriginalImageResponse|None




@router.get("/tags")
def list_tags(session: Session = Depends(get_db_session)):
    tags = get_tags(session)
    return [{"id": tag.id, "name": tag.name} for tag in tags]

@router.get("/tags/count", response_model=list[TagCountResponse])
def list_tags(session: Session = Depends(get_db_session)):
    tag_counts = get_tag_counts(session)
    return tag_counts

@router.get("/tags/annotations/{tag_id}",response_model=list[AnnotationsResponse])
def get_annotation_tags(session: Session = Depends(get_db_session), tag_id: int = Path(...)):
    return get_annotations_images_by_tag_id(session, tag_id)


@router.post("/tag")
def upload_tag(*, session: Session = Depends(get_db_session), tag: Tag_Model):
    try:
        tag = add_tag(session, tag.name)
    except Exception as e:
        print(e)
        return {"error": str(e)}
    return {"info": f"tag added", "id": tag}


@router.post("/tags")
def upload_tags(*, session: Session = Depends(get_db_session), tag: list[str]):
    try:
        tag = add_tags(session, tag)
    except Exception as e:
        print(e)
        return {"error": str(e)}
    return {
        "existing_tags": tag.existing_tags,
        "new_tags": tag.new_tags,
        "tag_ids": tag.tag_ids
    }


@router.delete("/tag")
def upload_tags(*, session: Session = Depends(get_db_session), tag_id: int):
    try:
        tag = delete_tag(session, tag_id)
    except Exception as e:
        print(e)
        return {"error": str(e)}
    return {"info": f"tag deleted", "id": tag}


@router.get("/tags/annotations/{annotations_id}")
def get_annotation_tags(session: Session = Depends(get_db_session), annotations_id: int = Path(...)):
    return get_tags_by_annotation_id(session, annotations_id)
