import os
from functools import wraps
from sqlalchemy import create_engine, BLOB, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, mapped_column
from sqlalchemy import TIMESTAMP,func
from typing_extensions import Annotated


os.makedirs("data", exist_ok=True)

DATABASE_URL = "sqlite:///data/db.sqlite"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

Base = declarative_base()

Session = sessionmaker(bind=engine)


def transactional_session(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        session = Session()
        try:
            result = func(session, *args, **kwargs)
            session.commit()
            return result
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    return wrapper


int_pk = Annotated[int, mapped_column(primary_key=True, autoincrement=True)]
modified_timestamp = Annotated[str, mapped_column(TIMESTAMP,nullable=False, server_default=func.current_timestamp(), server_onupdate=func.current_timestamp())]
non_nullable_blob_data = Annotated[bytes, mapped_column(BLOB,nullable=False)]
unique_non_nullable_blob_data = Annotated[bytes,mapped_column(BLOB, nullable=False,unique=True)]
nullable_file_name = Annotated[str, mapped_column(String(50), nullable=True)]
non_nullable_file_name = Annotated[str, mapped_column(String(50), nullable=False)]
unique_file_name = Annotated[str,mapped_column(String(50), nullable=False, unique=True)]
name = Annotated[str, mapped_column(String(20), nullable=True)]
non_nullable_name = Annotated[str, mapped_column(String(20), nullable=False)]


