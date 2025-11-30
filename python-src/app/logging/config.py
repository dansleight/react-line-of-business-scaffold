import structlog
import logging
from structlog.processors import TimeStamper, JSONRenderer, KeyValueRenderer
from structlog.stdlib import add_log_level, ProcessorFormatter
from app.logging.sql_sink import setup_async_sql_sink
from app.database.config import SessionLocal
from datetime import datetime
from app.config import settings
import os

_queue_listener = None

def configure_logging():
    global _queue_listener

    # Create logs directory
    log_dir = "logs"
    os.makedirs(log_dir, exist_ok=True)
    
    # File handler for structured logs
    file_handler = logging.FileHandler(
        os.path.join(log_dir, f"app-{datetime.now().strftime('%Y%m%d')}.log")
    )
    file_handler.setLevel(logging.INFO)
    
    # Console handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.DEBUG)

    # SQL handler
    sql_queue_handler, queue_listener = setup_async_sql_sink(SessionLocal)
    sql_queue_handler.setLevel(logging.INFO) # log INFO and above to SQL
    _queue_listener = queue_listener
    
    # Configure structlog
    structlog.configure(
        processors=[
            add_log_level,  # Add level (e.g., INFO, ERROR)
            TimeStamper(fmt="iso"),  # ISO timestamp
            ProcessorFormatter.wrap_for_formatter,
        ],
        context_class=dict,
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
        
    # Formatters for sinks
    json_formatter = ProcessorFormatter(
        processor=JSONRenderer(),  # JSON for file and SQL
        foreign_pre_chain=[
            TimeStamper(fmt="iso"),
            add_log_level,
        ]
    )
    
    console_formatter = ProcessorFormatter(
        processor=KeyValueRenderer(),  # Human-readable for console
        foreign_pre_chain=[
            TimeStamper(fmt="iso"),
            add_log_level,
        ]
    )
    
    file_handler.setFormatter(json_formatter)
    console_handler.setFormatter(console_formatter)
    sql_queue_handler.setFormatter(json_formatter) # JSON for SQL consistency
    
    # Configure stdlib logging
    logging.basicConfig(
        level=logging.DEBUG,
        handlers=[console_handler, file_handler, sql_queue_handler],
    )
        
    # Return main logger
    return structlog.get_logger("fastapi")

def shutdown_logging():
    """Call this on application shutdown to ensure all logs are flushed"""
    global _queue_listener
    if _queue_listener:
        _queue_listener.stop()

# Initialize logger
logger = configure_logging()