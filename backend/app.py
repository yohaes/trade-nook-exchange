
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import os
import uuid
from werkzeug.utils import secure_filename
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max upload

# Ensure upload directory exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Database initialization
def init_db():
    conn = sqlite3.connect('marketplace.db')
    cursor = conn.cursor()
    
    # Users table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT 0,
        is_banned BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Products table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        price REAL NOT NULL,
        image_url TEXT NOT NULL,
        category TEXT NOT NULL,
        condition TEXT NOT NULL,
        location TEXT NOT NULL,
        contact_phone TEXT NOT NULL,
        seller_id TEXT NOT NULL,
        is_sold BOOLEAN DEFAULT 0,
        is_paid BOOLEAN DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (seller_id) REFERENCES users (id)
    )
    ''')
    
    # Categories table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
    )
    ''')
    
    # Insert default categories if they don't exist
    categories = [
        ('1', 'Electronics'),
        ('2', 'Furniture'),
        ('3', 'Clothing'),
        ('4', 'Vehicles'),
        ('5', 'Sports Equipment'),
        ('6', 'Toys & Games'),
        ('7', 'Books'),
        ('8', 'Home & Garden')
    ]
    
    cursor.executemany('''
    INSERT OR IGNORE INTO categories (id, name) VALUES (?, ?)
    ''', categories)
    
    # Insert demo users if they don't exist
    demo_users = [
        ('1', 'johndoe', 'john@example.com', 'password_hash', 0, 0),
        ('2', 'janedoe', 'jane@example.com', 'password_hash', 0, 0),
        ('3', 'admin', 'admin@example.com', 'password_hash', 1, 0)
    ]
    
    cursor.executemany('''
    INSERT OR IGNORE INTO users (id, username, email, password_hash, is_admin, is_banned)
    VALUES (?, ?, ?, ?, ?, ?)
    ''', demo_users)
    
    conn.commit()
    conn.close()

# Initialize the database
init_db()

# Helper function to check if file extension is allowed
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Route for uploading images
@app.route('/api/uploads', methods=['POST'])
def upload_file():
    # Check if a file is part of the request
    if 'file' not in request.files:
        return jsonify({'error': 'No file part'}), 400
    
    file = request.files['file']
    
    # If user does not select file, browser might submit an empty file
    if file.filename == '':
        return jsonify({'error': 'No selected file'}), 400
    
    if file and allowed_file(file.filename):
        # Create a unique filename
        filename = str(uuid.uuid4()) + '_' + secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        # Return the URL for the saved file
        return jsonify({'url': f'/api/uploads/{filename}'}), 201
    
    return jsonify({'error': 'File type not allowed'}), 400

