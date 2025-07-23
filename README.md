# Invoice-Digitization-and-Tax-Prediction-Tool
The Invoice Digitization and Tax Prediction Tool is a full-stack AI-powered web application designed to automate the process of extracting key data from invoice documents and predicting applicable tax rates. This tool uses advanced Optical Character Recognition (OCR), intelligent field extraction techniques, and rule-based tax logic to eliminate manual data entry and streamline financial workflows for businesses, accountants, and tax professionals.

The system allows users to upload invoice images or PDFs through a secure and intuitive interface. Once uploaded, the application processes the document using EasyOCR to extract raw text. It then applies pattern matching and natural language parsing to identify key invoice fields such as:

Invoice Number

Invoice Date

Vendor Name

GSTIN

Total Amount

After successful extraction, the tool uses domain-specific rules to predict the applicable Goods and Services Tax (GST) rate based on item descriptions (Goods, Services, or Exempt items). It then calculates:

Item-wise GST

Total tax payable

Final invoice total

The application also supports exporting the results in JSON and Excel formats for downstream processing or accounting systems.

⚙️ Core Features:
Upload support for JPG, PNG, and PDF invoice files (up to 16MB)

EasyOCR-based text extraction from scanned or digital invoices

Regex and logic-based field extraction for structured invoice data

Rule-based GST rate prediction (0%, 12%, 18%)

Item-wise classification (Goods, Services, Exempt)

Export functionality in JSON and Excel formats

Responsive and professional UI with dark/light theme toggle

(Optional) Dashboard to track uploads and extraction statistics

🚀 Technology Stack:
Frontend: HTML, Bootstrap / Tailwind CSS, Jinja Templates / React (optional)

Backend: Python, Flask

OCR Engine: EasyOCR

Data Handling: Pandas, OpenPyXL

Export: JSON, Excel

Deployment: Render / Railway / Local server

👨‍💻 Developer Information:
This project is developed by Arish Ali, a Computer Science & Engineering student with a passion for artificial intelligence, web development, and automation systems. It is built as a major project to demonstrate real-world AI integration in enterprise finance domains.
