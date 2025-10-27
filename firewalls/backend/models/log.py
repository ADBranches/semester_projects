"""
Packet Log model
"""
from datetime import datetime
from utils.db import db


class Log(db.Model):
    __tablename__ = "logs"

    id = db.Column(db.Integer, primary_key=True)
    packet_id = db.Column(db.Integer, db.ForeignKey("packets.id"))
    rule_id = db.Column(db.Integer, db.ForeignKey("rules.id"), nullable=True)
    decision = db.Column(db.String(10))  # ALLOW / BLOCK
    reason = db.Column(db.String(255))
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "packet_id": self.packet_id,
            "rule_id": self.rule_id,
            "decision": self.decision,
            "reason": self.reason,
            "timestamp": self.timestamp.isoformat(),
        }

    def __init__(self, packet_id, decision, reason, rule_id=None):
        self.packet_id = packet_id
        self.decision = decision
        self.reason = reason
        self.rule_id = rule_id