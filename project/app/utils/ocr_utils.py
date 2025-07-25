"""
OCR utilities for text extraction from images and PDFs
Uses EasyOCR for image processing and PyPDF2 for PDF text extraction
"""

import easyocr
import cv2
import numpy as np
from PIL import Image
import PyPDF2
import os

# Initialize EasyOCR reader (supports English and other languages)
reader = easyocr.Reader(['en'])

def extract_text_from_image(image_path):
    """Extract text from image using EasyOCR"""
    try:
        # Read image
        results = reader.readtext(image_path)
        
        # Combine all detected text
        extracted_text = []
        for (bbox, text, confidence) in results:
            if confidence > 0.5:  # Filter low-confidence results
                extracted_text.append(text)
        
        return '\n'.join(extracted_text)
    
    except Exception as e:
        print(f"Error in image OCR: {str(e)}")
        return ""

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF file"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                text += page.extract_text() + "\n"
            
            return text.strip()
    
    except Exception as e:
        print(f"Error in PDF text extraction: {str(e)}")
        return ""

def preprocess_image(image_path):
    """Preprocess image for better OCR results"""
    try:
        # Read image
        img = cv2.imread(image_path)
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply denoising
        denoised = cv2.fastNlMeansDenoising(gray)
        
        # Apply adaptive thresholding
        thresh = cv2.adaptiveThreshold(
            denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
        )
        
        # Save preprocessed image temporarily
        preprocessed_path = image_path.replace('.', '_processed.')
        cv2.imwrite(preprocessed_path, thresh)
        
        return preprocessed_path
    
    except Exception as e:
        print(f"Error in image preprocessing: {str(e)}")
        return image_path

def extract_text_from_file(file_path):
    """Main function to extract text from any supported file type"""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    file_extension = os.path.splitext(file_path)[1].lower()
    
    if file_extension == '.pdf':
        # Extract text from PDF
        text = extract_text_from_pdf(file_path)
        
        # If PDF text extraction fails or returns minimal text, try OCR
        if not text or len(text.strip()) < 50:
            # Convert PDF to images and use OCR (simplified approach)
            text = extract_text_from_image(file_path)
        
        return text
    
    elif file_extension in ['.png', '.jpg', '.jpeg']:
        # Preprocess image for better OCR
        processed_path = preprocess_image(file_path)
        
        # Extract text using OCR
        text = extract_text_from_image(processed_path)
        
        # Clean up preprocessed image if it was created
        if processed_path != file_path and os.path.exists(processed_path):
            os.remove(processed_path)
        
        return text
    
    else:
        raise ValueError(f"Unsupported file type: {file_extension}")

def clean_extracted_text(text):
    """Clean and normalize extracted text"""
    if not text:
        return ""
    
    # Remove extra whitespace and normalize line breaks
    lines = [line.strip() for line in text.split('\n')]
    lines = [line for line in lines if line]  # Remove empty lines
    
    return '\n'.join(lines)