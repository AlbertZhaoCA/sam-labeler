from sqlalchemy.orm import Session
from app.db.models.setting import Setting


def get_settings(session):
    return session.query(Setting).all()


def get_setting_by_id(session: Session, settings_id):
    return session.query(Setting).filter(Setting.id == settings_id).first()


def add_setting(session, dataset_path, model_path, model_type, params, notes, name, is_preference=False):
    setting = Setting(dataset_path=dataset_path, model_path=model_path, model_type=model_type,
                      params=params, notes=notes, name=name, is_preference=is_preference)
    session.add(setting)
    session.commit()
    return {"message": "Settings added to database"}


def update_setting(session, setting_id, dataset_path=None, model_path=None, model_type=None, params=None, notes=None,
                   name=None, is_preference=None):
    setting = session.query(Setting).filter(Setting.id == setting_id).first()
    if setting:
        if dataset_path is not None:
            setting.dataset_path = dataset_path
        if model_path is not None:
            setting.model_path = model_path
        if model_type is not None:
            setting.model_type = model_type
        if params is not None:
            setting.params = params
        if notes is not None:
            setting.notes = notes
        if name is not None:
            setting.name = name
        if is_preference is not None:
            setting.is_preference = is_preference
    session.commit()
    return {"message": "Settings updated in database"}


def get_preference_settings(session):
    return session.query(Setting).filter(Setting.is_preference is True).one()
