from io import BytesIO
from fastapi import APIRouter, UploadFile, Depends
from starlette.responses import StreamingResponse
from app.db.data_access.image import add_image_by_upload, get_images, add_local_images, get_image_by_id as _get_image
from app.db.data_access.setting import get_setting_by_id
from utils.image import convert_image_data,pick_images
from app.db.models.base import Session,get_db_session
from utils.exception import raise_not_found_exception
router = APIRouter()
temp_session = Session()
setting = get_setting_by_id(temp_session, 1)
temp_session.close()
dataset_dir = None


@router.post("/images")
async def upload_file(*, session: Session = Depends(get_db_session), file: UploadFile):
    try:
        original_image_data = await file.read()
        image_bytes = convert_image_data(original_image_data)
        add_image_by_upload(session, image_bytes, file.filename)
    except Exception as e:
        print(e)
        return {"error": str(e)}
    return {"info": f"file '{file.filename}' uploaded"}


@router.get("/images")
async def list_images(session:Session=Depends(get_db_session)):
    images = await get_images(session)
    print()
    return [{"id": image.id, "filename": image.filename, 'url': f"images/{image.id}"} for image in images]


@router.get("/images/{image_id}")
async def get_image_by_id(image_id: int, session: Session = Depends(get_db_session)):
    image = await _get_image(session, image_id)
    if image is None:
        raise_not_found_exception('Images')

    return StreamingResponse(BytesIO(image.image_data), media_type="image/jpeg")


@router.post("/images/local")
async def upload_local_images(session:Session=Depends(get_db_session)):
    try:
        if setting and setting.dataset_path:
            images = pick_images(setting.dataset_path, recursive=True, repeat=False, open=False)
            for image in images:
                add_local_images(session, image, image.split('/')[-1])
            return {"info": "Images added to database"}
        else:
            return {"error": "Dataset path not set"}
    except Exception as e:
        print(e)
        return {"error": str(e)}