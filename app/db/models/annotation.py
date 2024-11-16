from sqlalchemy import Column, Integer, String, Text, Float, TIMESTAMP, ForeignKey, Table
from sqlalchemy.orm import relationship, Mapped
from .base import Base, int_pk, modified_timestamp,created_timestamp

class Annotation(Base):
    __tablename__ = 'annotations'

    id: Mapped[int_pk]
    original_id: Mapped[int] = Column(Integer, ForeignKey('original_images.id'))
    info = Column(Text)
    rate = Column(Float)
    created_time: Mapped[created_timestamp]
    last_modified_time: Mapped[modified_timestamp]

    annotated_images = relationship("AnnotatedImage", back_populates="annotations", cascade="all, delete-orphan")
    tags = relationship("Tag", secondary="annotation_tags", back_populates="annotations")
    originals = relationship("OriginalImage", back_populates="annotations")
