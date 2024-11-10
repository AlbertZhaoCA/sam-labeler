from sqlalchemy import Column, Integer, String, Text, Float, TIMESTAMP, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.orm import Mapped
from .base import Base, int_pk, modified_timestamp


class Annotation(Base):
    __tablename__ = 'annotations'

    id: Mapped[int_pk]
    info = Column(Text)
    params = Column(Text, nullable=True)
    rate = Column(Float)
    last_modified_time: Mapped[modified_timestamp]

    annotated_images = relationship("AnnotatedImage", back_populates="annotation")