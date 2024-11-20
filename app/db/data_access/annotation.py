from sqlalchemy.orm import Session
from app.db.models.annotation import Annotation
from app.db.models.image import AnnotatedImage
from app.db.models.tag import Tag

def get_annotation_by_id(session, annotation_id):
    annotation = session.query(Annotation).filter(Annotation.id == annotation_id).first()
    return annotation


def get_annotations(session):
    annotations = session.query(Annotation).all()
    return annotations


def update_annotations(session: Session, annotation_id: int, filename: str = None,
                       annotated_image_id: int = None, info: str = None, rate: float = None,
                       tag_ids: list[int] = None):
    update_data = {}

    if filename is not None:
        update_data['filename'] = filename
    if annotated_image_id is not None:
        update_data['annotated_image_id'] = annotated_image_id
    if info is not None:
        update_data['info'] = info
    if rate is not None:
        update_data['rate'] = rate

    result = session.query(Annotation).where(Annotation.id == annotation_id).update(update_data)

    if tag_ids is not None:
        annotation = session.query(Annotation).filter(Annotation.id == annotation_id).first()
        if annotation:
            tags = session.query(Tag).filter(Tag.id.in_(tag_ids)).all()

            annotation.tags.clear()
            annotation.tags.extend(tags)
            session.commit()

    if result or tag_ids is not None:
        session.commit()
    else:
        session.rollback()


def add_tags_to_annotation(session: Session, annotation_id: int, tag_ids: list[int]):
    annotation = session.query(Annotation).filter(Annotation.id == annotation_id).first()
    if not annotation:
        raise ValueError(f"Annotation with id {annotation_id} not found.")

    tags = session.query(Tag).filter(Tag.id.in_(tag_ids)).all()

    for tag in tags:
        annotation.tags.append(tag)

    session.commit()


def add_annotations(session:Session,info:str,rate:float,tag_ids:list[int],annotated_image_ids:list[int]):
    annotation = Annotation(info=info,rate=rate)
    tags = session.query(Tag).filter(Tag.id.in_(tag_ids)).all()
    annotated_images = session.query(AnnotatedImage).filter(AnnotatedImage.id.in_(annotated_image_ids)).all()
    annotation.tags.extend(tags)
    annotation.annotated_images.extend(annotated_images)
    session.add(annotation)
    session.commit()
    return annotation.id

