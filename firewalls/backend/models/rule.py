"""
Firewall Rule model
"""
from datetime import datetime
from utils.db import db


class Rule(db.Model):
    __tablename__ = "rules"

    id = db.Column(db.Integer, primary_key=True)
    src_ip = db.Column(db.String(64), default="any")
    dest_ip = db.Column(db.String(64), default="any")
    port = db.Column(db.Integer, nullable=True)
    protocol = db.Column(db.String(16), default="ANY")
    action = db.Column(db.String(10), default="ALLOW")  # ALLOW or BLOCK
    description = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "src_ip": self.src_ip,
            "dest_ip": self.dest_ip,
            "port": self.port,
            "protocol": self.protocol,
            "action": self.action,
            "description": self.description,
            "created_at": self.created_at.isoformat(),
        }
