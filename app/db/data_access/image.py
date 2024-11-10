from app.db.models.image import OriginalImage, AnnotatedImage


async def add_original_image(session, original_image_data,info=None, filename=None):
    original_image = OriginalImage(image_data=original_image_data, filename=filename,info=info)
    session.add(original_image)
    await session.commit()
    return original_image.id



async def add_annotated_image(session, annotated_image_data, annotation_id, annotation):
    annotated_image = AnnotatedImage(annotation_id=annotation_id, image_data=annotated_image_data)
    annotated_image.annotation = annotation
    await session.add(annotated_image)
    session.commit()


def add_image_by_upload(session, original_image_data, filename=None):
    if original_image_data is not None:
        original_image = OriginalImage(image_data=original_image_data, filename=filename)
        session.add(original_image)
        session.commit()


def add_local_images(session, original_image_path, filename=None):
    with open(original_image_path, 'rb') as f:
        original_image_data = f.read()
    original_image = OriginalImage(image_data=original_image_data, filename=filename)
    session.add(original_image)
    session.commit()


async def get_image_by_id(session, image_id):
    image = session.query(OriginalImage).filter(OriginalImage.id == image_id).first()
    return image


async def get_images(session):
    images = session.query(OriginalImage).all()
    return images
