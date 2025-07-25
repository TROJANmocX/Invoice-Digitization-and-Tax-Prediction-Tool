import React, { useState, useRef, useEffect } from 'react';

import { Upload, FileText, Calculator, Download, Eye, Search, CheckCircle, AlertCircle, ChevronDown, Settings, HelpCircle, User, LogOut, Menu, X, Github, Heart, Home, BarChart2 } from 'lucide-react';
import ThemeToggle from './components/ThemeToggle';
import Footer from './components/Footer';
import Toast from './components/Toast';
import FileUpload from './components/FileUpload';
import InvoiceResults from './components/InvoiceResults';
import FeatureCard from './components/FeatureCard';
import { InvoiceData } from './types/invoice';
import { motion } from 'framer-motion';

function App() {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isHelpDropdownOpen, setIsHelpDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' | 'info' });
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const helpDropdownRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState<'dashboard' | 'upload' | 'analytics' | 'settings'>('dashboard');

  // Remove mock invoice data and backend simulation
  const handleFileProcess = async (file: File, invoiceData?: any, error?: string) => {
    setIsProcessing(true);
    if (error) {
      setToast({ visible: true, message: error, type: 'error' });
      setIsProcessing(false);
      return;
    }
    if (invoiceData) {
      // Adapt backend response to InvoiceResults expected format if needed
      setInvoiceData({
        filename: invoiceData.filename,
        invoiceNumber: invoiceData.invoice_data?.invoice_number,
        invoiceDate: invoiceData.invoice_data?.invoice_date,
        vendorName: invoiceData.invoice_data?.vendor_name,
        gstin: invoiceData.invoice_data?.gstin,
        totalAmount: invoiceData.invoice_data?.total_amount,
        lineItems: (invoiceData.tax_data?.line_items_with_tax || []).map((item: any) => ({
          description: item.description,
          amount: item.amount,
          category: item.category,
          taxRate: item.tax_rate
        })),
        taxSummary: {
          totalTaxableAmount: invoiceData.tax_data?.tax_summary?.total_taxable_amount,
          cgst: invoiceData.tax_data?.tax_summary?.tax_breakdown?.cgst,
          sgst: invoiceData.tax_data?.tax_summary?.tax_breakdown?.sgst,
          totalTax: invoiceData.tax_data?.tax_summary?.total_tax_amount,
          grandTotal: invoiceData.tax_data?.predicted_total
        }
      });
    }
    setIsProcessing(false);
  };

  const handleNewInvoice = () => {
    setInvoiceData(null);
  };
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (helpDropdownRef.current && !helpDropdownRef.current.contains(event.target as Node)) {
        setIsHelpDropdownOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ visible: true, message, type });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 dark:text-white transition-colors duration-200">
      {/* Animated Navbar */}
      <header className="bg-white/80 dark:bg-gray-900/80 shadow-sm border-b dark:border-gray-800 sticky top-0 z-50 transition-colors duration-200 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <motion.div whileHover={{ scale: 1.1 }} className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg shadow-md">
                <FileText className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Invoice Digitization Tool</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">AI-Powered Tax Prediction</p>
              </div>
            </div>
            {/* Animated Icon Navbar */}
            <nav className="hidden md:flex items-center space-x-6">
              <motion.button whileHover={{ scale: 1.2 }} onClick={() => setActivePage('dashboard')} className={`p-2 rounded-full transition-colors ${activePage === 'dashboard' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40' : 'text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700'}`}> <Home className="w-5 h-5" /> </motion.button>
              <motion.button whileHover={{ scale: 1.2 }} onClick={() => setActivePage('upload')} className={`p-2 rounded-full transition-colors ${activePage === 'upload' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40' : 'text-gray-700 dark:text-gray-200 hover:bg-purple-50 dark:hover:bg-gray-700'}`}> <Upload className="w-5 h-5" /> </motion.button>
              <motion.button whileHover={{ scale: 1.2 }} onClick={() => setActivePage('analytics')} className={`p-2 rounded-full transition-colors ${activePage === 'analytics' ? 'bg-green-100 text-green-700 dark:bg-green-900/40' : 'text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-700'}`}> <BarChart2 className="w-5 h-5" /> </motion.button>
              <motion.button whileHover={{ scale: 1.2 }} onClick={() => setActivePage('settings')} className={`p-2 rounded-full transition-colors ${activePage === 'settings' ? 'bg-gray-200 text-gray-900 dark:bg-gray-800/40' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}> <Settings className="w-5 h-5" /> </motion.button>
              <ThemeToggle />
            </nav>
            
            {/* User Dropdown */}
            <div className="relative" ref={userDropdownRef}>
              <button 
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-medium">
                  U
                </div>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    <span>Profile</span>
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Settings</span>
                  </a>
                  <div className="border-t border-gray-100 my-1"></div>
                  <a href="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center">
                    <LogOut className="w-4 h-4 mr-2" />
                    <span>Sign out</span>
                  </a>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-gray-100">
              <nav className="flex flex-col space-y-2 pb-3">
                <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  Dashboard
                </a>
                <a href="#" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                  History
                </a>
                <button 
                  onClick={() => setIsHelpDropdownOpen(!isHelpDropdownOpen)}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-between"
                >
                  <span>Help</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {isHelpDropdownOpen && (
                  <div className="pl-6 space-y-2 mt-1">
                    <a href="#" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center">
                      <HelpCircle className="w-4 h-4 mr-2" />
                      <span>Documentation</span>
                    </a>
                    <a href="#" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center">
                      <Search className="w-4 h-4 mr-2" />
                      <span>FAQs</span>
                    </a>
                    <a href="#" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center">
                      <Calculator className="w-4 h-4 mr-2" />
                      <span>Tax Guidelines</span>
                    </a>
                  </div>
                )}
                
                {invoiceData && (
                  <button
                    onClick={handleNewInvoice}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 mx-3 mt-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>New Invoice</span>
                  </button>
                )}
              </nav>
              
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <a href="#" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  <span>Profile</span>
                </a>
                <a href="#" className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  <span>Settings</span>
                </a>
                <a href="#" className="block px-3 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md flex items-center">
                  <LogOut className="w-4 h-4 mr-2" />
                  <span>Sign out</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </header>
      {/* Main Content Switcher */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activePage === 'dashboard' && (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                <h2 className="text-4xl font-bold mb-4">Transform Your Invoice Processing</h2>
              </div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Upload invoice images or PDFs and let our AI extract data, predict GST rates, and generate detailed reports automatically
              </p>
            </div>

            {/* Upload Section */}
            <div className="mb-16">
              <FileUpload onFileProcess={handleFileProcess} isProcessing={isProcessing} />
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-16">
              <FeatureCard
                icon={<Eye className="w-8 h-8" />}
                title="OCR Text Extraction"
                description="Advanced OCR technology extracts text from images and PDFs with high accuracy"
                color="bg-blue-500"
              />
              <FeatureCard
                icon={<Search className="w-8 h-8" />}
                title="Smart Field Detection"
                description="Automatically identifies invoice numbers, dates, amounts, and vendor information"
                color="bg-green-500"
              />
              <FeatureCard
                icon={<Calculator className="w-8 h-8" />}
                title="Tax Prediction"
                description="Intelligent GST rate prediction based on item categories and Indian tax rules"
                color="bg-purple-500"
              />
            </div>

            {/* How It Works */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">How It Works</h3>
              <div className="grid md:grid-cols-4 gap-6">
                {[
                  { step: '1', title: 'Upload', desc: 'Select your invoice file', icon: <Upload className="w-6 h-6" /> },
                  { step: '2', title: 'Extract', desc: 'OCR extracts text data', icon: <Eye className="w-6 h-6" /> },
                  { step: '3', title: 'Predict', desc: 'AI predicts GST rates', icon: <Calculator className="w-6 h-6" /> },
                  { step: '4', title: 'Export', desc: 'Download results', icon: <Download className="w-6 h-6" /> }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                      {item.icon}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-2">{item.title}</h4>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Supported Formats */}
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6">
              <div className="flex items-center justify-center space-x-8">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">JPG, PNG Images</span>
                </div>
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">PDF Documents</span>
                </div>
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <span className="text-sm font-medium text-gray-700">Up to 16MB</span>
                </div>
              </div>
            </div>
          </>
        )}
        {activePage === 'upload' && (
          <FileUpload onFileProcess={handleFileProcess} isProcessing={isProcessing} />
        )}
        {activePage === 'analytics' && (
          // TODO: Analytics page with charts and insights
          <div className="text-center text-2xl font-bold text-blue-600 py-20">Analytics Coming Soon</div>
        )}
        {activePage === 'settings' && (
          // TODO: Settings page
          <div className="text-center text-2xl font-bold text-purple-600 py-20">Settings Coming Soon</div>
        )}
        {/* Invoice Results (show after upload/analysis) */}
        {invoiceData && activePage === 'upload' && (
          <InvoiceResults data={invoiceData} showToast={showToast} />
        )}
      </main>
      <Footer />
      <Toast message={toast.message} type={toast.type} isVisible={toast.visible} onClose={hideToast} />
    </div>
  );
}

export default App;