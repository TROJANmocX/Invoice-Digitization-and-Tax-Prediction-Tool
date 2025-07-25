"""
Invoice field extraction utilities
Uses regex patterns to extract structured data from raw OCR text
"""

import re
from datetime import datetime
import json

def extract_invoice_fields(raw_text):
    """Extract structured invoice fields from raw OCR text"""
    if not raw_text:
        return {}
    
    # Initialize result dictionary
    invoice_data = {
        'invoice_number': '',
        'invoice_date': '',
        'gstin': '',
        'vendor_name': '',
        'vendor_address': '',
        'total_amount': 0.0,
        'line_items': [],
        'raw_text': raw_text
    }
    
    # Extract invoice number
    invoice_patterns = [
        r'(?:invoice|inv|bill)\s*(?:no|number|#)?\s*:?\s*([A-Z0-9\-/]+)',
        r'(?:invoice|inv|bill)\s+([A-Z0-9\-/]{3,})',
        r'#\s*([A-Z0-9\-/]+)'
    ]
    
    for pattern in invoice_patterns:
        match = re.search(pattern, raw_text, re.IGNORECASE)
        if match:
            invoice_data['invoice_number'] = match.group(1).strip()
            break
    
    # Extract date
    date_patterns = [
        r'(?:date|dated)\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
        r'(\d{1,2}\s+\w+\s+\d{2,4})'
    ]
    
    for pattern in date_patterns:
        match = re.search(pattern, raw_text, re.IGNORECASE)
        if match:
            date_str = match.group(1).strip()
            invoice_data['invoice_date'] = normalize_date(date_str)
            break
    
    # Extract GSTIN
    gstin_pattern = r'(?:gstin|gst)\s*:?\s*([0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}[Z]{1}[0-9A-Z]{1})'
    match = re.search(gstin_pattern, raw_text, re.IGNORECASE)
    if match:
        invoice_data['gstin'] = match.group(1).strip()
    
    # Extract vendor name (usually appears near the top)
    lines = raw_text.split('\n')[:10]  # Check first 10 lines
    for line in lines:
        if len(line.strip()) > 3 and not re.search(r'^\d+|invoice|bill|date', line, re.IGNORECASE):
            # Skip lines that look like numbers or common invoice terms
            if not re.search(r'^[\d\s\-/:.]+$', line):
                invoice_data['vendor_name'] = line.strip()
                break
    
    # Extract total amount
    amount_patterns = [
        r'(?:total|amount|sum)\s*:?\s*(?:rs\.?|₹)?\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',
        r'(?:rs\.?|₹)\s*(\d+(?:,\d{3})*(?:\.\d{2})?)',
        r'(\d+(?:,\d{3})*(?:\.\d{2})?)(?:\s*(?:rs\.?|₹))',
    ]
    
    amounts = []
    for pattern in amount_patterns:
        matches = re.findall(pattern, raw_text, re.IGNORECASE)
        for match in matches:
            amount_str = match.replace(',', '')
            try:
                amount = float(amount_str)
                if 10 <= amount <= 1000000:  # Reasonable range
                    amounts.append(amount)
            except ValueError:
                continue
    
    if amounts:
        invoice_data['total_amount'] = max(amounts)  # Take the largest amount as total
    
    # Extract line items (simplified)
    invoice_data['line_items'] = extract_line_items(raw_text)
    
    return invoice_data

def extract_line_items(raw_text):
    """Extract individual line items from invoice text"""
    line_items = []
    lines = raw_text.split('\n')
    
    for line in lines:
        # Look for lines that contain both description and amount
        if re.search(r'[a-zA-Z].*\d+(?:\.\d{2})?', line):
            # Extract amount from the line
            amount_match = re.search(r'(\d+(?:\.\d{2})?)', line)
            if amount_match:
                amount = float(amount_match.group(1))
                description = re.sub(r'\d+(?:\.\d{2})?.*$', '', line).strip()
                
                if description and amount > 0:
                    line_items.append({
                        'description': description,
                        'amount': amount,
                        'line_text': line.strip()
                    })
    
    return line_items[:20]  # Limit to 20 items to avoid noise

def normalize_date(date_str):
    """Normalize date string to standard format"""
    try:
        # Try different date formats
        formats = ['%d/%m/%Y', '%d-%m-%Y', '%d/%m/%y', '%d-%m-%y', '%Y-%m-%d']
        
        for fmt in formats:
            try:
                parsed_date = datetime.strptime(date_str, fmt)
                return parsed_date.strftime('%Y-%m-%d')
            except ValueError:
                continue
        
        # If parsing fails, return original string
        return date_str
    
    except Exception:
        return date_str

def validate_invoice_data(invoice_data):
    """Validate extracted invoice data and flag potential issues"""
    issues = []
    
    if not invoice_data.get('invoice_number'):
        issues.append("Invoice number not found")
    
    if not invoice_data.get('invoice_date'):
        issues.append("Invoice date not found")
    
    if not invoice_data.get('vendor_name'):
        issues.append("Vendor name not found")
    
    if invoice_data.get('total_amount', 0) == 0:
        issues.append("Total amount not found or is zero")
    
    if not invoice_data.get('gstin'):
        issues.append("GSTIN not found")
    
    invoice_data['validation_issues'] = issues
    invoice_data['is_valid'] = len(issues) == 0
    
    return invoice_data