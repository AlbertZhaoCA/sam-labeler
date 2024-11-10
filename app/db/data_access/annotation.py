from sqlalchemy.orm import Session

from app.db import Annotation
from app.db import transactional_session


@transactional_session
def get_annotation_by_id(session, annotation_id):
    annotation = session.query(Annotation).filter(Annotation.id == annotation_id).first()
    return annotation


@transactional_session
def get_annotations(session):
    annotations = session.query(Annotation).all()
    return annotations


@transactional_session
def update_annotations(session: Session, annotation_id: int, filename: str = None, original_image_id: int = None,
                    annotated_image_id: int = None, info: str = None, params: str = None, rate: float = None):
    update_data = {}

    if filename is not None:
        update_data['filename'] = filename
    if original_image_id is not None:
        update_data['original_image_id'] = original_image_id
    if annotated_image_id is not None:
        update_data['annotated_image_id'] = annotated_image_id
    if info is not None:
        update_data['info'] = info
    if params is not None:
        update_data['params'] = params
    if rate is not None:
        update_data['rate'] = rate

    session.query(Annotation).where(Annotation.id == annotation_id).update(update_data)
