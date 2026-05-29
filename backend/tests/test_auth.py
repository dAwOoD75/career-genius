import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.database import Base, get_db

# Use in-memory SQLite for tests
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

TEST_USER = {
    "email": "test@careergenius.com",
    "username": "testuser",
    "full_name": "Test User",
    "password": "TestPass123",
}


def test_register_user():
    response = client.post("/api/v1/auth/register", json=TEST_USER)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == TEST_USER["email"]


def test_register_duplicate_email():
    client.post("/api/v1/auth/register", json=TEST_USER)
    response = client.post("/api/v1/auth/register", json=TEST_USER)
    assert response.status_code == 409


def test_login_success():
    client.post("/api/v1/auth/register", json=TEST_USER)
    response = client.post("/api/v1/auth/login", json={
        "email": TEST_USER["email"],
        "password": TEST_USER["password"],
    })
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_login_wrong_password():
    response = client.post("/api/v1/auth/login", json={
        "email": TEST_USER["email"],
        "password": "wrongpassword",
    })
    assert response.status_code == 401


def test_get_profile():
    reg = client.post("/api/v1/auth/register", json={**TEST_USER, "email": "profile@test.com", "username": "profileuser"})
    token = reg.json()["access_token"]
    response = client.get("/api/v1/users/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "profile@test.com"


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
