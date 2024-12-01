from fastapi import HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.db.models.annotation import Annotation
from app.db.models.annotation_tags import annotation_tags
from app.db.models.tag import Tag


def get_tags_by_annotation_id(session: Session, annotation_id: int):
    annotation = session.query(Annotation).filter(Annotation.id == annotation_id).first()
    if not annotation:
        raise HTTPException(status_code=404, detail=f"Annotation with id {annotation_id} not found.")

    return annotation.tags


def get_annotations_images_by_tag_id(session: Session, tag_id: int):
    annotations = session.query(Annotation).join(annotation_tags).filter(annotation_tags.c.tag_id == tag_id).all()
    returned_annotations = []
    for annotation in annotations:
        returned_annotations.append({
            "id": annotation.id,
            "info": annotation.info,
            "rate": annotation.rate,
            "tags": [tag.name for tag in annotation.tags],
            "annotated": annotation.annotated_images,
            "original": annotation.originals
        })

    if not returned_annotations:
        raise HTTPException(status_code=404, detail=f"Tag with id {tag_id} not found.")
    return returned_annotations


def get_tags(session: Session):
    tags = session.query(Tag).all()
    return tags


def get_tags_by_ids(session: Session, tag_ids: list[int]):
    tags = session.query(Tag).filter(Tag.id.in_(tag_ids)).all()
    return tags


def get_tag_by_id(session: Session, tag_id: int):
    tag = session.query(Tag).filter(Tag.id == tag_id).first()
    return tag


def add_tag(session: Session, name: str):
    try:
        existing_tag = session.query(Tag).filter(Tag.name == name).first()
        if existing_tag:
            return {"info": "exists", "name": existing_tag.name, "id": existing_tag.id}

        tag = Tag(name=name)
        session.add(tag)
        session.commit()

    except Exception as e:
        session.rollback()
        raise e

    session.refresh(tag)
    return tag.id


def add_tags(session: Session, tags: list[str]):
    existing_tags = []
    new_tags = []
    tag_ids = []

    for tag in tags:
        existing_tag = session.query(Tag).filter(Tag.name == tag).first()
        if existing_tag:
            existing_tags.append(existing_tag.name)
            tag_ids.append(existing_tag.id)
        else:
            tag_id = add_tag(session, tag)
            session.flush()
            new_tags.append(tag)
            tag_ids.append(tag_id)

    return {
        "existing_tags": existing_tags,
        "new_tags": new_tags,
        "tag_ids": tag_ids,
        "tags":new_tags,
    }


def delete_tag(session: Session, tag_id: int):
    tag = session.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise ValueError(f"Tag with id {tag_id} not found.")
    session.delete(tag)
    session.commit()
    return tag_id

def query_tags_alike(session, keyword):
    tags = session.query(Tag).filter(Tag.name.ilike(f'%{keyword}%')).all()
    return tags

def get_tag_counts(session: Session):
    tag_counts = session.query(
        Tag.id,
        Tag.name,
        func.count(annotation_tags.c.annotation_id).label('count')
    ).join(annotation_tags, Tag.id == annotation_tags.c.tag_id).group_by(Tag.name).all()
    return tag_counts

