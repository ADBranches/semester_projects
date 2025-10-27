"""
Firewall rule management endpoints
"""
from flask import Blueprint, request, jsonify
from models.rule import Rule
from utils.db import db
from utils.response import success_response, error_response

rule_bp = Blueprint("rule_bp", __name__)

@rule_bp.before_request
def handle_rule_options():
    if request.method == 'OPTIONS':
        response = jsonify({'status': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', 'http://localhost:5173')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
        response.headers.add('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS')
        return response

@rule_bp.route("/", methods=["GET"])
def get_rules():
    rules = [r.to_dict() for r in Rule.query.all()]
    return success_response("Rules retrieved", rules)

@rule_bp.route("/", methods=["POST"])
def create_rule():
    data = request.get_json()
    if not data:
        return error_response("Missing JSON body", 400)

    try:
        rule = Rule(
            src_ip=data.get("src_ip", "any"),
            dest_ip=data.get("dest_ip", "any"),
            port=data.get("port"),
            protocol=data.get("protocol", "ANY").upper(),
            action=data.get("action", "ALLOW").upper(),
            description=data.get("description", ""),
        )
        db.session.add(rule)
        db.session.commit()
        return success_response("Rule created successfully", rule.to_dict(), 201)
    except Exception as e:
        db.session.rollback()
        return error_response("Failed to create rule", 500, e)

@rule_bp.route("/<int:id>", methods=["DELETE"])
def delete_rule(id):
    rule = Rule.query.get(id)
    if not rule:
        return error_response("Rule not found", 404)

    db.session.delete(rule)
    db.session.commit()
    return success_response(f"Rule #{id} deleted")
