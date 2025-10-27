"""
Real-time packet simulation service (Flask + WebSocket safe)
Author: Edwin Bwambale
"""

import threading
import time
import random
from datetime import datetime
from flask import current_app, request, jsonify
from utils.db import db

# Optional import for emitting to WebSocket clients (if you use socketio)
try:
    from services.websocket_service import socketio
except ImportError:
    socketio = None


class PacketSimulator:
    
    def __init__(self, interval=2.0):
        self.interval = interval
        self.is_running = False
        self.thread = None
        self.packet_count = 0

    def start(self):
        """Start the packet simulation"""
        if self.is_running:
            return "Simulation already running"

        self.is_running = True
        self.thread = threading.Thread(target=self._simulation_loop, daemon=True)
        self.thread.start()
        return f"Simulation started with {self.interval}s interval"

    def stop(self):
        """Stop the packet simulation"""
        if not self.is_running:
            return "Simulation not running"

        self.is_running = False
        if self.thread:
            self.thread.join(timeout=1.0)
        return "Simulation stopped"

    def get_status(self):
        """Get simulation status"""
        return {
            "is_running": self.is_running,
            "interval": self.interval,
            "packet_count": self.packet_count,
        }

    def _simulation_loop(self):
        """Main simulation loop (runs inside Flask app_context)"""
        protocols = ["TCP", "UDP", "ICMP"]

        # ✅ Capture the actual Flask app instance
        try:
            app = current_app
        except RuntimeError:
            app = None

        while self.is_running:
            # Generate random packet data
            packet = {
                "src_ip": f"192.168.1.{random.randint(1, 254)}",
                "dest_ip": f"10.0.0.{random.randint(1, 254)}",
                "port": random.choice([80, 443, 22, 53, 8080]),
                "protocol": random.choice(protocols),
                "timestamp": datetime.utcnow().isoformat(),
            }

            if app:
                with app.app_context():
                    print(f"📦 Simulating packet: {packet}")
                    if socketio:
                        socketio.emit("PACKET_RESULT", {"packet": packet})
            else:
                print(f"📦 [No Flask Context] Simulated packet: {packet}")

            self.packet_count += 1
            time.sleep(self.interval)


    def generate_mock_packet(self):
        """Generate a realistic mock packet for simulation"""
        return {
            "src_ip": f"192.168.1.{random.randint(1, 254)}",
            "dest_ip": f"10.0.0.{random.randint(1, 254)}",
            "port": random.choice([80, 443, 22, 53, 8080]),
            "protocol": random.choice(["TCP", "UDP", "ICMP"]),
            "timestamp": datetime.utcnow().isoformat(),
        }
