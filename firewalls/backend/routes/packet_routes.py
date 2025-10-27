"""
Packet simulation endpoints
"""
from flask import Blueprint, request, jsonify
from services.packet_parser import parse_packet
from services.firewall_engine import evaluate_packet
from services.simulator import PacketSimulator
from utils.response import success_response, error_response

packet_bp = Blueprint("packet_bp", __name__)

# Singleton simulator instance
simulator = PacketSimulator(interval=2.0)

@packet_bp.before_request
def handle_packet_options():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
        return response

@packet_bp.route("/simulate", methods=["POST"])
def simulate_packet():
    """Simulate single packet traversal through firewall"""
    data = request.get_json()
    if not data:
        return error_response("Missing JSON body", 400)

    parsed = parse_packet(data)
    # parse_packet returns dict OR Flask Response tuple on error
    if isinstance(parsed, tuple):
        return parsed

    decision, reason = evaluate_packet(parsed)
    return success_response(
        f"Packet {decision.lower()}ed successfully",
        {"decision": decision, "reason": reason, "packet": parsed},
    )

@packet_bp.route("/simulate-stream", methods=["POST"])
def start_simulation():
    """Start mock packet simulation stream"""
    try:
        message = simulator.start()
        return success_response(message)
    except Exception as e:
        return error_response(f"Failed to start simulation: {str(e)}", 500)

@packet_bp.route("/simulate-stop", methods=["POST"])
def stop_simulation():
    """Stop packet simulation stream"""
    try:
        message = simulator.stop()
        return success_response(message)
    except Exception as e:
        return error_response(f"Failed to stop simulation: {str(e)}", 500)

@packet_bp.route("/simulation-status", methods=["GET"])
def simulation_status():
    """Get current simulation status"""
    try:
        status = simulator.get_status()
        return success_response("Simulation status retrieved", status)
    except Exception as e:
        return error_response(f"Failed to get simulation status: {str(e)}", 500)