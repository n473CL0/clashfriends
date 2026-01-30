from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, UniqueConstraint, CheckConstraint, Index, Boolean
from sqlalchemy.orm import relationship
from database import Base
import datetime

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), nullable=False)
    player_tag = Column(String(15), unique=True, nullable=True, index=True)
    
    # Auth Fields (These were missing, causing your error)
    email = Column(String(255), unique=True, index=True, nullable=True)
    hashed_password = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)

    # Relationships
    invites_created = relationship("Invite", back_populates="creator")

class Invite(Base):
    __tablename__ = "invites"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(64), unique=True, nullable=False, index=True)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    expires_at = Column(DateTime(timezone=True), nullable=True)
    max_uses = Column(Integer, default=1)
    used_count = Column(Integer, default=0)

    creator = relationship("User", back_populates="invites_created")

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
    battle_id = Column(String(50), unique=True, nullable=False)
    
    player_1_tag = Column(String(15), ForeignKey("users.player_tag"), nullable=False)
    player_2_tag = Column(String(15), ForeignKey("users.player_tag"), nullable=False)
    
    winner_tag = Column(String(15))
    battle_time = Column(DateTime(timezone=True), nullable=False)
    game_mode = Column(String(50))
    crowns_1 = Column(Integer, default=0)
    crowns_2 = Column(Integer, default=0)

    __table_args__ = (
        Index('idx_matches_player_1', 'player_1_tag', 'player_2_tag'),
        Index('idx_matches_player_2', 'player_2_tag'),
        Index('idx_matches_time', 'battle_time'),
    )