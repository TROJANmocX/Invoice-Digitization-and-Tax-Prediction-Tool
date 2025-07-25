"""
Export utilities for generating JSON and Excel files
Handles data formatting and file creation for downloads
"""

import json
import pandas as pd
import os
from datetime import datetime
from typing import Dict, Any

def create_json_export(invoice_data: Dict[str, Any]) -> str:
    """Create JSON export file"""
    try:
        # Prepare export data
        export_data = {
            'export_info': {
                'generated_at': datetime.now().isoformat(),
                'tool': 'Invoice Digitization & Tax Prediction Tool',
                'version': '1.0'
            },
            'invoice_data': invoice_data
        }
        
        # Create exports directory if it doesn't exist
        os.makedirs('exports', exist_ok=True)
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'invoice_export_{timestamp}.json'
        filepath = os.path.join('exports', filename)
        
        # Write JSON file
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)
        
        return filepath
    
    except Exception as e:
        raise Exception(f"Failed to create JSON export: {str(e)}")

def create_excel_export(invoice_data: Dict[str, Any]) -> str:
    """Create Excel export file with multiple sheets"""
    try:
        # Create exports directory if it doesn't exist
        os.makedirs('exports', exist_ok=True)
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'invoice_export_{timestamp}.xlsx'
        filepath = os.path.join('exports', filename)
        
        # Create Excel writer object
        with pd.ExcelWriter(filepath, engine='openpyxl') as writer:
            
            # Sheet 1: Invoice Summary
            summary_data = {
                'Field': ['Invoice Number', 'Invoice Date', 'Vendor Name', 'GSTIN', 'Total Amount'],
                'Value': [
                    invoice_data.get('invoice_number', 'N/A'),
                    invoice_data.get('invoice_date', 'N/A'),
                    invoice_data.get('vendor_name', 'N/A'),
                    invoice_data.get('gstin', 'N/A'),
                    f"₹{invoice_data.get('total_amount', 0)}"
                ]
            }
            
            summary_df = pd.DataFrame(summary_data)
            summary_df.to_excel(writer, sheet_name='Invoice Summary', index=False)
            
            # Sheet 2: Line Items
            if 'line_items' in invoice_data and invoice_data['line_items']:
                line_items_data = []
                for i, item in enumerate(invoice_data['line_items'], 1):
                    line_items_data.append({
                        'S.No': i,
                        'Description': item.get('description', ''),
                        'Amount': item.get('amount', 0)
                    })
                
                line_items_df = pd.DataFrame(line_items_data)
                line_items_df.to_excel(writer, sheet_name='Line Items', index=False)
            
            # Sheet 3: Tax Details (if available)
            if 'tax_data' in invoice_data and invoice_data['tax_data']:
                tax_data = invoice_data['tax_data']
                
                # Tax summary
                tax_summary_data = {
                    'Tax Component': ['Total Taxable Amount', 'CGST', 'SGST', 'IGST', 'Total Tax', 'Grand Total'],
                    'Amount (₹)': [
                        tax_data['tax_summary'].get('total_taxable_amount', 0),
                        tax_data['tax_summary']['tax_breakdown'].get('cgst', 0),
                        tax_data['tax_summary']['tax_breakdown'].get('sgst', 0),
                        tax_data['tax_summary']['tax_breakdown'].get('igst', 0),
                        tax_data['tax_summary'].get('total_tax_amount', 0),
                        tax_data.get('predicted_total', 0)
                    ]
                }
                
                tax_summary_df = pd.DataFrame(tax_summary_data)
                tax_summary_df.to_excel(writer, sheet_name='Tax Summary', index=False)
                
                # Detailed tax breakdown
                if 'line_items_with_tax' in tax_data:
                    tax_details_data = []
                    for i, item in enumerate(tax_data['line_items_with_tax'], 1):
                        tax_details_data.append({
                            'S.No': i,
                            'Description': item.get('description', ''),
                            'Taxable Amount': item.get('amount', 0),
                            'Category': item.get('category', ''),
                            'Tax Rate (%)': item.get('tax_rate', 0),
                            'Tax Amount': item.get('tax_amount', 0),
                            'Total with Tax': item.get('total_with_tax', 0)
                        })
                    
                    tax_details_df = pd.DataFrame(tax_details_data)
                    tax_details_df.to_excel(writer, sheet_name='Tax Details', index=False)
        
        return filepath
    
    except Exception as e:
        raise Exception(f"Failed to create Excel export: {str(e)}")

def create_csv_export(invoice_data: Dict[str, Any]) -> str:
    """Create CSV export file (alternative format)"""
    try:
        # Create exports directory if it doesn't exist
        os.makedirs('exports', exist_ok=True)
        
        # Generate filename with timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'invoice_export_{timestamp}.csv'
        filepath = os.path.join('exports', filename)
        
        # Prepare data for CSV
        csv_data = []
        
        # Add invoice summary
        csv_data.append(['Invoice Summary', '', ''])
        csv_data.append(['Invoice Number', invoice_data.get('invoice_number', 'N/A'), ''])
        csv_data.append(['Invoice Date', invoice_data.get('invoice_date', 'N/A'), ''])
        csv_data.append(['Vendor Name', invoice_data.get('vendor_name', 'N/A'), ''])
        csv_data.append(['GSTIN', invoice_data.get('gstin', 'N/A'), ''])
        csv_data.append(['Total Amount', f"₹{invoice_data.get('total_amount', 0)}", ''])
        csv_data.append(['', '', ''])  # Empty row
        
        # Add line items
        csv_data.append(['Line Items', '', ''])
        csv_data.append(['S.No', 'Description', 'Amount'])
        
        if 'line_items' in invoice_data:
            for i, item in enumerate(invoice_data['line_items'], 1):
                csv_data.append([
                    i,
                    item.get('description', ''),
                    item.get('amount', 0)
                ])
        
        # Create DataFrame and save
        df = pd.DataFrame(csv_data)
        df.to_csv(filepath, index=False, header=False)
        
        return filepath
    
    except Exception as e:
        raise Exception(f"Failed to create CSV export: {str(e)}")

def cleanup_old_exports(days_old: int = 7):
    """Clean up old export files"""
    try:
        export_dir = 'exports'
        if not os.path.exists(export_dir):
            return
        
        cutoff_time = datetime.now().timestamp() - (days_old * 24 * 60 * 60)
        
        for filename in os.listdir(export_dir):
            filepath = os.path.join(export_dir, filename)
            if os.path.isfile(filepath):
                file_time = os.path.getmtime(filepath)
                if file_time < cutoff_time:
                    os.remove(filepath)
                    print(f"Cleaned up old export: {filename}")
    
    except Exception as e:
        print(f"Error cleaning up exports: {str(e)}")