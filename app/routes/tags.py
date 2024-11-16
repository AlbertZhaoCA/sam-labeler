from fastapi import APIRouter, UploadFile, Depends, Path
from pydantic import BaseModel
from app.db.data_access.tag import get_tags, add_tag, add_tags, delete_tag, get_tags_by_annotation_id
from app.db.models.base import Session, get_db_session
from fastapi import Depends

router = APIRouter()


class Tag_Model(BaseModel):
    name: str


@router.get("/tags")
def list_tags(session: Session = Depends(get_db_session)):
    tags = get_tags(session)
    return [{"id": tag.id, "name": tag.name} for tag in tags]


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
