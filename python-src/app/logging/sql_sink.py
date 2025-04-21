import logging
import json
from sqlalchemy.orm import Session
from app.models.log import Log
from typing import Callable

class SQLSink(logging.Handler):
    def __init__(self, session_factory: Callable[[], Session]):
        super().__init__()
        self.session_factory = session_factory
    
    def emit(self, record: logging.LogRecord):
        try:
            # Handle record.msg (str or dict)
            message = record.msg
            context = getattr(record, "context", {})
            if isinstance(record.msg, dict):
                # Extract event as message, merge extra into context
                message = record.msg.get("event", str(record.msg))
                extra = record.msg.get("extra", {})
                context = {**context, **extra}

            with self.session_factory() as db:
                log_entry = Log(
                    Level=record.levelname,
                    Message=message,
                    Logger=record.name,
                    Context=json.dumps(context),
                    Exception=record.exc_text if record.exc_info else None
                )
                db.add(log_entry)
                db.commit()
                print(f"SQLSink committed: {message}")  # Debug
        except Exception as e:
            print(f"Failed to log to SQL: {str(e)}")