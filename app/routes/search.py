from typing import Optional, Union, List
from fastapi import APIRouter, Query, Depends
from pydantic import BaseModel, Field
from app.db.models.base import Session, get_db_session
from app.db.data_access.image import query_or_images_alike
from app.db.data_access.tag import query_tags_alike

router = APIRouter()

class ImageModel(BaseModel):
    id: int = Field(None, example=1)
    filename: Optional[str] = Field(None, example="my_cat.jpg")
    img_data: Optional[str] = Field(None,
                                    example="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/4QBYRXhpZgAATU0AKgAAAAgAA1IBAAABAAEA")
    info: Optional[str] = Field(None, example="Maybe the image is not clear")
    labeled: Optional[bool] = Field(None, example=True)

class TagsModel(BaseModel):
    id: int = Field(None, example=1)
    name: Optional[str] = Field(None, example="cat")

class SearchResultsModel(BaseModel):
    image: List[ImageModel]
    tags: List[TagsModel]

@router.get("/search", response_model=SearchResultsModel, description="Search for images or annotations")
async def search(query: str = Query(..., description="Keyword to search for"), db: Session = Depends(get_db_session)):
    images = query_or_images_alike(db, query)
    tags = query_tags_alike(db, query)

    results = {
        "image": images,
        "tags": tags
    }

    print(results)

    return results
