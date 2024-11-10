from app.db.models import annotation, image, setting
from app.db.models.base import Base,engine

Base.metadata.create_all(engine)