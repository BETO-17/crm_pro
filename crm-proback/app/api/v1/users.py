from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.user import UserCreate, UserUpdate, UserOut
from app.services.user import UserService

router = APIRouter()

@router.get("/", response_model=List[UserOut])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    service = UserService(db)
    return service.get_all(skip=skip, limit=limit)

@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(user_in: UserCreate, db: Session = Depends(get_db)):
    service = UserService(db)
    if service.get_by_email(user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    return service.create(user_in)

@router.get("/{user_id}", response_model=UserOut)
def read_user(user_id: int, db: Session = Depends(get_db)):
    service = UserService(db)
    user = service.get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: int, user_in: UserUpdate, db: Session = Depends(get_db)):
    service = UserService(db)
    user = service.update(user_id, user_in)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db)):
    service = UserService(db)
    if not service.delete(user_id):
        raise HTTPException(status_code=404, detail="User not found")
