"""
Invoice Digitization & Tax Prediction Tool
Main application entry point
"""

from flask import Flask
import os
from app.routes.upload import upload_bp
from app.routes.ocr import ocr_bp
from app.routes.extract import extract_bp
from flask_cors import CORS

def create_app():
    """Create and configure the Flask application"""
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = 'your-secret-key-here'
    app.config['UPLOAD_FOLDER'] = 'uploads'
    app.config['EXPORT_FOLDER'] = 'exports'
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size
    
    # Create directories if they don't exist
    os.makedirs('uploads', exist_ok=True)
    os.makedirs('exports', exist_ok=True)
    os.makedirs('app/static', exist_ok=True)
    
    # Register blueprints
    app.register_blueprint(upload_bp)
    app.register_blueprint(ocr_bp)
    app.register_blueprint(extract_bp)
    CORS(app)  # Enable CORS for all routes
    
    return app

if __name__ == '__main__':
    app = create_app()
    print(" * Invoice Digitization & Tax Prediction Tool")
    print(" * Starting Flask development server...")
    app.run(debug=True, host='0.0.0.0', port=5000)