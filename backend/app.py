from flask import Flask, request, jsonify, make_response
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from os import environ

app = Flask(__name__)

# --- CONFIGURATION ---
# 1. Enable CORS completely so Next.js (port 3000) can talk to Flask (port 5000)
CORS(app) 

# 2. Add a fallback local SQLite database file if DATABASE_URL doesn't exist
app.config['SQLALCHEMY_DATABASE_URI'] = environ.get('DATABASE_URL') or 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# --- DATABASE MODEL ---
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    # Changed unique=False so testing multiple names/emails doesn't trigger a strict database block
    email = db.Column(db.String(120), unique=False, nullable=False) 

    def json(self):
        return {'id': self.id, 'name': self.name, 'email': self.email}

# Initialize and create local database file inside app context
with app.app_context():
    db.create_all()

# --- ROUTES ---

# Test Route
@app.route('/test', methods=['GET'])
def test():
    return jsonify({'message': 'The server is running perfectly'})

# 1. CREATE USER (POST)
@app.route('/api/flask/users', methods=['POST'])
def create_user():
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'email' not in data:
            return make_response(jsonify({'message': 'Missing name or email fields'}), 400)

        new_user = User(name=data['name'], email=data['email'])
        db.session.add(new_user)
        db.session.commit()
        
        # Matches frontend expectations exactly
        return make_response(jsonify(new_user.json()), 201)
    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({'message': 'error creating user', 'error': str(e)}), 500)

# 2. GET ALL USERS (GET)
@app.route('/api/flask/users', methods=['GET'])
def get_users():
    try:
        users = User.query.all()
        users_data = [user.json() for user in users]
        return jsonify(users_data), 200
    except Exception as e:
        return make_response(jsonify({'message': 'error getting users', 'error': str(e)}), 500)

# 3. UPDATE USER (PUT)
@app.route('/api/flask/users/<int:id>', methods=['PUT'])
def update_user(id):
    try:
        user = User.query.get(id)
        if user:
            data = request.get_json()
            user.name = data.get('name', user.name)
            user.email = data.get('email', user.email)
            db.session.commit()
            
            # CRITICAL FRONTEND FIX: Returns the updated object profile structure back to Axios
            return make_response(jsonify(user.json()), 200)
        return make_response(jsonify({'message': 'user not found'}), 404)
    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({'message': 'error updating user', 'error': str(e)}), 500)

# 4. DELETE USER (DELETE)
@app.route('/api/flask/users/<int:id>', methods=['DELETE'])
def delete_user(id):
    try:
        user = User.query.get(id)
        if user:
            db.session.delete(user)
            db.session.commit()
            return make_response(jsonify({'message': 'user deleted'}), 200)
        return make_response(jsonify({'message': 'user not found'}), 404)
    except Exception as e:
        db.session.rollback()
        return make_response(jsonify({'message': 'error deleting user', 'error': str(e)}), 500)

# Force Flask to run on Port 5000 explicitly
if __name__ == '__main__':
    app.run(port=5000, debug=True)