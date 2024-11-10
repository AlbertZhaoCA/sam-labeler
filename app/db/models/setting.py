from sqlalchemy import Column, Integer, String, Text, TIMESTAMP, func, Boolean, CheckConstraint
from sqlalchemy.orm import Mapped
from .base import Base, int_pk, modified_timestamp, non_nullable_name


class Setting(Base):
    __tablename__ = 'settings'

    id: Mapped[int_pk]
    is_preference = Column(Boolean, default=False, nullable=True)
    name: Mapped[non_nullable_name]
    dataset_path = Column(String, nullable=False)
    model_path = Column(String, nullable=False)
    model_type: Mapped[non_nullable_name]
    params = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    last_modified_time: Mapped[modified_timestamp]

    __table_args__ = (
        CheckConstraint(
            'is_preference = FALSE OR (SELECT COUNT(*) FROM settings WHERE is_preference = TRUE) = 1',
            name='check_one_preference',
        ),
    )


