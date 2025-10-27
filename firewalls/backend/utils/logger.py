"""
Lightweight logging utility
"""
import os
from datetime import datetime

LOG_DIR = os.path.join(os.path.dirname(__file__), "../static/logs")
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, "firewallx.log")


def log_event(message: str):
    """Append timestamped log entries."""
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    with open(LOG_FILE, "a") as f:
        f.write(f"[{timestamp}] {message}\n")
