from sqlalchemy import Column, Integer, BLOB, Text, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from .base import Base, int_pk, non_nullable_blob_data, nullable_file_name, modified_timestamp, created_timestamp


class OriginalImage(Base):
    __tablename__ = 'original_images'

    id: Mapped[int_pk]
    image_data = mapped_column(BLOB, nullable=False)
    filename: Mapped[nullable_file_name]
    info = mapped_column(Text, default=None)
    created_time: Mapped[created_timestamp]
    last_modified_time: Mapped[modified_timestamp]
    labeled: Mapped[bool] = mapped_column(default=False)
    annotations = relationship("Annotation", back_populates="originals", cascade="all, delete-orphan")


class AnnotatedImage(Base):
    __tablename__ = 'annotated_images'

    filename: Mapped[nullable_file_name]
    id: Mapped[int_pk]
    annotation_id = Column(Integer, ForeignKey('annotations.id'))
    image_data: Mapped[non_nullable_blob_data]
    created_time: Mapped[created_timestamp]
    last_modified_time: Mapped[modified_timestamp]
    annotations = relationship("Annotation", back_populates="annotated_images", cascade="all, delete-orphan", single_parent=True)

