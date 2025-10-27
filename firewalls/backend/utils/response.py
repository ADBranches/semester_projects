"""
Unified API response helper
"""

from flask import jsonify


def success_response(message: str, data=None, code=200):
    return jsonify({"status": "success", "message": message, "data": data}), code


def error_response(message: str, code=400, error=None):
    return (
        jsonify(
            {"status": "error", "message": message, "error": str(error) if error else None}
        ),
        code,
    )
