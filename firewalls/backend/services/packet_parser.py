"""
Service to parse and validate packet data
"""
import re
from utils.response import error_response


def validate_ip(ip: str):
    """Basic IPv4 validation."""
    pattern = re.compile(r"^(any|(\d{1,3}\.){3}\d{1,3})$")
    return bool(pattern.match(ip))


def parse_packet(data: dict):
    """Validate incoming packet JSON payload."""
    required = ["src_ip", "dest_ip", "port", "protocol"]

    for key in required:
        if key not in data:
            return error_response(f"Missing required field '{key}'", 400)

    if not validate_ip(data["src_ip"]) or not validate_ip(data["dest_ip"]):
        return error_response("Invalid IP address format", 400)

    try:
        port = int(data["port"])
        if port < 0 or port > 65535:
            return error_response("Invalid port range (0–65535)", 400)
    except ValueError:
        return error_response("Port must be an integer", 400)

    protocol = data["protocol"].upper()
    if protocol not in ["TCP", "UDP", "ICMP", "ANY"]:
        return error_response("Unsupported protocol", 400)

    # Normalize packet structure
    packet = {
        "src_ip": data["src_ip"],
        "dest_ip": data["dest_ip"],
        "port": port,
        "protocol": protocol,
    }
    return packet
