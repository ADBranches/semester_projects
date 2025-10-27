"""
Mock data utilities for simulating network traffic
"""
import random

# Common IP blocks for simulation
LOCAL_IPS = [
    "192.168.1.10", "192.168.1.22", "10.0.0.5", "10.0.0.8",
    "172.16.0.12", "192.168.0.15"
]

DEST_IPS = [
    "10.0.0.5", "10.0.0.6", "8.8.8.8", "142.250.190.14",
    "216.58.223.46", "10.1.0.9"
]

PROTOCOLS = ["TCP", "UDP", "ICMP"]

def generate_mock_packet():
    """Generate a single random packet."""
    src_ip = random.choice(LOCAL_IPS)
    dest_ip = random.choice(DEST_IPS)
    port = random.choice([22, 53, 80, 443, 8080, 3306])
    protocol = random.choice(PROTOCOLS)
    return {
        "src_ip": src_ip,
        "dest_ip": dest_ip,
        "port": port,
        "protocol": protocol,
    }

def generate_bulk_packets(n=10):
    """Generate multiple mock packets."""
    return [generate_mock_packet() for _ in range(n)]