# Route to serve uploaded files
@app.route('/api/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

# User routes
@app.route('/api/users', methods=['GET'])
def get_users():
    conn = sqlite3.connect('marketplace.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, username, email, is_admin, is_banned, created_at FROM users')
    users = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return jsonify(users)

@app.route('/api/users/<user_id>', methods=['GET'])
def get_user(user_id):
    conn = sqlite3.connect('marketplace.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT id, username, email, is_admin, is_banned, created_at FROM users WHERE id = ?', (user_id,))
    user = cursor.fetchone()
    
    conn.close()
    
    if user:
        return jsonify(dict(user))
    else:
        return jsonify({'error': 'User not found'}), 404

@app.route('/api/users/<user_id>/ban', methods=['PUT'])
def ban_user(user_id):
    conn = sqlite3.connect('marketplace.db')
    cursor = conn.cursor()
    
    cursor.execute('UPDATE users SET is_banned = 1 WHERE id = ?', (user_id,))
    conn.commit()
    
    if cursor.rowcount > 0:
        conn.close()
        return jsonify({'success': True, 'message': 'User banned successfully'})
    else:
        conn.close()
        return jsonify({'error': 'User not found'}), 404

@app.route('/api/users/<user_id>/unban', methods=['PUT'])
def unban_user(user_id):
    conn = sqlite3.connect('marketplace.db')
    cursor = conn.cursor()
    
    cursor.execute('UPDATE users SET is_banned = 0 WHERE id = ?', (user_id,))
    conn.commit()
    
    if cursor.rowcount > 0:
        conn.close()
        return jsonify({'success': True, 'message': 'User unbanned successfully'})
    else:
        conn.close()
        return jsonify({'error': 'User not found'}), 404

# Auth routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    
    if not data or not all(key in data for key in ['username', 'email', 'password']):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = sqlite3.connect('marketplace.db')
    cursor = conn.cursor()
    
    try:
        # In a real app, we would hash the password
        user_id = str(uuid.uuid4())
        cursor.execute(
            'INSERT INTO users (id, username, email, password_hash) VALUES (?, ?, ?, ?)',
            (user_id, data['username'], data['email'], data['password'])  # Password should be hashed
        )
        conn.commit()
        
        # Return the created user (without password)
        cursor.execute('SELECT id, username, email, is_admin, is_banned, created_at FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        
        conn.close()
        return jsonify({
            'id': user[0],
            'username': user[1],
            'email': user[2],
            'is_admin': bool(user[3]),
            'is_banned': bool(user[4]),
            'created_at': user[5]
        }), 201
    except sqlite3.IntegrityError as e:
        conn.close()
        if "username" in str(e):
            return jsonify({'error': 'Username already exists'}), 409
        elif "email" in str(e):
            return jsonify({'error': 'Email already exists'}), 409
        return jsonify({'error': 'Registration failed'}), 409

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    
    if not data or not all(key in data for key in ['email', 'password']):
        return jsonify({'error': 'Missing email or password'}), 400
    
    conn = sqlite3.connect('marketplace.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # In a real app, we would verify the hashed password
    cursor.execute('SELECT id, username, email, is_admin, is_banned FROM users WHERE email = ? AND password_hash = ?',
                  (data['email'], data['password']))
    user = cursor.fetchone()
    
    conn.close()
    
    if user:
        if user['is_banned']:
            return jsonify({'error': 'Your account has been banned'}), 403
        
        return jsonify(dict(user))
    else:
        return jsonify({'error': 'Invalid email or password'}), 401

# Product routes
@app.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get('category')
    query = request.args.get('query')
    
    conn = sqlite3.connect('marketplace.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    sql = 'SELECT p.*, u.username as seller_name FROM products p JOIN users u ON p.seller_id = u.id'
    params = []
    
    if category and category != 'All':
        sql += ' WHERE p.category = ?'
        params.append(category)
    
    if query:
        if 'WHERE' in sql:
            sql += ' AND (p.title LIKE ? OR p.description LIKE ?)'
        else:
            sql += ' WHERE (p.title LIKE ? OR p.description LIKE ?)'
        params.extend([f'%{query}%', f'%{query}%'])
    
    cursor.execute(sql, params)
    products = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return jsonify(products)

@app.route('/api/products/<product_id>', methods=['GET'])
def get_product(product_id):
    conn = sqlite3.connect('marketplace.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT p.*, u.username as seller_name FROM products p JOIN users u ON p.seller_id = u.id WHERE p.id = ?', 
                  (product_id,))
    product = cursor.fetchone()
    
    conn.close()
    
    if product:
        return jsonify(dict(product))
    else:
        return jsonify({'error': 'Product not found'}), 404

@app.route('/api/products', methods=['POST'])
def create_product():
    data = request.json
    required_fields = ['title', 'description', 'price', 'image_url', 'category', 
                      'condition', 'location', 'contact_phone', 'seller_id']
    
    if not data or not all(key in data for key in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
    
    conn = sqlite3.connect('marketplace.db')
    cursor = conn.cursor()
    
    # Verify the seller exists
    cursor.execute('SELECT id FROM users WHERE id = ?', (data['seller_id'],))
    if not cursor.fetchone():
        conn.close()
        return jsonify({'error': 'Seller not found'}), 404
    
    try:
        product_id = str(uuid.uuid4())
        created_at = datetime.now().isoformat()
        
        cursor.execute('''
        INSERT INTO products 
        (id, title, description, price, image_url, category, condition, location, contact_phone, seller_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            product_id,
            data['title'],
            data['description'],
            data['price'],
            data['image_url'],
            data['category'],
            data['condition'],
            data['location'],
            data['contact_phone'],
            data['seller_id'],
            created_at
        ))
        conn.commit()
        
        # Get the created product
        conn.row_factory = sqlite3.Row
        cursor = conn.connection.cursor()
        cursor.execute('SELECT p.*, u.username as seller_name FROM products p JOIN users u ON p.seller_id = u.id WHERE p.id = ?', 
                      (product_id,))
        product = cursor.fetchone()
        
        conn.close()
        return jsonify(dict(product)), 201
    except Exception as e:
        conn.close()
        return jsonify({'error': f'Failed to create product: {str(e)}'}), 500

@app.route('/api/products/<product_id>/pay', methods=['PUT'])
def mark_product_as_paid(product_id):
    conn = sqlite3.connect('marketplace.db')
    cursor = conn.cursor()
    
    cursor.execute('UPDATE products SET is_paid = 1 WHERE id = ?', (product_id,))
    conn.commit()
    
    if cursor.rowcount > 0:
        conn.close()
        return jsonify({'success': True, 'message': 'Product marked as paid'})
    else:
        conn.close()
        return jsonify({'error': 'Product not found'}), 404

@app.route('/api/products/<product_id>/sold', methods=['PUT'])
def mark_product_as_sold(product_id):
    data = request.json
    if not data or 'seller_id' not in data:
        return jsonify({'error': 'Missing seller_id'}), 400
    
    conn = sqlite3.connect('marketplace.db')
    cursor = conn.cursor()
    
    # Check if user is seller or admin
    cursor.execute('SELECT seller_id FROM products WHERE id = ?', (product_id,))
    product = cursor.fetchone()
    
    if not product:
        conn.close()
        return jsonify({'error': 'Product not found'}), 404
    
    cursor.execute('SELECT is_admin FROM users WHERE id = ?', (data['seller_id'],))
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        return jsonify({'error': 'User not found'}), 404
    
    is_seller = product[0] == data['seller_id']
    is_admin = user[0] == 1
    
    if not (is_seller or is_admin):
        conn.close()
        return jsonify({'error': 'Unauthorized'}), 403
    
    cursor.execute('UPDATE products SET is_sold = 1 WHERE id = ?', (product_id,))
    conn.commit()
    
    conn.close()
    return jsonify({'success': True, 'message': 'Product marked as sold'})

@app.route('/api/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    data = request.json
    if not data or 'seller_id' not in data:
        return jsonify({'error': 'Missing seller_id'}), 400
    
    conn = sqlite3.connect('marketplace.db')
    cursor = conn.cursor()
    
    # Check if user is seller or admin
    cursor.execute('SELECT seller_id FROM products WHERE id = ?', (product_id,))
    product = cursor.fetchone()
    
    if not product:
        conn.close()
        return jsonify({'error': 'Product not found'}), 404
    
    cursor.execute('SELECT is_admin FROM users WHERE id = ?', (data['seller_id'],))
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        return jsonify({'error': 'User not found'}), 404
    
    is_seller = product[0] == data['seller_id']
    is_admin = user[0] == 1
    
    if not (is_seller or is_admin):
        conn.close()
        return jsonify({'error': 'Unauthorized'}), 403
    
    cursor.execute('DELETE FROM products WHERE id = ?', (product_id,))
    conn.commit()
    
    conn.close()
    return jsonify({'success': True, 'message': 'Product deleted successfully'})

# Categories routes
@app.route('/api/categories', methods=['GET'])
def get_categories():
    conn = sqlite3.connect('marketplace.db')
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM categories')
    categories = [dict(row) for row in cursor.fetchall()]
    
    conn.close()
    return jsonify(categories)

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
