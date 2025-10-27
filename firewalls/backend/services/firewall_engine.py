"""
Firewall engine core logic
"""
from models.rule import Rule
from models.packet import Packet
from models.log import Log
from utils.db import db
from utils.logger import log_event


def evaluate_packet(packet_data):
    """
    Process an incoming packet through firewall rules
    Returns (decision, reason)
    """
    rules = Rule.query.order_by(Rule.id.asc()).all()

    for rule in rules:
        match_src = rule.src_ip in ["any", packet_data["src_ip"]]
        match_dest = rule.dest_ip in ["any", packet_data["dest_ip"]]
        match_port = rule.port in [None, packet_data["port"]]
        match_proto = rule.protocol in ["ANY", packet_data["protocol"]]

        if all([match_src, match_dest, match_port, match_proto]):
            decision = rule.action
            reason = f"Matched rule #{rule.id} ({rule.action})"
            save_result(packet_data, rule, decision, reason)
            return decision, reason

    # Default ALLOW if no rule matches
    decision = "ALLOW"
    reason = "No matching rule found"
    save_result(packet_data, None, decision, reason)
    return decision, reason


def save_result(packet_data, rule, decision, reason):
    """Store results in DB and logs."""
    pkt = Packet(
        src_ip=packet_data["src_ip"],
        dest_ip=packet_data["dest_ip"],
        port=packet_data["port"],
        protocol=packet_data["protocol"],
        status=decision,
    )
    db.session.add(pkt)
    db.session.commit()

    log_entry = Log(
        packet_id=pkt.id,
        rule_id=rule.id if rule else None,
        decision=decision,
        reason=reason,
    )
    db.session.add(log_entry)
    db.session.commit()

    log_event(f"Packet {pkt.id}: {decision} ({reason})")
