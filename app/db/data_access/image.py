from app.db.models.image import OriginalImage, AnnotatedImage
from app.db.models.tag import Tag


def add_annotated_image(session, annotated_image_data, annotation_id, filename=None):
    annotated_image = AnnotatedImage(image_data=annotated_image_data, annotation_id=annotation_id, filename=filename)
    session.add(annotated_image)
    session.commit()
    return annotated_image.id


def get_anno_image_by_id(session, image_id):
    image = session.query(AnnotatedImage).filter(AnnotatedImage.id == image_id).first()
    return image


def get_anno_images(session):
    images = session.query(AnnotatedImage).all()
    return images


def add_original_image(session, original_image_data,info=None, filename=None):
    original_image = OriginalImage(image_data=original_image_data, filename=filename,info=info)
    session.add(original_image)
    session.commit()
    return original_image.id


def add_or_image_by_upload(session, original_image_data, filename=None, info=None):
    original_image = None
    if original_image_data is not None:
        original_image = OriginalImage(image_data=original_image_data, filename=filename, info=info)
        session.add(original_image)
        session.commit()
    return original_image


def add_or_local_images(session, original_image_path, filename=None):
    with open(original_image_path, 'rb') as f:
        original_image_data = f.read()
    original_image = OriginalImage(image_data=original_image_data, filename=filename)
    session.add(original_image)
    session.commit()


def get_or_image_by_id(session, image_id):
    image = session.query(OriginalImage).filter(OriginalImage.id == image_id).first()
    session.commit()
    return image


def get_or_images(session):
    images = session.query(OriginalImage).all()
    session.commit()
    return images

def query_or_images_alike(session, keyword):
    images = session.query(OriginalImage).filter(OriginalImage.filename.ilike(f'%{keyword}%')).all()
    session.commit()
    return images

def query_tags_alike(session, keyword):
    tags = session.query(Tag).filter(Tag.name.ilike(f'%{keyword}%')).all()
    session.commit()
    return tags

