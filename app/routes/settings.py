import json
import sqlite3
import sqlalchemy
from typing import List,Union
from fastapi import APIRouter, Query, Depends
from app.db.data_access.setting import (get_settings, get_setting_by_id, add_setting as db_add_setting, get_preference_setting_id,
                                        update_preference_setting as _update_preference_setting)
from pydantic import Field, BaseModel
from utils import exception
from app.db.models.base import get_db_session
from sqlalchemy.orm import Session
import datetime

router = APIRouter()

class Setting(BaseModel):
    dataset_path: str = Field(..., example="/Users/rupert/deep-learning/segment/checkpoints/datas/data_set")
    model_path: str = Field(..., example="/Users/rupert/deep-learning/segment/checkpoints/sam_vit_b_01ec64.pth")
    model_type: str = Field(..., example="vit_b")
    params: dict[str, str] = Field( example={"dtype": "float32"})
    notes: str = Field(..., example="This setting is for the vit_b model, only test purpose")
    name: str = Field(..., example="tested config used, stewie")

class SettingResponse(Setting):
    created_time: datetime.datetime = Field(..., example="2024-09-01T00:00:00")
    last_modified_time: datetime.datetime = Field(..., example="2024-09-01T00:00:00")

    class Config:
        protected_namespaces = ()


@router.get("/settings", response_model = Union[List[SettingResponse],SettingResponse],description="Get all settings or a specific setting by ID")
async def get_setting(*, session:Session=Depends(get_db_session),setting_id: int = Query(None, alias="id", description="Setting ID", example="1")):
    try:
        if setting_id is None:
            settings = get_settings(session)
            for setting in settings:
                print(setting.name)
                setting.params = json.loads(setting.params)
        else:
            settings = get_setting_by_id(session,setting_id)
            settings.params = json.loads(settings.params)
    except Exception as e:
        print(e)
        raise exception.raise_generic_exception()
    return settings


@router.post("/settings",description="Add a new setting")
async def add_setting(*, session:Session=Depends(get_db_session), setting: Setting):
    try:
        dataset_path = setting.dataset_path
        model_path = setting.model_path
        model_type = setting.model_type
        params = json.dumps(setting.params)
        notes = setting.notes
        name = setting.name

        db_add_setting(session,dataset_path, model_path, model_type, params, notes, name)
    except sqlalchemy.exc.IntegrityError as e:
        print(e)
        raise exception.raise_resource_exists_exception('setting')
    except Exception as e:
        print(e)
        raise exception.raise_generic_exception()
    return {"info": "Setting added"}

@router.get("/settings/preference",description="Get the preference setting")
async def get_preference_setting(*, session:Session=Depends(get_db_session)):
    try:
        setting_id = get_preference_setting_id(session)
    except Exception as e:
        print(e)
        raise exception.raise_generic_exception()
    return setting_id

@router.put("/settings/preference",description="Update the preference setting")
async def update_preference_setting(*, session:Session=Depends(get_db_session), setting_id: int = Query(..., description="set given setting as preferred setting", example="2")):
    try:
        setting = get_setting_by_id(session,setting_id)
        if not setting:
            raise exception.raise_resource_not_found_exception('setting',setting_id)
        setting_id = _update_preference_setting(session,setting_id)
    except Exception as e:
        print(e)
        raise exception.raise_generic_exception()
    return setting_id