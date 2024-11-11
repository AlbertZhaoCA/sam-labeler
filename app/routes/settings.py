import json
from typing import List,Union
from fastapi import APIRouter, Query, Depends
from app.db.data_access.setting import get_settings, get_setting_by_id, add_setting as db_add_setting
from pydantic import Field, BaseModel
from utils import exception
from app.db.models.base import get_db_session
from sqlalchemy.orm import Session

router = APIRouter()

class Setting(BaseModel):
    dataset_path: str = Field(..., example="/Users/rupert/deep-learning/segment/checkpoints/datas/data_set")
    model_path: str = Field(..., example="/Users/rupert/deep-learning/segment/checkpoints/sam_vit_b_01ec64.pth")
    model_type: str = Field(..., example="vit_b")
    params: dict[str, str] = Field( example={"dtype": "float32"})
    notes: str = Field(..., example="This setting is for the vit_b model, only test purpose")
    name: str = Field(..., example="tested config used, stewie")
    is_preference: bool = Field(False, example=False)

    class Config:
        protected_namespaces = ()


@router.get("/settings", response_model= Union[List[Setting],Setting],description="Get all settings or a specific setting by ID")
async def get_setting(*, session:Session=Depends(get_db_session),setting_id: int = Query(None, alias="id", description="Setting ID", example="1")):
    try:
        if setting_id is None:
            settings = get_settings(session)
            for setting in settings:
                setting.params = json.loads(setting.params)
        else:
            settings = get_setting_by_id(session,setting_id)
            settings.params = json.loads(settings.params)
    except Exception as e:
        print(e)
        raise exception.raise_generic_exception()
    return settings


@router.post("/settings",description="Add a new setting")
async def add_setting(*,session:Session=Depends(get_db_session),setting: Setting):
    try:
        dataset_path = setting.dataset_path
        model_path = setting.model_path
        model_type = setting.model_type
        params = json.dumps(setting.params)
        notes = setting.notes
        name = setting.name
        is_preference = setting.is_preference

        db_add_setting(session,dataset_path, model_path, model_type, params, notes, name, is_preference)
    except Exception as e:
        print(e)
        raise exception.raise_generic_exception()
    return {"info": "Setting added"}
