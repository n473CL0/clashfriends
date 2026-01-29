from sqlalchemy.orm import Session
from sqlalchemy import or_, desc
from sqlalchemy.dialects.postgresql import insert as pg_insert
import models, schemas

# --- User Logic ---
def get_user_by_tag(db: Session, player_tag: str):
    return db.query(models.User).filter(models.User.player_tag == player_tag).first()

def create_user(db: Session, user: schemas.UserCreate):
    # Ensure tag is formatted correctly (uppercase, starts with #)
    formatted_tag = user.player_tag.upper()
    if not formatted_tag.startswith("#"):
        formatted_tag = f"#{formatted_tag}"
    
    db_user = models.User(username=user.username, player_tag=formatted_tag)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Match Logic ---
def get_matches_for_player(db: Session, player_tag: str, limit: int = 50):
    """
    Optimized query to find matches where the player was EITHER 
    player_1 OR player_2, sorted by most recent.
    """
    return db.query(models.Match).filter(
        or_(
            models.Match.player_1_tag == player_tag,
            models.Match.player_2_tag == player_tag
        )
    ).order_by(desc(models.Match.battle_time)).limit(limit).all()

def upsert_matches(db: Session, matches_data: list[dict]):
    """
    Bulk insert matches. Ignores duplicates based on the 'battle_id' 
    unique constraint using PostgreSQL's ON CONFLICT DO NOTHING.
    """
    if not matches_data:
        return

    stmt = pg_insert(models.Match).values(matches_data)
    
    # Define what to do on conflict (duplicate battle_id): do nothing
    do_nothing_stmt = stmt.on_conflict_do_nothing(
        index_elements=['battle_id']
    )
    
    db.execute(do_nothing_stmt)
    db.commit()