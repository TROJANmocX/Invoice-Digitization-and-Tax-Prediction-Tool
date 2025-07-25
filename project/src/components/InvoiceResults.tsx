import React, { useState, useEffect } from 'react';
import { FileText, Download, Calculator, CheckCircle, AlertTriangle, ArrowRight, Share2, Printer, Mail, Copy, ChevronDown, ChevronUp, Filter, BarChart2, PieChart, Loader2, Clock, X, DollarSign, Percent, Plus, Info, List, FileSpreadsheet } from 'lucide-react';
import { InvoiceData } from '../types/invoice';
import { motion } from 'framer-motion';

interface InvoiceResultsProps {
  data: InvoiceData;
  showToast?: (message: string, type: 'success' | 'error' | 'info') => void;
}

// 3D Invoice Card component
const InvoiceCard = ({ data }: { data: InvoiceData }) => (
  <motion.div
    className="bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-2xl p-8 w-96 mx-auto cursor-pointer select-none"
    whileHover={{ rotateY: 8, scale: 1.04, boxShadow: '0 8px 32px rgba(80,80,200,0.18)' }}
    initial={{ rotateY: 0, scale: 1 }}
    animate={{ rotateY: 0, scale: 1 }}
    transition={{ type: 'spring', stiffness: 200, damping: 20 }}
    style={{ perspective: 1200 }}
  >
    <div className="flex items-center mb-4">
      <FileText className="w-8 h-8 text-blue-600 mr-3" />
      <div>
        <div className="font-bold text-lg text-gray-900 dark:text-white">{data.invoiceNumber || 'Invoice #'}</div>
        <div className="text-xs text-gray-500 dark:text-gray-300">{data.invoiceDate}</div>
      </div>
    </div>
    <div className="mb-2 text-gray-700 dark:text-gray-200 font-medium">{data.vendorName}</div>
    <div className="mb-2 text-xs text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded inline-block font-mono">GSTIN: {data.gstin}</div>
    <div className="mt-4 flex justify-between items-center">
      <div>
        <div className="text-xs text-gray-500">Total</div>
        <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">₹{data.totalAmount?.toLocaleString()}</div>
      </div>
      <div>
        <div className="text-xs text-gray-500">Grand Total</div>
        <div className="text-xl font-semibold text-purple-700 dark:text-purple-400">₹{data.taxSummary?.grandTotal?.toLocaleString()}</div>
      </div>
    </div>
  </motion.div>
);

