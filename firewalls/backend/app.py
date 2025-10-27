"""
FirewallX Backend Entry
Author: Edwin Bwambale
"""

from flask import Flask, jsonify
from flask_cors import CORS
from utils.db import init_db
from routes import register_routes
import os

# Optional import: WebSocket setup
try:
    from services.websocket_service import init_websocket, sock
    WEBSOCKET_ENABLED = True
except ImportError:
    sock = None
    init_websocket = None
    WEBSOCKET_ENABLED = False

def create_app():
    app = Flask(__name__)
    app.config.from_object("config.Config")
    app.url_map.strict_slashes = False
    
    # ✅ SIMPLIFIED CORS - Let Flask-CORS handle everything
    CORS(app,
        resources={r"/*": {"origins": [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://semester-projects.onrender.com",
            "https://semester-projects.vercel.app",
            "https://semester-projects-*.vercel.app"
        ]}},
    expose_headers=["Content-Type", "Authorization"],
    allow_headers=["Content-Type", "Authorization"],
    supports_credentials=True)


    
    init_db(app)
    register_routes(app)

    # Initialize WebSocket if available
    if WEBSOCKET_ENABLED and init_websocket:
        init_websocket(app)

    @app.route("/", methods=["GET"])
    def index():
        return jsonify({
            "message": "🔥 FirewallX backend is running!",
            "websocket_enabled": WEBSOCKET_ENABLED
        }), 200

    return app

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app = create_app()

    print(f"🚀 FirewallX Backend starting on port {port}")
    if WEBSOCKET_ENABLED:
        print("📡 Native WebSocket enabled on /ws")

    # ✅ Use Hypercorn if available for WebSocket support
    try:
        from hypercorn.asyncio import serve
        from hypercorn.config import Config
        import asyncio

        config = Config()
        config.bind = [f"0.0.0.0:{port}"]
        print("🌀 Running via Hypercorn (WebSocket-capable)...")

        asyncio.run(serve(app, config))
    except ImportError:
        print("⚠️ Hypercorn not installed, falling back to Flask dev server (no WebSocket support).")
        app.run(host="0.0.0.0", port=port, debug=True)
