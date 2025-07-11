from pydantic import BaseModel, Field

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str = Field(..., description="用于获取新 Access Token 的 refresh token")
