"""
Tax prediction utilities
Implements rule-based tax rate prediction for Indian GST
"""

import re
from typing import Dict, List, Any

# GST categories and rates
GST_RATES = {
    'goods': 12.0,      # Most goods
    'services': 18.0,   # Most services
    'exempt': 0.0,      # Exempt items
    'luxury': 28.0,     # Luxury/sin goods
    'essential': 5.0    # Essential goods
}

# Keywords for categorization
GOODS_KEYWORDS = [
    'product', 'item', 'goods', 'material', 'equipment', 'hardware',
    'supplies', 'parts', 'components', 'tools', 'machinery', 'device',
    'book', 'stationery', 'food', 'medicine', 'clothes', 'fabric'
]

SERVICES_KEYWORDS = [
    'service', 'consultation', 'support', 'maintenance', 'repair',
    'installation', 'training', 'development', 'design', 'management',
    'hosting', 'software', 'license', 'subscription', 'professional'
]

EXEMPT_KEYWORDS = [
    'education', 'healthcare', 'medicine', 'hospital', 'school',
    'book', 'newspaper', 'milk', 'bread', 'rice', 'wheat', 'grain'
]

LUXURY_KEYWORDS = [
    'luxury', 'premium', 'car', 'automobile', 'tobacco', 'cigarette',
    'alcohol', 'wine', 'jewellery', 'gold', 'diamond', 'cosmetic'
]

ESSENTIAL_KEYWORDS = [
    'food', 'grain', 'vegetable', 'fruit', 'milk', 'oil', 'sugar',
    'salt', 'medicine', 'drug', 'vaccine', 'medical'
]

def categorize_item(description: str) -> str:
    """Categorize an item based on its description"""
    description_lower = description.lower()
    
    # Check for exempt items first
    if any(keyword in description_lower for keyword in EXEMPT_KEYWORDS):
        return 'exempt'
    
    # Check for luxury items
    if any(keyword in description_lower for keyword in LUXURY_KEYWORDS):
        return 'luxury'
    
    # Check for essential goods
    if any(keyword in description_lower for keyword in ESSENTIAL_KEYWORDS):
        return 'essential'
    
    # Check for services
    if any(keyword in description_lower for keyword in SERVICES_KEYWORDS):
        return 'services'
    
    # Check for goods
    if any(keyword in description_lower for keyword in GOODS_KEYWORDS):
        return 'goods'
    
    # Default to goods if uncertain
    return 'goods'

def predict_tax_rates(raw_text: str, invoice_data: Dict[str, Any]) -> Dict[str, Any]:
    """Predict tax rates for invoice line items"""
    tax_data = {
        'line_items_with_tax': [],
        'tax_summary': {
            'total_taxable_amount': 0.0,
            'total_tax_amount': 0.0,
            'tax_breakdown': {
                'cgst': 0.0,
                'sgst': 0.0,
                'igst': 0.0
            }
        },
        'predicted_total': 0.0
    }
    
    line_items = invoice_data.get('line_items', [])
    total_taxable_amount = 0.0
    total_tax_amount = 0.0
    
    for item in line_items:
        description = item.get('description', '')
        amount = item.get('amount', 0.0)
        
        # Categorize the item
        category = categorize_item(description)
        tax_rate = GST_RATES.get(category, GST_RATES['goods'])
        
        # Calculate tax amount
        tax_amount = (amount * tax_rate) / 100
        total_with_tax = amount + tax_amount
        
        # Add to processed items
        item_with_tax = {
            'description': description,
            'amount': amount,
            'category': category,
            'tax_rate': tax_rate,
            'tax_amount': tax_amount,
            'total_with_tax': total_with_tax,
            'original_line': item.get('line_text', '')
        }
        
        tax_data['line_items_with_tax'].append(item_with_tax)
        total_taxable_amount += amount
        total_tax_amount += tax_amount
    
    # Calculate tax breakdown (assuming intra-state transaction)
    # CGST + SGST = Total GST (for intra-state)
    # IGST = Total GST (for inter-state)
    cgst_amount = total_tax_amount / 2
    sgst_amount = total_tax_amount / 2
    
    tax_data['tax_summary'] = {
        'total_taxable_amount': round(total_taxable_amount, 2),
        'total_tax_amount': round(total_tax_amount, 2),
        'tax_breakdown': {
            'cgst': round(cgst_amount, 2),
            'sgst': round(sgst_amount, 2),
            'igst': 0.0  # Assuming intra-state
        }
    }
    
    tax_data['predicted_total'] = round(total_taxable_amount + total_tax_amount, 2)
    
    # Validate against extracted total
    extracted_total = invoice_data.get('total_amount', 0)
    if extracted_total > 0:
        difference = abs(tax_data['predicted_total'] - extracted_total)
        tax_data['validation'] = {
            'extracted_total': extracted_total,
            'predicted_total': tax_data['predicted_total'],
            'difference': round(difference, 2),
            'match_threshold': difference < (extracted_total * 0.1)  # 10% tolerance
        }
    
    return tax_data

def generate_tax_report(tax_data: Dict[str, Any]) -> str:
    """Generate a human-readable tax report"""
    report = []
    report.append("=== TAX PREDICTION REPORT ===\n")
    
    # Summary
    summary = tax_data['tax_summary']
    report.append(f"Total Taxable Amount: ₹{summary['total_taxable_amount']}")
    report.append(f"Total Tax Amount: ₹{summary['total_tax_amount']}")
    report.append(f"CGST: ₹{summary['tax_breakdown']['cgst']}")
    report.append(f"SGST: ₹{summary['tax_breakdown']['sgst']}")
    report.append(f"Predicted Total: ₹{tax_data['predicted_total']}")
    report.append("")
    
    # Line items
    report.append("=== LINE ITEMS BREAKDOWN ===")
    for i, item in enumerate(tax_data['line_items_with_tax'], 1):
        report.append(f"{i}. {item['description']}")
        report.append(f"   Amount: ₹{item['amount']} | Category: {item['category']}")
        report.append(f"   Tax Rate: {item['tax_rate']}% | Tax: ₹{item['tax_amount']}")
        report.append(f"   Total: ₹{item['total_with_tax']}")
        report.append("")
    
    # Validation
    if 'validation' in tax_data:
        val = tax_data['validation']
        report.append("=== VALIDATION ===")
        report.append(f"Extracted Total: ₹{val['extracted_total']}")
        report.append(f"Predicted Total: ₹{val['predicted_total']}")
        report.append(f"Difference: ₹{val['difference']}")
        report.append(f"Match: {'✓' if val['match_threshold'] else '✗'}")
    
    return '\n'.join(report)

def update_tax_category(item_description: str, new_category: str) -> bool:
    """Update tax category for a specific item (for manual corrections)"""
    if new_category not in GST_RATES:
        return False
    
    # In a real application, you might want to store user corrections
    # and use them for future predictions
    return True