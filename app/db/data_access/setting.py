from sqlalchemy.orm import Session
from app.db.models.setting import Setting, Preference


def get_settings(session):
    return session.query(Setting).all()


def get_setting_by_id(session: Session, settings_id):
    return session.query(Setting).filter(Setting.id == settings_id).first()


def add_setting(session, dataset_path, model_path, model_type, params, notes, name):
    setting = Setting(dataset_path=dataset_path, model_path=model_path, model_type=model_type,
                      params=params, notes=notes, name=name)
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


def get_preference_setting_id(session):
    preference = session.query(Preference).first()
    if not preference:
        default_preference = Preference(setting_id=1)
        session.add(default_preference)
        session.commit()
        session.refresh(default_preference)
        return default_preference.setting_id
    return preference.setting_id

def get_preference_setting(session):
    setting_id = get_preference_setting_id(session)
    setting = get_setting_by_id(session, setting_id)
    session.close()
    return setting


def update_preference_setting(session, setting_id):
    preference = session.query(Preference).first()
    if not preference:
        preference = Preference(setting_id=setting_id)
        session.add(preference)
    else:
        preference.setting_id = setting_id
    session.commit()
    return {"message": "Preference setting updated in database", "setting_id": setting_id}


