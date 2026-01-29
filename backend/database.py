import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# 1. Load Database URL from environment
# We default to the docker service name 'db' if not found
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "postgresql://user:password@db:5432/cr_tracker"
)

# 2. Configure the Engine
engine = create_engine(DATABASE_URL)

# 3. Create SessionLocal class for DB requests
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 4. Base class for our models
Base = declarative_base()

# 5. Dependency for FastAPI endpoints
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()