import os
import hashlib
import requests
from typing import List
from datetime import datetime
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
import models, schemas, database

# 1. Initialize Database Tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# 2. CORS Configuration (Allows Frontend to talk to Backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows localhost:3000 and others
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. Helper: Clash Royale API Client
CR_API_KEY = os.getenv("CR_API_KEY")
API_BASE = "https://api.clashroyale.com/v1"

def get_headers():
    if not CR_API_KEY:
        raise HTTPException(status_code=500, detail="CR_API_KEY not set in environment")
    return {"Authorization": f"Bearer {CR_API_KEY}"}

def generate_battle_id(battle_time: str, p1_tag: str, p2_tag: str) -> str:
    """
    Creates a unique ID for a match so we don't save duplicates.
    Logic: MD5(Time + SortedPlayerTags)
    """
    # Sort tags to ensure A vs B and B vs A produce the same ID
    tags = sorted([p1_tag, p2_tag])
    raw_string = f"{battle_time}-{tags[0]}-{tags[1]}"
    return hashlib.md5(raw_string.encode()).hexdigest()

# 4. API Endpoints

@app.get("/")
def read_root():
    return {"status": "online", "service": "CR Tracker API"}

@app.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    """
    Registers a user. If they exist, returns the existing record.
    """
    # Check if user exists
    existing_user = db.query(models.User).filter(models.User.player_tag == user.player_tag).first()
    if existing_user:
        return existing_user

    new_user = models.User(username=user.username, player_tag=user.player_tag)
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return new_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="User already exists")

@app.get("/players/{player_tag}/matches", response_model=List[schemas.MatchResponse])
def get_player_matches(player_tag: str, db: Session = Depends(database.get_db)):
    """
    Fetches match history where the user is EITHER Player 1 OR Player 2.
    """
    matches = db.query(models.Match).filter(
        (models.Match.player_1_tag == player_tag) | 
        (models.Match.player_2_tag == player_tag)
    ).order_by(models.Match.battle_time.desc()).limit(50).all()
    
    return matches

@app.post("/sync/{player_tag}")
def sync_battles(player_tag: str, db: Session = Depends(database.get_db)):
    """
    Fetches recent battles from Clash Royale API and saves them to DB.
    """
    # 1. Clean Tag
    clean_tag = player_tag.replace("#", "%23")
    url = f"{API_BASE}/players/{clean_tag}/battlelog"
    
    # 2. Call External API
    try:
        response = requests.get(url, headers=get_headers())
        if response.status_code == 403:
            raise HTTPException(status_code=403, detail="API Key Invalid or IP blocked by Clash Royale")
        if response.status_code != 200:
            raise HTTPException(status_code=response.status_code, detail="Failed to fetch from Clash Royale")
        
        battles = response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # 3. Process & Save Battles
    saved_count = 0
    for b in battles:
        # We only support 1v1 or 2v2 (ignore challenges/tournaments for simplicity if needed)
        if b.get("type") not in ["PvP", "2v2", "ClanWar"]:
            continue
            
        try:
            # Extract basic data
            # Note: API format varies. This assumes standard PvP structure.
            p1_tag = b["team"][0]["tag"]
            p2_tag = b["opponent"][0]["tag"]
            
            # API returns generic format 20240215T120000.000Z
            battle_time_str = b["battleTime"]
            # Convert to Python DateTime
            battle_time_obj = datetime.strptime(battle_time_str, "%Y%m%dT%H%M%S.%fZ")

            # Generate Unique Hash
            battle_id = generate_battle_id(battle_time_str, p1_tag, p2_tag)

            # Check if exists
            if db.query(models.Match).filter(models.Match.battle_id == battle_id).first():
                continue

            # Create Record
            match_record = models.Match(
                battle_id=battle_id,
                player_1_tag=p1_tag,
                player_2_tag=p2_tag,
                winner_tag=p1_tag if b["team"][0]["crowns"] > b["opponent"][0]["crowns"] else (p2_tag if b["opponent"][0]["crowns"] > b["team"][0]["crowns"] else None),
                battle_time=battle_time_obj,
                game_mode=b["type"],
                crowns_1=b["team"][0]["crowns"],
                crowns_2=b["opponent"][0]["crowns"]
            )
            
            db.add(match_record)
            saved_count += 1
            
        except (KeyError, IndexError):
            # Skip malformed battles
            continue

    try:
        db.commit()
    except Exception:
        db.rollback()
        
    return {"status": "success", "new_matches_synced": saved_count}