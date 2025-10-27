"""
Register blueprints
"""

from .packet_routes import packet_bp
from .rule_routes import rule_bp
from .log_routes import log_bp
from flask import jsonify

def register_routes(app):
    """
    Registers all API blueprints and global error handlers.
    Flask-CORS now automatically manages all preflight (OPTIONS) requests.
    """

    # ✅ Register Blueprints
    app.register_blueprint(packet_bp, url_prefix="/api/packets")
    app.register_blueprint(rule_bp, url_prefix="/api/rules")
    app.register_blueprint(log_bp, url_prefix="/api/logs")

    # ✅ Health check endpoint (no manual OPTIONS logic needed)
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({
            "status": "ok",
            "service": "FirewallX Backend"
        }), 200

    # ✅ Global 404 handler
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({
            "status": "error",
            "message": "Resource not found"
        }), 404
