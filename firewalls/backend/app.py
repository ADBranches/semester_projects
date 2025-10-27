"""
FirewallX Backend Entry
Author: Edwin Bwambale
"""

from flask import Flask, jsonify
from flask_cors import CORS
from utils.db import init_db
from routes import register_routes
import os

# ---------------------------------------------------------------------
# ✅ Optional: WebSocket imports (not required for basic API)
# ---------------------------------------------------------------------
try:
    from services.websocket_service import init_websocket, sock
    WEBSOCKET_ENABLED = True
except ImportError:
    sock = None
    init_websocket = None
    WEBSOCKET_ENABLED = False


def create_app():
    """Application factory for FirewallX backend."""
    app = Flask(__name__)
    app.config.from_object("config.Config")
    app.url_map.strict_slashes = False

    # -----------------------------------------------------------------
    # ✅ FLASK-CORS CONFIGURATION
    # Allow Render + Vercel + local origins
    # -----------------------------------------------------------------
    allowed_origins = [
        "https://frontend-lsqi.onrender.com",
        "https://semester-projects.onrender.com",
        "https://semester-projects.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]

    CORS(
        app,
        resources={r"/*": {"origins": allowed_origins}},
        supports_credentials=True,
        expose_headers=["Content-Type", "Authorization"],
        allow_headers=["Content-Type", "Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    )

    # -----------------------------------------------------------------
    # ✅ Initialize app modules
    # -----------------------------------------------------------------
    init_db(app)
    register_routes(app)

    if WEBSOCKET_ENABLED and init_websocket:
        init_websocket(app)

    # -----------------------------------------------------------------
    # ✅ Health endpoint
    # -----------------------------------------------------------------
    @app.route("/", methods=["GET"])
    def index():
        return jsonify({
            "message": "🔥 FirewallX backend is running!",
            "websocket_enabled": WEBSOCKET_ENABLED
        }), 200

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({
            "service": "FirewallX Backend",
            "status": "ok"
        }), 200

    return app


# ---------------------------------------------------------------------
# ✅ ENTRY POINT
# ---------------------------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app = create_app()

    print(f"🚀 FirewallX Backend starting on port {port}")
    if WEBSOCKET_ENABLED:
        print("📡 Native WebSocket enabled on /ws")

    # ✅ Run with Hypercorn for async/WebSocket support
    try:
        from hypercorn.asyncio import serve
        from hypercorn.config import Config
        import asyncio

        config = Config()
        config.bind = [f"0.0.0.0:{port}"]
        print("🌀 Running via Hypercorn (WebSocket-capable)...")

        asyncio.run(serve(app, config))
    except ImportError:
        print("⚠️ Hypercorn not installed, running Flask dev server instead.")
        app.run(host="0.0.0.0", port=port, debug=True)
