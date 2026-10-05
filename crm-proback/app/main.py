# pyrefly: ignore [missing-import]
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import Base, engine, SessionLocal
from app.api.v1 import auth, users, workspaces, datasets, analytics, rekognition
from app.models.user import User, UserWorkspace
from app.models.workspace import Workspace
from app.core.security import get_password_hash

# Base.metadata.create_all(bind=engine)

def seed_defaults():
    try:
        db: Session = SessionLocal()
    except Exception as e:
        print(f"Warning: Database engine connection failed: {e}")
        return
    try:
        # Create default admin user if it doesn't exist
        admin_email = "luisalbertohuaman419@gmail.com"
        admin_user = db.query(User).filter(User.email == admin_email).first()
        if not admin_user:
            admin_user = User(
                email=admin_email,
                username="admin",
                password_hash=get_password_hash("1234luis#p"),
                full_name="Luis Alberto",
                role="admin",
                status="online",
                preferences={
                    "carga": True,
                    "analisis": True,
                    "tendencias": True,
                    "workspace": True,
                    "reportes": True
                }
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
            print("Default admin created.")

        # Create default workspace if it doesn't exist
        default_workspace_name = "Módulo principal"
        workspace = db.query(Workspace).filter(Workspace.name == default_workspace_name).first()
        if not workspace:
            workspace = Workspace(name=default_workspace_name, description="Default assigned workspace for admin", status="active")
            db.add(workspace)
            db.commit()
            db.refresh(workspace)
            print("Default workspace created.")

        # Assign user to workspace if not assigned
        user_workspace = db.query(UserWorkspace).filter(UserWorkspace.user_id == admin_user.id, UserWorkspace.workspace_id == workspace.id).first()
        if not user_workspace:
            user_workspace = UserWorkspace(user_id=admin_user.id, workspace_id=workspace.id, role_override="admin", is_default=True)
            db.add(user_workspace)
            db.commit()
            print("Default workspace assigned to admin.")
            
    except Exception as e:
        print(f"Warning: Database seeding failed: {e}")
    finally:
        try:
            db.close()
        except Exception:
            pass

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        Base.metadata.create_all(bind=engine)
        print("Database schema verified.")
    except Exception as e:
        print(f"Notice: Database schema creation skipped or offline: {e}")
    seed_defaults()
    yield
    pass

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
    description="RetailMetrics 360 API with Amazon Rekognition Biometrics & Analytics",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.CORS_ORIGINS.split(',')],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(workspaces.router, prefix="/api/v1/workspaces", tags=["workspaces"])
app.include_router(datasets.router, prefix="/api/v1/datasets", tags=["datasets"])
app.include_router(analytics.router, prefix="/api/v1/analytics", tags=["analytics"])
app.include_router(rekognition.router, prefix="/api/v1/rekognition", tags=["rekognition"])

@app.get("/")
def read_root():
    return {"message": "Welcome to RetailMetrics 360 API"}
