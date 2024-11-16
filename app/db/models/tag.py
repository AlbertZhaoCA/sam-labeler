from sqlalchemy.orm import Mapped, relationship
from .base import Base, int_pk,unique_name


class Tag(Base):
    __tablename__ = 'tags'

    id: Mapped[int_pk]
    name: Mapped[unique_name]

    annotations = relationship("Annotation", secondary="annotation_tags", back_populates="tags")
