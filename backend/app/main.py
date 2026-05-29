import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.database import create_tables
from app.utils.logger import app_logger
from app.routers import auth, users, cv_analyzer, resume_builder, cover_letter, interview_chat, salary_predictor

# Create required directories
os.makedirs("uploads", exist_ok=True)
os.makedirs("logs", exist_ok=True)

# Rate limiter
limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    app_logger.info("Starting Career Genius API...")
    create_tables()
    app_logger.info("Database tables created/verified")
    app_logger.info(f"Running in {settings.ENVIRONMENT} mode")
    yield
    app_logger.info("Shutting down Career Genius API")


app = FastAPI(
    title=settings.APP_NAME,
    description="""
    ## Career Genius API

    An AI-powered career preparation platform for students and job seekers.

    ### Features:
    - **CV Analyzer**: ATS scoring, keyword analysis, improvement suggestions
    - **Resume Builder**: AI-assisted resume creation with multiple templates
    - **Cover Letter Generator**: Personalized AI cover letters
    - **Interview Chatbot**: Real-time interview simulation with feedback
    - **Salary Predictor**: Data-driven salary range predictions
    """,
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Compression
app.add_middleware(GZipMiddleware, minimum_size=1000)


# Global exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error["loc"])
        errors.append({"field": field, "message": error["msg"]})
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": "Validation error", "errors": errors},
    )


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    app_logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error. Please try again later."},
    )


# Health check
@app.get("/health", tags=["Health"])
async def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


# Include all routers
API_PREFIX = "/api/v1"
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(cv_analyzer.router, prefix=API_PREFIX)
app.include_router(resume_builder.router, prefix=API_PREFIX)
app.include_router(cover_letter.router, prefix=API_PREFIX)
app.include_router(interview_chat.router, prefix=API_PREFIX)
app.include_router(salary_predictor.router, prefix=API_PREFIX)


@app.get("/", tags=["Root"])
async def root():
    return {
        "message": "Welcome to Career Genius API",
        "docs": "/docs",
        "version": settings.APP_VERSION,
    }
