from typing import Optional

from pydantic import BaseModel, EmailStr


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    profile_image: Optional[str] = None
    theme_preference: Optional[str] = None
    notifications_enabled: Optional[bool] = None


class UserProfileResponse(BaseModel):
    id: str
    name: str
    email: str
    profile_image: Optional[str]
    theme_preference: str
    notifications_enabled: bool

    model_config = {"from_attributes": True}


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str
    confirm_password: str
