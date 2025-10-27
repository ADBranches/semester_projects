"""
Native WebSocket service for real-time communication
Author: Edwin Bwambale
"""

from flask_sock import Sock
import threading
import time
import random
import json
from services.packet_parser import parse_packet
from services.firewall_engine import evaluate_packet
from models.log import Log
from models.packet import Packet
from utils.db import db

# -------------------------------------------------------------
# ✅ Global WebSocket setup
# -------------------------------------------------------------
sock = Sock()
connected_clients = set()
clients_lock = threading.Lock()

simulation_thread = None
simulation_running = False


def init_websocket(app):
    """
    Initialize WebSocket endpoint with the Flask app.
    Must be called from app.py inside create_app().
    """
    sock.init_app(app)
    print("📡 WebSocket initialized on /ws")
    return sock


# -------------------------------------------------------------
# ✅ Core WebSocket Route
# -------------------------------------------------------------
@sock.route("/ws")
def handle_websocket(ws):
    """Handle new WebSocket connection"""
    client_id = id(ws)
    with clients_lock:
        connected_clients.add(ws)
        client_count = len(connected_clients)

    print(f"📡 Client connected → Total clients: {client_count}")

    try:
        # Confirm connection
        ws.send(json.dumps({
            "type": "connected",
            "message": "Connected to FirewallX WebSocket",
            "clients": client_count
        }))

        # Main receive loop
        while True:
            data = ws.receive()
            if data is None:
                break  # connection closed gracefully

            try:
                payload = json.loads(data)
                handle_websocket_message(ws, payload)
            except json.JSONDecodeError:
                print("❌ Invalid JSON from client")

    except Exception as e:
        print(f"❌ WebSocket error: {e}")

    finally:
        with clients_lock:
            connected_clients.discard(ws)
            client_count = len(connected_clients)
        print(f"🔌 Client disconnected → Remaining clients: {client_count}")


# -------------------------------------------------------------
# ✅ Message Dispatch
# -------------------------------------------------------------
def handle_websocket_message(ws, data):
    """Dispatch messages based on type"""
    event_type = data.get("type")

    if event_type == "simulate_packet":
        handle_simulate_packet(data.get("data", {}), ws)
    elif event_type == "start_simulation":
        handle_start_simulation()
    elif event_type == "stop_simulation":
        handle_stop_simulation()
    elif event_type == "ping_test":
        send_to_client(ws, {"type": "pong_test", "message": "pong"})
    else:
        send_to_client(ws, {"type": "error", "message": "Unknown event type"})


# -------------------------------------------------------------
# ✅ Packet Simulation Logic
# -------------------------------------------------------------
def handle_simulate_packet(packet_data, ws=None):
    """Simulate evaluation of a single packet"""
    try:
        print(f"📦 Simulating packet: {packet_data}")
        parsed = parse_packet(packet_data)
        if isinstance(parsed, tuple):
            send_to_client(ws, {"type": "error", "message": parsed[0].get_json()["message"]})
            return

        decision, reason = evaluate_packet(parsed)

        # Save to DB
        packet = Packet(
            src_ip=parsed["src_ip"],
            dest_ip=parsed["dest_ip"],
            port=parsed["port"],
            protocol=parsed["protocol"],
            status=decision
        )
        db.session.add(packet)
        db.session.flush()

        log = Log(
            packet_id=packet.id,
            decision=decision,
            reason=reason,
            rule_id=None
        )
        db.session.add(log)
        db.session.commit()

        result_data = {
            "type": "PACKET_RESULT",
            "packet": {
                "id": packet.id,
                "src_ip": packet.src_ip,
                "dest_ip": packet.dest_ip,
                "port": packet.port,
                "protocol": packet.protocol,
                "timestamp": packet.timestamp.isoformat()
            },
            "log": {
                "id": log.id,
                "packet_id": log.packet_id,
                "decision": log.decision,
                "reason": log.reason,
                "rule_id": log.rule_id,
                "timestamp": log.timestamp.isoformat()
            }
        }

        print(f"📊 Packet decision → {decision}: {reason}")
        broadcast_message(result_data)

    except Exception as e:
        print(f"❌ Packet simulation error: {str(e)}")
        send_to_client(ws, {"type": "error", "message": str(e)})


# -------------------------------------------------------------
# ✅ Simulation Controls
# -------------------------------------------------------------
def handle_start_simulation():
    global simulation_running
    if not simulation_running:
        simulation_running = True
        start_mock_simulation()
        broadcast_message({
            "type": "simulation_status",
            "status": "started",
            "message": "Simulation started"
        })


def handle_stop_simulation():
    global simulation_running
    simulation_running = False
    broadcast_message({
        "type": "simulation_status",
        "status": "stopped",
        "message": "Simulation stopped"
    })


def simulation_loop():
    """Background random packet generator"""
    protocols = ["TCP", "UDP", "ICMP"]
    while simulation_running:
        time.sleep(2)
        packet = {
            "src_ip": f"192.168.1.{random.randint(1, 254)}",
            "dest_ip": f"10.0.0.{random.randint(1, 254)}",
            "port": random.choice([22, 53, 80, 443, 8080]),
            "protocol": random.choice(protocols),
        }
        handle_simulate_packet(packet)


def start_mock_simulation():
    """Launch the background simulation thread"""
    global simulation_thread
    if simulation_thread and simulation_thread.is_alive():
        return
    simulation_thread = threading.Thread(target=simulation_loop, daemon=True)
    simulation_thread.start()
    print("🚀 Mock packet simulation started")


# -------------------------------------------------------------
# ✅ Broadcast + Client Messaging Helpers
# -------------------------------------------------------------
def broadcast_message(message):
    """Send message to all connected clients safely"""
    message_json = json.dumps(message)
    disconnected = []

    with clients_lock:
        for client in list(connected_clients):
            try:
                client.send(message_json)
            except Exception:
                disconnected.append(client)

        for dead in disconnected:
            connected_clients.discard(dead)


def send_to_client(client, message):
    """Send message to a specific WebSocket client"""
    if not client:
        return
    try:
        client.send(json.dumps(message))
    except Exception:
        pass
