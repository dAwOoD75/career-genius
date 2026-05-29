from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.activity_log import ActivityLog
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, PasswordChange
from app.utils.security import hash_password, verify_password, create_access_token
from app.utils.logger import app_logger

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, request: Request, db: Session = Depends(get_db)):
    """Register a new user account."""
    # Check uniqueness
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
    if db.query(User).filter(User.username == user_data.username).first():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

    user = User(
        email=user_data.email,
        username=user_data.username,
        full_name=user_data.full_name,
        hashed_password=hash_password(user_data.password),
        is_active=True,
        is_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Log activity
    db.add(ActivityLog(
        user_id=user.id,
        action="user_registered",
        module="auth",
        description="New user account created",
        ip_address=request.client.host if request.client else None,
    ))
    db.commit()

    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    app_logger.info(f"New user registered: {user.email}")
    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, request: Request, db: Session = Depends(get_db)):
    """Authenticate user and return JWT token."""
    user = db.query(User).filter(User.email == credentials.email).first()

    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is deactivated")

    user.last_login = datetime.now(timezone.utc)
    db.add(ActivityLog(
        user_id=user.id,
        action="user_login",
        module="auth",
        description="User logged in",
        ip_address=request.client.host if request.client else None,
    ))
    db.commit()

    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    app_logger.info(f"User logged in: {user.email}")
    return Token(access_token=token, user=UserResponse.model_validate(user))


@router.post("/change-password", status_code=status.HTTP_200_OK)
async def change_password(
    data: PasswordChange,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Change user password."""
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is incorrect")

    current_user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}
