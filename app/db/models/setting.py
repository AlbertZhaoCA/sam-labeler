from sqlalchemy import Column, String, Text, Boolean, UniqueConstraint, Integer, ForeignKey, CheckConstraint
from sqlalchemy.orm import Mapped, relationship
from .base import Base, int_pk, modified_timestamp, non_nullable_name, unique_nullable_name, created_timestamp


class Setting(Base):
    __tablename__ = 'settings'

    id: Mapped[int_pk]
    name: Mapped[unique_nullable_name]
    dataset_path = Column(String, nullable=False)
    model_path = Column(String, nullable=False)
    model_type: Mapped[non_nullable_name]
    params = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_time: Mapped[created_timestamp]
    last_modified_time: Mapped[modified_timestamp]


class Preference(Base):
    __tablename__ = 'preferences'

    id = Column(Integer, primary_key=True)
    setting_id = Column(Integer, ForeignKey('settings.id'), nullable=False)
    created_time: Mapped[created_timestamp]
    last_modified_time: Mapped[modified_timestamp]

    __table_args__ = (
        CheckConstraint("id = 1", name="ck_single_record"),
    )





