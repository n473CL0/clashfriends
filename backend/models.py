from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, CheckConstraint, Index
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), nullable=False)
    player_tag = Column(String(15), unique=True, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

class Friendship(Base):
    __tablename__ = "friendships"

    id = Column(Integer, primary_key=True, index=True)
    user_id_1 = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    user_id_2 = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

    __table_args__ = (
        UniqueConstraint('user_id_1', 'user_id_2', name='unique_friendship'),
        CheckConstraint('user_id_1 != user_id_2', name='no_self_friending'),
        Index('idx_friendships_user_2', 'user_id_2'),
    )

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    # The unique hash used for deduplication
    battle_id = Column(String(50), unique=True, nullable=False)
    
    player_1_tag = Column(String(15), nullable=False)
    player_2_tag = Column(String(15), nullable=False)
    winner_tag = Column(String(15))
    
    battle_time = Column(DateTime(timezone=True), nullable=False)
    game_mode = Column(String(50))
    crowns_1 = Column(Integer, default=0)
    crowns_2 = Column(Integer, default=0)

    __table_args__ = (
        # Composite index for fast H2H lookup
        Index('idx_matches_player_1', 'player_1_tag', 'player_2_tag'),
        # Index for "My Matches"
        Index('idx_matches_player_2', 'player_2_tag'),
        # Index for chronological sorting
        Index('idx_matches_time', 'battle_time'), # Note: .desc() is handled in queries
    )