"""
Upload route handler for invoice files
Handles file upload, validation, and saving
"""

from flask import Blueprint, render_template, request, flash, redirect, url_for, current_app
import os
from werkzeug.utils import secure_filename
from werkzeug.datastructures import FileStorage
from werkzeug.exceptions import RequestEntityTooLarge

upload_bp = Blueprint('upload', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

def allowed_file(filename):
    """Check if uploaded file has allowed extension"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@upload_bp.route('/')
def index():
    """Main upload page"""
    return render_template('upload.html')

@upload_bp.route('/upload', methods=['GET', 'POST'])
def upload_file():
    """Handle file upload"""
    if request.method == 'POST':
        # Check if file was uploaded
        if 'file' not in request.files:
            flash('No file selected', 'error')
            return redirect(request.url)
        
        file = request.files['file']
        
        # Check if file was actually selected
        if file.filename == '':
            flash('No file selected', 'error')
            return redirect(request.url)
        
        # Validate file type and save
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            
            # Add timestamp to avoid conflicts
            import time
            timestamp = str(int(time.time()))
            name, ext = os.path.splitext(filename)
            filename = f"{name}_{timestamp}{ext}"
            
            filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            flash('File uploaded successfully!', 'success')
            return redirect(url_for('ocr.process_ocr', filename=filename))
        else:
            flash('Invalid file type. Please upload PNG, JPG, JPEG, or PDF files only.', 'error')
            return redirect(request.url)
    
    return render_template('upload.html')

@upload_bp.errorhandler(RequestEntityTooLarge)
def handle_file_too_large(e):
    flash('File is too large. Maximum allowed size is 16MB.', 'error')
    return redirect(request.url)