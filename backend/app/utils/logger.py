import sys
from loguru import logger
from app.config import settings


def setup_logging():
    logger.remove()

    log_format = (
        "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
        "<level>{level: <8}</level> | "
        "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
        "<level>{message}</level>"
    )

    logger.add(sys.stdout, format=log_format, level="DEBUG" if settings.DEBUG else "INFO", colorize=True)

    logger.add(
        "logs/career_genius_{time:YYYY-MM-DD}.log",
        rotation="1 day",
        retention="30 days",
        format=log_format,
        level="INFO",
        compression="zip",
    )

    return logger


app_logger = setup_logging()
