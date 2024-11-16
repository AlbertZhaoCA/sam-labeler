from sqlalchemy import Table, Column, Integer, ForeignKey
from .base import Base

annotation_tags = Table(
    'annotation_tags', Base.metadata,
    Column('annotation_id', Integer, ForeignKey('annotations.id'), primary_key=True),
    Column('tag_id', Integer, ForeignKey('tags.id'), primary_key=True)
)
