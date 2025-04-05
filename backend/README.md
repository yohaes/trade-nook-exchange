
# Marketplace Backend API

This is the Flask backend for the Marketplace application. It provides APIs for user authentication, product listings, image uploads, and admin functionalities.

## Setup Instructions

1. Create a virtual environment:
   ```
   python -m venv venv
   ```

2. Activate the virtual environment:
   - On Windows: `venv\Scripts\activate`
   - On macOS/Linux: `source venv/bin/activate`

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run the application:
   ```
   python app.py
   ```

The server will start on `http://localhost:5000`.

## API Endpoints

### Authentication
- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login a user

### Users
- `GET /api/users`: Get all users (admin only)
- `GET /api/users/<user_id>`: Get user by ID
- `PUT /api/users/<user_id>/ban`: Ban a user (admin only)
- `PUT /api/users/<user_id>/unban`: Unban a user (admin only)

### Products
- `GET /api/products`: Get all products (with optional category and search filters)
- `GET /api/products/<product_id>`: Get product by ID
- `POST /api/products`: Create a new product
- `PUT /api/products/<product_id>/pay`: Mark a product as paid
- `PUT /api/products/<product_id>/sold`: Mark a product as sold
- `DELETE /api/products/<product_id>`: Delete a product

### Categories
- `GET /api/categories`: Get all categories

### File Uploads
- `POST /api/uploads`: Upload an image file
- `GET /api/uploads/<filename>`: Get an uploaded file
