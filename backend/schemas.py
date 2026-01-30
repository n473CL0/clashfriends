from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime
from typing import Optional, List

# --- Auth Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str

class UserSignup(BaseModel):
    email: EmailStr
    password: str
    player_tag: Optional[str] = None 
    invite_token: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# --- Invite Schemas ---
class InviteCreate(BaseModel):
    target_tag: Optional[str] = None

class InviteResponse(BaseModel):
    token: str
    target_tag: Optional[str] = None
    creator_username: Optional[str] = None

# --- User Operations ---
class LinkTagRequest(BaseModel):
    player_tag: str

class UserResponse(BaseModel):
    id: int
    username: Optional[str] = None
    player_tag: Optional[str] = None
    email: EmailStr
    
    # New Fields
    trophies: Optional[int] = 0
    clan_name: Optional[str] = None
    
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# --- Match Schemas ---
class MatchResponse(BaseModel):
    battle_id: str
    player_1_tag: str
    player_2_tag: str
    winner_tag: Optional[str] = None
    battle_time: datetime
    game_mode: str
    crowns_1: int
    crowns_2: int

    model_config = ConfigDict(from_attributes=True)