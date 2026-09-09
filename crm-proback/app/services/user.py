from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select, update, delete
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash
import uuid

class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self, skip: int = 0, limit: int = 100) -> List[User]:
        stmt = select(User).offset(skip).limit(limit)
        return self.db.scalars(stmt).all()

    def get_by_id(self, user_id: int) -> Optional[User]:
        stmt = select(User).where(User.id == user_id)
        return self.db.scalars(stmt).first()

    def get_by_email(self, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email)
        return self.db.scalars(stmt).first()

    def create(self, user_in: UserCreate) -> User:
        user_data = user_in.model_dump()
        password = user_data.pop("password")
        user_data["password_hash"] = get_password_hash(password)
        # Generate a fallback username
        user_data["username"] = user_in.email.split("@")[0] + str(uuid.uuid4())[:4]
        
        db_user = User(**user_data)
        self.db.add(db_user)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def update(self, user_id: int, user_in: UserUpdate) -> Optional[User]:
        db_user = self.get_by_id(user_id)
        if not db_user:
            return None
        
        update_data = user_in.model_dump(exclude_unset=True)
        if "password" in update_data:
            password = update_data.pop("password")
            update_data["password_hash"] = get_password_hash(password)
            
        if update_data:
            stmt = update(User).where(User.id == user_id).values(**update_data)
            self.db.execute(stmt)
            self.db.commit()
            self.db.refresh(db_user)
            
        return db_user

    def delete(self, user_id: int) -> bool:
        stmt = delete(User).where(User.id == user_id)
        result = self.db.execute(stmt)
        self.db.commit()
        return result.rowcount > 0
