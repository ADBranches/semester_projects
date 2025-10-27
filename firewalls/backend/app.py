"""
FirewallX Backend Entry - PRODUCTION READY
Author: Edwin Bwambale
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from utils.db import init_db
from routes import register_routes
import os

# ---------------------------------------------------------------------
# ✅ Optional: WebSocket imports
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
    # ✅ CORS Configuration - MUST BE BEFORE ROUTES
    # -----------------------------------------------------------------
    allowed_origins = [
        "https://frontend-lsqi.onrender.com",
        "https://semester-projects.onrender.com", 
        "https://semester-projects.vercel.app",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ]
    
    # Allow additional origins from environment
    extra_origins = os.getenv("CORS_ORIGINS", "")
    if extra_origins:
        allowed_origins.extend([o.strip() for o in extra_origins.split(",")])
    
    print(f"🔐 CORS enabled for origins: {allowed_origins}")
    
    CORS(
        app,
        resources={
            r"/*": {
                "origins": allowed_origins,
                "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
                "allow_headers": ["Content-Type", "Authorization", "Accept", "X-Requested-With"],
                "expose_headers": ["Content-Type", "Authorization"],
                "supports_credentials": True,
                "max_age": 3600,
            }
        },
        send_wildcard=False,
        always_send=True,
    )
    
    # -----------------------------------------------------------------
    # ✅ Global OPTIONS handler for preflight requests
    # -----------------------------------------------------------------
    @app.before_request
    def handle_preflight():
        if request.method == "OPTIONS":
            origin = request.headers.get("Origin")
            
            # Validate origin
            if origin in allowed_origins:
                response = jsonify({"status": "ok"})
                response.headers["Access-Control-Allow-Origin"] = origin
                response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
                response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization, Accept"
                response.headers["Access-Control-Allow-Credentials"] = "true"
                response.headers["Access-Control-Max-Age"] = "3600"
                return response, 200
            else:
                return jsonify({"error": "Origin not allowed"}), 403
    
    # -----------------------------------------------------------------
    # ✅ Health Check Endpoints (before other routes)
    # -----------------------------------------------------------------
    @app.route("/", methods=["GET"])
    def root():
        return jsonify({
            "status": "success",
            "data": {
                "message": "🔥 FirewallX Backend API",
                "version": "1.0.0",
                "websocket_enabled": WEBSOCKET_ENABLED,
            }
        }), 200
    
    @app.route("/api/health", methods=["GET"])
    @app.route("/health", methods=["GET"])
    def health_check():
        return jsonify({
            "status": "success",
            "data": {
                "status": "online",
                "service": "FirewallX Backend",
                "websocket_enabled": WEBSOCKET_ENABLED,
                "cors_origins": len(allowed_origins),
            }
        }), 200
    
    # -----------------------------------------------------------------
    # ✅ Initialize Database & Routes
    # -----------------------------------------------------------------
    try:
        init_db(app)
        print("✅ Database initialized")
    except Exception as e:
        print(f"⚠️ Database initialization warning: {e}")
    
    try:
        register_routes(app)
        print("✅ Routes registered")
    except Exception as e:
        print(f"❌ Route registration failed: {e}")
        raise
    
    # -----------------------------------------------------------------
    # ✅ WebSocket Setup (if available)
    # -----------------------------------------------------------------
    if WEBSOCKET_ENABLED and init_websocket:
        try:
            init_websocket(app)
            print("✅ WebSocket initialized")
        except Exception as e:
            print(f"⚠️ WebSocket initialization failed: {e}")
    
    # -----------------------------------------------------------------
    # ✅ Error Handlers
    # -----------------------------------------------------------------
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            "status": "error",
            "message": "Endpoint not found",
            "path": request.path
        }), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "status": "error",
            "message": "Internal server error",
            "details": str(error) if app.debug else "Contact support"
        }), 500
    
    @app.errorhandler(Exception)
    def handle_exception(error):
        # Log the error
        print(f"❌ Unhandled error: {error}")
        
        return jsonify({
            "status": "error",
            "message": str(error) if app.debug else "An unexpected error occurred"
        }), 500
    
    # -----------------------------------------------------------------
    # ✅ Request/Response Logging (Debug Mode)
    # -----------------------------------------------------------------
    if app.debug:
        @app.after_request
        def log_response(response):
            print(f"📤 {request.method} {request.path} -> {response.status_code}")
            return response
    
    return app

# ---------------------------------------------------------------------
# ✅ ENTRY POINT
# ---------------------------------------------------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5001))
    app = create_app()
    
    print("=" * 70)
    print(f"🚀 FirewallX Backend starting on port {port}")
    print(f"📡 WebSocket: {'✅ Enabled' if WEBSOCKET_ENABLED else '❌ Disabled'}")
    print(f"🔧 Debug Mode: {app.debug}")
    print("=" * 70)
    
    # ✅ Production server selection
    if WEBSOCKET_ENABLED:
        try:
            from hypercorn.asyncio import serve
            from hypercorn.config import Config
            import asyncio
            
            config = Config()
            config.bind = [f"0.0.0.0:{port}"]
            print("🌀 Running via Hypercorn (WebSocket support)...")
            asyncio.run(serve(app, config))
            
        except ImportError:
            print("⚠️ Hypercorn not installed, using Flask dev server")
            app.run(host="0.0.0.0", port=port, debug=False)
    else:
        # Standard Flask for API-only
        app.run(host="0.0.0.0", port=port, debug=False)