from app.db.models import annotation_tags, tag, annotation, image, setting
from app.db.models.base import Base, engine

Base.metadata.create_all(engine)