"""
Data Models package initializer
"""
from utils.db import db

# Import all models so that SQLAlchemy can register them
from .rule import Rule
from .packet import Packet
from .log import Log

__all__ = ["db", "Rule", "Packet", "Log"]

