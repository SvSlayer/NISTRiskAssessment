# backend/app.py
import os
from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import func, case
from flask_bcrypt import Bcrypt
from flask_migrate import Migrate
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, JWTManager

load_dotenv()

app = Flask(__name__)
CORS(app) 
bcrypt = Bcrypt(app)

# --- Konfigurasi ---
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'postgresql://postgres:Indomie1@localhost:5432/assessment')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY")

jwt = JWTManager(app)
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# --- Perintah CLI ---
@app.cli.command("init-db")
def init_db_command():
    with app.app_context():
        db.create_all()
    print("Initialized the database.")

# --- Model Database ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    role = db.Column(db.String(80), nullable=False, default='user')

    def set_password(self, password):
        self.password_hash = bcrypt.generate_password_hash(password).decode('utf8')
    def check_password(self, password):
        return bcrypt.check_password_hash(self.password_hash, password)

class RiskGroup(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    user = db.relationship('User', backref=db.backref('risk_groups', lazy=True))
    def to_dict(self):
        return {"id": self.id, "name": self.name, "user_id": self.user_id}

class Risk(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    asset_name = db.Column(db.String(100), nullable=False)
    risk_level = db.Column(db.String(50), nullable=False)
    impact = db.Column(db.String(50), nullable=False)
    likelihood = db.Column(db.String(50), nullable=False)
    mitigation_plan = db.Column(db.Text, nullable=True)
    group_id = db.Column(db.Integer, db.ForeignKey('risk_group.id'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    group = db.relationship('RiskGroup', backref=db.backref('risks', lazy=True))
    user = db.relationship('User', backref=db.backref('risks', lazy=True))
    def to_dict(self):
        return { "id": self.id, "asset_name": self.asset_name, "risk_level": self.risk_level, "impact": self.impact, "likelihood": self.likelihood, "mitigation_plan": self.mitigation_plan, "group": self.group.to_dict() if self.group else None, "user_id": self.user_id }

# --- Endpoint API ---
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data or not data.get('email') or not data.get('password'):
        return jsonify({"message": "Email and password are required"}), 400
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"message": "User with this email already exists"}), 409
    new_user = User(email=data['email'])
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"message": "User registered successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data.get('email')).first()
    if user and user.check_password(data.get('password')):
        access_token = create_access_token(identity={"id": user.id, "role": user.role})
        return jsonify(access_token=access_token, user={"id": user.id, "email": user.email, "role": user.role})
    return jsonify({"message": "Invalid credentials"}), 401

@app.route('/api/risk_groups', methods=['GET'])
@jwt_required()
def get_risk_groups():
    current_user = get_jwt_identity()
    if current_user['role'] == 'admin':
        groups = RiskGroup.query.all()
    else:
        groups = RiskGroup.query.filter_by(user_id=current_user['id']).all()
    return jsonify([group.to_dict() for group in groups])

@app.route('/api/risk_groups', methods=['POST'])
@jwt_required()
def create_risk_group():
    current_user_id = get_jwt_identity()['id']
    data = request.get_json()
    if not data or not data.get('name'):
        return jsonify({"message": "Group name is required"}), 400
    new_group = RiskGroup(name=data['name'], user_id=current_user_id)
    db.session.add(new_group)
    db.session.commit()
    return jsonify(new_group.to_dict()), 201

@app.route('/api/risk_groups/<int:group_id>', methods=['GET'])
@jwt_required()
def get_risk_group_details(group_id):
    current_user = get_jwt_identity()
    group = RiskGroup.query.get_or_404(group_id)
    if group.user_id != current_user['id'] and current_user['role'] != 'admin':
        return jsonify({"message": "Forbidden"}), 403
    return jsonify(group.to_dict())

@app.route('/api/risk_groups/<int:group_id>/risks', methods=['GET'])
@jwt_required()
def get_risks_for_group(group_id):
    current_user = get_jwt_identity()
    group = RiskGroup.query.get_or_404(group_id)
    if group.user_id != current_user['id'] and current_user['role'] != 'admin':
        return jsonify({"message": "Forbidden"}), 403
    risks = [risk.to_dict() for risk in group.risks]
    return jsonify(risks)

@app.route('/api/risks', methods=['GET'])
@jwt_required()
def get_risks():
    current_user = get_jwt_identity()
    if current_user['role'] == 'admin':
        all_risks = Risk.query.all()
    else:
        all_risks = Risk.query.filter_by(user_id=current_user['id']).all()
    results = [risk.to_dict() for risk in all_risks]
    return jsonify(results)

@app.route('/api/risks', methods=['POST'])
@jwt_required()
def add_risk():
    current_user_id = get_jwt_identity()['id']
    data = request.get_json()
    if not all(key in data for key in ['asset_name', 'group_id']):
        return jsonify({"message": "Asset name and group ID are required"}), 400
    new_risk = Risk(
        asset_name=data['asset_name'],
        risk_level=data.get('risk_level', 'Low'),
        impact=data.get('impact', 'Low'),
        likelihood=data.get('likelihood', 'Low'),
        mitigation_plan=data.get('mitigation_plan'),
        group_id=data['group_id'],
        user_id=current_user_id
    )
    db.session.add(new_risk)
    db.session.commit()
    return jsonify(new_risk.to_dict()), 201

@app.route('/api/risks/<int:risk_id>', methods=['GET'])
@jwt_required()
def get_risk(risk_id):
    current_user = get_jwt_identity()
    risk = Risk.query.get_or_404(risk_id)
    if risk.user_id != current_user['id'] and current_user['role'] != 'admin':
        return jsonify({"message": "Forbidden"}), 403
    return jsonify(risk.to_dict())

@app.route('/api/risks/<int:risk_id>', methods=['PUT'])
@jwt_required()
def update_risk(risk_id):
    current_user = get_jwt_identity()
    risk = Risk.query.get_or_404(risk_id)
    if risk.user_id != current_user['id'] and current_user['role'] != 'admin':
        return jsonify({"message": "Forbidden"}), 403
    data = request.get_json()
    risk.asset_name = data.get('asset_name', risk.asset_name)
    risk.risk_level = data.get('risk_level', risk.risk_level)
    risk.impact = data.get('impact', risk.impact)
    risk.likelihood = data.get('likelihood', risk.likelihood)
    risk.mitigation_plan = data.get('mitigation_plan', risk.mitigation_plan)
    risk.group_id = data.get('group_id', risk.group_id)
    db.session.commit()
    return jsonify(risk.to_dict())

@app.route('/api/risks/<int:risk_id>', methods=['DELETE'])
@jwt_required()
def delete_risk(risk_id):
    current_user = get_jwt_identity()
    risk = Risk.query.get_or_404(risk_id)
    if risk.user_id != current_user['id'] and current_user['role'] != 'admin':
        return jsonify({"message": "Forbidden"}), 403
    db.session.delete(risk)
    db.session.commit()
    return jsonify({"message": "Risk deleted successfully"})

@app.route('/api/risks/summary', methods=['GET'])
@jwt_required()
def get_risk_summary():
    current_user = get_jwt_identity()
    query = db.session.query(func.count(Risk.id))
    if current_user['role'] != 'admin':
        query = query.filter(Risk.user_id == current_user['id'])
    total_risks = query.scalar()
    high_risks = query.filter(Risk.risk_level == 'High').scalar()
    return jsonify({ "total_risks": total_risks, "high_risks": high_risks })

@app.route('/api/risks/stats', methods=['GET'])
@jwt_required()
def get_risk_stats():
    current_user = get_jwt_identity()
    query = db.session.query(Risk.risk_level, func.count(Risk.id))
    if current_user['role'] != 'admin':
        query = query.filter(Risk.user_id == current_user['id'])
    ordering = case((Risk.risk_level == 'Low', 1), (Risk.risk_level == 'Medium', 2), (Risk.risk_level == 'High', 3), else_=4)
    stats = query.group_by(Risk.risk_level).order_by(ordering).all()
    return jsonify({ "labels": [row[0] for row in stats], "data": [row[1] for row in stats] })

@app.route('/api/risks/stats_by_impact', methods=['GET'])
@jwt_required()
def get_risk_stats_by_impact():
    current_user = get_jwt_identity()
    query = db.session.query(Risk.impact, func.count(Risk.id))
    if current_user['role'] != 'admin':
        query = query.filter(Risk.user_id == current_user['id'])
    ordering = case((Risk.impact == 'Low', 1), (Risk.impact == 'Medium', 2), (Risk.impact == 'High', 3), else_=4)
    stats = query.group_by(Risk.impact).order_by(ordering).all()
    return jsonify({ "labels": [row[0] for row in stats], "data": [row[1] for row in stats] })

@app.route('/api/risk_groups/<int:group_id>/summary', methods=['GET'])
@jwt_required()
def get_group_summary(group_id):
    total = db.session.query(func.count(Risk.id)).filter(Risk.group_id == group_id).scalar()
    high = db.session.query(func.count(Risk.id)).filter(Risk.group_id == group_id, Risk.risk_level == 'High').scalar()
    return jsonify({"total_risks": total, "high_risks": high})

@app.route('/api/risk_groups/<int:group_id>/stats', methods=['GET'])
@jwt_required()
def get_group_stats_by_level(group_id):
    ordering = case((Risk.risk_level == 'Low', 1), (Risk.risk_level == 'Medium', 2), (Risk.risk_level == 'High', 3), else_=4)
    stats = db.session.query(Risk.risk_level, func.count(Risk.id)).filter(Risk.group_id == group_id).group_by(Risk.risk_level).order_by(ordering).all()
    return jsonify({"labels": [row[0] for row in stats], "data": [row[1] for row in stats]})

@app.route('/api/risk_groups/<int:group_id>/stats_by_impact', methods=['GET'])
@jwt_required()
def get_group_stats_by_impact(group_id):
    ordering = case((Risk.impact == 'Low', 1), (Risk.impact == 'Medium', 2), (Risk.impact == 'High', 3), else_=4)
    stats = db.session.query(Risk.impact, func.count(Risk.id)).filter(Risk.group_id == group_id).group_by(Risk.impact).order_by(ordering).all()
    return jsonify({"labels": [row[0] for row in stats], "data": [row[1] for row in stats]})

if __name__ == '__main__':
    app.run(debug=True)
