# """
# Central configuration file
# """

import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent


# class Config:
#     SECRET_KEY = os.environ.get("SECRET_KEY", "dev_secret_firewallx")
#     DEBUG = os.environ.get("DEBUG", True)
#     TESTING = os.environ.get("TESTING", False)

#     # SQLite default (switchable to MySQL/Postgres later)
#     SQLALCHEMY_DATABASE_URI = (
#         os.environ.get("DATABASE_URL")
#         or f"sqlite:///{BASE_DIR}/firewallx.db"
#     )
#     SQLALCHEMY_TRACK_MODIFICATIONS = False
import os

class Config:
    """Application configuration"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'firewallx-dev-secret-key'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///firewallx.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    # ✅ FIXED: CORS settings
    CORS_HEADERS = 'Content-Type'
    CORS_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173']
    
    
    # SQLite default (switchable to MySQL/Postgres later)
    SQLALCHEMY_DATABASE_URI = (
        os.environ.get("DATABASE_URL")
        or f"sqlite:///{BASE_DIR}/firewallx.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False