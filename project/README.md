# Invoice Digitization and Tax Prediction Tool

An AI-powered web application that extracts key details from uploaded invoices using OCR and predicts GST rates based on item classification. It streamlines invoice processing by automating data capture, tax calculation, and report generation.

## 🚀 Features

- **Upload Support**: JPG, PNG, and PDF invoice files (up to 16MB)
- **OCR Processing**: EasyOCR-based text extraction from scanned or digital invoices
- **Intelligent Extraction**: Regex and logic-based field extraction for structured invoice data
- **GST Prediction**: Rule-based GST rate prediction (0%, 12%, 18%)
- **Item Classification**: Categorization into Goods, Services, or Exempt items
- **Export Options**: Download results in JSON, CSV, and PDF formats
- **Modern UI**: Responsive design with dark/light theme toggle

## 🛠️ Technology Stack

### Frontend
- React with TypeScript
- Tailwind CSS
- Lucide React (for icons)
- Vite (build tool)

### Backend
- Python
- Flask
- EasyOCR (Optical Character Recognition)
- Pandas (Data processing)
- OpenPyXL (Excel export)

## 📋 Prerequisites

- Node.js (v16+)
- Python (v3.9+)
- pip (Python package manager)

## 🔧 Installation

### Clone the repository
```bash
git clone https://github.com/yourusername/Invoice-Digitization-and-Tax-Prediction-Tool.git
cd Invoice-Digitization-and-Tax-Prediction-Tool
```

### Backend Setup
```bash
# Create and activate a virtual environment (optional but recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Python dependencies
pip install -r requirements.txt
```

### Frontend Setup
```bash
# Install Node.js dependencies
npm install
```

## 🚀 Running the Application

### Start the Backend Server
```bash
python main.py
```
The Flask server will start at http://localhost:5000

### Start the Frontend Development Server
```bash
npm run dev
```
The Vite development server will start at http://localhost:5173

## 📁 Project Structure

```
├── app/                  # Flask backend application
│   ├── routes/           # API endpoints
│   ├── static/           # Static files
│   ├── templates/        # HTML templates
│   └── utils/            # Utility functions
├── src/                  # React frontend application
│   ├── components/       # React components
│   ├── App.tsx           # Main React component
│   └── main.tsx          # Entry point
├── uploads/              # Temporary storage for uploaded files
├── exports/              # Generated export files
├── main.py               # Flask application entry point
├── requirements.txt      # Python dependencies
└── package.json          # Node.js dependencies
```

## 🔒 Environment Variables

Create a `.env` file in the root directory with the following variables:

```
SECRET_KEY=your-secret-key-here
```

## 👨‍💻 Developer Information

This project is developed by Arish Ali, a Computer Science & Engineering student with a passion for artificial intelligence, web development, and automation systems.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.