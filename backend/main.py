import os
import requests
import hashlib
import datetime
from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

import models, schemas, crud, database

# Initialize Database Tables (auto-create if not exists)
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Clash Royale H2H Tracker")

CR_API_KEY = os.getenv("CR_API_KEY")

# --- Helpers ---
def generate_battle_id(battle_time_str: str, tag: str) -> str:
    """Generates a deterministic ID from the battle time + player tag"""
    raw_string = f"{battle_time_str}{tag}"
    return hashlib.md5(raw_string.encode()).hexdigest()

def parse_cr_time(time_str: str) -> datetime.datetime:
    """Parses CR API time format: YYYYMMDDTHHMMSS.000Z"""
    # Fix formatting to be ISO compliant for Python
    clean_time = time_str.replace("Z", "+00:00")
    # Convert '20231115T100000.000+00:00' -> '2023-11-15T10:00:00.000+00:00'
    # Simple strategy: reformat string to ISO before parsing
    iso_format = f"{clean_time[:4]}-{clean_time[4:6]}-{clean_time[6:8]}T{clean_time[9:11]}:{clean_time[11:13]}:{clean_time[13:]}"
    return datetime.datetime.fromisoformat(iso_format)

# --- Endpoints ---

@app.post("/users/", response_model=schemas.UserResponse)
def create_user(user: schemas.UserCreate, db: Session = Depends(database.get_db)):
    db_user = crud.get_user_by_tag(db, player_tag=user.player_tag)
    if db_user:
        return db_user # Return existing user if already registered
    return crud.create_user(db=db, user=user)

@app.get("/players/{player_tag}/matches", response_model=List[schemas.MatchResponse])
def read_matches(player_tag: str, db: Session = Depends(database.get_db)):
    """Fetch history for a player (checking both P1 and P2 slots)"""
    # Ensure tag has #
    if not player_tag.startswith("#"):
        player_tag = f"#{player_tag}"
    return crud.get_matches_for_player(db, player_tag=player_tag)

@app.post("/sync/{player_tag}")
def sync_player_battles(player_tag: str, db: Session = Depends(database.get_db)):
    """
    1. Fetches official battle log from Clash Royale API.
    2. Transforms data to our schema.
    3. Deduplicates and saves to DB.
    """
    if not player_tag.startswith("%23") and not player_tag.startswith("#"):
        # For API URL, # must be encoded as %23, but requests handles encoding often.
        # However, safe bet is to pass clean tag.
        pass
    
    clean_tag = player_tag.replace("#", "")
    url = f"https://api.clashroyale.com/v1/players/%23{clean_tag}/battlelog"
    
    headers = {"Authorization": f"Bearer {CR_API_KEY}"}
    response = requests.get(url, headers=headers)
    
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Failed to fetch from CR API")
    
    battles = response.json()
    matches_to_insert = []

    for battle in battles:
        # We only track PvP modes usually, but let's grab everything
        if battle['type'] == 'PvP' or battle['type'] == 'pathOfLegend': 
             # Generate Unique ID
            b_time_str = battle['battleTime']
            b_id = generate_battle_id(b_time_str, f"#{clean_tag}")
            
            # Determine who is who (API response is relative to the requested player)
            # 'team' is the requested player, 'opponent' is the enemy
            p1_tag = battle['team'][0]['tag']
            p2_tag = battle['opponent'][0]['tag']
            
            # Helper to calculate winner
            p1_crowns = battle['team'][0]['crowns']
            p2_crowns = battle['opponent'][0]['crowns']
            
            winner = None
            if p1_crowns > p2_crowns:
                winner = p1_tag
            elif p2_crowns > p1_crowns:
                winner = p2_tag

            match_data = {
                "battle_id": b_id,
                "player_1_tag": p1_tag,
                "player_2_tag": p2_tag,
                "winner_tag": winner,
                "battle_time": parse_cr_time(b_time_str),
                "game_mode": battle['gameMode']['name'],
                "crowns_1": p1_crowns,
                "crowns_2": p2_crowns
            }
            matches_to_insert.append(match_data)

    # Bulk Insert
    crud.upsert_matches(db, matches_to_insert)
    
    return {"status": "success", "matches_synced": len(matches_to_insert)}