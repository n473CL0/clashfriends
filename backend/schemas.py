from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional

# --- User Schemas ---
class UserBase(BaseModel):
    username: str
    player_tag: str

class UserCreate(UserBase):
    pass

class UserResponse(UserBase):
    id: int
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# --- Match Schemas ---
class MatchBase(BaseModel):
    battle_id: str
    player_1_tag: str
    player_2_tag: str
    winner_tag: Optional[str] = None
    battle_time: datetime
    game_mode: str
    crowns_1: int
    crowns_2: int

class MatchCreate(MatchBase):
    pass

class MatchResponse(MatchBase):
    id: int

    model_config = ConfigDict(from_attributes=True)