import inspect
import os
from functools import wraps,partial
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


def get_db_session():
    db = Session()
    try:
        yield db
    finally:
        db.close()


def transactional_session(func):
    @wraps(func)
    async def wrapper(*args, **kwargs):
        session = Session()
        try:
            result = await func(*args, **kwargs)
            session.commit()
            return result
        except Exception as e:
            session.rollback()
            raise e
        finally:
            session.close()
    return wrapper


int_pk = Annotated[int, mapped_column(primary_key=True, autoincrement=True)]
created_timestamp = Annotated[str,mapped_column(TIMESTAMP,nullable=False, server_default=func.now())]
modified_timestamp = Annotated[str,mapped_column(TIMESTAMP,nullable=False, server_default=func.now(),
                                                 server_onupdate=func.now())]
non_nullable_blob_data = Annotated[bytes, mapped_column(BLOB,nullable=False)]
unique_non_nullable_blob_data = Annotated[bytes,mapped_column(BLOB, nullable=False,unique=True)]
nullable_file_name = Annotated[str, mapped_column(String(50), nullable=True)]
non_nullable_file_name = Annotated[str, mapped_column(String(50), nullable=False)]
unique_file_name = Annotated[str,mapped_column(String(50), nullable=False, unique=True)]
unique_name = Annotated[str, mapped_column(String(20), unique=True, nullable=False)]
name = Annotated[str, mapped_column(String(20), nullable=True)]
non_nullable_name = Annotated[str, mapped_column(String(20), nullable=False)]
unique_nullable_name = Annotated[str, mapped_column(String(20), nullable=False, unique=True)]


