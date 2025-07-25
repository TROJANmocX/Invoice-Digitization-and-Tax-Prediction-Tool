"""
Data extraction and export routes
Handles JSON and Excel export functionality
"""

from flask import Blueprint, render_template, request, send_file, flash, redirect, url_for, current_app, jsonify
import os
import json
from app.utils.export_utils import create_excel_export, create_json_export

extract_bp = Blueprint('extract', __name__)

@extract_bp.route('/export/<format_type>')
def export_data(format_type):
    """Export processed invoice data"""
    try:
        # Get data from request args (in real app, you'd store this in session/database)
        data = request.args.get('data')
        if not data:
            flash('No data to export', 'error')
            return redirect(url_for('upload.index'))
        
        # Parse the data
        invoice_data = json.loads(data)
        
        if format_type == 'json':
            filepath = create_json_export(invoice_data)
            return send_file(filepath, as_attachment=True, download_name='invoice_data.json')
        
        elif format_type == 'excel':
            filepath = create_excel_export(invoice_data)
            return send_file(filepath, as_attachment=True, download_name='invoice_data.xlsx')
        
        else:
            flash('Invalid export format', 'error')
            return redirect(url_for('upload.index'))
            
    except Exception as e:
        flash(f'Error exporting data: {str(e)}', 'error')
        return redirect(url_for('upload.index'))

@extract_bp.route('/api/export', methods=['POST'])
def api_export():
    """API endpoint for exporting data"""
    try:
        data = request.get_json()
        format_type = data.get('format', 'json')
        invoice_data = data.get('data', {})
        
        if format_type == 'json':
            filepath = create_json_export(invoice_data)
        elif format_type == 'excel':
            filepath = create_excel_export(invoice_data)
        else:
            return jsonify({'error': 'Invalid format'}), 400
        
        return send_file(filepath, as_attachment=True)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500