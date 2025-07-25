"""
OCR processing route
Handles text extraction from uploaded images and PDFs
"""

from flask import Blueprint, render_template, request, flash, redirect, url_for, current_app, jsonify
import os
from app.utils.ocr_utils import extract_text_from_file
from app.utils.extract_utils import extract_invoice_fields
from app.utils.tax_utils import predict_tax_rates

ocr_bp = Blueprint('ocr', __name__)

@ocr_bp.route('/process/<filename>')
def process_ocr(filename):
    """Process OCR on uploaded file"""
    try:
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        
        if not os.path.exists(filepath):
            flash('File not found', 'error')
            return redirect(url_for('upload.index'))
        
        # Extract text using OCR
        raw_text = extract_text_from_file(filepath)
        
        if not raw_text or len(raw_text.strip()) < 10:
            flash('Could not extract sufficient text from the image. Please try a clearer image.', 'error')
            return redirect(url_for('upload.index'))
        
        # Extract structured fields
        invoice_data = extract_invoice_fields(raw_text)
        
        # Predict tax rates for line items
        tax_data = predict_tax_rates(raw_text, invoice_data)
        
        # Combine all data
        result_data = {
            'filename': filename,
            'raw_text': raw_text,
            'invoice_data': invoice_data,
            'tax_data': tax_data
        }
        
        return render_template('result.html', data=result_data)
        
    except Exception as e:
        flash(f'Error processing file: {str(e)}', 'error')
        return redirect(url_for('upload.index'))

@ocr_bp.route('/reprocess/<filename>')
def reprocess_file(filename):
    """Reprocess an existing file"""
    return process_ocr(filename)

@ocr_bp.route('/api/analyze', methods=['POST'])
def api_analyze_invoice():
    """API endpoint for analyzing an uploaded invoice file (PDF/image) and returning structured data as JSON"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        # Save file to uploads folder
        filename = file.filename
        import time, os
        timestamp = str(int(time.time()))
        name, ext = os.path.splitext(filename)
        filename = f"{name}_{timestamp}{ext}"
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        # Extract text using OCR
        raw_text = extract_text_from_file(filepath)
        if not raw_text or len(raw_text.strip()) < 10:
            return jsonify({'error': 'Could not extract sufficient text from the file.'}), 400
        # Extract structured fields
        invoice_data = extract_invoice_fields(raw_text)
        # Predict tax rates for line items
        tax_data = predict_tax_rates(raw_text, invoice_data)
        # Combine all data
        result_data = {
            'filename': filename,
            'raw_text': raw_text,
            'invoice_data': invoice_data,
            'tax_data': tax_data
        }
        return jsonify(result_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500