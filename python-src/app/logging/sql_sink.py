import logging
import json
from sqlalchemy.orm import Session
from app.models.log import Log
from typing import Callable
from queue import Queue
from logging.handlers import QueueHandler, QueueListener

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
        except Exception as e:
            print(f"Failed to log to SQL: {str(e)}")

def setup_async_sql_sink(session_factory: Callable[[], Session]) -> tuple[QueueHandler, QueueListener]:
    """
    Sets up a non-blocking SQL logging using a queue and background thread.

    Returns:
        tuple: (queue_handler, queue_listener)
        Add queue_handler to your logger, and call queue_listener.start()
    """
    # Create a queue for log records
    log_queue = Queue(-1) # -1 means unlimited size

    # Create the DQL sink handler
    sql_handler = SQLSink(session_factory)

    # Create a queue handler (this is what you attach to your logger)
    queue_handler = QueueHandler(log_queue)

    # Create a listener that processes the queue in a background thread
    # respect_handler_level=True ensures the SQLSink's level is respected
    queue_listener = QueueListener(log_queue, sql_handler, respect_handler_level=True)
    queue_listener.start()

    return queue_handler, queue_listener