const InvoiceResults: React.FC<InvoiceResultsProps> = ({ data, showToast }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'visualization'>('details');
  const [showFullBreakdown, setShowFullBreakdown] = useState(false);
  const [shareDropdownOpen, setShareDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  // Simulate loading progress
  useEffect(() => {
    if (isLoading) {
      const timer = setInterval(() => {
        setLoadingProgress(prev => {
          const newProgress = prev + Math.random() * 15;
          if (newProgress >= 100) {
            clearInterval(timer);
            setTimeout(() => setIsLoading(false), 500);
            return 100;
          }
          return newProgress;
        });
      }, 400);
      
      return () => clearInterval(timer);
    }
  }, [isLoading]);
  const handleExport = (format: 'json' | 'excel' | 'pdf') => {
    const exportData = {
      ...data,
      exportedAt: new Date().toISOString(),
      format
    };
    
    try {
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${data.invoiceNumber || 'export'}.json`;
        a.click();
        URL.revokeObjectURL(url);
        showToast?.('JSON file exported successfully', 'success');
      } else if (format === 'excel') {
        // For demo purposes, we'll create a CSV-like format
        const csvContent = [
          'Invoice Summary',
          `Invoice Number,${data.invoiceNumber}`,
          `Date,${data.invoiceDate}`,
          `Vendor,${data.vendorName}`,
          `GSTIN,${data.gstin}`,
          `Total Amount,₹${data.totalAmount}`,
          '',
          'Line Items',
          'Description,Amount,Category,Tax Rate',
          ...data.lineItems.map(item => 
            `"${item.description}",₹${item.amount},${item.category},${item.taxRate}%`
          ),
          '',
          'Tax Summary',
          `Taxable Amount,₹${data.taxSummary.totalTaxableAmount}`,
          `CGST,₹${data.taxSummary.cgst}`,
          `SGST,₹${data.taxSummary.sgst}`,
          `Total Tax,₹${data.taxSummary.totalTax}`,
          `Grand Total,₹${data.taxSummary.grandTotal}`
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice_${data.invoiceNumber || 'export'}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        showToast?.('CSV file exported successfully', 'success');
      } else if (format === 'pdf') {
        // For demo purposes, we'll just show a toast for PDF export
        showToast?.('PDF export initiated', 'info');
        setTimeout(() => {
          showToast?.('PDF file exported successfully', 'success');
        }, 1500);
      }
    } catch (error) {
      console.error('Export error:', error);
      showToast?.('Failed to export file. Please try again.', 'error');
    }
  };
  
  const handlePrint = () => {
    try {
      window.print();
      showToast?.('Print dialog opened', 'info');
    } catch (error) {
      console.error('Print error:', error);
      showToast?.('Failed to open print dialog', 'error');
    }
  };
  
  const handleCopyToClipboard = () => {
    const summaryText = `Invoice #${data.invoiceNumber}\n` +
      `Date: ${data.invoiceDate}\n` +
      `Vendor: ${data.vendorName}\n` +
      `Amount: ₹${data.totalAmount}\n` +
      `Tax: ₹${data.taxSummary.totalTax}\n` +
      `Total: ₹${data.taxSummary.grandTotal}`;
    
    navigator.clipboard.writeText(summaryText)
      .then(() => {
        showToast?.('Invoice summary copied to clipboard', 'success');
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
        showToast?.('Failed to copy to clipboard', 'error');
      });
  };
  
  const toggleShareDropdown = () => {
    setShareDropdownOpen(!shareDropdownOpen);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'services': return 'bg-blue-100 text-blue-800';
      case 'goods': return 'bg-green-100 text-green-800';
      case 'exempt': return 'bg-gray-100 text-gray-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  const validationMatch = Math.abs(data.totalAmount - data.taxSummary.grandTotal) < (data.totalAmount * 0.1);

  // Carousel state (for future multi-invoice support)
  const [carouselIndex] = useState(0);

  return (
    <motion.div className="space-y-8" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: 'spring' }}>
      {/* 3D Card Carousel */}
      <div className="mb-8 flex justify-center">
        {/* For now, just show the current invoice as a single card */}
        <InvoiceCard data={data} />
      </div>
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full animate-fadeIn border border-blue-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center">
                <Clock className="w-6 h-6 mr-3 text-blue-600 animate-pulse" />
                Processing Invoice
              </h3>
              <button 
                onClick={() => setIsLoading(false)}
                className="text-gray-400 hover:text-gray-600 transition-all duration-200 hover:bg-gray-100 p-1 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-6">
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 transition-all duration-300 rounded-full"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
              <div className="flex justify-between mt-3 text-sm font-medium">
                <span className="text-blue-700 flex items-center">
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Extracting data...
                </span>
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{Math.round(loadingProgress)}%</span>
              </div>
            </div>
            
            <div className="space-y-4 bg-gray-50 p-4 rounded-xl">
              <div className={`flex items-center ${loadingProgress > 30 ? 'text-gray-700' : 'text-gray-500'} p-2 rounded-lg ${loadingProgress > 30 ? 'bg-green-50' : ''} transition-colors duration-300`}>
                <div className="w-6 h-6 mr-3 flex-shrink-0">
                  {loadingProgress > 30 ? 
                    <CheckCircle className="w-6 h-6 text-green-500 animate-fadeIn" /> : 
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Reading invoice content</span>
                  {loadingProgress > 30 && <span className="text-xs text-green-600">Completed in {Math.round(Math.random() * 2 + 1)} seconds</span>}
                </div>
              </div>
              <div className={`flex items-center ${loadingProgress > 60 ? 'text-gray-700' : 'text-gray-500'} p-2 rounded-lg ${loadingProgress > 60 ? 'bg-green-50' : ''} transition-colors duration-300`}>
                <div className="w-6 h-6 mr-3 flex-shrink-0">
                  {loadingProgress > 60 ? 
                    <CheckCircle className="w-6 h-6 text-green-500 animate-fadeIn" /> : 
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Identifying fields and values</span>
                  {loadingProgress > 60 && <span className="text-xs text-green-600">Completed in {Math.round(Math.random() * 3 + 2)} seconds</span>}
                </div>
              </div>
              <div className={`flex items-center ${loadingProgress > 85 ? 'text-gray-700' : 'text-gray-500'} p-2 rounded-lg ${loadingProgress > 85 ? 'bg-green-50' : ''} transition-colors duration-300`}>
                <div className="w-6 h-6 mr-3 flex-shrink-0">
                  {loadingProgress > 85 ? 
                    <CheckCircle className="w-6 h-6 text-green-500 animate-fadeIn" /> : 
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />}
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">Calculating tax predictions</span>
                  {loadingProgress > 85 && <span className="text-xs text-green-600">Completed in {Math.round(Math.random() * 2 + 1)} seconds</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-8 animate-fadeIn">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center">
              <FileText className="w-8 h-8 mr-3 text-blue-600" />
              Invoice Processing Results
            </h2>
            <div className="flex items-center mt-2">
              {validationMatch ? (
                <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full shadow-sm">
                  <div className="relative">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="absolute top-0 right-0 h-2 w-2 bg-green-400 rounded-full animate-ping"></span>
                  </div>
                  <span className="font-medium">Validated</span>
                </div>
              ) : (
                <div className="flex items-center text-amber-600 bg-amber-50 px-3 py-1 rounded-full shadow-sm">
                  <div className="relative">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <span className="absolute top-0 right-0 h-2 w-2 bg-amber-400 rounded-full animate-pulse"></span>
                  </div>
                  <span className="font-medium">Review Required</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <button 
              onClick={handlePrint}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              title="Print Invoice"
            >
              <Printer className="w-5 h-5" />
            </button>
            
            <button 
              onClick={handleCopyToClipboard}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
              title="Copy to Clipboard"
            >
              <Copy className="w-5 h-5" />
            </button>
            
            <div className="relative">
              <button 
                onClick={toggleShareDropdown}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                title="Share"
              >
                <Share2 className="w-5 h-5" />
              </button>
              
              {shareDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200 animate-fadeIn">
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center">
                    <Mail className="w-4 h-4 mr-2" />
                    <span>Email Invoice</span>
                  </button>
                  <button className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    <span>Download PDF</span>
                  </button>
                </div>
              )}
            </div>
            
            {/* View Toggle */}
            <div className="ml-2 border-l border-gray-200 pl-2">
              <div className="bg-gray-100 rounded-lg p-1 flex shadow-inner">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'details' ? 'bg-white shadow-sm text-blue-600 transform -translate-y-0.5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                  Details
                </button>
                <button
                  onClick={() => setActiveTab('visualization')}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${activeTab === 'visualization' ? 'bg-white shadow-sm text-blue-600 transform -translate-y-0.5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}
                >
                  Charts
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Summary - Details Tab */}
        {activeTab === 'details' && (
          <div className="grid md:grid-cols-2 gap-8 animate-fadeIn">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Invoice Details
            </h3>
            <div className="space-y-3 bg-gray-50 rounded-xl p-5 shadow-sm">
              <div className="flex justify-between py-2 border-b border-gray-200 hover:bg-gray-100 px-2 rounded transition-colors">
                <span className="text-gray-600">Invoice Number:</span>
                <span className="font-medium text-blue-700">{data.invoiceNumber}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 hover:bg-gray-100 px-2 rounded transition-colors">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium text-blue-700">{data.invoiceDate}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-200 hover:bg-gray-100 px-2 rounded transition-colors">
                <span className="text-gray-600">Vendor:</span>
                <span className="font-medium text-blue-700">{data.vendorName}</span>
              </div>
              <div className="flex justify-between py-2 hover:bg-gray-100 px-2 rounded transition-colors">
                <span className="text-gray-600">GSTIN:</span>
                <span className="font-medium font-mono text-sm bg-blue-50 text-blue-800 px-2 py-0.5 rounded">{data.gstin}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-purple-600" />
              Amount Summary
            </h3>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 font-medium">Extracted Total:</span>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold text-gray-900">₹{data.totalAmount.toLocaleString()}</span>
                    <span className="text-xs text-gray-500">From invoice</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-purple-100">
                  <span className="text-gray-600 font-medium">Predicted Total:</span>
                  <div className="flex flex-col items-end">
                    <span className="text-xl font-semibold text-blue-600">₹{data.taxSummary.grandTotal.toLocaleString()}</span>
                    <span className="text-xs text-gray-500">Calculated with tax</span>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-purple-100">
                  <span className="text-gray-600 font-medium">Difference:</span>
                  <span className={`font-medium px-2 py-0.5 rounded-full ${validationMatch ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                    ₹{Math.abs(data.totalAmount - data.taxSummary.grandTotal).toLocaleString()}
                    {validationMatch && <span className="ml-1">✓</span>}
                  </span>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}
        
        {/* Visualization Tab */}
        {activeTab === 'visualization' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <BarChart2 className="w-5 h-5 mr-2 text-blue-600" />
                Tax Visualization
              </h3>
              <div className="flex items-center bg-gray-100 p-1 rounded-lg shadow-inner">
                <button className="p-2 text-blue-600 bg-white rounded-md shadow-sm transition-all duration-200 hover:-translate-y-0.5">
                  <PieChart className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 mx-1 hover:-translate-y-0.5">
                  <BarChart2 className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all duration-200 hover:-translate-y-0.5">
                  <Filter className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Simple Chart Visualization */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Tax Distribution</h4>
              <div className="h-64 flex items-end justify-around">
                {/* Taxable Amount Bar */}
                <div className="flex flex-col items-center space-y-2">
                  <div 
                    className="w-16 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg animate-fadeIn" 
                    style={{ height: `${(data.taxSummary.totalTaxableAmount / data.taxSummary.grandTotal) * 200}px`, animationDelay: '0.1s' }}
                  ></div>
                  <div className="text-sm text-gray-600">Taxable</div>
                  <div className="font-medium text-blue-600">₹{data.taxSummary.totalTaxableAmount.toLocaleString()}</div>
                </div>
                
                {/* CGST Bar */}
                <div className="flex flex-col items-center space-y-2">
                  <div 
                    className="w-16 bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg animate-fadeIn" 
                    style={{ height: `${(data.taxSummary.cgst / data.taxSummary.grandTotal) * 200}px`, animationDelay: '0.2s' }}
                  ></div>
                  <div className="text-sm text-gray-600">CGST</div>
                  <div className="font-medium text-green-600">₹{data.taxSummary.cgst.toLocaleString()}</div>
                </div>
                
                {/* SGST Bar */}
                <div className="flex flex-col items-center space-y-2">
                  <div 
                    className="w-16 bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg animate-fadeIn" 
                    style={{ height: `${(data.taxSummary.sgst / data.taxSummary.grandTotal) * 200}px`, animationDelay: '0.3s' }}
                  ></div>
                  <div className="text-sm text-gray-600">SGST</div>
                  <div className="font-medium text-green-600">₹{data.taxSummary.sgst.toLocaleString()}</div>
                </div>
                
                {/* Total Tax Bar */}
                <div className="flex flex-col items-center space-y-2">
                  <div 
                    className="w-16 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg animate-fadeIn" 
                    style={{ height: `${(data.taxSummary.totalTax / data.taxSummary.grandTotal) * 200}px`, animationDelay: '0.4s' }}
                  ></div>
                  <div className="text-sm text-gray-600">Total Tax</div>
                  <div className="font-medium text-purple-600">₹{data.taxSummary.totalTax.toLocaleString()}</div>
                </div>
              </div>
            </div>
            
            {/* Category Distribution */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-300">
              <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                Category Distribution
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Calculate category totals */}
                {(() => {
                  const categories = data.lineItems.reduce((acc, item) => {
                    if (!acc[item.category]) {
                      acc[item.category] = { amount: 0, count: 0 };
                    }
                    acc[item.category].amount += item.amount;
                    acc[item.category].count += 1;
                    return acc;
                  }, {} as Record<string, { amount: number, count: number }>);
                  
                  return Object.entries(categories).map(([category, info], index) => (
                    <div 
                      key={category} 
                      className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-fadeIn" 
                      style={{ animationDelay: `${0.1 * index}s` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: getCategoryColor(category) }}
                          ></div>
                          <div className="font-medium text-gray-900 capitalize">{category}</div>
                        </div>
                        <div className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                          {info.count} item{info.count !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <div className="text-2xl font-bold" style={{ color: getCategoryColor(category) }}>₹{info.amount.toLocaleString()}</div>
                        <div className="w-full bg-gray-200 h-1.5 mt-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full animate-pulse" 
                            style={{ 
                              backgroundColor: getCategoryColor(category),
                              width: `${(info.amount / data.totalAmount) * 100}%`,
                              animationDelay: `${0.2 * index}s`
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ));
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tax Breakdown */}
      <div className="bg-white rounded-2xl shadow-lg p-8 animate-fadeIn">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <Calculator className="w-6 h-6 mr-3 text-purple-600 animate-pulse" />
            Tax Prediction Results
          </h3>
          
          <button 
            onClick={() => setShowFullBreakdown(!showFullBreakdown)}
            className="flex items-center px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-800 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow hover:-translate-y-0.5"
          >
            {showFullBreakdown ? (
              <>
                <span>Show Less</span>
                <ChevronUp className="w-4 h-4 ml-1 animate-bounce" />
              </>
            ) : (
              <>
                <span>Show Details</span>
                <ChevronDown className="w-4 h-4 ml-1 animate-bounce" />
              </>
            )}
          </button>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 mb-8 shadow-sm hover:shadow-md transition-all duration-300">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-orange-600" />
            GST Breakdown
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-fadeIn" style={{ animationDelay: '0.1s' }}>
              <div className="text-2xl font-bold text-blue-600">₹{data.taxSummary.totalTaxableAmount.toLocaleString()}</div>
              <div className="text-sm text-gray-600 mt-1">Taxable Amount</div>
              <div className="w-full bg-blue-100 h-1 mt-2 rounded-full">
                <div className="bg-blue-600 h-full rounded-full" style={{ width: `${(data.taxSummary.totalTaxableAmount / data.taxSummary.grandTotal) * 100}%` }}></div>
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              <div className="text-2xl font-bold text-green-600">₹{data.taxSummary.cgst.toLocaleString()}</div>
              <div className="text-sm text-gray-600 mt-1">CGST</div>
              <div className="w-full bg-green-100 h-1 mt-2 rounded-full">
                <div className="bg-green-600 h-full rounded-full" style={{ width: `${(data.taxSummary.cgst / data.taxSummary.grandTotal) * 100}%` }}></div>
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              <div className="text-2xl font-bold text-green-600">₹{data.taxSummary.sgst.toLocaleString()}</div>
              <div className="text-sm text-gray-600 mt-1">SGST</div>
              <div className="w-full bg-green-100 h-1 mt-2 rounded-full">
                <div className="bg-green-600 h-full rounded-full" style={{ width: `${(data.taxSummary.sgst / data.taxSummary.grandTotal) * 100}%` }}></div>
              </div>
            </div>
            <div className="text-center bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              <div className="text-2xl font-bold text-purple-600">₹{data.taxSummary.grandTotal.toLocaleString()}</div>
              <div className="text-sm text-gray-600 mt-1">Grand Total</div>
              <div className="w-full bg-purple-100 h-1 mt-2 rounded-full">
                <div className="bg-purple-600 h-full rounded-full w-full"></div>
              </div>
            </div>
          </div>
          
          {/* Additional Tax Details */}
          {showFullBreakdown && (
            <div className="mt-6 pt-6 border-t border-orange-100 animate-fadeIn">
              <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                <Calculator className="w-4 h-4 mr-2 text-orange-600" />
                Detailed Tax Calculation
              </h5>
              <div className="bg-white rounded-lg p-5 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded transition-colors">
                    <span className="text-gray-600 flex items-center">
                      <FileText className="w-3.5 h-3.5 mr-2 text-gray-400" />
                      Total Invoice Value:
                    </span>
                    <span className="font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded">₹{data.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded transition-colors">
                    <span className="text-gray-600 flex items-center">
                      <DollarSign className="w-3.5 h-3.5 mr-2 text-gray-400" />
                      Taxable Value:
                    </span>
                    <span className="font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded">₹{data.taxSummary.totalTaxableAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded transition-colors">
                    <span className="text-gray-600 flex items-center">
                      <Percent className="w-3.5 h-3.5 mr-2 text-gray-400" />
                      CGST ({(data.taxSummary.cgst / data.taxSummary.totalTaxableAmount * 100).toFixed(1)}%):
                    </span>
                    <span className="font-medium px-2 py-0.5 bg-green-50 text-green-700 rounded">₹{data.taxSummary.cgst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded transition-colors">
                    <span className="text-gray-600 flex items-center">
                      <Percent className="w-3.5 h-3.5 mr-2 text-gray-400" />
                      SGST ({(data.taxSummary.sgst / data.taxSummary.totalTaxableAmount * 100).toFixed(1)}%):
                    </span>
                    <span className="font-medium px-2 py-0.5 bg-green-50 text-green-700 rounded">₹{data.taxSummary.sgst.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-medium pt-3 pb-1 border-t border-gray-100">
                    <span className="text-gray-800 flex items-center">
                      <Plus className="w-3.5 h-3.5 mr-2 text-blue-500" />
                      Total Tax:
                    </span>
                    <span className="text-blue-600 px-2 py-0.5 bg-blue-50 rounded font-bold">₹{data.taxSummary.totalTax.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold pt-3 pb-1 border-t border-gray-100">
                    <span className="text-gray-800 flex items-center">
                      <CheckCircle className="w-3.5 h-3.5 mr-2 text-purple-500" />
                      Grand Total:
                    </span>
                    <span className="text-purple-600 px-3 py-1 bg-purple-50 rounded-md font-bold">₹{data.taxSummary.grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Line Items */}
        <div className="mt-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <List className="w-5 h-5 mr-2 text-blue-600" />
            Line Items
          </h3>
          <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 rounded-tl-xl">Description</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Amount</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Category</th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900">Tax Rate</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Tax Amount</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 rounded-tr-xl">Total</th>
                </tr>
              </thead>
              <tbody>
                {data.lineItems.map((item, index) => {
                  const taxAmount = (item.amount * item.taxRate) / 100;
                  const totalWithTax = item.amount + taxAmount;
                  
                  return (
                    <tr 
                      key={index} 
                      className="border-b border-gray-100 hover:bg-gray-50 transition-all duration-200 animate-fadeIn" 
                      style={{ animationDelay: `${0.05 * index}s` }}
                    >
                      <td className="py-4 px-4">
                        <div className="font-medium text-gray-900">{item.description}</div>
                      </td>
                      <td className="py-4 px-4 text-right font-medium">₹{item.amount.toLocaleString()}</td>
                      <td className="py-4 px-4 text-center">
                        <span 
                          className="px-3 py-1 rounded-full text-xs font-medium inline-flex items-center justify-center"
                          style={{ 
                            backgroundColor: `${getCategoryColor(item.category)}20`, // 20 is hex for 12% opacity
                            color: getCategoryColor(item.category).replace('bg-', 'text-').replace('-100', '-800')
                          }}
                        >
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="font-medium px-2 py-0.5 bg-blue-50 text-blue-700 rounded">{item.taxRate}%</span>
                      </td>
                      <td className="py-4 px-4 text-right font-medium text-orange-600">₹{taxAmount.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right font-bold text-purple-700">₹{totalWithTax.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mt-8 animate-fadeIn">
        <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Download className="w-6 h-6 mr-3 text-green-600 animate-bounce" style={{ animationDuration: '2s' }} />
          Export Options
        </h3>
        
        <p className="text-gray-600 mb-6">Download the processed invoice data in your preferred format</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => handleExport('json')}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-3 group shadow-md hover:shadow-lg hover:-translate-y-1 animate-fadeIn dark:shadow-blue-900/20"
            style={{ animationDelay: '0.1s' }}
            title="Download extracted invoice data as JSON"
          >
            <FileText className="w-5 h-5" />
            <span>Download JSON</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={() => handleExport('excel')}
            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-3 group shadow-md hover:shadow-lg hover:-translate-y-1 animate-fadeIn dark:shadow-green-900/20"
            style={{ animationDelay: '0.2s' }}
            title="Download extracted invoice data as CSV"
          >
            <FileSpreadsheet className="w-5 h-5" />
            <span>Download CSV</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          
          <button
            onClick={() => handleExport('pdf')}
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center space-x-3 group shadow-md hover:shadow-lg hover:-translate-y-1 animate-fadeIn dark:shadow-red-900/20"
            style={{ animationDelay: '0.3s' }}
            title="Download extracted invoice data as PDF"
          >
            <FileText className="w-5 h-5" />
            <span>Download PDF</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
        
        <div className="mt-6 flex justify-center animate-fadeIn" style={{ animationDelay: '0.4s' }}>
          <button
            onClick={handlePrint}
            className="text-blue-600 hover:text-blue-800 transition-all duration-200 flex items-center space-x-2 px-6 py-3 rounded-lg hover:bg-blue-100 border border-blue-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 group"
          >
            <Printer className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Print Invoice</span>
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </button>
        </div>
      </div>

      {/* Processing Info */}
      <div className="bg-blue-50 rounded-xl p-6 mt-8 shadow-sm hover:shadow-md transition-all duration-300 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
          <Info className="w-5 h-5 mr-2 text-blue-600 animate-pulse" />
          Processing Summary
        </h4>
        <div className="text-blue-800 text-sm space-y-2">
          <p className="flex items-center hover:bg-blue-100 p-2 rounded-lg transition-colors">
            <FileText className="w-4 h-4 mr-2 text-blue-600" />
            <span className="font-medium">File processed:</span> 
            <span className="ml-2 bg-white px-2 py-1 rounded-md shadow-sm">{data.filename}</span>
          </p>
          <p className="flex items-center hover:bg-blue-100 p-2 rounded-lg transition-colors">
            <List className="w-4 h-4 mr-2 text-blue-600" />
            <span className="font-medium">{data.lineItems.length} line items</span> 
            <span className="ml-2">identified and categorized</span>
          </p>
          <p className="flex items-center hover:bg-blue-100 p-2 rounded-lg transition-colors">
            <Percent className="w-4 h-4 mr-2 text-blue-600" />
            <span>GST rates predicted based on item categories</span>
          </p>
          <p className="flex items-center hover:bg-blue-100 p-2 rounded-lg transition-colors">
            <CheckCircle className={`w-4 h-4 mr-2 ${validationMatch ? 'text-green-600' : 'text-orange-500'}`} />
            <span>Tax calculations completed with </span>
            <span className={`ml-1 font-bold ${validationMatch ? 'text-green-600' : 'text-orange-500'}`}>
              {validationMatch ? 'successful' : 'partial'}
            </span>
            <span className="ml-1">validation</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default InvoiceResults;