"""
Packet log retrieval endpoints
"""
from flask import Blueprint, request, jsonify
from models.log import Log
from utils.response import success_response

log_bp = Blueprint("log_bp", __name__)

@log_bp.before_request
def handle_log_options():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,OPTIONS')
        return response

@log_bp.route("/", methods=["GET"])
def get_logs():
    """Fetch recent packet processing logs"""
    logs = [l.to_dict() for l in Log.query.order_by(Log.timestamp.desc()).limit(50)]
    return success_response("Recent logs", logs)
