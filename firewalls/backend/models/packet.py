"""
Network Packet model
"""
from datetime import datetime
from utils.db import db


class Packet(db.Model):
    __tablename__ = "packets"

    id = db.Column(db.Integer, primary_key=True)
    src_ip = db.Column(db.String(64))
    dest_ip = db.Column(db.String(64))
    port = db.Column(db.Integer)
    protocol = db.Column(db.String(16))
    status = db.Column(db.String(10))  # ALLOWED / BLOCKED
    processed_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "src_ip": self.src_ip,
            "dest_ip": self.dest_ip,
            "port": self.port,
            "protocol": self.protocol,
            "status": self.status,
            "processed_at": self.processed_at.isoformat(),
        }

    def __init__(self, src_ip, dest_ip, port, protocol, status):
        self.src_ip = src_ip
        self.dest_ip = dest_ip
        self.port = port
        self.protocol = protocol
        self.status = status