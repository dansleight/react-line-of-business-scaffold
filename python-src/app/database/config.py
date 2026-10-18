from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

Base = declarative_base()

_engine = None
_session_factory = None


def get_engine():
    global _engine
    if _engine is None:
        _engine = create_engine(settings.db_url, connect_args={"verify": False})
    return _engine


def SessionLocal(**kwargs):
    global _session_factory
    if _session_factory is None:
        _session_factory = sessionmaker(autocommit=False, autoflush=False, bind=get_engine())
    return _session_factory(**kwargs)


def __getattr__(name: str):
    if name == "engine":
        return get_engine()
    raise AttributeError(name)